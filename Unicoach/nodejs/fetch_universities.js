const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

// ==========================================
// CONFIGURATION
// ==========================================
// The target API URL from the Network tab
const API_URL = "https://leapscholar.com/leapscholar-seo-api/es/university-search";

// Folder where logos will be saved
const LOGOS_FOLDER = path.join(__dirname, 'usa_masters_logos');
const DATA_FILE = path.join(__dirname, 'all_universities_data.json');

// HTTP Headers copied from the browser session
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Content-Type': 'application/json',
    'Origin': 'https://leapscholar.com',
    'Referer': 'https://leapscholar.com/',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
};

// ==========================================
// HELPERS
// ==========================================

// Download single image, convert to WebP using sharp, and save locally
async function downloadLogo(url, safeUniName, index, total) {
    if (!url || !url.startsWith('http')) {
        return { status: 'skipped', reason: 'No valid URL' };
    }

    const fileName = `${safeUniName}.webp`;
    const localPath = path.join(LOGOS_FOLDER, fileName);

    try {
        // Skip download if WebP version already exists on disk
        if (await fs.pathExists(localPath)) {
            return { status: 'exists', fileName };
        }

        // Fetch image as arraybuffer
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'arraybuffer',
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // Convert buffer to WebP and save
        await sharp(response.data)
            .webp({ quality: 85 })
            .toFile(localPath);

        console.log(`[${index}/${total}] ✅ Downloaded & Converted to WebP: ${fileName}`);
        return { status: 'success', fileName };
    } catch (error) {
        return { status: 'failed', error: error.message };
    }
}

// ==========================================
// MAIN WORKFLOW
// ==========================================
async function startWorkflow() {
    try {
        console.log(`\n🚀 Starting University Data & Logo Harvester (WebP Enabled)`);
        console.log(`📡 Fetching from: ${API_URL}`);

        await fs.ensureDir(LOGOS_FOLDER);
        console.log(`📁 Saving logos to: ${LOGOS_FOLDER}\n`);

        let currentPage = 1;
        let hasMore = true;
        const allRawUniversities = [];

        // 1. Fetch metadata paginated loop
        while (hasMore) {
            console.log(`⏳ Fetching page ${currentPage}...`);
            const payload = {
                "currentAppliedFilters": {
                    "city": [],
                    "degree": [
                        {
                            "id": 6,
                            "documentId": "g73vntxn432wz9ew8sxkh4j5",
                            "name": "Postgraduate",
                            "es_document_id": "36",
                            "slug": null,
                            "createdAt": "2025-09-24T14:26:07.109Z",
                            "updatedAt": "2025-09-24T14:26:07.109Z",
                            "publishedAt": "2025-09-24T14:26:07.104Z"
                        }
                    ],
                    "streams": [],
                    "country": [
                        {
                            "id": 18,
                            "documentId": "nf8r9nguu4noct969mih4r7u",
                            "name": "USA",
                            "slug": "usa",
                            "createdAt": "2025-09-24T09:33:11.465Z",
                            "updatedAt": "2025-10-24T19:48:47.526Z",
                            "publishedAt": "2025-10-24T19:48:47.354Z",
                            "cf_id": null,
                            "flag_image_link": "https://leapassets.s3.ap-south-1.amazonaws.com/USA_flag_b41a1be6f9.svg"
                        }
                    ],
                    "firstYearFee": [],
                    "intake": [],
                    "duration": [],
                    "perPage": 20,
                    "sort": {
                        "id": "RANK",
                        "name": "Ranking: High to Low",
                        "elasticFilterId": "rankToDisplay"
                    },
                    "page": 0
                },
                "page": currentPage
            };

            let response;
            try {
                response = await axios.post(API_URL, payload, { headers: HEADERS });
            } catch (error) {
                console.error(`❌ API Fetch Failed on Page ${currentPage}: ${error.message}`);
                if (error.response && error.response.status === 403) {
                    console.warn(`⚠️ Status Code 403: Forbidden. Copy headers/cookies from your browser.`);
                }
                break;
            }

            const pageList = response.data.universityList || [];
            if (pageList.length === 0) {
                console.log(`ℹ️ Received empty list. Stopping pagination.`);
                break;
            }

            allRawUniversities.push(...pageList);
            console.log(`   Fetched ${pageList.length} universities (Total gathered: ${allRawUniversities.length} / ${response.data.totalUniqueUniversities})`);

            hasMore = response.data.hasMore && allRawUniversities.length < response.data.totalUniqueUniversities;
            currentPage++;

            // Small delay to respect the server
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        const totalUnis = allRawUniversities.length;
        if (totalUnis === 0) {
            console.log("❌ No universities fetched. Exiting.");
            process.exit(1);
        }

        console.log(`\n✅ Finished metadata fetch. Total: ${totalUnis} universities.`);
        console.log(`⏳ Starting logo downloads & WebP conversions...`);

        // 2. Download logos & structure data
        const structuredData = [];
        const BATCH_SIZE = 10;
        let downloadedCount = 0;
        let skippedCount = 0;
        let failedCount = 0;

        for (let i = 0; i < totalUnis; i += BATCH_SIZE) {
            const batch = allRawUniversities.slice(i, i + BATCH_SIZE);
            const promises = batch.map(async (uni, idx) => {
                const globalIndex = i + idx + 1;
                const originalLogo = uni.logo || '';
                const safeName = uni.name
                    .replace(/[<>:"/\\|?*]/g, '') // Remove illegal chars
                    .trim()
                    .replace(/\s+/g, '_'); // Replace spaces with underscore

                let downloadResult = { status: 'skipped' };
                if (originalLogo) {
                    downloadResult = await downloadLogo(originalLogo, safeName, globalIndex, totalUnis);
                }

                // Track statistics
                const success = downloadResult.status === 'success' || downloadResult.status === 'exists';
                if (downloadResult.status === 'success') downloadedCount++;
                else if (downloadResult.status === 'exists') downloadedCount++;
                else if (downloadResult.status === 'skipped') skippedCount++;
                else failedCount++;

                // Map data structure
                return {
                    name: uni.name,
                    rank: uni.rankToDisplay || "N/A",
                    tuitionFee: uni.tuitionFeeLabel || "N/A",
                    type: uni.type || "PUBLIC/PRIVATE",
                    originalLogoUrl: originalLogo,
                    localLogoPath: success ? `usa_masters_logos/${safeName}.webp` : null
                };
            });

            const batchResults = await Promise.all(promises);
            structuredData.push(...batchResults);
        }

        // 3. Save JSON file
        console.log(`\n💾 Saving structured data to JSON file...`);
        await fs.writeJson(DATA_FILE, structuredData, { spaces: 2 });
        console.log(`✅ Data saved successfully to: ${DATA_FILE}`);

        console.log('\n' + '='.repeat(50));
        console.log(`🎉 RUN COMPLETION SUMMARY`);
        console.log(`   - Total Universities: ${totalUnis}`);
        console.log(`   - Logos Downloaded/Verified: ${downloadedCount}`);
        console.log(`   - Logos Skipped (no URL):    ${skippedCount}`);
        console.log(`   - Logos Failed:              ${failedCount}`);
        console.log('='.repeat(50) + '\n');

    } catch (err) {
        console.error(`\n❌ Unexpected Error in workflow: ${err.message}`);
    }
}

startWorkflow();

const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

const LOGOS_FOLDER = path.join(__dirname, 'downloaded_logos');
const DATA_FILE = path.join(__dirname, 'all_universities_data.json');

async function convertLogos() {
    try {
        if (!await fs.pathExists(DATA_FILE)) {
            console.error(`❌ Data file not found: ${DATA_FILE}`);
            process.exit(1);
        }

        console.log(`\n🔄 Loading data from: ${DATA_FILE}`);
        const universities = await fs.readJson(DATA_FILE);
        console.log(`✅ Loaded ${universities.length} universities.`);

        let successCount = 0;
        let skipCount = 0;
        let failCount = 0;
        let alreadyWebpCount = 0;

        console.log(`\n⏳ Converting logos to WebP...`);

        // Batch size for conversion to avoid memory exhaustion (sharp can be resource-intensive)
        const BATCH_SIZE = 15;

        for (let i = 0; i < universities.length; i += BATCH_SIZE) {
            const batch = universities.slice(i, i + BATCH_SIZE);
            const indices = Array.from({ length: batch.length }, (_, k) => i + k);

            const promises = batch.map(async (uni, idx) => {
                const globalIdx = indices[idx];

                if (!uni.localLogoPath) {
                    skipCount++;
                    return;
                }

                // Resolve full path
                const relativePath = uni.localLogoPath;
                const absoluteInputPath = path.join(__dirname, relativePath);

                if (!await fs.pathExists(absoluteInputPath)) {
                    // File doesn't exist on disk, reset path to null in JSON
                    uni.localLogoPath = null;
                    failCount++;
                    return;
                }

                const ext = path.extname(absoluteInputPath).toLowerCase();
                if (ext === '.webp') {
                    alreadyWebpCount++;
                    return;
                }

                // Output filename
                const dirName = path.dirname(absoluteInputPath);
                const baseName = path.basename(absoluteInputPath, ext);
                const outputFileName = `${baseName}.webp`;
                const absoluteOutputPath = path.join(dirName, outputFileName);
                const relativeOutputPath = `downloaded_logos/${outputFileName}`;

                try {
                    // Convert to WebP using sharp
                    await sharp(absoluteInputPath)
                        .webp({ quality: 85 })
                        .toFile(absoluteOutputPath);

                    // Delete original file to save space
                    await fs.remove(absoluteInputPath);

                    // Update JSON database record
                    uni.localLogoPath = relativeOutputPath;
                    successCount++;
                    console.log(`[${globalIdx + 1}/${universities.length}] ✅ Converted: ${baseName}${ext} ➡️ ${outputFileName}`);
                } catch (err) {
                    console.error(`[${globalIdx + 1}/${universities.length}] ❌ Error converting ${baseName}${ext}: ${err.message}`);
                    failCount++;
                }
            });

            await Promise.all(promises);
        }

        // Save the updated JSON file
        console.log(`\n💾 Saving updated JSON data...`);
        await fs.writeJson(DATA_FILE, universities, { spaces: 2 });
        console.log(`✅ JSON file successfully updated.`);

        console.log('\n' + '='.repeat(50));
        console.log(`🎉 CONVERSION SUMMARY`);
        console.log(`   - Total Universities:   ${universities.length}`);
        console.log(`   - Successfully Converted: ${successCount}`);
        console.log(`   - Already WebP:          ${alreadyWebpCount}`);
        console.log(`   - Skipped (No Logo):     ${skipCount}`);
        console.log(`   - Failed / Missing:      ${failCount}`);
        console.log('='.repeat(50) + '\n');

    } catch (err) {
        console.error(`❌ Unexpected Error: ${err.message}`);
    }
}

convertLogos();

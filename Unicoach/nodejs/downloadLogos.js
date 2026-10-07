const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');

// 1. Text file se filtered URLs read karo
const urlFile = path.join(__dirname, 'final_university_logos.txt');
const outputFolder = path.join(__dirname, 'university_logos');

async function downloadImage(url, index) {
    try {
        // University ka naam URL se nikalne ki koshish
        const urlParts = url.split('/');
        let fileName = urlParts[urlParts.length - 1].split('?')[0];

        // Decode URL-encoded characters (e.g., %20 -> space)
        try { fileName = decodeURIComponent(fileName); } catch (e) {}

        // Agar filename ajeeb sa h to unique index laga do
        if (!fileName.includes('.') || fileName.length > 100 || fileName.trim() === '') {
            fileName = `university_${index}.png`;
        }

        // Replace illegal filename characters on Windows
        fileName = fileName.replace(/[<>:"/\\|?*]/g, '_');

        const localPath = path.join(outputFolder, fileName);

        console.log(`[${index + 1}] Downloading: ${fileName}`);

        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const writer = fs.createWriteStream(localPath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log(`  ✅ Saved: ${fileName}`);
                resolve({ name: fileName, status: 'success' });
            });
            writer.on('error', (err) => {
                console.log(`  ❌ Write error: ${fileName} - ${err.message}`);
                reject(err);
            });
        });
    } catch (error) {
        console.log(`  ❌ Failed URL[${index + 1}]: ${url.substring(0, 80)}... => ${error.message}`);
        return { url, status: 'failed', error: error.message };
    }
}

async function startWorkflow() {
    // Check if URL file exists
    if (!await fs.pathExists(urlFile)) {
        console.error(`\n❌ File not found: ${urlFile}`);
        console.log('\n📝 Please create "final_university_logos.txt" in the nodejs folder');
        console.log('   Each line should contain one image URL, e.g.:');
        console.log('   https://upload.wikimedia.org/wikipedia/.../Harvard_University.png');
        console.log('   https://example.com/logos/mit.png\n');
        process.exit(1);
    }

    await fs.ensureDir(outputFolder);

    const rawContent = await fs.readFile(urlFile, 'utf-8');
    const urls = rawContent
        .split('\n')
        .map(u => u.trim())
        .filter(u => u.length > 0 && u.startsWith('http'));

    if (urls.length === 0) {
        console.error('❌ No valid URLs found in final_university_logos.txt');
        process.exit(1);
    }

    console.log(`\n🚀 Starting download of ${urls.length} images...`);
    console.log(`📁 Output folder: ${outputFolder}\n`);

    // Batch size to avoid overwhelming servers (10 at a time)
    const BATCH_SIZE = 10;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
        const batch = urls.slice(i, i + BATCH_SIZE);
        const promises = batch.map((url, batchIndex) =>
            downloadImage(url, i + batchIndex)
        );
        const results = await Promise.allSettled(promises);

        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value?.status === 'success') {
                successCount++;
            } else {
                failCount++;
            }
        });
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Success: ${successCount} images`);
    console.log(`❌ Failed:  ${failCount} images`);
    console.log(`📁 Saved to: ${outputFolder}`);
    console.log('='.repeat(50) + '\n');
}

startWorkflow();

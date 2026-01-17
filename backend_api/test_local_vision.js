require('dotenv').config();
const ocrService = require('./services/ocrService');
const path = require('path');
const fs = require('fs');

async function runTest() {
    // 1. Pick a test image from the user's provided folder
    const imagePath = "D:\\CMRU-MAJOR-PROJECT\\medicine_images\\dolo650_strip.jpg";

    if (!fs.existsSync(imagePath)) {
        console.error("❌ Test image not found:", imagePath);
        return;
    }

    console.log("🏥 Starting Local Vision Benchmark...");
    console.log(`📸 Image: ${path.basename(imagePath)}`);
    console.log("🧠 Model: gemma3:4b (via Ollama)");
    console.log("----------------------------------------");

    // Run twice to test Cold vs Warm start
    for (let i = 1; i <= 2; i++) {
        console.log(`\n🔄 Run #${i} (Testing ${i === 1 ? 'Cold' : 'Warm'} Start)...`);
        const loopStartTime = Date.now();

        try {
            const result = await ocrService.processImageWithOCR(imagePath);
            const loopDuration = (Date.now() - loopStartTime) / 1000;
            console.log(`✅ Run #${i} Complete in ${loopDuration.toFixed(2)} seconds`);

            if (i === 1) {
                console.log("   (First run includes model loading time)");
            } else {
                console.log("   (Second run should be much faster)");
                console.log("\n📝 Final Analysis Data:");
                console.log(JSON.stringify(result.aiAnalysis, null, 2));
            }
        } catch (error) {
            console.error(`❌ Run #${i} Failed:`, error);
        }
    }
}

runTest();

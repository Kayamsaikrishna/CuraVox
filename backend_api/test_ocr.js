const path = require('path');
const { processImageWithOCR } = require('./services/ocrService');
require('dotenv').config();

const testImage = path.join('D:', 'CMRU-MAJOR-PROJECT', 'medicine_images', 'dolo650_strip.jpg');

console.log(`\n🧪 Testing OCR on: ${testImage}`);
console.log('----------------------------------------');

async function runTest() {
    try {
        console.log('⏳ Processing image...');
        const result = await processImageWithOCR(testImage, {
            userId: 'test_user',
            confidenceThreshold: 50
        });

        console.log('\n✅ OCR Result:');
        console.log(`   - Text Detected: ${result.text ? 'YES' : 'NO'}`);
        console.log(`   - Confidence: ${Math.round(result.confidence)}%`);
        console.log(`   - Detected Medicine: ${result.medicineName || 'None'}`);
        console.log(`   - AI Analysis: ${result.aiAnalysis?.identifiedMedicine || 'Failed'}`);

        if (result.aiAnalysis) {
            console.log('\n💊 AI Details:');
            console.log(`   - Uses: ${JSON.stringify(result.aiAnalysis.usageInfo)}`);
            console.log(`   - Dosage: ${JSON.stringify(result.aiAnalysis.dosageInfo)}`);
        }

    } catch (error) {
        console.error('\n❌ Test Failed:', error);
    }
}

runTest();

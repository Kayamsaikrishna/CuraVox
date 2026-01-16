require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.GEMINI_API_KEY;

console.log("----------------------------------------");
console.log("🧪 Testing Gemini API Key");
console.log(`🔑 Key Fragment: ${API_KEY ? API_KEY.substring(0, 8) + '...' : 'MISSING'}`);
console.log("----------------------------------------");

if (!API_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY not found in .env");
    process.exit(1);
}

async function testGeminiVision() {
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        // User requested model test
        const modelName = "gemini-2.5-flash-native-audio-dialog";
        console.log(`🧪 Testing Model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        // Use the user's uploaded image path
        let imagePath = process.argv[2];

        if (!imagePath) {
            console.log("⚠️ No image path provided. Running simple text test...");
            const prompt = "Hi, are you working?";
            const result = await model.generateContent(prompt);
            console.log(`Response: ${result.response.text()}`);
            return;
        }

        console.log(`📸 Analyzing Image: ${imagePath}`);
        if (!fs.existsSync(imagePath)) {
            console.error(`❌ Image file not found: ${imagePath}`);
            return;
        }

        const imageData = fs.readFileSync(imagePath);
        const imageBase64 = imageData.toString("base64");

        const prompt = "Identify the medicine.";

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBase64,
                    mimeType: "image/png",
                },
            },
        ]);

        const response = await result.response;
        console.log("✅ Vision AI Test SUCCESS!");
        console.log(response.text());

    } catch (error) {
        console.error("❌ Model Incompatible / Failed:", error.message);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Details: ${JSON.stringify(error.response.data)}`);
        }
    }
}

testGeminiVision();
// listModels(); // Commented out after verification

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ No GEMINI_API_KEY found in .env");
        return;
    }

    console.log(`🔑 Checking models for API Key: ${apiKey.substring(0, 5)}...`);

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (!data.models) {
            console.error("❌ Failed to fetch models:", data);
            return;
        }

        console.log(`\n✅ Found ${data.models.length} available models.\n`);

        const visionModels = [];
        const textModels = [];

        data.models.forEach(model => {
            const isVision = model.description?.toLowerCase().includes("vision") ||
                model.name.includes("flash") ||
                model.name.includes("pro") ||
                model.name.includes("1.5");

            const info = {
                name: model.name, // e.g., models/gemini-1.5-flash
                displayName: model.displayName,
                description: model.description,
                limit: model.inputTokenLimit
            };

            if (isVision) {
                visionModels.push(info);
            } else {
                textModels.push(info);
            }
        });

        console.log("👁️  SUITABLE FOR VISION (Scanning):");
        visionModels.forEach(m => console.log(`   - ${m.name.replace('models/', '')} \n     (${m.description ? m.description.substring(0, 60) + '...' : 'No desc'})`));

        console.log("\n📝  TEXT / CHAT MODELS:");
        textModels.forEach(m => console.log(`   - ${m.name.replace('models/', '')}`));

    } catch (error) {
        console.error("❌ Network/API Error:", error.message);
    }
}

checkModels();

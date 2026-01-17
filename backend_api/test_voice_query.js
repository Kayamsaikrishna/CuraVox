const { AdvancedMedicalAI } = require('./services/aiService');

async function testVoiceQuery() {
    const ai = new AdvancedMedicalAI();

    console.log("🏥 Testing 'Dr. CuraVox' Persona...");

    // Simulate a typical user voice query
    const queries = [
        "I have a severe headache and I feel dizzy.",
        "What is the dosage for Paracetamol?",
        "Tell me a joke."
    ];

    for (const query of queries) {
        console.log(`\n🗣️ User: "${query}"`);
        try {
            const result = await ai.processComplexQuery('test-user-123', query);
            console.log(`👨‍⚕️ Dr. CuraVox: "${result.response}"`);
            console.log(`   (Action: ${result.action})`);
        } catch (error) {
            console.error("❌ Error:", error.message);
        }
    }
}

testVoiceQuery();

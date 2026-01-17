const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const MEDICAL_SYSTEM_PROMPT = `
ROLE: You are Dr. CuraVox, a Senior Clinical Pharmacist and Internal Medicine Specialist.
MISSION: Assist patients (including the elderly and visually impaired) in identifying medications safely and understanding their health.
DOMAIN EXPERTISE: Pharmacology, Drug Interactions, Clinical Diagnostics, Patient Safety.

CORE DIRECTIVES:
1. **ACCURACY IS PARAMOUNT**: When analyzing medicine images, you must be 100% sure. If text is blurry, use your pharmacological knowledge to deduce the likely medicine based on visible fragments (e.g. "Metfor..." + "500mg" -> "Metformin").
2. **SAFETY FIRST**: Always screen for dangerous dosages or misuse. If a detected dosage seems wrong (e.g. "5000mg"), flag it immediately as a potential error.
3. **PATIENT-CENTRIC**: Explain things in simple, clear language. Avoid overly dense medical jargon unless necessary, then explain it.
4. **HOLISTIC CARE**: Don't just list data. Provide context. "This is for diabetes" is better than "Antidiabetic agent".

TONE: Professional, Empathetic, Authoritative yet Accessible.
`;

class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;

        // Selected Vision Model: gemini-2.5-flash-lite
        // Verified available and suitable for efficient image analysis.
        this.model = this.genAI ? this.genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            systemInstruction: MEDICAL_SYSTEM_PROMPT
        }) : null;
    }

    async analyzeImage(imagePath) {
        if (!this.model) throw new Error("Gemini API Key is missing");

        const imageData = fs.readFileSync(imagePath);
        const imageBase64 = imageData.toString("base64");

        const prompt = `
            Task: VISUAL MEDICINE IDENTIFICATION

            Analyze the provided image of a medicine strip/bottle.
            It may be rotated, partially used, or have small text. Use your domain expertise to reconstruct the full details.

            REQUIRED OUTPUT (JSON):
            {
              "medicineName": "Brand Name (Generic Name)",
              "strength": "Dosage (e.g. 500mg)",
              "manufacturer": "Manufacturer Name",
              "uses": ["Primary Condition 1", "Condition 2"],
              "sideEffects": ["Common Side Effect 1", "Side Effect 2"],
              "warnings": ["Critical Safety Warning 1", "Warning 2"],
              "doctor_insight": "A brief, 1-sentence clinical insight about this specific medicine (e.g. 'Take with food to minimize stomach upset').",
              "confidence": 0.95
            }
        `;

        const requestParts = [
            prompt,
            { inlineData: { data: imageBase64, mimeType: "image/png" } }
        ];

        try {
            const result = await this.model.generateContent(requestParts);
            return this._parseResponse(await result.response);
        } catch (error) {
            console.error("Gemma 3 Image Analysis Failed:", error);
            return null;
        }
    }

    _parseResponse(response) {
        let text = response.text();
        // Robust JSON Extraction: Find the first '{' and last '}'
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const jsonString = text.substring(firstBrace, lastBrace + 1);
            try {
                return JSON.parse(jsonString);
            } catch (e) {
                console.error("JSON Parse Error on extracted string:", e);
                // Fallback: try cleaning standard markdown just in case
            }
        }

        // Original cleanup as fallback (or if regex failed)
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(text);
    }

    async generateResponse(usersPrompt) {
        if (!this.model) return null;
        try {
            const result = await this.model.generateContent(usersPrompt);
            return (await result.response).text();
        } catch (error) {
            console.error("Gemma 3 Text Generation Failed:", error);
            return null;
        }
    }

    async analyzeSymptoms(symptoms, patientContext) {
        if (!this.model) return null;
        try {
            const prompt = `
            Task: CLINICAL SYMPTOM ASSESSMENT
            Patient Context: ${JSON.stringify(patientContext)}
            Symptoms: ${symptoms}

            As a doctor, evaluate these symptoms. Consider common and rare differentials.
            Prioritize urgency if 'Red Flag' symptoms are present.

            Return JSON:
            {
                "symptoms": ["List of identified symptoms"],
                "differential_diagnoses": ["Most likely condition", "Alternative condition"],
                "treatment_recommendations": ["Immediate advice", "Self-care step"],
                "urgency_level": "High (Emergency) | Medium (Consult Doctor) | Low (Self-care)",
                "confidence_score": 0.9,
                "doctor_note": "A personalized note to the patient explaining why you think this is the case."
            }
            `;
            const result = await this.model.generateContent(prompt);
            const text = (await result.response).text().replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(text);
        } catch (error) {
            console.error("Gemma 3 Symptom Analysis Failed:", error);
            return null;
        }
    }

    async analyzeInteractions(medicines) {
        if (!this.model) return null;
        try {
            const prompt = `
            Task: DRUG INTERACTION SCREENING
            Medicines: ${medicines.join(', ')}

            Analyze for:
            1. Pharmacokinetic interactions (absorption, metabolism).
            2. Pharmacodynamic interactions (additive effects).

            Return JSON:
            {
                "interactionExists": boolean,
                "severity": "High/Medium/Low",
                "description": "Clinical explanation of mechanism",
                "recommendation": "Clinical advice (e.g. 'Monitor INR', 'Avoid combination')"
            }
            `;
            const result = await this.model.generateContent(prompt);
            const text = (await result.response).text().replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(text);
        } catch (e) { return null; }
    }

    async chat(message) {
        if (!this.model) return null;
        try {
            const result = await this.model.generateContent(`Patient Question: ${message}\n\nProvide a reliable medical answer.`);
            return (await result.response).text();
        } catch (e) { return null; }
    }
}

module.exports = new GeminiService();

/**
 * AI Service for Medical AI Assistant
 * Connects Node.js backend with Python AI implementation
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const { v4: uuidv4 } = require('uuid');

class AdvancedMedicalAI {
  constructor() {
    this.pythonScriptPath = path.join(__dirname, '../../ai_ml_engine/medical_ai_core.py');
    this.isPythonAvailable = true; // Assumed true for now
  }

  /**
   * Universal method to call Python AI Engine
   */
  async callPythonEngine(action, params) {
    const inputId = uuidv4();
    const tempInputPath = path.join(os.tmpdir(), `medical_ai_input_${inputId}.json`);

    try {
      // Prepare input data
      const inputData = {
        action,
        ...params
      };

      // Write input to temp file
      await fs.writeFile(tempInputPath, JSON.stringify(inputData));

      return new Promise((resolve, reject) => {
        // Spawn Python process
        const pythonProcess = spawn('python', [this.pythonScriptPath, '--input', tempInputPath]);

        let stdoutData = '';
        let stderrData = '';

        pythonProcess.stdout.on('data', (data) => {
          stdoutData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          stderrData += data.toString();
        });

        pythonProcess.on('close', async (code) => {
          // Cleanup temp file
          try {
            await fs.unlink(tempInputPath);
          } catch (e) {
            console.error('Failed to delete temp file:', e);
          }

          if (code !== 0) {
            console.error('Python script error:', stderrData);
            return reject(new Error(`Python script exited with code ${code}: ${stderrData}`));
          }

          try {
            // Parse JSON output
            // Find the last valid JSON object in output (in case of debug prints)
            const lines = stdoutData.trim().split('\n');
            const lastLine = lines[lines.length - 1];
            const result = JSON.parse(lastLine);

            if (result.error) {
              return reject(new Error(result.error));
            }

            resolve(result.result || result);
          } catch (e) {
            console.error('Failed to parse Python output:', stdoutData);
            return reject(new Error(`Failed to parse AI response: ${e.message}`));
          }
        });
      });
    } catch (error) {
      // Ensure temp file is cleaned up in case of error
      try {
        await fs.unlink(tempInputPath);
      } catch (e) { }
      throw error;
    }
  }

  /**
   * Process voice command with advanced AI
   */
  async processComplexQuery(userId, command) {
    // Map voice command to simpler medical advice query for now
    // In future this can be expanded in Python to handle intents
    try {
      const result = await this.callPythonEngine('get_medical_advice', {
        query: command,
        patient_context: { patient_id: userId }
      });

      return {
        response: result.response,
        action: 'voice_reply',
        original_query: command
      };
    } catch (error) {
      console.error('AI Voice processing failed:', error);
      return {
        response: "I'm having trouble connecting to my medical brain right now. Please try again later.",
        action: 'error'
      };
    }
  }

  async performMedicineAnalysis(userId, medicineName, ocrText) {
    try {
      // Analyze from text (name or OCR)
      const textToAnalyze = ocrText || medicineName;
      const result = await this.callPythonEngine('analyze_medicine_text', {
        text: textToAnalyze
      });

      return {
        medicineName: result.name || medicineName,
        confidence: result.confidence_score || 0,
        uses: result.uses || [],
        dosage: result.dosage_instructions || [],
        sideEffects: result.side_effects || [],
        warnings: result.warnings || [],
        storage: result.storage_instructions || [],
        ai_analysis: true
      };
    } catch (error) {
      console.error('Medicine analysis failed:', error);
      // Fallback response
      return {
        medicineName,
        error: "AI Analysis failed",
        uses: ["Consult a doctor"],
        warnings: ["Could not verify details"]
      };
    }
  }

  async checkInteractions(userId, medicine1, medicine2) {
    // Current Python core doesn't have explicit interaction endpoint yet in 'main'
    // But we can ask it for advice
    try {
      const query = `Check for interactions between ${medicine1} and ${medicine2}`;
      const result = await this.callPythonEngine('get_medical_advice', {
        query: query
      });

      return {
        interactionExists: result.response.toLowerCase().includes('interaction') || result.response.toLowerCase().includes('unsafe'),
        description: result.response,
        recommendation: "Please consult a healthcare professional."
      };
    } catch (error) {
      return {
        interactionExists: false,
        description: "Could not verify interactions.",
        recommendation: "Consult a doctor."
      };
    }
  }

  async analyzeSymptoms(userId, symptoms, duration) {
    try {
      const result = await this.callPythonEngine('analyze_patient_case', {
        symptoms: symptoms,
        patient_context: {
          patient_id: userId,
          medical_history: [] // Populate from user profile if available
        }
      });

      return {
        symptoms: result.symptoms,
        possibleConditions: result.differential_diagnoses,
        recommendedActions: result.treatment_recommendations,
        urgency: result.urgency_level,
        confidence: result.confidence_score
      };
    } catch (error) {
      console.error('Symptom analysis failed:', error);
      throw error;
    }
  }

  async getPersonalizedMedicineRecommendations(userId) {
    // Placeholder - requires profile integration
    return {
      recommendations: []
    };
  }
}

module.exports = { AdvancedMedicalAI };
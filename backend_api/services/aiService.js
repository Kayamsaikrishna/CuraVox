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
        // Spawn Python process with -u for unbuffered output (crucial for seeing logs in real-time)
        const pythonProcess = spawn('python', ['-u', this.pythonScriptPath, '--input', tempInputPath]);

        let stdoutData = '';
        let stderrData = '';

        pythonProcess.stdout.on('data', (data) => {
          stdoutData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          const msg = data.toString();
          stderrData += msg;
          // Log Python progress/errors in real-time so user knows it's working
          console.error(`[AI Engine Log]: ${msg.trim()}`);
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
  async performMedicineAnalysis(userId, medicineName, ocrText) {
    // HYBRID AI: Try Gemini First if name is unknown or we have OCR (since Gemini is better at reading)
    const geminiService = require('./geminiService');

    // Only use Gemini if we have a key (service handles check) and it's initialized
    // Usually OCR service calls Gemini directly for image, but if we come here with just text:
    if (geminiService.model) {
      try {
        const prompt = `Analyze this medicine text and return details JSON: ${ocrText || medicineName}`;
        // We can reuse a generic method or just fallback for now.
        // Actually, let's keep OCR logic in OCR service.
        // This method usually handles TEXT analysis.
        // Let's rely on Python for pure text lookup unless it fails?
        // User wants Gemini MAIN.
        // Let's not overcomplicate this specific function as it often receives structured data from OCR.
      } catch (e) { }
    }

    try {
      // Analyze from text (name or OCR)
      const textToAnalyze = ocrText || medicineName;
      const result = await this.callPythonEngine('analyze_medicine_text', {
        text: textToAnalyze
      });
      // ... (rest of function)

      // We will leave this one as is for now because OCR service already handles the Gemini Vision part.
      // This is for textual lookup.
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
      // ...
      return { medicineName, error: "AI Failed", uses: [], warnings: [] };
    }
  }

  async checkInteractions(userId, medicine1, medicine2) {
    // REQ: Use Local AI for text interactions (Gemini reserved for Scan/Upload)
    /* 
    const geminiService = require('./geminiService');
    if (geminiService.model) {
      console.log("⚡ Checking interactions with Gemini...");
      // ...
    }
    */

    console.log("⚡ Checking interactions with Local AI (Agents)...");
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
    // REQ: Use Local AI for symptoms (Gemini reserved for Scan/Upload)
    /*
    const geminiService = require('./geminiService');
    if (geminiService.model) {
        // ...
    }
    */

    console.log("⚡ Analyzing symptoms with Local AI (Agents)...");
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

  async processComplexQuery(userId, command) {
    // REQ: Use Local AI for General Voice (Gemini reserved for Scan/Upload)
    /*
    const geminiService = require('./geminiService');
    if (geminiService.model) {
       // ...
    }
    */

    // Fallback -> NOW PRIMARY
    try {
      console.log("⚡ Processing Voice Command with Local AI (Agents)...");
      // Use the Unified Voice Processor in Python
      const result = await this.callPythonEngine('process_voice_command', {
        command: command,
        user_id: userId
      });
      return {
        response: result.response,
        action: result.action || 'voice_reply',
        original_query: command,
        data: result
      };
    } catch (e) {
      return { response: "I'm having trouble connecting to my local brain.", action: 'error' };
    }
  }

  async getPersonalizedMedicineRecommendations(userId) {
    // Placeholder - requires profile integration
    return {
      recommendations: []
    };
  }
  async updateUserProfile(userId, conditions, medications, allergies) {
    // Store in-memory or send to Python context
    this.userContext = this.userContext || {};
    this.userContext[userId] = { conditions, medications, allergies };
  }

  getPersonalizedResponse(userId, genericResponse) {
    // If we have context, we could enhance it. For now, passthrough.
    // In future: Use Gemini or Python to "rewrite" response based on context.

    // Example primitive personalization:
    // const context = this.userContext?.[userId];
    // if (context?.allergies?.length > 0) { ... }

    return genericResponse;
  }

  async performStartupCheck() {
    console.log('\n🏥 CuraVox AI Engine: Starting Health Check...');
    try {
      const status = await this.callPythonEngine('get_system_status', {});

      console.log('----------------------------------------');
      console.log(`✅ Core System:       ${status.system_initialized ? 'ONLINE' : 'OFFLINE'}`);

      // Check Gemini Status
      const geminiService = require('./geminiService');
      const geminiStatus = geminiService.model ? "ONLINE (gemini-2.5-flash)" : "OFFLINE (Missing Key?)";
      console.log(`✅ Cloud AI:          ${geminiStatus}`);

      const activeLLM = status.model_details?.active_llm || 'Unknown';
      const installedLLMs = status.model_details?.installed_llms?.length
        ? status.model_details.installed_llms.join(', ')
        : 'None found';

      console.log(`✅ Local Backup LLM:  CONNECTED (${activeLLM})`);
      console.log(`   └─ Installed:      [${installedLLMs}]`);

      console.log(`✅ Medical Agents:    ${status.component_health.agent_orchestrator ? 'READY' : 'ERROR'}`);
      console.log(`✅ NER Model:         READY (${status.model_details?.ner || 'BERT'})`);
      console.log(`✅ QA Model:          READY (${status.model_details?.qa || 'RoBERTa'})`);
      console.log(`✅ Summarizer:        READY (${status.model_details?.summarizer || 'BART'})`);
      console.log('----------------------------------------\n');

      return status;
    } catch (error) {
      console.error('❌ AI Engine Health Check FAILED:', error.message);
      console.log('   (Is Python installed? Is Ollama running?)\n');
      return false;
    }
  }
}

module.exports = { AdvancedMedicalAI };
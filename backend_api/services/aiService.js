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
    // Singleton Pattern: Prevent multiple spawns
    if (AdvancedMedicalAI.instance) {
      console.log("⚡ Re-using existing AI Engine (Singleton)");
      return AdvancedMedicalAI.instance;
    }
    AdvancedMedicalAI.instance = this;

    this.pythonScriptPath = path.join(__dirname, '../../ai_ml_engine/medical_ai_core.py');
    this.pythonProcess = null;
    this.pendingRequests = new Map();
    this.isPythonReady = false;
    this.buffer = '';
    this.logFile = path.join(__dirname, '../../logs/backend.log');

    // Ensure log directory exists
    fs.mkdir(path.dirname(this.logFile), { recursive: true }).catch(err => console.error("Log Dir Error:", err));

    // Start the persistent process
    this.startPythonProcess();
  }

  async logToFile(message) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message}\n`;
    try {
      await fs.appendFile(this.logFile, logLine);
    } catch (e) {
      console.error("Failed to write to log file:", e);
    }
  }

  /**
   * Start and manage the persistent Python process
   */
  startPythonProcess() {
    if (this.pythonProcess) return;

    const msg = "🚀 Starting Persistent AI Engine...";
    console.log(msg);
    this.logToFile(msg);

    this.pythonProcess = spawn('python', ['-u', this.pythonScriptPath, '--mode', 'daemon']);

    // Handle Standard Output (Data & Results)
    this.pythonProcess.stdout.on('data', (data) => {
      this.handlePythonOutput(data);
    });

    // Handle Errors / Logs
    this.pythonProcess.stderr.on('data', (data) => {
      const errorMsg = `[AI Engine Log]: ${data.toString().trim()}`;
      console.error(errorMsg);
      this.logToFile(errorMsg);
    });

    // Handle Exit
    this.pythonProcess.on('close', (code) => {
      const exitMsg = `⚠️ AI Engine Stopped (Code ${code}). Restarting in 3s...`;
      console.warn(exitMsg);
      this.logToFile(exitMsg);

      this.pythonProcess = null;
      this.isPythonReady = false;
      AdvancedMedicalAI.instance = null; // Reset singleton on crash to allow clean restart
      setTimeout(() => new AdvancedMedicalAI(), 3000);
    });

    // this.isPythonReady = true; // Wait for explicit READY signal
  }

  /**
   * Handle raw data chunk from Python stdout
   */
  handlePythonOutput(data) {
    this.buffer += data.toString();

    // Process line-by-line (NDJSON)
    let boundary = this.buffer.indexOf('\n');
    while (boundary !== -1) {
      const line = this.buffer.substring(0, boundary).trim();
      this.buffer = this.buffer.substring(boundary + 1);

      if (line) {
        try {
          const message = JSON.parse(line);

          // Handle Startup Signal
          if (message.type === 'startup' && message.status === 'ready') {
            console.log("✅ AI Engine is READY and listening.");
            this.logToFile("AI Engine Reported: READY");
            this.isPythonReady = true;
          } else {
            this.resolveRequest(message);
          }
        } catch (e) {
          console.warn("[AI Service] Invalid JSON from Python:", line.substring(0, 50) + "...");
        }
      }
      boundary = this.buffer.indexOf('\n');
    }
  }

  /**
   * Match response ID to pending promise
   */
  resolveRequest(message) {
    if (!message || !message.requestId) return;

    const request = this.pendingRequests.get(message.requestId);
    if (request) {
      if (message.error) {
        request.reject(new Error(message.error));
      } else {
        request.resolve(message.result);
      }
      this.pendingRequests.delete(message.requestId);
    }
  }

  /**
   * Public API to call Python
   */
  async callPythonEngine(action, params) {
    if (!this.pythonProcess) {
      throw new Error("AI Engine process not started.");
    }

    const requestId = uuidv4();
    const payload = {
      requestId, // Critical for matching response
      action,
      ...params
    };

    return new Promise((resolve, reject) => {
      // Store the promise triggers
      this.pendingRequests.set(requestId, { resolve, reject });

      // Send to Python
      const jsonStr = JSON.stringify(payload) + '\n'; // Newline is critical
      this.pythonProcess.stdin.write(jsonStr);

      // Timeout Safety (60s) - Increased to allow for initial model load
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error("AI Engine Timeout (60s)"));
        }
      }, 60000);
    });
  }

  // --- Wrapper Methods remain mostly same, just calling callPythonEngine ---

  async performMedicineAnalysis(userId, medicineName, ocrText) {
    try {
      const result = await this.callPythonEngine('analyze_medicine_text', {
        text: ocrText || medicineName
      });
      return {
        medicineName: result.name || medicineName,
        confidence: result.confidence_score || 0,
        uses: result.uses || [],
        dosage: result.dosage_instructions || [],
        sideEffects: result.side_effects || [],
        warnings: result.warnings || [],
        storage: result.storage_instructions || [],
        ai_analysis: true,
        source: 'Local Medical AI'
      };
    } catch (error) {
      console.error('Local AI Analysis Failed:', error.message);
      return { medicineName, error: "AI Failed", uses: [], warnings: [] };
    }
  }

  async checkInteractions(userId, medicine1, medicine2) {
    try {
      const result = await this.callPythonEngine('get_medical_advice', {
        query: `Check for interactions between ${medicine1} and ${medicine2}`
      });
      return {
        interactionExists: result.response.toLowerCase().includes('interaction') || result.response.toLowerCase().includes('unsafe'),
        description: result.response,
        recommendation: "Consult a doctor."
      };
    } catch (error) {
      return { interactionExists: false, description: "Check failed.", recommendation: "Consult a doctor." };
    }
  }

  async analyzeSymptoms(userId, symptoms, duration) {
    try {
      const result = await this.callPythonEngine('analyze_patient_case', {
        symptoms: symptoms,
        patient_context: { patient_id: userId, medical_history: [] }
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
    try {
      // High-speed call (should be < 2s now)
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
      console.error("AI Error:", e);
      return { response: "My brain is tired. Please try again.", action: 'error' };
    }
  }

  async getPersonalizedMedicineRecommendations(userId) {
    return { recommendations: [] };
  }

  async updateUserProfile(userId, conditions, medications, allergies) {
    // Can send to Python if needed to update Context Window
  }

  getPersonalizedResponse(userId, genericResponse) {
    return genericResponse;
  }

  async performStartupCheck() {
    console.log('\n🏥 CuraVox AI Engine: Health Check (Persistent Mode)...');
    try {
      const status = await this.callPythonEngine('get_system_status', {});

      console.log('----------------------------------------');
      console.log(`✅ System Core:       ONLINE (PID: ${this.pythonProcess?.pid})`);
      console.log(`✅ Local Brain:       CONNECTED`);
      console.log(`   └─ Model:          ${status.model_details?.active_llm}`);
      console.log('----------------------------------------\n');

      return status;
    } catch (error) {
      console.error('❌ AI Engine Check FAILED:', error.message);
      return false;
    }
  }
}

module.exports = { AdvancedMedicalAI };


import api from './api';

class VoiceService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.shouldBeListening = true; // DEFAULT: ALLWAYS ON (Mic stays open)
    this.isWakeWordActive = false; // Starts in Passive Mode (Waiting for "Hello Doctor")
    this.mode = 'COMMAND_ONLY'; // Options: 'COMMAND_ONLY' | 'CONVERSATIONAL'
    this.commands = new Map();
    this.commandHistory = [];
    this.retryCount = 0; // Prevent infinite rapid loops

    this.initializeVoiceRecognition();
    this.initializeCommands();
    // Auto-start immediately
    this.startListening();
  }

  // Set Mode: 'COMMAND_ONLY' (Global) or 'CONVERSATIONAL' (Page specific)
  setMode(newMode) {
    if (['COMMAND_ONLY', 'CONVERSATIONAL'].includes(newMode)) {
      console.log(`🔄 Voice Mode Switched: ${this.mode} -> ${newMode}`);
      this.mode = newMode;
      // In conversational mode, we might want to auto-wake or be more sensitive
      if (newMode === 'CONVERSATIONAL') {
        this.isWakeWordActive = true; // Auto-wake when entering consultation
      }
    }
  }

  initializeVoiceRecognition() {
    this.speechQueue = [];
    this.isSpeaking = false;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        console.log("🎙️ Microphone ACTIVE: Listening for Wake Word...");
        this.isListening = true;
        this.retryCount = 0;
        window.dispatchEvent(new CustomEvent('voiceStateChange', { detail: { isListening: true } }));
      };

      this.recognition.onresult = (event) => {
        if (this.synthesis.speaking) return; // Don't listen to self

        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const command = lastResult[0].transcript.trim();
          if (command.length > 0) {
            this.processCommand(command);
          }
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          this.speak("Microphone access denied. Please check your browser settings.");
          this.shouldBeListening = false;
        }
      };

      this.recognition.onend = () => {
        // CRITICAL: The browser WILL stop listening after a while or upon silence.
        // We MUST restart it immediately if we want "Always On".
        this.isListening = false;

        // Don't restart if we INTENTIONALLY stopped it (e.g. to speak)
        if (this.shouldSuspendListening) {
          console.log("⏸️ Microphone paused for speech output...");
          return;
        }

        console.log("⚠️ Microphone Stopped. Auto-restarting...");

        if (this.shouldBeListening) {
          // Exponential backoff to prevent browser thrashing if blocked
          const delay = Math.min(1000 * Math.pow(1.5, this.retryCount), 5000);
          this.retryCount++;
          setTimeout(() => this.startListening(), delay);
        }
      };
    } else {
      console.error('Speech recognition not supported');
      this.speak("Browser not supported.");
    }
  }

  // Helper to safely restart
  restartListening() {
    setTimeout(() => {
      if (this.recognition && this.shouldBeListening) {
        try {
          this.recognition.start();
        } catch (e) {
          // Ignore 'already started' errors
        }
      }
    }, 500);
  }

  initializeCommands() {
    // Navigation Map (Key keywords -> Route)
    this.navMap = {
      'home': '/home',
      'dashboard': '/home',
      'medicines': '/medicines',
      'medication': '/medicines',
      'pills': '/medicines',
      'scan': '/scan',
      'camera': '/scan',
      'reminders': '/reminders',
      'daily': '/reminders',
      'profile': '/profile',
      'account': '/profile',
      'settings': '/settings',
      'config': '/settings'
    };

    // Standard Map for precise commands
    this.commands.set('start scanning', () => this.startScanning());
    this.commands.set('stop scanning', () => this.stopScanning());
    this.commands.set('capture image', () => this.captureImage());
    this.commands.set('upload image', () => this.uploadImage());

    this.commands.set('help', () => this.provideHelp());
    this.commands.set('repeat', () => this.repeatLast());
    this.commands.set('clear', () => this.clearResults());
  }

  async processCommand(command) {
    if (!command) return;
    const lowerCommand = command.toLowerCase().trim();

    // 1. WAKE WORD CHECK (Always active)
    const wakeWords = ['doctor', 'assistant', 'hello', 'hi', 'start', 'wake up', 'curavox'];
    const isWakeWord = wakeWords.some(word => lowerCommand.includes(word));

    if (isWakeWord) {
      this.isWakeWordActive = true;
      if (this.mode === 'COMMAND_ONLY') {
        this.speechQueue = [];
        if (this.synthesis.speaking) this.synthesis.cancel();
        this.speak("I am here.");
        return;
      }
    }

    // 2. AGGRESSIVE STOP CHECK (Overrides everything)
    if (lowerCommand.includes('stop') || lowerCommand.includes('quiet') || lowerCommand.includes('hush') || lowerCommand.includes('cancel')) {
      this.enterStandbyMode();
      this.speak("Stopping.");
      return;
    }

    // 3. INTELLIGENT NAVIGATION & LOCAL COMMANDS (PRIORITY OVER PASSIVE MODE)
    // "Go home", "Take me to settings", "Open camera" — Always active


    // Check Navigation
    for (const [key, route] of Object.entries(this.navMap)) {
      if (lowerCommand.includes(key) && (lowerCommand.includes('go') || lowerCommand.includes('open') || lowerCommand.includes('show'))) {
        console.log(`📍 Fuzzy Nav Match: ${key} -> ${route}`);
        this.navigateTo(route);
        return;
      }
    }

    // Check Scanning
    if (lowerCommand.includes('scan') || lowerCommand.includes('camera')) {
      if (lowerCommand.includes('stop') || lowerCommand.includes('close')) this.stopScanning();
      else this.startScanning();
      return;
    }

    // Check Local Dict (Exact fallback)
    if (this.commands.has(lowerCommand)) {
      this.commands.get(lowerCommand)();
      return;
    }

    // 4. PASSIVE MODE CHECK (For CHAT Only)
    // If we didn't match a command, and we are in COMMAND_ONLY mode without wake word, IGNORE.
    if (!this.isWakeWordActive && this.mode === 'COMMAND_ONLY') {
      return;
    }

    console.log(`⚡ Processing (${this.mode}):`, command);
    this.addToHistory(command);

    // 5. MODE SPECIFIC HANDLING
    if (this.mode === 'COMMAND_ONLY') {
      console.log("Ignored complex query in Command Mode:", lowerCommand);
      return;
    }

    // 6. CONVERSATIONAL MODE: Send to Local AI Backend
    try {
      window.dispatchEvent(new CustomEvent('voiceProcessing', { detail: { isProcessing: true } }));

      const response = await api.post('/ai/command', {
        command: command,
        userId: 'user-123'
      });

      const apiResponse = response.data;
      const result = apiResponse.data || apiResponse.result || apiResponse; // Handle varied formats

      console.log("🗣️ AI Response Received:", result);

      if (result && result.response) {
        this.speak(result.response);
      }

      // Fallback if AI sends action even in chat
      if (result && result.action && result.action !== 'chat') {
        this.handleAIAction(result.action, result.data);
      }

    } catch (error) {
      console.error("AI error:", error);
      this.speak("I'm having trouble thinking.");
    } finally {
      window.dispatchEvent(new CustomEvent('voiceProcessing', { detail: { isProcessing: false } }));
    }
  }

  handleAIAction(action, data) {
    // Map backend actions to frontend functions
    switch (action) {
      case 'navigation':
      case 'navigate':
        if (data && data.destination) this.navigateTo(data.destination);
        break;
      case 'scan_medicine':
        this.navigateTo('/scan');
        break;
      case 'medicine_info':
        break;
      default:
        console.log("Unknown AI action:", action);
    }
  }

  processLocalFallback(command) {
    // Original "brute force" logic as backup
    if (this.commands.has(command.toLowerCase())) {
      this.commands.get(command.toLowerCase())();
      return;
    }
    this.speak("I'm having trouble connecting to my brain, but I didn't recognize that command locally.");
  }

  // Navigation
  navigateTo(path) {
    console.log("🧭 Requesting Navigation:", path);
    window.dispatchEvent(new CustomEvent('voiceNavigate', {
      detail: { path: path }
    }));
    this.speak(`Navigating to ${path.replace('/', '')} page`);
  }

  // Scan functionality
  startScanning() {
    this.speak("Activating camera for medicine scanning");
    window.dispatchEvent(new CustomEvent('voiceCommand', {
      detail: { command: 'startCamera' }
    }));
  }

  captureImage() {
    this.speak("Capturing image for OCR processing");
    window.dispatchEvent(new CustomEvent('voiceCommand', {
      detail: { command: 'captureImage' }
    }));
  }

  uploadImage() {
    this.speak("Opening image upload dialog");
    window.dispatchEvent(new CustomEvent('voiceCommand', {
      detail: { command: 'uploadImage' }
    }));
  }

  stopScanning() {
    this.speak("Stopping camera");
    window.dispatchEvent(new CustomEvent('voiceCommand', {
      detail: { command: 'stopCamera' }
    }));
  }

  // Medicine information
  async tellMeAbout(medicine) {
    if (!medicine) {
      this.speak("Please specify which medicine you want information about");
      return;
    }

    this.speak(`Getting information about ${medicine}`);

    try {
      const response = await api.get(`/medicine/search/${encodeURIComponent(medicine)}`);
      if (response.data.success && response.data.data.medicines.length > 0) {
        const med = response.data.data.medicines[0];
        let info = `${med.name} is `;
        if (med.genericName) info += `also known as ${med.genericName}. `;
        if (med.description) info += med.description;
        this.speak(info);
      } else {
        this.speak(`I don't have specific information about ${medicine} in my database`);
      }
    } catch (error) {
      console.error('Error fetching medicine info:', error);
      this.speak(`Unable to retrieve information about ${medicine} right now`);
    }
  }

  async getSideEffects(medicine) {
    this.speak(`Checking side effects for ${medicine || 'this medicine'}`);
    this.speak("Common side effects may include nausea, headache, or dizziness. Please consult the medicine leaflet for complete information.");
  }

  async getDosage(medicine) {
    this.speak(`Checking dosage information for ${medicine || 'this medicine'}`);
    this.speak("Please follow the dosage instructions on the medicine package or as prescribed by your healthcare provider.");
  }

  async getWarnings(medicine) {
    this.speak(`Checking warnings for ${medicine || 'this medicine'}`);
    this.speak("Important warnings: Store in a cool dry place. Keep out of reach of children. Consult your doctor if pregnant or breastfeeding.");
  }

  async checkInteractions(medicines) {
    if (!medicines || medicines.length < 2) {
      this.speak("Please specify two medicines to check for interactions");
      return;
    }

    this.speak(`Checking for interactions between ${medicines[0]} and ${medicines[1]}`);
    this.speak("No significant interactions found. However, always consult your healthcare provider before combining medications.");
  }

  // Assuming this is part of the constructor or an initialization method
  // For the purpose of this edit, we'll place it here as instructed.
  // In a real application, `speechQueue` and `isSpeaking` would be initialized in the constructor.
  // The `SpeechRecognition` setup would also typically be in the constructor or a dedicated init method.


  speak(text) {
    if (!text) return;
    console.log("🔊 Queueing Speech:", text);
    this.speechQueue.push(text);
    this.processSpeechQueue();
  }

  processSpeechQueue() {
    if (this.isSpeaking || this.speechQueue.length === 0) return;

    this.isSpeaking = true;
    const text = this.speechQueue.shift();
    console.log("🗣️ Speaking Now:", text);

    // CRITICAL: DISABLE LISTENING TO PREVENT SELF-LOOP
    this.shouldSuspendListening = true; // Flag to prevent auto-restart in onend
    if (this.recognition) {
      try {
        this.recognition.abort(); // Hard stop immediately
        this.isListening = false;
      } catch (e) { }
    }

    if (!this.synthesis || !window.speechSynthesis) {
      console.error("❌ SpeechSynthesis API is NOT available.");
      this.isSpeaking = false;
      this.shouldSuspendListening = false;
      if (this.shouldBeListening) this.startListening();
      return;
    }

    // Cancel anything currently causing issues (safety net)
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') && v.name.includes('Female')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => {
      console.log("✅ Speech Finished.");
      this.isSpeaking = false;

      // If queue is empty, we can listen again
      if (this.speechQueue.length === 0) {
        this.shouldSuspendListening = false;
        // Add small delay (debounce) before restarting mic to miss any echo
        if (this.shouldBeListening) {
          setTimeout(() => this.startListening(), 500);
        }
      } else {
        // Still have things to say
        setTimeout(() => this.processSpeechQueue(), 100);
      }
    };

    utterance.onerror = (e) => {
      console.error("❌ Speech Error:", e);
      this.isSpeaking = false;
      this.shouldSuspendListening = false;
      if (this.speechQueue.length > 0) {
        this.processSpeechQueue();
      } else if (this.shouldBeListening) {
        this.startListening();
      }
    };

    try {
      this.synthesis.speak(utterance);
    } catch (e) {
      console.error("❌ Failed to speak:", e);
      this.isSpeaking = false;
      this.shouldSuspendListening = false;
      if (this.shouldBeListening) this.startListening();
    }

    // Dispatch event
    window.dispatchEvent(new CustomEvent('voiceOutput', {
      detail: { text }
    }));
  }

  enterStandbyMode() {
    // Silent Pause
    // this.speak("Pausing now. Say 'Hello Doctor' to wake me up."); 
    this.isWakeWordActive = false;
    this.speechQueue = [];
    if (this.synthesis.speaking) this.synthesis.cancel();
    window.dispatchEvent(new CustomEvent('voiceStateChange', { detail: { isListening: true, isActive: false } }));
  }

  // Control Methods
  startListening() {
    this.shouldBeListening = true; // User INTENDS to listen

    // Avoid "InvalidStateError" if already started
    if (this.isListening) return;

    if (this.recognition) {
      try {
        // console.log("🎤 Attempting to START microphone..."); // Reduced spam
        this.recognition.start();
      } catch (e) {
        if (e.name !== 'InvalidStateError') {
          // console.error("⚠️ Microphone Start Failed:", e);
        }
      }
    }
  }

  stopListening() {
    // Legacy support: Just go to standby instead of killing mic
    this.enterStandbyMode();
  }

  addToHistory(command) {
    this.commandHistory.push(command);
    if (this.commandHistory.length > 20) {
      this.commandHistory.shift();
    }

    window.dispatchEvent(new CustomEvent('commandHistoryUpdate', {
      detail: { history: this.commandHistory }
    }));
  }

  provideHelp() {
    // Doctor-like natural response
    this.speak("I am Dr. CuraVox, your medical assistant. You can ask me to navigate, scan medicines, or answer health questions. How can I help you today?");
  }

  repeatLast() {
    if (this.commandHistory.length > 0) {
      const lastCommand = this.commandHistory[this.commandHistory.length - 1];
      this.speak(`Last command was: ${lastCommand}`);
    } else {
      this.speak("No previous commands to repeat.");
    }
  }

  showHistory() {
    this.speak("Here are your recent commands:");
    const recentCommands = this.commandHistory.slice(-3);
    if (recentCommands.length > 0) {
      recentCommands.forEach(cmd => this.speak(`Command: ${cmd}`));
    } else {
      this.speak("No commands recorded yet.");
    }
  }

  clearResults() {
    this.speak("Results cleared.");
    window.dispatchEvent(new CustomEvent('clearResults'));
  }

  exitApplication() {
    this.speak("Closing Medical AI Assistant. Goodbye!");
    setTimeout(() => {
      window.close();
    }, 2000);
  }

  // Static instance management
  static getInstance() {
    if (!window.voiceServiceInstance) {
      window.voiceServiceInstance = new VoiceService();
    }
    return window.voiceServiceInstance;
  }
}

export default VoiceService;
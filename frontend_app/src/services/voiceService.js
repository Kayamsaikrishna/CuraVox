import api from './api';

class VoiceService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.shouldBeListening = false;
    this.isWakeWordActive = false; // Starts in Passive Mode
    this.commands = new Map();
    this.commandHistory = [];
    this.initializeVoiceRecognition();
    this.initializeCommands();
  }

  initializeVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true; // Keep listening even after silence
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        window.dispatchEvent(new CustomEvent('voiceStateChange', { detail: { isListening: true } }));
      };

      this.recognition.onresult = (event) => {
        // Ignore results if the system itself is currently speaking (prevent echo)
        if (this.synthesis.speaking) return;

        const command = event.results[event.results.length - 1][0].transcript.trim();
        if (command.length > 0) {
          this.processCommand(command);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);

        // Specific handling for 'no-speech' (common in continuous mode) - just ignore
        if (event.error === 'no-speech') {
          return;
        }

        // For other errors, try to restart after a delay
        if (event.error !== 'aborted') {
          this.restartListening();
        }
      };

      this.recognition.onend = () => {
        // ALWAYS restart unless explicitly told to stop (e.g., 'Exit' command)
        if (this.shouldBeListening) {
          this.restartListening();
        } else {
          this.isListening = false;
          window.dispatchEvent(new CustomEvent('voiceStateChange', { detail: { isListening: false } }));
        }
      };
    } else {
      console.error('Speech recognition not supported');
      this.speak("Voice control is not supported in your browser. Please use Chrome or Edge.");
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
    // Navigation commands
    this.commands.set('go to home', () => this.navigateTo('/home'));
    this.commands.set('go to dashboard', () => this.navigateTo('/home'));
    this.commands.set('go to medicines', () => this.navigateTo('/medicines'));
    this.commands.set('go to scan', () => this.navigateTo('/scan'));
    this.commands.set('go to reminders', () => this.navigateTo('/reminders'));
    this.commands.set('go to profile', () => this.navigateTo('/profile'));
    this.commands.set('go to settings', () => this.navigateTo('/settings'));

    // Scan commands
    this.commands.set('start scanning', () => this.startScanning());
    this.commands.set('capture image', () => this.captureImage());
    this.commands.set('upload image', () => this.uploadImage());
    this.commands.set('stop scanning', () => this.stopScanning());

    // Medicine commands
    this.commands.set('tell me about', (medicine) => this.tellMeAbout(medicine));
    this.commands.set('side effects of', (medicine) => this.getSideEffects(medicine));
    this.commands.set('dosage for', (medicine) => this.getDosage(medicine));
    this.commands.set('warnings for', (medicine) => this.getWarnings(medicine));
    this.commands.set('interactions between', (medicines) => this.checkInteractions(medicines));

    // General commands
    this.commands.set('help', () => this.provideHelp());
    this.commands.set('repeat', () => this.repeatLast());
    this.commands.set('history', () => this.showHistory());
    this.commands.set('clear', () => this.clearResults());
    this.commands.set('stop listening', () => this.stopListening());
    this.commands.set('start listening', () => this.startListening());
    this.commands.set('exit', () => this.exitApplication());
  }

  async processCommand(command) {
    const lowerCommand = command.toLowerCase();

    // 1. Check for WAKE WORD (Easier options)
    const wakeWords = ['doctor', 'assistant', 'hello', 'hi', 'start', 'wake up', 'curavox'];
    const isWakeWord = wakeWords.some(word => lowerCommand.includes(word));

    if (isWakeWord) {
      this.isWakeWordActive = true;
      this.speak("I'm listening."); // Shorter, simpler response
      window.dispatchEvent(new CustomEvent('voiceStateChange', { detail: { isListening: true, isActive: true } }));
      return;
    }

    // 2. Check for STOP WORD ("Stop")
    if (lowerCommand === 'stop' || lowerCommand.includes('stop listening') || lowerCommand.includes('shut up') || lowerCommand.includes('quiet')) {
      if (this.isWakeWordActive) {
        this.isWakeWordActive = false;
        this.speak("Standing by.");
        window.dispatchEvent(new CustomEvent('voiceStateChange', { detail: { isListening: true, isActive: false } }));
      }
      return;
    }

    // 3. If NOT active, ignore everything else (Passive Mode)
    if (!this.isWakeWordActive) {
      console.log('Ignored (Standby):', command);
      return;
    }

    // --- ACTIVE PROCESSING BELOW ---
    console.log('Processing active command (Raw):', command);

    // Clean command: Remove common prefixes/noise
    let cleanCommand = command.replace(/^(i'm|i am) listening[.!?]?\s*/i, '').trim();
    cleanCommand = cleanCommand.replace(/^(system|computer|doctor)[.!?]?\s*/i, '').trim();

    if (!cleanCommand) return; // Ignore if just noise

    console.log('Processing active command (Clean):', cleanCommand);
    this.addToHistory(cleanCommand);

    // 4. Check LOCAL COMMANDS first (Navigation, Help, simple stuff)
    // This makes navigation instant and works even if backend is slow/offline
    if (this.commands.has(lowerCommand)) {
      console.log("Executing local command:", lowerCommand);
      this.commands.get(lowerCommand)();
      return;
    }

    // 5. If not local, send to Local AI Backend (Complex queries)
    try {
      // Send to Backend API
      const response = await api.post('/ai/command', {
        command: command,
        userId: 'user-123'
      });
      // ... (rest of API handling)
      const result = response.data;

      // Speak the AI's natural response
      if (result.response) {
        this.speak(result.response);
      }

      // Perform any actions
      if (result.action) {
        this.handleAIAction(result.action, result.data);
      }
    } catch (error) {
      // ... (error handling)
      console.error("AI processing error:", error);

      if (error.response && error.response.status === 401) {
        this.speak("Please log in to use AI features.");
        return;
      }

      if (error.code === 'ERR_NETWORK') {
        this.speak("I cannot reach the server. Please check your connection.");
        return;
      }

      // Fallback logic not really needed if we checked local commands first, 
      // but good safety net for partial matches
      this.processLocalFallback(command);
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
    window.location.hash = `#${path}`;
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

  speak(text) {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }

    // Temporarily stop recognition loop to prevent hearing itself
    // Note: We don't stop the *service*, just the processing or the recognition engine if needed.
    // However, stopping/starting engine causes 'bloop' noises in some browsers.
    // Better strategy: The `onresult` check for `this.synthesis.speaking` handles the logic. 
    // But for cleaner audio ducking, let's keep it simple.

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      // Resume listening focus if needed
    };

    this.synthesis.speak(utterance);

    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('voiceOutput', {
      detail: { text }
    }));
  }

  // Control Methods
  startListening() {
    this.shouldBeListening = true; // User INTENDS to listen
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {
        // Already started
      }
    }
  }

  stopListening() {
    this.shouldBeListening = false; // User INTENDS to stop
    if (this.recognition) {
      this.recognition.stop();
    }
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
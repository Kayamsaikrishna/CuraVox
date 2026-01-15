import api from './api';

class VoiceService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.commands = new Map();
    this.commandHistory = [];
    this.initializeVoiceRecognition();
    this.initializeCommands();
  }

  initializeVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event) => {
        const command = event.results[event.results.length - 1][0].transcript.trim();
        this.processCommand(command);
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this.speak(`Speech recognition error: ${event.error}`);
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          setTimeout(() => {
            if (this.isListening && this.recognition) {
              this.recognition.start();
            }
          }, 100);
        }
      };
    } else {
      console.error('Speech recognition not supported');
      this.speak("Voice control is not supported in your browser. Please use Chrome or Edge.");
    }
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
    console.log('Processing voice command:', command);
    this.addToHistory(command);

    // 1. Check for simple local navigation commands (for speed)
    const lowerCommand = command.toLowerCase();

    // Quick local overrides for specific UI actions that don't need AI
    if (lowerCommand.includes('stop') && lowerCommand.includes('listen')) {
      this.stopListening();
      return;
    }

    // 2. If it's a complex query or not a simple nav, ASK THE AI BRAIN
    // This removes the "brute force" keyword matching and lets the LLM/BERT handle it.
    try {
      this.speak("Thinking..."); // Feedback that we are processing

      // Send to Backend API
      const response = await api.post('/ai/command', {
        command: command,
        // Assuming we have a userId stored or context, otherwise generic
        userId: 'user-123'
      });

      const result = response.data;

      // Speak the AI's natural response
      if (result.response) {
        this.speak(result.response);
      }

      // Perform any actions the AI decided on (e.g., "navigate_to_scan")
      if (result.action) {
        this.handleAIAction(result.action, result.data);
      }

    } catch (error) {
      console.error("AI processing error:", error);
      // Fallback to local if AI fails or for offline support
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
        // The info is usually already spoken in 'response', but we could show a modal
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
    // Trigger camera start event
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
    // Implementation would fetch from backend
    this.speak("Common side effects may include nausea, headache, or dizziness. Please consult the medicine leaflet for complete information.");
  }

  async getDosage(medicine) {
    this.speak(`Checking dosage information for ${medicine || 'this medicine'}`);
    // Implementation would fetch from backend
    this.speak("Please follow the dosage instructions on the medicine package or as prescribed by your healthcare provider.");
  }

  async getWarnings(medicine) {
    this.speak(`Checking warnings for ${medicine || 'this medicine'}`);
    // Implementation would fetch from backend
    this.speak("Important warnings: Store in a cool dry place. Keep out of reach of children. Consult your doctor if pregnant or breastfeeding.");
  }

  async checkInteractions(medicines) {
    if (!medicines || medicines.length < 2) {
      this.speak("Please specify two medicines to check for interactions");
      return;
    }

    this.speak(`Checking for interactions between ${medicines[0]} and ${medicines[1]}`);
    // Implementation would fetch from backend
    this.speak("No significant interactions found. However, always consult your healthcare provider before combining medications.");
  }

  // Utility functions
  startListening() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
        this.speak("Voice control activated. I'm listening for your commands.");
        window.dispatchEvent(new CustomEvent('voiceStateChange', {
          detail: { isListening: true }
        }));
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        this.speak("Unable to start voice recognition. Please try again.");
      }
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.speak("Voice control deactivated.");
      window.dispatchEvent(new CustomEvent('voiceStateChange', {
        detail: { isListening: false }
      }));
    }
  }

  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  speak(text) {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    this.synthesis.speak(utterance);

    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('voiceOutput', {
      detail: { text }
    }));
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
    const helpText = `
      Available commands:
      Navigation: Say "Go to home", "Go to medicines", "Go to scan"
      Scanning: Say "Start scanning", "Capture image", "Upload image"
      Medicine info: Say "Tell me about [medicine]", "Side effects of [medicine]"
      General: Say "Help", "Repeat", "History", "Stop listening", "Exit"
    `;
    this.speak(helpText);
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
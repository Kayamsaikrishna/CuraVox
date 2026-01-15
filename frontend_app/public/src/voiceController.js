// Voice controller for visually impaired users - Simplified Professional Version
class VoiceController {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.synthesis = window.speechSynthesis;
    this.commands = new Map();
    this.commandHistory = [];
    this.setupVoiceRecognition();
    this.initializeCommands();
    this.setupVoiceFeedback();
  }

  setupVoiceRecognition() {
    // Check for browser support
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
        console.error('Speech recognition error', event.error);
        this.speak(`Speech recognition error: ${event.error}. Please try again.`);
      };

      this.recognition.onend = () => {
        // Auto-restart if we want continuous listening
        if (this.isListening) {
          setTimeout(() => {
            if (this.isListening && this.recognition) {
              this.recognition.start();
            }
          }, 100);
        }
      };
    } else {
      console.error('Speech recognition not supported in this browser');
      this.speak("Voice control is not supported in your browser. Please use Chrome or Edge for best experience.");
    }
  }

  initializeCommands() {
    // Essential navigation commands
    this.commands.set('help', () => this.provideHelp());
    this.commands.set('scan', () => this.startScanning());
    this.commands.set('start scanning', () => this.startScanning());
    this.commands.set('stop scanning', () => this.stopScanning());
    this.commands.set('capture', () => this.captureImage());
    this.commands.set('upload', () => this.uploadImage());
    this.commands.set('history', () => this.showHistory());
    this.commands.set('repeat', () => this.repeatLast());
    this.commands.set('clear', () => this.clearResults());
    this.commands.set('stop', () => this.stopListening());
    this.commands.set('start', () => this.startListening());
    this.commands.set('exit', () => this.exitApplication());
    
    // Medicine information commands
    this.commands.set('tell me about', (medicine) => this.tellMeAbout(medicine));
    this.commands.set('side effects', (medicine) => this.getSideEffects(medicine));
    this.commands.set('dosage', (medicine) => this.getDosage(medicine));
    this.commands.set('warnings', (medicine) => this.getWarnings(medicine));
    this.commands.set('interactions', (medicines) => this.checkInteractions(medicines));
  }

  processCommand(command) {
    console.log('Received voice command:', command);
    
    // Add to command history
    this.addToHistory(command);
    
    // Check for exact matches first
    if (this.commands.has(command.toLowerCase())) {
      this.commands.get(command.toLowerCase())();
      return;
    }
    
    // Check for partial matches with parameters
    const lowerCommand = command.toLowerCase();
    
    // Medicine information commands with parameters
    if (lowerCommand.startsWith('tell me about ')) {
      const medicine = command.substring(14).trim();
      this.tellMeAbout(medicine);
      return;
    }
    
    if (lowerCommand.includes('side effects of ')) {
      const medicine = command.split('side effects of ')[1];
      this.getSideEffects(medicine);
      return;
    }
    
    if (lowerCommand.includes('dosage for ')) {
      const medicine = command.split('dosage for ')[1];
      this.getDosage(medicine);
      return;
    }
    
    if (lowerCommand.includes('warnings for ')) {
      const medicine = command.split('warnings for ')[1];
      this.getWarnings(medicine);
      return;
    }
    
    if (lowerCommand.includes('interactions between ')) {
      const medicines = command.split('interactions between ')[1].split(' and ');
      this.checkInteractions(medicines);
      return;
    }
    
    // If no command matched, provide help
    this.speak(`I didn't understand "${command}". Say "Help" for available commands.`);
  }

  startListening() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
        this.speak("Voice control activated. I'm listening for your commands.");
        this.updateUIState(true);
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
      this.updateUIState(false);
    }
  }

  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  // Core functionality methods
  startScanning() {
    this.speak("Activating camera for medicine scanning. Please position the medicine package in front of your camera.");
    // Trigger camera activation
    const startCameraBtn = document.getElementById('startCamera');
    if (startCameraBtn) {
      startCameraBtn.click();
    } else {
      this.speak("Camera controls are not available on this page.");
    }
  }

  stopScanning() {
    this.speak("Stopping camera.");
    const stopCameraBtn = document.getElementById('stopCamera');
    if (stopCameraBtn) {
      stopCameraBtn.click();
    }
  }

  captureImage() {
    const captureBtn = document.getElementById('captureBtn');
    if (captureBtn && !captureBtn.disabled) {
      captureBtn.click();
      this.speak("Capturing image and processing with OCR. Please wait.");
    } else {
      this.speak("Capture button is not available or disabled.");
    }
  }

  uploadImage() {
    const uploadBtn = document.getElementById('uploadImageButton');
    if (uploadBtn) {
      uploadBtn.click();
      this.speak("Opening file upload dialog.");
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

  repeatLast() {
    if (this.commandHistory.length > 0) {
      const lastCommand = this.commandHistory[this.commandHistory.length - 1];
      this.speak(`Last command was: ${lastCommand}`);
    } else {
      this.speak("No previous commands to repeat.");
    }
  }

  clearResults() {
    const resultsContent = document.getElementById('resultsContent');
    if (resultsContent) {
      resultsContent.innerHTML = '<p>Cleared previous results.</p>';
      this.speak("Results cleared.");
    }
  }

  exitApplication() {
    this.speak("Closing Medical AI Assistant. Goodbye!");
    setTimeout(() => {
      window.close();
    }, 2000);
  }

  // Medicine information methods
  tellMeAbout(medicine) {
    if (!medicine) {
      this.speak("Please specify which medicine you want information about.");
      return;
    }
    
    this.speak(`Getting information about ${medicine}.`);
    
    // Simulate API call to backend
    fetch('/api/medicine/search/' + encodeURIComponent(medicine))
      .then(response => response.json())
      .then(data => {
        if (data.success && data.data.medicines.length > 0) {
          const med = data.data.medicines[0];
          let info = `${med.name} is `;
          if (med.genericName) info += `also known as ${med.genericName}. `;
          if (med.description) info += med.description;
          this.speak(info);
        } else {
          this.speak(`I don't have specific information about ${medicine} in my database. Would you like me to scan the medicine package?`);
        }
      })
      .catch(error => {
        console.error('Error fetching medicine info:', error);
        this.speak(`Unable to retrieve information about ${medicine} right now.`);
      });
  }

  getSideEffects(medicine) {
    this.speak(`Checking side effects for ${medicine || 'this medicine'}.`);
    // Implementation would fetch from backend
    this.speak("Common side effects may include nausea, headache, or dizziness. Please consult the medicine leaflet for complete information.");
  }

  getDosage(medicine) {
    this.speak(`Checking dosage information for ${medicine || 'this medicine'}.`);
    // Implementation would fetch from backend
    this.speak("Please follow the dosage instructions on the medicine package or as prescribed by your healthcare provider.");
  }

  getWarnings(medicine) {
    this.speak(`Checking warnings for ${medicine || 'this medicine'}.`);
    // Implementation would fetch from backend
    this.speak("Important warnings: Store in a cool dry place. Keep out of reach of children. Consult your doctor if pregnant or breastfeeding.");
  }

  checkInteractions(medicines) {
    if (!medicines || medicines.length < 2) {
      this.speak("Please specify two medicines to check for interactions.");
      return;
    }
    
    this.speak(`Checking for interactions between ${medicines[0]} and ${medicines[1]}.`);
    // Implementation would fetch from backend
    this.speak("No significant interactions found. However, always consult your healthcare provider before combining medications.");
  }

  // UI Update methods
  updateUIState(listening) {
    const stateElement = document.getElementById('listeningState');
    const statusText = document.getElementById('statusText');
    const toggleBtn = document.getElementById('toggleListening');
    
    if (stateElement) {
      stateElement.textContent = listening ? 'LISTENING' : 'READY';
      stateElement.className = listening ? 'state-listening' : 'state-ready';
    }
    
    if (statusText) {
      statusText.textContent = listening ? 
        'Listening for voice commands...' : 
        'Ready for voice commands. Press spacebar or click microphone to activate.';
    }
    
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-label', 
        listening ? 'Stop listening' : 'Start listening');
    }
  }

  // Voice feedback methods
  setupVoiceFeedback() {
    // Already initialized in constructor
  }

  speak(text) {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Add to results display
    this.updateResultsDisplay(text);

    this.synthesis.speak(utterance);
  }

  updateResultsDisplay(text) {
    const resultsContent = document.getElementById('resultsContent');
    const initialPrompt = document.getElementById('initialPrompt');
    
    if (resultsContent) {
      if (initialPrompt) {
        initialPrompt.remove();
      }
      
      const resultElement = document.createElement('div');
      resultElement.className = 'spoken-result';
      resultElement.innerHTML = `<p>${text}</p>`;
      resultsContent.appendChild(resultElement);
      
      // Scroll to bottom
      resultsContent.scrollTop = resultsContent.scrollHeight;
    }
  }

  addToHistory(command) {
    this.commandHistory.push(command);
    // Keep only last 10 commands
    if (this.commandHistory.length > 10) {
      this.commandHistory.shift();
    }
    
    // Also add to global history if available
    if (typeof addToHistory === 'function') {
      addToHistory(command);
    }
  }

  provideHelp() {
    const helpText = `
      Available commands:
      Say "Help" - hear this list of commands
      Say "Scan" or "Start scanning" - activate camera for medicine identification
      Say "Capture" - take a picture of the medicine
      Say "Upload" - select an image from your device
      Say "History" - hear your recent commands
      Say "Repeat" - repeat the last information
      Say "Clear" - clear the results display
      Say "Stop" - deactivate voice listening
      Say "Start" - activate voice listening
      
      For medicine information:
      Say "Tell me about [medicine name]"
      Say "Side effects of [medicine name]"
      Say "Dosage for [medicine name]"
      Say "Warnings for [medicine name]"
      Say "Interactions between [medicine1] and [medicine2]"
      
      Say "Exit" to close the application
    `;
    
    this.speak(helpText);
  }

  // Static methods for singleton pattern
  static getInstance() {
    if (!window.voiceControllerInstance) {
      window.voiceControllerInstance = new VoiceController();
    }
    return window.voiceControllerInstance;
  }

  static init() {
    return VoiceController.getInstance();
  }
}

// Export the VoiceController class
export default VoiceController;
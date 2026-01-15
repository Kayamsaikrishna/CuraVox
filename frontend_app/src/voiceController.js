// Voice controller for visually impaired users
class VoiceController {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.commands = new Map();
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
        const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
        this.processCommand(command);
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        this.speak(`Sorry, I couldn't understand that. Please try again.`);
      };
    } else {
      console.error('Speech recognition not supported in this browser');
      this.speak("Voice control is not supported in your browser. Please use Chrome for best experience.");
    }
  }

  initializeCommands() {
    // Navigation commands
    this.commands.set('go to dashboard', () => this.navigateTo('dashboard'));
    this.commands.set('go to scan', () => this.navigateTo('scan'));
    this.commands.set('go to history', () => this.navigateTo('history'));
    this.commands.set('go to profile', () => this.navigateTo('profile'));
    
    // Scan commands
    this.commands.set('start scanning', () => this.startCamera());
    this.commands.set('capture image', () => this.captureAndScan());
    this.commands.set('stop scanning', () => this.stopCamera());
    this.commands.set('upload image', () => this.triggerFileUpload());
    
    // Medicine interaction commands
    this.commands.set('read medicine information', () => this.readMedicineInfo());
    this.commands.set('read dosage', () => this.readDosage());
    this.commands.set('read side effects', () => this.readSideEffects());
    this.commands.set('read warnings', () => this.readWarnings());
    this.commands.set('read uses', () => this.readUses());
    
    // Reminder commands
    this.commands.set('set reminder', () => this.openReminderModal());
    this.commands.set('list reminders', () => this.listReminders());
    
    // General commands
    this.commands.set('help', () => this.provideHelp());
    this.commands.set('repeat', () => this.repeatLastInfo());
    this.commands.set('cancel', () => this.cancelCurrentAction());
    this.commands.set('stop listening', () => this.stopListening());
    this.commands.set('start listening', () => this.startListening());
  }

  processCommand(command) {
    console.log('Received voice command:', command);
    
    // Check for exact matches first
    if (this.commands.has(command)) {
      this.commands.get(command)();
      return;
    }
    
    // Check for partial matches
    for (let [cmd, action] of this.commands) {
      if (command.includes(cmd)) {
        action();
        return;
      }
    }
    
    // If no command matched, send to backend AI service for interpretation
    this.sendCommandToAI(command);
  }

  interpretIntent(command) {
    // Try to match partial commands
    if (command.includes('dashboard') || command.includes('home')) {
      this.navigateTo('dashboard');
    } else if (command.includes('scan') || command.includes('camera')) {
      if (command.includes('start') || command.includes('begin')) {
        this.startCamera();
      } else if (command.includes('capture') || command.includes('take')) {
        this.captureAndScan();
      } else if (command.includes('stop')) {
        this.stopCamera();
      } else {
        this.navigateTo('scan');
      }
    } else if (command.includes('medicine') || command.includes('drug')) {
      this.readMedicineInfo();
    } else if (command.includes('dosage') || command.includes('dose')) {
      this.readDosage();
    } else if (command.includes('side effect')) {
      this.readSideEffects();
    } else if (command.includes('warning')) {
      this.readWarnings();
    } else if (command.includes('use') || command.includes('indication')) {
      this.readUses();
    } else {
      this.speak(`I didn't understand "${command}". Say "help" for available commands.`);
    }
  }

  startListening() {
    if (this.recognition && !this.isListening) {
      this.recognition.start();
      this.isListening = true;
      this.speak("Voice control activated. How can I help you?");
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.speak("Voice control deactivated.");
    }
  }

  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  // Navigation methods
  navigateTo(section) {
    // Hide all sections
    document.querySelectorAll('main section').forEach(section => {
      section.style.display = 'none';
    });
    
    // Show target section
    const targetSection = document.getElementById(section);
    if (targetSection) {
      targetSection.style.display = 'block';
      
      // Update active navigation state
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
      });
      
      const activeLink = document.querySelector(`a[href="#${section}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
      }
      
      // Provide feedback about the new section
      switch(section) {
        case 'dashboard':
          this.speak("You are now on the dashboard. You can say 'go to scan' to start scanning medicine packages.");
          break;
        case 'scan':
          this.speak("You are now on the scan page. You can say 'start scanning' to activate the camera.");
          break;
        case 'history':
          this.speak("You are now on the history page. You can hear your scan history by saying 'list history'.");
          break;
        case 'profile':
          this.speak("You are now on the profile page. You can manage your information and reminders here.");
          break;
      }
    }
  }

  // Camera methods
  startCamera() {
    const startCameraBtn = document.getElementById('startCamera');
    if (startCameraBtn) {
      startCameraBtn.click();
      this.speak("Starting camera. Please position the medicine package in view.");
    } else {
      this.speak("Camera controls are not available on this page.");
    }
  }

  captureAndScan() {
    const captureBtn = document.getElementById('captureBtn');
    if (captureBtn && !captureBtn.disabled) {
      captureBtn.click();
      this.speak("Capturing image and processing with OCR. Please wait.");
    } else {
      this.speak("Capture button is not available or disabled.");
    }
  }

  stopCamera() {
    const stopCameraBtn = document.getElementById('stopCamera');
    if (stopCameraBtn && !stopCameraBtn.disabled) {
      stopCameraBtn.click();
      this.speak("Camera stopped.");
    }
  }

  triggerFileUpload() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.click();
      this.speak("Please select an image file to upload.");
    }
  }

  // Medicine information methods
  readMedicineInfo() {
    const medicineCard = document.querySelector('.medicine-analysis .card');
    if (medicineCard) {
      const medicineName = medicineCard.querySelector('h5');
      const dosage = medicineCard.querySelector('p:nth-of-type(2)');
      const uses = medicineCard.querySelector('p:nth-of-type(1)');
      
      let info = "Medicine information: ";
      if (medicineName) info += `Name: ${medicineName.textContent}. `;
      if (uses) info += `Uses: ${uses.textContent.replace('Uses:', '')}. `;
      if (dosage) info += `Dosage: ${dosage.textContent.replace('Dosage:', '')}. `;
      
      this.speak(info);
    } else {
      this.speak("No medicine information available. Please scan a medicine first.");
    }
  }

  readDosage() {
    const dosageElement = document.querySelector('.medicine-analysis .card p:nth-of-type(2)');
    if (dosageElement) {
      const dosageText = dosageElement.textContent.replace('Dosage:', '').trim();
      this.speak(`Dosage information: ${dosageText}`);
    } else {
      this.speak("Dosage information is not available.");
    }
  }

  readSideEffects() {
    const sideEffectsElement = document.querySelector('.medicine-analysis .card p:nth-of-type(3)');
    if (sideEffectsElement) {
      const sideEffectsText = sideEffectsElement.textContent.replace('Side Effects:', '').trim();
      this.speak(`Side effects: ${sideEffectsText}`);
    } else {
      this.speak("Side effects information is not available.");
    }
  }

  readWarnings() {
    const warningsElement = document.querySelector('.medicine-analysis .card p:nth-of-type(4)');
    if (warningsElement) {
      const warningsText = warningsElement.textContent.replace('Precautions:', '').trim();
      this.speak(`Warnings and precautions: ${warningsText}`);
    } else {
      this.speak("Warnings and precautions information is not available.");
    }
  }

  readUses() {
    const usesElement = document.querySelector('.medicine-analysis .card p:nth-of-type(1)');
    if (usesElement) {
      const usesText = usesElement.textContent.replace('Uses:', '').trim();
      this.speak(`Uses: ${usesText}`);
    } else {
      this.speak("Uses information is not available.");
    }
  }

  // Reminder methods
  openReminderModal() {
    this.speak("Opening reminder settings. Please specify the medicine name, dosage, and time.");
  }

  listReminders() {
    this.speak("Listing your medicine reminders. Implementation pending backend integration.");
  }

  // General methods
  provideHelp() {
    const helpText = `
      Available voice commands:
      Navigation: 'go to dashboard', 'go to scan', 'go to history', 'go to profile'
      Scanning: 'start scanning', 'capture image', 'stop scanning', 'upload image'
      Medicine Info: 'read medicine information', 'read dosage', 'read side effects', 'read warnings', 'read uses'
      General: 'help', 'repeat', 'cancel', 'stop listening', 'start listening'
      You can also say partial commands like 'scan medicine' or 'read dosage'.
    `;
    this.speak(helpText);
  }

  repeatLastInfo() {
    // Implementation would repeat the last spoken information
    this.speak("Repeating the last information is not implemented yet.");
  }

  cancelCurrentAction() {
    this.speak("Current action canceled.");
  }

  setupVoiceFeedback() {
    // Add accessibility attributes to important elements
    document.addEventListener('sectionShown', (e) => {
      setTimeout(() => {
        this.speak(`You are now on the ${e.detail.sectionId} page. Available commands will be context-sensitive.`);
      }, 1000);
    });
  }

  speak(text) {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.1; // Slightly higher pitch for better clarity
      utterance.volume = 1;
      
      speechSynthesis.speak(utterance);
    } else {
      console.error('Text-to-speech not supported in this browser');
      // Fallback: display text in a visible area for testing
      const feedbackDiv = document.getElementById('voice-feedback') || this.createFeedbackDiv();
      feedbackDiv.textContent = text;
      feedbackDiv.style.display = 'block';
      setTimeout(() => {
        feedbackDiv.style.display = 'none';
      }, 5000);
    }
  }
  
  // Send voice command to backend AI service
  async sendCommandToAI(command) {
    try {
      // Get the authentication token from wherever it's stored
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        this.speak("You need to be logged in to use advanced AI features. Please log in first.");
        return;
      }
      
      const response = await fetch('/api/ai/voice-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ command: command })
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.speak(result.data.response);
      } else {
        console.error('AI service error:', result.message);
        this.speak("Sorry, I couldn't process that command. Please try again.");
      }
    } catch (error) {
      console.error('Error sending command to AI:', error);
      this.speak("Sorry, I'm having trouble connecting to the AI service. Please check your connection.");
    }
  }

  createFeedbackDiv() {
    const feedbackDiv = document.createElement('div');
    feedbackDiv.id = 'voice-feedback';
    feedbackDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #007bff;
      color: white;
      padding: 15px;
      border-radius: 5px;
      z-index: 10000;
      display: none;
    `;
    document.body.appendChild(feedbackDiv);
    return feedbackDiv;
  }

  // Initialize voice controller when DOM is loaded
  static init() {
    document.addEventListener('DOMContentLoaded', () => {
      window.voiceController = new VoiceController();
      
      // Add a prominent voice control toggle button to the page
      const voiceControlBtn = document.createElement('button');
      voiceControlBtn.id = 'voice-control-btn';
      voiceControlBtn.innerHTML = '🎙️ Voice Control';
      voiceControlBtn.setAttribute('aria-label', 'Toggle voice control');
      voiceControlBtn.setAttribute('title', 'Toggle voice control (Press Ctrl+Shift+V)');
      voiceControlBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
        padding: 15px 25px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 50px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 6px 12px rgba(0,0,0,0.4);
        transition: all 0.3s ease;
        min-width: 180px;
        text-align: center;
      `;
      
      voiceControlBtn.addEventListener('click', () => {
        window.voiceController.toggleListening();
        window.voiceController.updateVoiceButton(voiceControlBtn);
      });
      
      // Add keyboard shortcut for voice control
      document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'v') {
          event.preventDefault();
          window.voiceController.toggleListening();
          window.voiceController.updateVoiceButton(voiceControlBtn);
        }
      });
      
      document.body.appendChild(voiceControlBtn);
      
      // Start voice control automatically after a short delay
      setTimeout(() => {
        window.voiceController.startListening();
        window.voiceController.updateVoiceButton(voiceControlBtn);
      }, 1000);
      
      // Add help announcement
      setTimeout(() => {
        window.voiceController.speak("Welcome to Medical AI Assistant. I'm ready to help you. Say 'Help' to hear available commands.");
      }, 2000);
    });
  }
  
  // Update the voice button text and appearance
  updateVoiceButton(button) {
    if (this.isListening) {
      button.innerHTML = '🎙️ <b>LISTENING...</b>';
      button.style.background = '#28a745';
      button.title = 'Currently listening (Press Ctrl+Shift+V to pause)';
    } else {
      button.innerHTML = '🎙️ Voice Control';
      button.style.background = '#007bff';
      button.title = 'Activate voice control (Press Ctrl+Shift+V)';
    }
  }
}

// Initialize the voice controller
VoiceController.init();

// Export for module use
export default VoiceController;
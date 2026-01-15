// Main application logic for voice-centric interface
import VoiceController from './voiceController.js';

/**
 * Initialize the main application
 */
function initializeApp() {
    // Render the main application structure optimized for voice interaction
    renderAppStructure();
    
    // Load initial data
    loadInitialData();
    
    // Initialize any required services
    initializeServices();
    
    // Initialize voice controller for accessibility
    VoiceController.init();
    
    // Set up keyboard shortcuts for accessibility
    setupKeyboardShortcuts();
    
    // Focus management for screen readers
    setupFocusManagement();
    
    // Announce application ready
    setTimeout(() => {
        VoiceController.getInstance().speak("Medical AI Assistant is ready. Say 'Help' to hear available commands, or 'Scan' to start identifying medicines.");
    }, 1000);
}

/**
 * Render the main application structure optimized for voice interaction
 * Simplified design focused entirely on accessibility
 */
function renderAppStructure() {
    const rootElement = document.getElementById('root');
    
    rootElement.innerHTML = `
        <div class="app-container" role="application" aria-label="Medical AI Assistant">
            <!-- Header with essential information -->
            <header class="app-header sr-only">
                <h1>Medical AI Assistant for Visually Impaired</h1>
                <p>This application provides voice-controlled medicine identification and medical information.</p>
            </header>
            
            <!-- Main content area -->
            <main class="app-main" role="main">
                <div class="voice-interface" id="voiceInterface">
                    <!-- Status indicator -->
                    <div class="status-indicator" id="statusIndicator" aria-live="polite" aria-atomic="true">
                        <span id="statusText">Ready for voice commands</span>
                    </div>
                    
                    <!-- Voice command input area -->
                    <div class="command-area" role="region" aria-label="Voice command area">
                        <button id="toggleListening" class="primary-button" aria-label="Toggle voice listening">
                            <span class="button-text">🎤 Toggle Listening</span>
                            <span class="button-state" id="listeningState">OFF</span>
                        </button>
                        
                        <div class="command-history" id="commandHistory" aria-label="Recent commands" aria-live="polite">
                            <h2 class="sr-only">Recent Commands</h2>
                            <ul id="historyList" class="history-list"></ul>
                        </div>
                    </div>
                    
                    <!-- Results display -->
                    <div class="results-area" id="resultsArea" role="region" aria-label="Results and information">
                        <div id="resultsContent" class="results-content">
                            <p id="initialPrompt" class="welcome-message">
                                Welcome to Medical AI Assistant. 
                                Press the microphone button or say "Help" to begin.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            
            <!-- Hidden navigation for screen readers -->
            <nav class="sr-only" aria-label="Application navigation">
                <ul>
                    <li><button id="nav-home" data-section="home">Home</button></li>
                    <li><button id="nav-scan" data-section="scan">Scan Medicine</button></li>
                    <li><button id="nav-history" data-section="history">History</button></li>
                    <li><button id="nav-help" data-section="help">Help</button></li>
                </ul>
            </nav>
            
            <!-- Footer with essential information -->
            <footer class="app-footer sr-only">
                <div class="footer-info">
                    <p>Medical AI Assistant - Voice Controlled Healthcare Companion</p>
                    <p>Emergency: Dial 911</p>
                    <p>Say "Exit" to close the application</p>
                </div>
            </footer>
        </div>
    `;
}

/**
 * Load initial data for the application
 */
function loadInitialData() {
    console.log('Loading initial application data...');
    // Initialize any necessary data structures
    window.appData = {
        commandHistory: [],
        currentSession: {
            startTime: new Date(),
            commandsCount: 0
        }
    };
}

/**
 * Initialize required services
 */
function initializeServices() {
    console.log('Initializing application services...');
    // Initialize any required services
    setupEventListeners();
}

/**
 * Set up event listeners for interactive elements
 */
function setupEventListeners() {
    // Toggle listening button
    const toggleBtn = document.getElementById('toggleListening');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            const voiceController = VoiceController.getInstance();
            if (voiceController.isListening) {
                voiceController.stopListening();
                updateListeningState(false);
            } else {
                voiceController.startListening();
                updateListeningState(true);
            }
        });
    }
    
    // Navigation buttons for screen readers
    document.querySelectorAll('[data-section]').forEach(button => {
        button.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            navigateToSection(section);
        });
    });
}

/**
 * Update the listening state display
 */
function updateListeningState(isListening) {
    const stateElement = document.getElementById('listeningState');
    const statusText = document.getElementById('statusText');
    
    if (stateElement) {
        stateElement.textContent = isListening ? 'ON' : 'OFF';
        stateElement.className = isListening ? 'state-on' : 'state-off';
    }
    
    if (statusText) {
        statusText.textContent = isListening ? 
            'Listening for voice commands...' : 
            'Ready for voice commands';
    }
}

/**
 * Navigate to different sections of the application
 */
function navigateToSection(section) {
    const voiceController = VoiceController.getInstance();
    
    switch(section) {
        case 'home':
            voiceController.speak("You are at the main interface. Say 'Help' for commands or 'Scan' to identify medicines.");
            break;
        case 'scan':
            voiceController.speak("Scan mode activated. Say 'Start camera' to begin medicine identification.");
            // Trigger camera start
            document.getElementById('startCamera')?.click();
            break;
        case 'history':
            voiceController.speak("Showing your scan history.");
            displayHistory();
            break;
        case 'help':
            voiceController.provideHelp();
            break;
    }
}

/**
 * Display command history for screen reader users
 */
function displayHistory() {
    const historyList = document.getElementById('historyList');
    const historyContent = window.appData.commandHistory.slice(-5); // Last 5 commands
    
    if (historyContent.length === 0) {
        historyList.innerHTML = '<li class="history-item">No commands recorded yet</li>';
        return;
    }
    
    historyList.innerHTML = historyContent
        .map((cmd, index) => `<li class="history-item">${cmd}</li>`)
        .join('');
}

/**
 * Add command to history
 */
function addToHistory(command) {
    if (!window.appData) return;
    
    window.appData.commandHistory.push(command);
    window.appData.currentSession.commandsCount++;
    
    // Keep only last 20 commands
    if (window.appData.commandHistory.length > 20) {
        window.appData.commandHistory.shift();
    }
    
    // Update display
    displayHistory();
}

/**
 * Set up keyboard shortcuts for accessibility
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Spacebar to toggle listening
        if (event.code === 'Space') {
            event.preventDefault();
            document.getElementById('toggleListening')?.click();
        }
        // H for help
        else if (event.key.toLowerCase() === 'h') {
            event.preventDefault();
            VoiceController.getInstance().provideHelp();
        }
        // S for scan
        else if (event.key.toLowerCase() === 's') {
            event.preventDefault();
            VoiceController.getInstance().speak("Scan mode activated");
            navigateToSection('scan');
        }
        // Escape to stop listening
        else if (event.key === 'Escape') {
            const voiceController = VoiceController.getInstance();
            if (voiceController.isListening) {
                voiceController.stopListening();
                updateListeningState(false);
            }
        }
    });
}

/**
 * Set up focus management for screen readers
 */
function setupFocusManagement() {
    // Ensure main elements are focusable
    const focusableElements = document.querySelectorAll('button, [role="button"]');
    
    focusableElements.forEach(element => {
        element.setAttribute('tabindex', '0');
        
        element.addEventListener('focus', function() {
            this.classList.add('focused');
        });
        
        element.addEventListener('blur', function() {
            this.classList.remove('focused');
        });
    });
    
    // Set initial focus
    setTimeout(() => {
        document.getElementById('toggleListening')?.focus();
    }, 500);
}

// Export functions for module use
export { initializeApp, renderAppStructure, loadInitialData, initializeServices, setupKeyboardShortcuts, setupFocusManagement, addToHistory };
/**
 * Event handling utility functions
 */

/**
 * Set up global event listeners
 */
function setupEventListeners() {
    // Set up camera functionality
    setupCameraEvents();
    
    // Set up file upload functionality
    setupFileUploadEvents();
    
    // Set up section-specific event handling
    setupSectionEvents();
    
    // Listen for custom section shown events
    document.addEventListener('sectionShown', handleSectionChange);
}

/**
 * Set up camera-related event listeners
 */
function setupCameraEvents() {
    const startCameraBtn = document.getElementById('startCamera');
    const captureBtn = document.getElementById('captureBtn');
    const stopCameraBtn = document.getElementById('stopCamera');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    
    if (startCameraBtn && video) {
        startCameraBtn.addEventListener('click', startCamera);
    }
    
    if (captureBtn) {
        captureBtn.addEventListener('click', captureAndScan);
    }
    
    if (stopCameraBtn) {
        stopCameraBtn.addEventListener('click', stopCamera);
    }
    
    // Canvas context for drawing
    if (canvas) {
        canvas.ctx = canvas.getContext('2d');
    }
}

/**
 * Set up file upload event listeners
 */
function setupFileUploadEvents() {
    const fileInput = document.getElementById('fileInput');
    
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
}

/**
 * Set up section-specific event listeners
 */
function setupSectionEvents() {
    // Listen for when scan section is shown
    document.addEventListener('sectionShown', function(e) {
        if (e.detail.sectionId === 'scan') {
            // Initialize scan section specific functionality
            initScanSection();
        }
    });
}

/**
 * Handle section change events
 */
function handleSectionChange(e) {
    console.log(`Section changed to: ${e.detail.sectionId}`);
    
    // Perform section-specific initialization
    switch(e.detail.sectionId) {
        case 'dashboard':
            initDashboardSection();
            break;
        case 'scan':
            initScanSection();
            break;
        case 'history':
            initHistorySection();
            break;
        case 'profile':
            initProfileSection();
            break;
        default:
            break;
    }
}

/**
 * Initialize dashboard section
 */
function initDashboardSection() {
    console.log('Initializing dashboard section');
    // Any dashboard-specific initialization goes here
}

/**
 * Initialize scan section
 */
function initScanSection() {
    console.log('Initializing scan section');
    // Any scan-specific initialization goes here
}

/**
 * Initialize history section
 */
function initHistorySection() {
    console.log('Initializing history section');
    // Any history-specific initialization goes here
}

/**
 * Initialize profile section
 */
function initProfileSection() {
    console.log('Initializing profile section');
    // Any profile-specific initialization goes here
}

/**
 * Start camera functionality
 */
async function startCamera() {
    const video = document.getElementById('video');
    const startCameraBtn = document.getElementById('startCamera');
    const captureBtn = document.getElementById('captureBtn');
    const stopCameraBtn = document.getElementById('stopCamera');
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        
        if (video) {
            video.srcObject = stream;
            
            if (startCameraBtn) startCameraBtn.disabled = true;
            if (captureBtn) captureBtn.disabled = false;
            if (stopCameraBtn) stopCameraBtn.disabled = false;
            
            showMessage('Camera started successfully! Point at medicine label and capture.', 'success');
        }
    } catch (error) {
        console.error('Error accessing camera:', error);
        showMessage('Error accessing camera: ' + error.message, 'error');
    }
}

/**
 * Stop camera functionality
 */
function stopCamera() {
    const video = document.getElementById('video');
    const startCameraBtn = document.getElementById('startCamera');
    const captureBtn = document.getElementById('captureBtn');
    const stopCameraBtn = document.getElementById('stopCamera');
    
    if (video && video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        
        if (startCameraBtn) startCameraBtn.disabled = false;
        if (captureBtn) captureBtn.disabled = true;
        if (stopCameraBtn) stopCameraBtn.disabled = true;
        
        showMessage('Camera stopped.', 'info');
    }
}

/**
 * Capture and scan functionality
 */
function captureAndScan() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    
    if (video && canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.ctx.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/png');
        processImage(imageData);
    }
}

/**
 * Handle file upload functionality
 */
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            processImage(e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

/**
 * Process image with OCR (placeholder)
 */
function processImage(imageData) {
    // Show loading indicator
    showLoadingIndicator();
    
    // Simulate OCR processing delay
    setTimeout(() => {
        // This is where the actual OCR processing would happen
        // For now, we'll simulate the results
        
        // Hide loading indicator
        hideLoadingIndicator();
        
        // Display simulated results
        displayResults({
            text: "Simulated OCR Results - This would contain the actual extracted text from the image",
            confidence: 85
        });
    }, 2000);
}

/**
 * Show loading indicator
 */
function showLoadingIndicator() {
    const resultsContainer = document.getElementById('resultsContainer');
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <span class="loading-text">Processing image with OCR...</span>
            </div>
        `;
    }
}

/**
 * Hide loading indicator
 */
function hideLoadingIndicator() {
    // This function would be implemented to hide the loading indicator
    // when OCR processing is complete
}

/**
 * Display OCR results
 */
function displayResults(results) {
    const resultsContainer = document.getElementById('resultsContainer');
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="ocr-results">
                <h4>OCR Results</h4>
                <p><strong>Extracted Text:</strong> ${results.text}</p>
                <p><strong>Confidence:</strong> ${results.confidence}%</p>
                <div class="mt-2">
                    <button class="btn btn-primary" onclick="analyzeMedicine('${results.text}', ${results.confidence})">
                        Analyze Medicine
                    </button>
                </div>
            </div>
        `;
    }
}

/**
 * Analyze medicine information (placeholder)
 */
function analyzeMedicine(extractedText, confidence) {
    // This would connect to the backend API to analyze the medicine
    // For now, we'll simulate the results
    
    // Show loading indicator
    showLoadingIndicator();
    
    // Simulate API processing delay
    setTimeout(() => {
        // Hide loading indicator
        hideLoadingIndicator();
        
        // Display simulated medicine analysis
        displayMedicineAnalysis({
            name: "Simulated Medicine Name",
            uses: "Treatment for simulated condition",
            dosage: "Take as directed by healthcare provider",
            sideEffects: "May cause simulated side effects",
            precautions: "Consult healthcare provider before use"
        });
    }, 1500);
}

/**
 * Display medicine analysis results
 */
function displayMedicineAnalysis(medicineInfo) {
    const resultsContainer = document.getElementById('resultsContainer');
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="medicine-analysis">
                <h4>Medicine Analysis</h4>
                <div class="card mb-2">
                    <h5>${medicineInfo.name}</h5>
                    <p><strong>Uses:</strong> ${medicineInfo.uses}</p>
                    <p><strong>Dosage:</strong> ${medicineInfo.dosage}</p>
                    <p><strong>Side Effects:</strong> ${medicineInfo.sideEffects}</p>
                    <p><strong>Precautions:</strong> ${medicineInfo.precautions}</p>
                </div>
                <div class="flex justify-between">
                    <button class="btn btn-primary" onclick="speakMedicineInfo()">
                        <span>🔊</span> Listen
                    </button>
                    <button class="btn btn-outline" onclick="setReminderForMedicine('${medicineInfo.name}')">
                        <span>⏰</span> Set Reminder
                    </button>
                </div>
            </div>
        `;
    }
}

/**
 * Speak medicine information
 */
function speakMedicineInfo() {
    const medicineCard = document.querySelector('.medicine-analysis .card h5');
    if (medicineCard) {
        const text = `Medicine name: ${medicineCard.textContent}. This is a simulated feature for text-to-speech.`;
        
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.8;
            utterance.pitch = 1;
            utterance.volume = 1;
            speechSynthesis.speak(utterance);
        } else {
            showMessage('Text-to-speech not supported in this browser.', 'info');
        }
    }
}

/**
 * Set reminder for medicine
 */
function setReminderForMedicine(medicineName) {
    showMessage(`Reminder functionality would be implemented here for ${medicineName}`, 'info');
}

/**
 * Show message to user
 */
function showMessage(message, type = 'info') {
    // Remove any existing messages
    const existingMessages = document.querySelectorAll('.message-toast');
    existingMessages.forEach(msg => msg.remove());
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message-toast ${type}`;
    messageEl.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            max-width: 400px;
            word-wrap: break-word;
            background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff'};
        ">
            ${message}
        </div>
    `;
    
    document.body.appendChild(messageEl);
    
    // Auto-remove message after 5 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.parentNode.removeChild(messageEl);
        }
    }, 5000);
}

// Make functions globally available for inline event handlers
window.startCamera = startCamera;
window.stopCamera = stopCamera;
window.captureAndScan = captureAndScan;
window.analyzeMedicine = analyzeMedicine;
window.speakMedicineInfo = speakMedicineInfo;
window.setReminderForMedicine = setReminderForMedicine;

// Export functions for module use
export { setupEventListeners, showMessage, startCamera, stopCamera, captureAndScan, handleFileUpload };
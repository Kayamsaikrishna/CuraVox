// Import necessary modules
import { initializeApp } from './app.js';

// Application initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('Medical AI Assistant initializing...');
    
    // Initialize the main application
    initializeApp();
    
    console.log('Medical AI Assistant initialized successfully');
});

// Export functions for module use
export { initializeApp };
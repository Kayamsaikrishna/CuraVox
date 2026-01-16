import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import VoiceService from '../../services/voiceService';

const RouteAnnouncer = () => {
    const location = useLocation();
    const voiceService = VoiceService.getInstance();

    useEffect(() => {
        // Define page names
        const pageNames = {
            '/home': 'Home Page',
            '/medicines': 'My Medicines',
            '/scan': 'Scan and Upload',
            '/reminders': 'Reminders',
            '/settings': 'Settings',
            '/profile': 'My Profile',
            '/login': 'Login',
            '/register': 'Register'
        };

        const path = location.pathname;
        const pageName = pageNames[path] || '';

        // Special Logic for Home Page
        if (path === '/home') {
            const hasWelcomed = sessionStorage.getItem('welcomeAnnounced');

            if (!hasWelcomed) {
                // First time in this session: Play Full Welcome
                const now = new Date();
                const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
                const welcomeMsg = `Welcome to CuraVox. Today is ${dateStr}. You are on the Home Page.`;

                voiceService.speak(welcomeMsg);
                sessionStorage.setItem('welcomeAnnounced', 'true');
            } else {
                // Subsequent visits/refreshes: Short Intro
                voiceService.speak("You are on the Home Page.");
            }
        }
        // Logic for other pages
        else if (pageName) {
            voiceService.speak(`You are on the ${pageName}.`);
        }

    }, [location]); // Run on route change

    return null; // No UI
};

export default RouteAnnouncer;

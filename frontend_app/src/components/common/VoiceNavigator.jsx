import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VoiceNavigator = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleVoiceNavigate = (event) => {
            if (event.detail && event.detail.path) {
                console.log("🧭 VoiceNavigator receiving request:", event.detail.path);
                // Remove /# prefix if present, though router usually handles paths
                const path = event.detail.path.replace('/#', '');
                navigate(path);
            }
        };

        window.addEventListener('voiceNavigate', handleVoiceNavigate);

        return () => {
            window.removeEventListener('voiceNavigate', handleVoiceNavigate);
        };
    }, [navigate]);

    return null; // Logic only component
};

export default VoiceNavigator;

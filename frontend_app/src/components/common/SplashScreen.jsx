import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo.jpeg';
import useAccessibility from '../../hooks/useAccessibility';

const SplashScreen = ({ onComplete }) => {
    const { speak } = useAccessibility();

    useEffect(() => {
        // 1. Play Welcome Message
        const timer = setTimeout(() => {
            speak("Welcome to CuraVox. Your personal medical AI assistant is ready.");
        }, 500);

        // 2. Play "Medical" Sound (Simulated for now, would need an actual file)
        // const audio = new Audio('/welcome_chime.mp3');
        // audio.play().catch(e => console.log('Audio play failed', e));

        // 3. Exit Splash Screen after 3.5 seconds
        const exitTimer = setTimeout(() => {
            onComplete();
        }, 3500);

        return () => {
            clearTimeout(timer);
            clearTimeout(exitTimer);
        };
    }, [speak, onComplete]);

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center z-50 overflow-hidden">

            {/* Background Pulse Effect */}
            <motion.div
                className="absolute w-96 h-96 bg-blue-200 rounded-full opacity-20 filter blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Main Content Container */}
            <div className="relative z-10 flex flex-col items-center">

                {/* Animated Logo */}
                <motion.div
                    initial={{ scale: 0, opacity: 0, rotate: -180 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        duration: 1.5
                    }}
                    className="relative"
                >
                    {/* Logo Image with Medical "Glow" */}
                    <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50 backdrop-blur-sm">
                        <img
                            src={logo}
                            alt="CuraVox Logo"
                            className="w-full h-full object-cover"
                        />
                        {/* Scanning Line Animation overlay */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent w-full h-4"
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        />
                    </div>
                </motion.div>

                {/* Text Animations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="mt-8 text-center"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-tight">
                        Dr. CuraVox
                    </h1>
                    <p className="mt-2 text-lg text-gray-600 font-medium tracking-wide uppercase text-sm">
                        Medical Intelligence System
                    </p>
                </motion.div>

                {/* Loading Indicator */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: 100 }}
                    transition={{ delay: 1.5, duration: 1.5 }}
                    className="mt-8 h-1 bg-blue-500 rounded-full"
                    style={{ width: '100px' }}
                />
            </div>
        </div>
    );
};

export default SplashScreen;

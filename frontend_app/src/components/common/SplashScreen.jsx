import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import logo from '../../assets/logo.jpeg';
import useAccessibility from '../../hooks/useAccessibility';

const SplashScreen = ({ onComplete }) => {
    const { speak } = useAccessibility();

    useEffect(() => {
        const timer = setTimeout(() => {
            speak("Welcome to CuraVox. Analyzing system status.");
        }, 800);

        const exitTimer = setTimeout(() => {
            onComplete();
        }, 4000);

        return () => {
            clearTimeout(timer);
            clearTimeout(exitTimer);
        };
    }, [speak, onComplete]);

    return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 overflow-hidden">

            {/* Background Abstract Shapes (Subtle Medical Feel) */}
            <div className="absolute inset-0 overflow-hidden opacity-30">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-20 -right-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-3xl"
                />
            </div>

            <div className="relative z-10 flex flex-col items-center">

                {/* Main Logo Container - User's Design Highlighted */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: -50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        duration: 1.2
                    }}
                    className="relative mb-8"
                >
                    <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 bg-white p-2">
                        <img
                            src={logo}
                            alt="CuraVox Logo"
                            className="w-full h-full object-contain rounded-2xl"
                        />

                        {/* Shiny Reflection Effect */}
                        <motion.div
                            initial={{ left: "-100%" }}
                            animate={{ left: "100%" }}
                            transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
                            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg]"
                        />
                    </div>
                </motion.div>

                {/* Text Content - Matching the Logo's Vibe */}
                <div className="text-center space-y-2">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8, duration: 0.8, ease: "backOut" }}
                        className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 tracking-tighter drop-shadow-sm"
                    >
                        Dr. CuraVox
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, letterSpacing: "1px" }}
                        animate={{ opacity: 1, letterSpacing: "3px" }}
                        transition={{ delay: 1.2, duration: 1 }}
                        className="text-lg md:text-xl text-slate-500 font-semibold uppercase"
                    >
                        AI Medical Assistant
                    </motion.p>
                </div>        </div>

            {/* Loading Bar */}
            <motion.div
                className="mt-12 w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                <motion.div
                    className="h-full bg-blue-600 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1.2, duration: 2, ease: "easeInOut" }}
                />
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="mt-2 text-xs text-gray-400 font-medium uppercase tracking-widest"
            >
                Establishling Secure Connection...
            </motion.p>
        </div>
    );
};

export default SplashScreen;

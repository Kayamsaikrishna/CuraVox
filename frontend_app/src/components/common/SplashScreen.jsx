import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
// Import the video file
import introVideo from '../../assets/Product_Reveal_Video_Generation.mp4';

const SplashContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const SplashScreen = ({ onComplete }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        // Safety timeout: If video fails or stalls, exit after 8 seconds (video duration + buffer)
        const safetyTimer = setTimeout(() => {
            onComplete(); // Force exit if video doesn't end properly
        }, 8000);

        return () => clearTimeout(safetyTimer);
    }, [onComplete]);

    const handleVideoEnd = () => {
        onComplete();
    };

    return (
        <AnimatePresence>
            <SplashContainer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                <VideoElement
                    ref={videoRef}
                    src={introVideo}
                    autoPlay
                    muted
                    playsInline
                    onEnded={handleVideoEnd}
                />
            </SplashContainer>
        </AnimatePresence>
    );
};

export default SplashScreen;

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import introVideo from '../../assets/Product_Reveal_Video_Generation.mp4';
// import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa'; // Optional icons

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
        const playVideo = async () => {
            if (!videoRef.current) return;

            try {
                // Attempt 1: Play with sound
                videoRef.current.muted = false;
                await videoRef.current.play();
                console.log("Autoplay with sound success");
            } catch (err) {
                console.warn("Autoplay with sound blocked. Falling back to muted.");
                // Attempt 2: Fallback to muted (Always works)
                if (videoRef.current) {
                    videoRef.current.muted = true;
                    try {
                        await videoRef.current.play();
                    } catch (e) {
                        console.error("Muted playback failed too", e);
                        onComplete(); // Force exit if video is totally broken
                    }
                }
            }
        };

        playVideo();

        // Safety timeout: 10 seconds max (Video duration + buffer)
        const timer = setTimeout(() => {
            onComplete();
        }, 10000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            <SplashContainer
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
            >
                <VideoElement
                    ref={videoRef}
                    src={introVideo}
                    playsInline
                    onEnded={onComplete}
                />
            </SplashContainer>
        </AnimatePresence>
    );
};

export default SplashScreen;

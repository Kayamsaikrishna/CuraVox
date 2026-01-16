import React, { useEffect, useRef } from 'react';
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
                // 1. Try FORCE UNMUTED (What you want)
                videoRef.current.muted = false;
                videoRef.current.volume = 1.0;
                await videoRef.current.play();
                console.log("Audio Autoplay Success");
            } catch (err) {
                console.warn("Audio Blocked by Browser -> Fallback to Muted to prevent freezing");
                // 2. If Blocked, switch to MUTED so video doesn't get stuck
                if (videoRef.current) {
                    videoRef.current.muted = true;
                    try {
                        await videoRef.current.play();
                    } catch (e) {
                        onComplete(); // Total failure => Skip
                    }
                }
            }
        };

        playVideo();

        // Safety timeout: 10 seconds max
        const timer = setTimeout(() => {
            onComplete();
        }, 10000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    const handleInteraction = () => {
        if (videoRef.current) {
            videoRef.current.muted = false;
            videoRef.current.volume = 1.0;
            console.log("User interaction: Unmuting video");
        }
    };

    return (
        <AnimatePresence>
            <SplashContainer
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                onClick={handleInteraction}
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
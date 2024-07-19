// import React, { useEffect, useRef, useState } from 'react';
const { useEffect, useRef, useState } = React;

const SwipeCard = ({
    movieInfo,
    width,
    height,
    shakeSoundUrl = "shake.wav",
    swipeRightSoundUrl = "swipe-right.wav",
    swipeLeftSoundUrl = "swipe-left.wav",
    mute = true,
    onSwipe,
    onSwiped,
    onShake,
    cardStyle,
    onSwipeUp,
}) => {
    const cardRef = useRef(null);
    const liquidContainerRef = useRef(null);
    const liquidRef = useRef(null);
    const bubbleContainerRef = useRef(null);
    const [currentTick, setCurrentTick] = useState(0);
    const [swipeUpThreshold] = useState(-50);

    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(null);
    const [startY, setStartY] = useState(null);
    const [lastX, setLastX] = useState(null);
    const [lastY, setLastY] = useState(null);
    const [startTime, setStartTime] = useState(0);
    const [liquidLevel, setLiquidLevel] = useState(52);
    const [isAnimating, setIsAnimating] = useState(false);
    const [shakeLevel, setShakeLevel] = useState(null);

    const shakeAudioRef = useRef(null);
    const swipeRightAudioRef = useRef(null);
    const swipeLeftAudioRef = useRef(null);
    const gravityIntervalRef = useRef(null);
    const animationTimeoutRef = useRef(null);
    const [isUserActive, setIsUserActive] = useState(false);
    const userActivityTimeoutRef = useRef(null);

    const [isAudioInitialized, setIsAudioInitialized] = useState(false);
    const [lastEmittedRotation, setLastEmittedRotation] = useState(0);
    const [interactionStartedInCard, setInteractionStartedInCard] = useState(false);

    const cardWidthRef = useRef(0);

    useEffect(() => {
        if (cardRef.current) {
            cardWidthRef.current = cardRef.current.offsetWidth;
        }
    }, []);

    useEffect(() => {
        if (shakeLevel !== null) {
            onShake && onShake(shakeLevel);
            setShakeLevel(null);
        }
    }, [shakeLevel, onShake]);

    useEffect(() => {
        if (!mute) {
            shakeAudioRef.current = new AudioController(shakeSoundUrl, 10, 0.1, 50);
            swipeRightAudioRef.current = new AudioController(swipeRightSoundUrl);
            swipeLeftAudioRef.current = new AudioController(swipeLeftSoundUrl);
        }

        initializeBubbles();
        const bubbleInterval = setInterval(createBubble, 150);
        startGravity();

        return () => {
            clearInterval(bubbleInterval);
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
            if (gravityIntervalRef.current) {
                clearInterval(gravityIntervalRef.current);
            }
            if (userActivityTimeoutRef.current) {
                clearTimeout(userActivityTimeoutRef.current);
            }
        };
    }, [mute, shakeSoundUrl, swipeRightSoundUrl, swipeLeftSoundUrl]);

    const initializeAudio = async () => {
        if (isAudioInitialized || mute) return;

        const audioContexts = [
            shakeAudioRef.current.audioContext,
            swipeRightAudioRef.current.audioContext,
            swipeLeftAudioRef.current.audioContext,
        ];

        for (const context of audioContexts) {
            try {
                await context.resume();
                console.log("Audio context resumed");
            } catch (e) {
                console.error("Error resuming audio context:", e);
            }
        }

        setIsAudioInitialized(true);
    };

    const updateSwipeSound = (rotation) => {
        if (mute) return;
        if (rotation > 5) {
            swipeRightAudioRef.current.incrementIntensity(Math.abs(rotation) / 45);
            swipeLeftAudioRef.current.fadeOut(0.1);
        } else if (rotation < -5) {
            swipeLeftAudioRef.current.incrementIntensity(Math.abs(rotation) / 45);
            swipeRightAudioRef.current.fadeOut(0.1);
        } else {
            swipeRightAudioRef.current.fadeOut(0.05);
            swipeLeftAudioRef.current.fadeOut(0.05);
        }
    };

    const handleStart = (clientX, clientY) => {
        initializeAudio();
        setUserActive();
        setStartX(clientX);
        setStartY(clientY);
        setLastX(clientX);
        setStartTime(Date.now());
        setIsDragging(false);
        setInteractionStartedInCard(true);
        if (cardRef.current) cardRef.current.style.transition = "none";
        if (liquidRef.current) liquidRef.current.style.transition = "none";
    };

    const calculateSwipeData = (rotation, deltaY = 0) => {
        // console.log(deltaY);
        const tick = Math.round(rotation / 9);
        const value = rotation / 45;
        const direction = deltaY < swipeUpThreshold ? "up" : rotation > 0 ? "right" : "left";
        return { tick, value, direction, degree: rotation };
    };

    const handleMove = (clientX, clientY) => {
        if (startX === null || startY === null) return;
        setUserActive();

        const deltaX = clientX - startX;
        const deltaY = clientY - startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance > 10) {
            setIsDragging(true);
        }

        if (isDragging) {
            const cardWidth = cardWidthRef.current;
            const rotationFactor = (deltaX / cardWidth) * 2;
            const rotation = Math.max(-45, Math.min(45, rotationFactor * 45));

            const swipeData = calculateSwipeData(rotation, deltaY);

            if (Math.abs(rotation - lastEmittedRotation) >= 9) {
                onSwipe && onSwipe(swipeData);
                setLastEmittedRotation(rotation);
            }

            updateSwipeSound(rotation);

            // Modify liquid height calculation based on swipe direction
            const baseHeight = 52;
            const maxIncrease = 22; // 74 - 52
            const maxDecrease = 22; // 52 - 30 (assuming 30 as min height)
            let newLiquidHeight;

            if (rotation > 0) {
                // Swiping right
                newLiquidHeight = baseHeight + (rotation / 45) * maxIncrease;
            } else {
                // Swiping left
                newLiquidHeight = baseHeight - (Math.abs(rotation) / 45) * maxDecrease;
            }

            if (cardRef.current) cardRef.current.style.transform = `rotate(${rotation}deg)`;
            if (liquidContainerRef.current) liquidContainerRef.current.style.transform = `rotate(${-rotation}deg)`;
            if (liquidRef.current) {
                liquidRef.current.style.height = `${Math.max(30, Math.min(74, newLiquidHeight))}%`;

                // New color calculation
                if (rotation > 0) {
                    // Swiping right (blue to green)
                    liquidRef.current.style.backgroundColor = `rgba(${152 - Math.abs(rotation)}, ${251}, ${152}, 0.6)`;
                } else {
                    // Swiping left (blue to red)
                    const redIntensity = Math.min(255, 173 + Math.abs(rotation) * 2);
                    liquidRef.current.style.backgroundColor = `rgba(${redIntensity}, ${Math.max(
                        0,
                        216 - Math.abs(rotation) * 4
                    )}, ${Math.max(0, 230 - Math.abs(rotation) * 4)}, 0.6)`;
                }

                const speed = Math.abs(clientX - lastX) / ((Date.now() - startTime) / 1000);
                const waveHeight = Math.min(speed / 10, 10);
                liquidRef.current.style.transform = `translateY(${waveHeight}px)`;
            }

            // New wave color calculation
            const waveElements = liquidRef.current.querySelectorAll(".wave");
            let waveColor;
            if (rotation > 0) {
                // Swiping right (blue to green)
                waveColor = `rgba(${152 - Math.abs(rotation)}, ${251}, ${152}, 0.6)`;
            } else {
                // Swiping left (blue to red)
                const redIntensity = Math.min(255, 173 + Math.abs(rotation) * 2);
                waveColor = `rgba(${redIntensity}, ${Math.max(0, 216 - Math.abs(rotation) * 4)}, ${Math.max(
                    0,
                    230 - Math.abs(rotation) * 4
                )}, 0.6)`;
            }
            waveElements.forEach((wave) => {
                wave.style.filter = `drop-shadow(0 0 0 ${waveColor})`;
            });
        }

        setLastX(clientX);
        setLastY(clientY);
    };

    const handleEnd = () => {
        if (interactionStartedInCard) {
            if (!isDragging) {
                shakeGlass();
            } else {
                const deltaX = lastX - startX;
                const deltaY = lastY - startY; // You need to track lastY similar to lastX
                const rotation = Math.max(-45, Math.min(45, deltaX * 0.2));
                const swipeData = calculateSwipeData(rotation, deltaY);

                if (deltaY < swipeUpThreshold) {
                    onSwipeUp && onSwipeUp(swipeData);
                } else {
                    onSwiped && onSwiped(swipeData);
                }
                endInteraction();
            }
        }
        setIsDragging(false);
        setStartX(null);
        setStartY(null);
        setLastX(null);
        setStartTime(0);
        setInteractionStartedInCard(false);
    };

    const endInteraction = () => {
        if (cardRef.current) {
            cardRef.current.style.transition = "transform 0.3s ease";
            cardRef.current.style.transform = "rotate(0deg)";
        }
        if (liquidContainerRef.current) {
            liquidContainerRef.current.style.transition = "transform 0.3s ease";
            liquidContainerRef.current.style.transform = "rotate(0deg)";
        }
        if (liquidRef.current) {
            liquidRef.current.style.transition = "height 0.3s ease, transform 0.5s ease, background-color 0.3s ease";
            liquidRef.current.style.height = "52%"; // Reset to initial height
            liquidRef.current.style.transform = "translateY(0)";
            liquidRef.current.style.backgroundColor = "rgba(173, 216, 230, 0.6)"; // Reset to initial blue color

            const waveElements = liquidRef.current.querySelectorAll(".wave");
            waveElements.forEach((wave) => {
                wave.style.filter = "none";
            });
        }
        if (!mute) {
            swipeRightAudioRef.current.fadeOut(0.3);
            swipeLeftAudioRef.current.fadeOut(0.3);
        }
    };

    const handleMouseLeave = () => {
        if (isDragging) {
            handleEnd();
        }
        setInteractionStartedInCard(false);
    };

    const createBubble = (startPosition = 0) => {
        const bubble = document.createElement("div");
        bubble.classList.add("bubble");
        const size = Math.random() * 10 + 5;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${Math.random() * 100}%`;
        const duration = Math.random() * 2 + 1;
        bubble.style.animationDuration = `${duration}s`;
        bubble.style.bottom = `${startPosition}px`;
        bubbleContainerRef.current.appendChild(bubble);

        setTimeout(() => {
            if (bubble && bubble.parentNode) {
                bubble.parentNode.removeChild(bubble);
            }
        }, duration * 4 * 1000);
    };

    const initializeBubbles = () => {
        const liquidHeight = liquidRef.current.offsetHeight;
        for (let i = 0; i < 20; i++) {
            const startPosition = Math.random() * liquidHeight;
            createBubble(startPosition);
        }
    };

    const shakeGlass = () => {
        if (isDragging) return;
        initializeAudio();
        setUserActive();

        // Clear any ongoing animation timeout
        if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current);
        }

        if (!mute) {
            shakeAudioRef.current.incrementIntensity();
        }

        // Remove and re-add shake classes to restart animation
        cardRef.current.classList.remove("shake");
        liquidRef.current.classList.remove("liquid-shake");
        void cardRef.current.offsetWidth; // Force reflow
        void liquidRef.current.offsetWidth; // Force reflow
        cardRef.current.classList.add("shake");
        liquidRef.current.classList.add("liquid-shake");

        // Increase liquid level immediately
        setLiquidLevel((prevLevel) => {
            const newLevel = Math.min(90, prevLevel + 2);
            const normalizedLevel = (newLevel - 52) / (90 - 52);
            setShakeLevel(normalizedLevel); // Set shakeLevel instead of calling onShake directly
            return newLevel;
        });

        // Create bubbles
        for (let i = 0; i < 10; i++) {
            setTimeout(() => createBubble(), i * 50);
        }

        // Set a timeout to remove the shake classes
        animationTimeoutRef.current = setTimeout(() => {
            cardRef.current.classList.remove("shake");
            liquidRef.current.classList.remove("liquid-shake");
        }, 500);
    };

    const startGravity = () => {
        if (gravityIntervalRef.current) {
            clearInterval(gravityIntervalRef.current);
        }
        gravityIntervalRef.current = setInterval(() => {
            setLiquidLevel((prevLevel) => {
                const gravityStrength = isUserActive ? 0.2 : 0.5; // Slower when active, faster when inactive
                const newLevel = Math.max(52, prevLevel - gravityStrength);
                if (newLevel === 52) {
                    if (!mute) shakeAudioRef.current.fadeOut(0.3);
                }
                return newLevel;
            });
        }, 50);
    };

    const setUserActive = () => {
        setIsUserActive(true);
        if (userActivityTimeoutRef.current) {
            clearTimeout(userActivityTimeoutRef.current);
        }
        userActivityTimeoutRef.current = setTimeout(() => {
            setIsUserActive(false);
        }, 1000); // Set to inactive after 1 second of no activity
    };

    // Calculate dimensions
    const aspectRatio = 9 / 16;
    const cardWidth = width || "80vw";
    const cardHeight = (height && height != "auto") || (width ? `${parseFloat(width) / aspectRatio}px` : "120vw");

    return (
        <div
            className="card"
            ref={cardRef}
            onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchEnd={handleEnd}
            onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
            onMouseUp={handleEnd}
            onMouseLeave={handleMouseLeave}
            style={{
                backgroundImage: `url(${movieInfo.imageUrl})`,
                width: cardWidth,
                height: cardHeight,
                maxWidth: "300px",
                maxHeight: "450px",
                borderRadius: "20px",
                position: "relative",
                overflow: "hidden",
                ...cardStyle, // Allow overriding styles
            }}
        >
            <div className="glass">
                <div className="liquid-container" ref={liquidContainerRef}>
                    <div className="liquid" ref={liquidRef} style={{ height: `${liquidLevel}%` }}>
                        <div className="wave-container">
                            <div className="wave wave1"></div>
                            <div className="wave wave2"></div>
                        </div>
                        <div className="bubble-container" ref={bubbleContainerRef}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// export default Swiper;

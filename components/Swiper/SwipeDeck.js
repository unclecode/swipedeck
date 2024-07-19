// import React, { useState, useEffect } from 'react';
// import SwipeCard from './SwipeCard';
const { useState, useEffect, useMemo } = React;

const SwipeDeck = ({ movies, onSwipe, onSwiped, onShake, onSwipeUp, onDeckFinished, cardStyle = {} }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [swipedCards, setSwipedCards] = useState({});

    // Calculate dimensions
    const aspectRatio = 9 / 16;
    const deckWidth = cardStyle.width || "300px";
    const deckHeight =
        cardStyle.height === "auto" ? "auto" : cardStyle.height || `${parseFloat(deckWidth) / aspectRatio}px`;

    // Generate fixed rotations for all cards
    const cardRotations = useMemo(() => {
        return movies.map((_, index) => (index === 0 ? 0 : Math.random() * 10 - 5));
    }, [movies.length]);

    const handleSwiped = (swipedData, movieId) => {
        console.log("Swiped", swipedData, movies[currentIndex]);
        if (onSwiped) onSwiped(swipedData, movies[currentIndex]);
        setSwipedCards((prev) => ({ ...prev, [movieId]: swipedData.direction }));
        setTimeout(() => {
            setCurrentIndex((prevIndex) => {
                const newIndex = prevIndex + 1;
                if (newIndex >= movies.length && onDeckFinished) {
                    onDeckFinished();
                }
                return newIndex;
            });
        }, 300);
    };

    useEffect(() => {
        if (currentIndex >= movies.length && onDeckFinished) {
            onDeckFinished();
        }
    }, [currentIndex, movies.length, onDeckFinished]);

    const deckStyle = {
        position: "relative",
        width: deckWidth,
        height: deckHeight,
    };

    return (
        <div className="swipe-deck" style={deckStyle}>
            {movies.map((movie, index) => {
                const isCurrentCard = index === currentIndex;
                const cardRotation = isCurrentCard ? 0 : cardRotations[index];
                const swipedDirection = swipedCards[movie.id];

                return (
                    <div
                        key={movie.id}
                        className={`card-wrapper ${swipedDirection || ""}`}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            zIndex: movies.length - index,
                            transform: `rotate(${cardRotation}deg) translateY(${(index - currentIndex) * 2}px)`,
                            opacity: index < currentIndex ? 0 : 1,
                            pointerEvents: isCurrentCard ? "auto" : "none",
                            transition: "transform 0.3s ease, opacity 0.3s ease",
                            display: index < currentIndex - 1 ? "none" : "block",
                        }}
                    >
                        <SwipeCard
                            movieInfo={movie}
                            onSwipe={(data) => onSwipe && onSwipe(data, movie)}
                            onSwiped={(data) => handleSwiped(data, movie.id)}
                            onShake={(level) => onShake && onShake(level, movie)}
                            onSwipeUp={(data) => {
                                onSwipeUp && onSwipeUp(data, movie);
                                handleSwiped({ ...data, direction: "up" }, movie.id);
                            }}
                            cardStyle={{
                                width: "100%",
                                height: "100%",
                                ...cardStyle,
                                boxShadow: `0 ${(index - currentIndex + 1) * 2}px ${
                                    (index - currentIndex + 1) * 3.5
                                }px rgba(0,0,0,0.4)`,
                            }}
                        />
                    </div>
                );
            })}
            {currentIndex >= movies.length && (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "20px",
                        fontWeight: "bold",
                    }}
                >
                    No more cards!
                </div>
            )}
        </div>
    );
};

// export default SwipeDeck;

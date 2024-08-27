import React, { useState, useMemo } from "react";
import SwipeDeck from "./SwipeDeck";
import SwipeableCard from "./SwipeableCard";

const styles = {
    app: {
        fontFamily: "sans-serif",
        textAlign: "center",
        backgroundColor: "#020106",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
    },
    headLine: {
        color: "#fff",
        width: "100%",
        zIndex: 2,
    },
    buttonContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        bottom: "60px", // Adjusted for space above the dots
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 3,
    },
    button: {
        padding: "10px 20px",
        backgroundColor: "#fff",
        color: "#000",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        margin: "0 10px", // Spacing between buttons
    },
    progressDots: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        bottom: "20px",
        width: "100%",
        zIndex: 2,
    },
    dot: {
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        backgroundColor: "rgba(255, 255, 255, 0.3)", // Dimmed color for incomplete cards
        margin: "0 5px",
        transition: "background-color 0.3s ease",
    },
    activeDot: {
        backgroundColor: "#fff", // Bright white color for swiped cards
    },
};

const Swiper = ({ cardData, skipEnabled = true, onSwipe, onCardLeftScreen, onSwipeable }) => {
    const [cards, setCards] = useState(cardData);
    const [currentCardIndex, setCurrentCardIndex] = useState(cardData.length - 1);
    const [cardsInitialCount] = useState(cardData.length);

    const handleSwipe = (direction, cardToDelete, magnified = false) => {
        onSwipe(direction, cardToDelete, magnified);
        setCards((prevCards) => prevCards.filter((card) => card.key !== cardToDelete.key));
        setCurrentCardIndex((prevIndex) => prevIndex - 1);
    };

    const handleCardLeftScreen = (myIdentifier) => {
        onCardLeftScreen(myIdentifier);
    };

    const handleSkip = () => {
        const currentCard = cards[currentCardIndex];
        if (currentCard) {
            handleSwipe("skip", currentCard);
            console.log("You skipped: " + currentCard.key);
        }
    };

    const handleSwipeLeft = () => {
        const currentCard = cards[currentCardIndex];
        if (currentCard) {
            handleSwipe("left", currentCard, true);
        }
    };

    const handleSwipeRight = () => {
        const currentCard = cards[currentCardIndex];
        if (currentCard) {
            handleSwipe("right", currentCard, true);
        }
    };

    const renderProgressDots = useMemo(() => {
        const currentIndexSoFar = cardsInitialCount - currentCardIndex;
        return (
            <div style={styles.progressDots}>
                {Array.from({ length: cardsInitialCount }).map((_, index) => (
                    <div
                        key={index}
                        style={{
                            ...styles.dot,
                            ...(index < currentIndexSoFar ? styles.activeDot : {}),
                        }}
                    />
                ))}
            </div>
        );
    }, [cardsInitialCount, currentCardIndex]);

    return (
        <div style={styles.app}>
            <h1 style={styles.headLine}>Stacked Swipeable Cards</h1>
            <SwipeDeck onSwipe={handleSwipe} onCardLeftScreen={handleCardLeftScreen} onSwipeable={onSwipeable}>
                {cards.map((card, index) => (
                    <SwipeableCard key={card.key} content={card} />
                ))}
            </SwipeDeck>

            {skipEnabled && cards.length > 0 && (
                <div style={styles.buttonContainer}>
                    <button style={styles.button} onClick={handleSkip}>
                        Skip
                    </button>
                </div>
            )}

            {renderProgressDots}
        </div>
    );
};

export default Swiper;

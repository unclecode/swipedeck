import React, { useState, useEffect, useCallback, useMemo } from "react";

const styles = {
    cardContainer: {
        width: "100%",
        height: "100%",
        margin: "0 auto",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        overflow: "hidden",
    },
    swipeStackOverlay: {
        position: "absolute",
        top: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        opacity: 0,
        transition: "opacity 0.3s ease",
    },
    swipeStackOverlayLeft: {
        left: 0,
        background:
            "radial-gradient(circle 200vh at -130vw 50%, rgba(255, 0, 0, 0.5) 0%, rgba(255, 0, 0, 0.5) 30%, transparent 70%)",
    },
    swipeStackOverlayRight: {
        right: 0,
        background:
            "radial-gradient(circle 200vh at 230vw 50%, rgba(0, 255, 0, 0.5) 0%, rgba(0, 255, 0, 0.5) 30%, transparent 70%)",
    },
    swipeStackOverlayUp: {
        top: 0,
        background:
            "linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 0%, rgba(192, 192, 192, 0.5) 30%, transparent 100%)",
    },
};

const SwipeDeck = ({ children, onSwipe, onCardLeftScreen, onSwipeable }) => {
    const [backgroundOverlay, setBackgroundOverlay] = useState({ left: 0, right: 0, up: 0 });

    const handleSwipeable = useCallback(
        (direction) => {
            setBackgroundOverlay((prev) => {
                if (direction === "left") return { left: 0.5, right: 0, up: 0 };
                if (direction === "right") return { left: 0, right: 0.5, up: 0 };
                if (direction === "up") return { left: 0, right: 0, up: 0.5 };
                return { left: 0, right: 0, up: 0 };
            });
            onSwipeable(direction);
        },
        [onSwipeable]
    );

    const handleTouchStart = useCallback((e) => {
        e.preventDefault();
    }, []);

    const handleTouchMove = useCallback((e) => {
        e.preventDefault();
    }, []);

    useEffect(() => {
        const deckElement = document.querySelector(".SwipeDeck");
        deckElement.addEventListener("touchstart", handleTouchStart, { passive: false });
        deckElement.addEventListener("touchmove", handleTouchMove, { passive: false });

        return () => {
            deckElement.removeEventListener("touchstart", handleTouchStart);
            deckElement.removeEventListener("touchmove", handleTouchMove);
        };
    }, [handleTouchStart, handleTouchMove]);

    const lastFourCards = useMemo(() => {
        const childArray = React.Children.toArray(children);
        return childArray
            .slice(-4)
            .reverse()
            .map((child, index, arr) =>
                React.cloneElement(child, {
                    key: child.key || `card-${childArray.length - index}`,
                    onSwipe,
                    onCardLeftScreen,
                    onSwipeable: handleSwipeable,
                    style: {
                        zIndex: arr.length - index,
                        transform: `scale(${1 - index * 0.05}) translateY(${-index * 20}px)`,
                    },
                })
            );
    }, [children, onSwipe, onCardLeftScreen, handleSwipeable]);

    return (
        <div className="SwipeDeck" style={styles.cardContainer}>
            <div
                style={{
                    ...styles.swipeStackOverlay,
                    ...styles.swipeStackOverlayLeft,
                    opacity: backgroundOverlay.left,
                }}
            />
            <div
                style={{
                    ...styles.swipeStackOverlay,
                    ...styles.swipeStackOverlayRight,
                    opacity: backgroundOverlay.right,
                }}
            />
            <div
                style={{
                    ...styles.swipeStackOverlay,
                    ...styles.swipeStackOverlayUp,
                    opacity: backgroundOverlay.up,
                }}
            />
            {lastFourCards}
        </div>
    );
};

export default React.memo(SwipeDeck);

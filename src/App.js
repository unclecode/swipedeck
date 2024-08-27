import React, { useState } from "react";
import Swiper from "./Swiper";

const App = () => {
    const [cards] = useState(() =>
        Array.from({ length: 10 }, (_, index) => ({
            index: index,
            key: `card-${index}`,
            name: `Card ${index + 1}`,
            description: `This is card number ${index + 1}`,
            header: `<strong>Header ${index + 1}</strong>`,
            footer: `<em>Footer ${index + 1}</em>`,
            posterImage: `https://picsum.photos/300/450?random=${index + 1}`,
        }))
    );

    // Event Handlers
    const handleSwipe = (direction, card) => {
        console.log(`Swiped ${direction} on ${card.key}`);
    };

    const handleCardLeftScreen = (cardName) => {
        console.log(`${cardName} left the screen`);
    };

    const handleSwipeable = (direction) => {
        if (direction) {
            console.log(`Card is in swipeable zone: ${direction}`);
        } else {
            console.log("Card is no longer in swipeable zone");
        }
    };

    return (
        <>
            <Swiper
                cardData={cards}
                skipEnabled={true} // Enable or disable skip functionality
                onSwipe={handleSwipe}
                onCardLeftScreen={handleCardLeftScreen}
                onSwipeable={handleSwipeable}
            />
        </>
    );
};

export default App;

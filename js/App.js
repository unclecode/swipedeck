// import React, { useState } from 'react';
// import SwipeDeck from './SwipeDeck';

const App = () => {
    const movies = [
        {
            id: 1,
            imageUrl:
                "https://images-cdn.ubuy.co.id/634d1909d46781775673cd3d-lord-of-the-rings-fellowship-of-the-ring.jpg",
            title: "The Lord of the Rings: The Fellowship of the Ring",
            rate: 8.8,
        },
        {
            id: 2,
            imageUrl:
                "https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_.jpg",
            title: "The Lord of the Rings: The Two Towers",
            rate: 8.7,
        },
        {
            id: 3,
            imageUrl:
                "https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZWMtM2NhNS00NDJjLTk4NDItYTRmY2EwMWZlMTY3XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
            title: "The Lord of the Rings: The Return of the King",
            rate: 8.9,
        },
        // Add more movies as needed
    ];

    const [swipeData, setSwipeData] = useState({});
    const [swipedData, setSwipedData] = useState({});
    const [shakeData, setShakeData] = useState(0);

    const handleSwipe = (data, movie) => {
        setSwipeData({ ...data, movieTitle: movie.title });
    };

    const handleSwiped = (data, movie) => {
        setSwipedData({ ...data, movieTitle: movie.title });
    };

    const handleShake = (level, movie) => {
        setShakeData({ level, movieTitle: movie.title });
    };

    const handleDeckFinished = () => {
        console.log("All cards have been swiped!");
        // You can add any additional logic here, such as resetting the deck or showing a message
    };

    return (
        <div className="container">
            <h1>Movie Swiper v0.1.0</h1>
            <div className="event-data">
                <p>
                    <b>Swipe</b>: Tick: {swipeData.tick}, Value: {swipeData.value?.toFixed(2)}, Dir:{" "}
                    {swipeData.direction}, Degree: {swipeData.degree?.toFixed(2)}
                </p>
                <p>
                    Swiped: Tick: {swipedData.tick}, Value: {swipedData.value?.toFixed(2)}, Dir:{" "}
                    {swipedData.direction}
                </p>
                <p>
                    Shake: Liquid Level: {shakeData.level?.toFixed(2)}
                </p>
            </div>
            <div className="swiper-container">
                <SwipeDeck
                    movies={movies}
                    onSwipe={handleSwipe}
                    onSwiped={handleSwiped}
                    onShake={handleShake}
                    onDeckFinished={handleDeckFinished}
                    onSwipeUp={() => console.log("Swiped up!")}
                    cardStyle={{
                        width: "150px",
                    }}
                />
                <SwipeDeck
                    movies={movies}
                    onSwipe={handleSwipe}
                    onSwiped={handleSwiped}
                    onShake={handleShake}
                    onDeckFinished={handleDeckFinished}
                    onSwipeUp={() => console.log("Swiped up!")}
                    cardStyle={{
                        width: "150px",
                    }}
                />
            </div>
            <div className="swiper-container">
                <SwipeDeck
                    movies={movies}
                    onSwipe={handleSwipe}
                    onSwiped={handleSwiped}
                    onShake={handleShake}
                    onDeckFinished={handleDeckFinished}
                    onSwipeUp={() => console.log("Swiped up!")}
                    cardStyle={{
                        width: "150px",
                    }}
                />
                <SwipeDeck
                    movies={movies}
                    onSwipe={handleSwipe}
                    onSwiped={handleSwiped}
                    onShake={handleShake}
                    onDeckFinished={handleDeckFinished}
                    onSwipeUp={() => console.log("Swiped up!")}
                    cardStyle={{
                        width: "150px",
                    }}
                />
            </div>

            
        </div>
    );
};

// export default App;

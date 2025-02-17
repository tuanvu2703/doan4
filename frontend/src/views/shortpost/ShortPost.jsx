import React, { useState, useEffect } from 'react';
import postImg from '../../img/images.jpg';

const ShortPost = () => {
    const totalPosters = 30; // Total number of posters
    const postersToMove = 3; // Number of posters to move per click
    const [postersPerPage, setPostersPerPage] = useState(8); // Number of posters displayed per row
    const [currentIndex, setCurrentIndex] = useState(0);

    // Adjust the number of posters per row based on screen width
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setPostersPerPage(8); // Large screens (desktop)
            } else if (window.innerWidth >= 768) {
                setPostersPerPage(6); // Medium screens (tablet)
            } else {
                setPostersPerPage(4); // Small screens (mobile)
            }
        };

        handleResize(); // Initial check

        window.addEventListener('resize', handleResize); // Add event listener for window resize

        return () => {
            window.removeEventListener('resize', handleResize); // Clean up event listener
        };
    }, []);

    const moveLeft = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - postersToMove);
        }
    };

    const moveRight = () => {
        const remainingPosters = totalPosters - currentIndex; // Calculate remaining posters
        const maxIndex = totalPosters - postersPerPage; // The maximum valid index

        // Check if the remaining posters are fewer than postersPerPage
        if (remainingPosters <= postersPerPage) {
            setCurrentIndex(maxIndex); // Move to the last possible set of posters
        } else if (remainingPosters > postersToMove) {
            setCurrentIndex(currentIndex + postersToMove); // Move right by postersToMove
        }
    };

    // Calculate the offset based on the number of posters per page
    const offset = -currentIndex * (100 / postersPerPage);

    // Mock poster data
    const posters = Array.from({ length: totalPosters }, (_, index) => ({
        id: index + 1,
        src: `https://via.placeholder.com/200?text=Poster+${index + 1}`,
    }));

    return (
        <div className="border border-gray-300 rounded-lg shadow-sm shadow-zinc-300 w-full max-w-[900px] overflow-hidden">
            <div className="relative mx-auto overflow-hidden pr-24">
                {currentIndex > 0 && (
                    <button
                        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white text-gray-500 h-12 aspect-square rounded-full shadow-md flex items-center justify-center"
                        onClick={moveLeft}
                        style={{ zIndex: 1 }}
                    >
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M14.791 5.207L8 12l6.793 6.793a1 1 0 1 1-1.415 1.414l-7.5-7.5a1 1 0 0 1 0-1.414l7.5-7.5a1 1 0 1 1 1.415 1.414z" />
                        </svg>
                    </button>
                )}
                <div
                    className="flex duration-300"
                    style={{ transform: `translateX(${offset}%)` }}
                >
                    {posters.map((poster) => (
                        <div key={poster.id} className="flex-shrink-0 w-1/4 sm:w-1/4 md:w-1/6 lg:w-1/8 box-border">
                            <div className="w-full max-h-48 overflow-hidden flex justify-center rounded-md p-2">
                                <img
                                    src={postImg} // Make sure the path is correct
                                    alt={`Poster ${poster.id}`} // Added alt attribute for accessibility
                                    className="rounded-md transform transition duration-300 ease-in-out hover:scale-105" // Image zoom effect on hover
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {currentIndex < totalPosters - postersPerPage && (
                    <button
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white text-gray-500 h-12 aspect-square rounded-full shadow-md flex items-center justify-center"
                        onClick={moveRight}
                        style={{ zIndex: 1 }}
                    >
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M9.209 5.207L16 12l-6.791 6.793a1 1 0 1 0 1.415 1.414l7.5-7.5a1 1 0 0 0 0-1.414l-7.5-7.5a1 1 0 1 0-1.415 1.414z" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default ShortPost;

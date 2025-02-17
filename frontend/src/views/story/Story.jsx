import React, { useRef } from 'react';
import Slider from 'react-slick';
import postImg from '../../img/images.jpg';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
const Story = () => {
    const sliderRef = useRef(null); // Reference to the Slider component
    const totalPosters = 30; // Total number of posters

    // Mock poster data
    const posters = Array.from({ length: totalPosters }, (_, index) => ({
        id: index + 1,
        src: `https://via.placeholder.com/200?text=Poster+${index + 1}`,
    }));

    const settings = {
        infinite: true, // Infinite scroll
        slidesToShow: 6, // Number of items per row (change based on screen size)
        slidesToScroll: 3, // Number of items to move per click
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 6,
                    slidesToScroll: 3,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                },
            },
        ],
    };

    // Functions to control slider navigation
    const moveLeft = () => {
        if (sliderRef.current) {
            sliderRef.current.slickPrev(); // Move to the previous slide
        }
    };

    const moveRight = () => {
        if (sliderRef.current) {
            sliderRef.current.slickNext(); // Move to the next slide
        }
    };

    return (
        <div className="relative w-full max-w-[900px] overflow-hidden">
            {/* Custom Left Navigation Button */}
            <button
                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white text-gray-500 h-12 aspect-square rounded-full shadow-md flex items-center justify-center"
                onClick={moveLeft}
                style={{ zIndex: 1 }}
            >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M14.791 5.207L8 12l6.793 6.793a1 1 0 1 1-1.415 1.414l-7.5-7.5a1 1 0 0 1 0-1.414l7.5-7.5a1 1 0 1 1 1.415 1.414z" />
                </svg>
            </button>
            <Slider ref={sliderRef} {...settings} className="gap-4">  {/* Thêm gap giữa các phần tử */}

                {posters.map((poster) => (
                    <div key={poster.id} className="flex-shrink-0 w-full">
                        <div className='px-1'>
                            <div className="w-36 h-48  overflow-hidden flex justify-center rounded-md">
                                <img
                                    src="https://media.giphy.com/media/dCdTUwSva7GOzPAcf3/giphy.gif"
                                    alt={`Poster ${poster.id}`}
                                    className="rounded-md transform transition duration-300 ease-in-out hover:scale-105"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>

            {/* Custom Right Navigation Button */}
            <button
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white text-gray-500 h-12 aspect-square rounded-full shadow-md flex items-center justify-center"
                onClick={moveRight}
                style={{ zIndex: 1 }}
            >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M9.209 5.207L16 12l-6.791 6.793a1 1 0 1 0 1.415 1.414l7.5-7.5a1 1 0 0 0 0-1.414l-7.5-7.5a1 1 0 1 0-1.415 1.414z" />
                </svg>
            </button>
        </div>
    );
};

export default Story;





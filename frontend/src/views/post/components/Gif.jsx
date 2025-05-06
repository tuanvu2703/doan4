import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loading from '../../../components/Loading';

export default function Gif({ onGifSelect }) {
    const [gifSearch, setGifSearch] = useState('');
    const [gifs, setGifs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [fetching, setFetching] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const handleChange = (e) => {
        setGifSearch(e.target.value);
    };

    useEffect(() => {
        if (gifSearch) {
            const delayDebounce = setTimeout(() => {
                fetchGifs(gifSearch, 1);
                setPage(1);
            }, 700);
            return () => clearTimeout(delayDebounce);
        } else {
            // If search is empty, load trending GIFs
            fetchTrendingGifs(1);
            setPage(1);
        }
    }, [gifSearch]);

    const fetchGifs = async (query, pageNum) => {
        setLoading(true);
        try {
            const response = await axios.get(`https://api.giphy.com/v1/gifs/search`, {
                params: {
                    api_key: 'GlVGYHkr3WSBnllca54iNt0yFbjz7L65',
                    q: query,
                    limit: 20,
                    offset: (pageNum - 1) * 20
                }
            });

            if (pageNum === 1) {
                setGifs(response.data.data);
            } else {
                setGifs(prev => [...prev, ...response.data.data]);
            }

            setHasMore(response.data.data.length === 20);
        } catch (error) {
            console.error('Error fetching GIFs:', error);
        } finally {
            setLoading(false);
            setFetching(false);
        }
    };

    const fetchTrendingGifs = async (pageNum) => {
        setLoading(true);
        try {
            const response = await axios.get(`https://api.giphy.com/v1/gifs/trending`, {
                params: {
                    api_key: 'GlVGYHkr3WSBnllca54iNt0yFbjz7L65',
                    limit: 20,
                    offset: (pageNum - 1) * 20
                }
            });

            if (pageNum === 1) {
                setGifs(response.data.data);
            } else {
                setGifs(prev => [...prev, ...response.data.data]);
            }

            setHasMore(response.data.data.length === 20);
        } catch (error) {
            console.error('Error fetching trending GIFs:', error);
        } finally {
            setLoading(false);
            setFetching(false);
        }
    };

    // Handle scroll to load more GIFs
    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;

        if (scrollHeight - scrollTop <= clientHeight * 1.5 && !fetching && hasMore) {
            setFetching(true);
            setPage(prev => prev + 1);

            if (gifSearch) {
                fetchGifs(gifSearch, page + 1);
            } else {
                fetchTrendingGifs(page + 1);
            }
        }
    };

    return (
        <div className="gif-container h-64 p-2 sm:p-3 md:p-4">
            <div className="mb-3 sm:mb-4">
                <input
                    type="text"
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                    placeholder="Tìm kiếm GIF..."
                    value={gifSearch}
                    onChange={handleChange}
                />
            </div>
            <div
                className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[300px] sm:max-h-[350px] md:max-h-[400px] p-1"
                onScroll={(e) => handleScroll(e)}
            >
                {loading && !fetching ? (
                    <div className="col-span-3 flex justify-center py-4">
                        <Loading />
                    </div>
                ) : gifs.length > 0 ? (
                    gifs.map((gif, index) => (
                        <div
                            key={index}
                            className="relative cursor-pointer hover:opacity-80 transition-opacity border border-gray-200 rounded-md overflow-hidden"
                            onClick={() => onGifSelect(gif.images.fixed_height.url)}
                        >
                            <img
                                src={gif.images.fixed_height_small.url}
                                alt=""
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    ))
                ) : !loading ? (
                    <div className="col-span-3 text-center py-4 text-gray-500 text-sm sm:text-base">
                        Không tìm thấy GIF nào
                    </div>
                ) : null}

                {fetching && (
                    <div className="col-span-3 flex justify-center py-2">
                        <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-500"></div>
                    </div>
                )}
            </div>
        </div>
    );
}
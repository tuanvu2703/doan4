import React from 'react'
import { useState, useEffect } from "react";
import { getSearchResult } from "../../service/SearchService";
import { Link, useParams } from "react-router-dom";
import FilePreview from "../../components/fileViewer";

export default function CardPost({ post }) {
    //carousel
    const [currentIndexes, setCurrentIndexes] = useState({});
    const [expandedPosts, setExpandedPosts] = useState({});
    const handlePrev = (post) => {
        setCurrentIndexes((prevIndexes) => ({
            ...prevIndexes,
            [post._id]: (prevIndexes[post._id] > 0 ? prevIndexes[post._id] : post.img.length) - 1
        }));
    };

    const handleNext = (post) => {
        setCurrentIndexes((prevIndexes) => ({
            ...prevIndexes,
            [post._id]: (prevIndexes[post._id] + 1) % post.img.length
        }));
    };

    const toggleExpand = (postId) => {
        setExpandedPosts(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const toggleContentExpansion = (postId) => {
        setExpandedPosts(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const renderPostContent = (post) => {
        const isExpanded = expandedPosts[post._id];
        // Check if content exists before trying to access its length
        const content = post.content || '';

        return (
            <div className="break-words text-gray-800 py-1 sm:py-2 px-0 sm:px-1 leading-relaxed w-full max-w-3xl text-sm sm:text-base mt-0.5 sm:mt-1 mb-1 sm:mb-2">
                <div className={`whitespace-pre-wrap ${!isExpanded ?
                    'h-auto max-h-16 sm:max-h-20 md:max-h-24 overflow-hidden' :
                    'h-auto'}`}>
                    {content}
                </div>
                {content.length > 60 && (
                    <button
                        onClick={() => toggleContentExpansion(post._id)}
                        className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium mt-0.5 sm:mt-1 transition-colors duration-200"
                    >
                        {isExpanded ? "Thu gọn" : "Xem chi tiết"}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="mb-4 w-full">
            <Link to={`/post/${post._id}`} className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-4">
                    {/* Thông tin người đăng */}
                    <div className="flex items-center gap-3 mb-3">
                        {post.author && (
                            <>
                                <img
                                    className="w-10 h-10 rounded-full object-cover border border-gray-300"
                                    src={post.author.avatar || 'https://th.bing.com/th/id/OIP.PKlD9uuBX0m4S8cViqXZHAHaHa?rs=1&pid=ImgDetMain'}
                                    alt={`${post.author.firstName} avatar`}
                                />
                                <div>
                                    <h2 className="font-semibold text-gray-800">{post.author.lastName} {post.author.firstName}</h2>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Nội dung bài đăng */}
                    {renderPostContent(post)}

                    {/* Hình ảnh bài đăng */}
                    {post?.img?.length > 0 && (
                        <div className="relative w-full rounded-lg overflow-hidden">
                            <div className="carousel w-full">
                                {post?.img?.length > 1 && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handlePrev(post);
                                        }}
                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800/70 text-white p-2 rounded-full z-10 hover:bg-gray-700"
                                    >
                                        ‹
                                    </button>
                                )}
                                <div className='flex justify-center'>
                                    <FilePreview file={post.img} />
                                </div>
                                {post?.img?.length > 1 && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNext(post);
                                        }}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800/70 text-white p-2 rounded-full z-10 hover:bg-gray-700"
                                    >
                                        ›
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    {post.gif && (
                        <div className='flex justify-center mt-2'>
                            <img src={post.gif} alt="GIF" className="w-full h-auto rounded-lg" />
                        </div>
                    )}
                </div>
            </Link>
        </div>
    )
}
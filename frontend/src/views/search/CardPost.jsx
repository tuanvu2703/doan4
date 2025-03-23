import React from 'react'
import { useState, useEffect } from "react";
import { getSearchResult } from "../../service/SearchService";
import { Link, useParams } from "react-router-dom";
import FilePreview from "../../components/fileViewer";

export default function CardPost({ post }) {
    //carousel
    const [currentIndexes, setCurrentIndexes] = useState({});
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

    return (
        <div className="mt-5 w-full">
            <Link to={`/post/${post._id}`} className="card card-side flex flex-col sm:flex-row bg-base-100 shadow-xl max-w-full">
                <div className="card-body p-4">
                    {/* Thông tin người đăng */}
                    <div className="flex gap-3">
                        {post.author && (
                            <>
                                <img
                                    className="w-12 h-12 sm:w-14 sm:h-14 aspect-square rounded-full border border-black cursor-pointer"
                                    src={post.author.avatar || 'https://th.bing.com/th/id/OIP.PKlD9uuBX0m4S8cViqXZHAHaHa?rs=1&pid=ImgDetMain'}
                                    alt=""
                                />
                                <div className="grid gap-2">
                                    <h2 className="font-semibold break-words">{post.author.lastName} {post.author.firstName}</h2>
                                    <p className="text-sm sm:text-base text-ellipsis break-words">{post.content}</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Hình ảnh bài đăng */}
                    {post?.img?.length > 0 && (
                        <div className="relative w-full max-w-lg mx-auto">
                            <div className="carousel rounded-lg overflow-hidden w-full h-auto sm:h-64">
                                {post?.img?.length > 1 && (
                                    <button
                                        onClick={() => handlePrev(post)}
                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full z-10"
                                    >
                                        ‹
                                    </button>
                                )}
                                {post.img.length > 0 && (
                                    <div className='flex justify-center'>
                                        <FilePreview file={post.img} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {post.gif && (
                        <div className='flex justify-center'>
                            <img src={post.gif} alt="GIF" className="w-full h-auto" />
                        </div>
                    )}
                </div>
            </Link>
        </div>

    )
}
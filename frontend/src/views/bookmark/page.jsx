import React from 'react'
import { useState, useEffect } from 'react'
import { getAllBookmark, getHomeFeed, handleRemoveBookmark } from '../../service/PostService'
import { profileUserCurrent } from '../../service/ProfilePersonal'
import Loading from '../../components/Loading'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import NotificationCss from '../../module/cssNotification/NotificationCss'
import FilePreview from '../../components/fileViewer'

export default function Bookmark() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true);
    const [currentIndexes, setCurrentIndexes] = useState({});
    const fetchUserId = async () => {
        const response = await profileUserCurrent();
        if (response) {
            return response.data._id
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const id = await fetchUserId();
            const [responsePost, response] = await Promise.all([getHomeFeed(), getAllBookmark(id)]);

            if (response && responsePost) {
                const bookmarks = response.data.bookmarks;
                const matchedPosts = responsePost.data.filter(post => bookmarks.includes(post._id));
                setData(matchedPosts);
            }
            setLoading(false);
        };
        setTimeout(fetchData, 1000); // Delay of 5 seconds
    }, [])

    const handleBookmarkClick = async (postId) => {
        try {
            const rs = await handleRemoveBookmark(postId);
            setData(prevData => prevData.filter(post => post._id !== postId));
            toast.success(rs?.message ? rs.message : 'Bỏ lưu bài viết thành công', NotificationCss.Success);
        } catch (error) {
            console.error('Error bookmarking post:', error);
        }
    };
    const handDetailUser = async (id) => {
        window.location.href = `/user/${id}`;
    };
    const handDetailPost = async (id) => {
        window.location.href = `/post/${id}`;
    };

    //carousel
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
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <h1 className="text-3xl font-bold text-center my-8 text-gray-800">
                Bài viết đã lưu
            </h1>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex justify-center">
                        <Loading />
                    </div>
                ) : data.length > 0 ? (
                    data.map((post, index) => (
                        <div
                            key={index}
                            className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
                        >
                            <div>
                                {(post?.img?.length > 0) || (post.gif) ? (
                                    <div className="relative w-full h-56 md:h-64 overflow-hidden group">
                                        {post?.img?.length > 1 && (
                                            <>
                                                <button
                                                    onClick={() => handlePrev(post)}
                                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white w-8 h-8 flex items-center justify-center rounded-full z-10 opacity-70 hover:opacity-100 hover:bg-black/70 transition-all duration-200"
                                                >
                                                    <span className="text-xl font-bold">‹</span>
                                                </button>
                                                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                                                    {post.img.map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className={`w-2 h-2 rounded-full ${currentIndexes[post._id] === i ? 'bg-white' : 'bg-white/50'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                        <div className="carousel-item w-full h-full flex items-center justify-center bg-gray-100">
                                            <FilePreview file={post.img} />
                                            {post.gif && (
                                                <div className='flex justify-center'>
                                                    <img
                                                        className="object-cover w-full h-full"
                                                        style={{ maxWidth: '100%', maxHeight: '400px' }}
                                                        src={post.gif}
                                                        alt="" />
                                                </div>
                                            )}
                                        </div>
                                        {post?.img?.length > 1 && (
                                            <button
                                                onClick={() => handleNext(post)}
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white w-8 h-8 flex items-center justify-center rounded-full z-10 opacity-70 hover:opacity-100 hover:bg-black/70 transition-all duration-200"
                                            >
                                                <span className="text-xl font-bold">›</span>
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="relative w-full h-48 md:h-64 flex items-center justify-center bg-gray-200 rounded-t-lg">
                                        <span className="text-gray-500 font-medium">Không có hình ảnh</span>
                                    </div>
                                )}

                                <div className="p-4">
                                    <h2 className="font-semibold text-lg line-clamp-2 mb-2 text-gray-800">
                                        {post.content ? post.content : "Không có nội dung"}
                                    </h2>

                                    <div className="mb-4 text-sm flex items-center gap-2">
                                        <span className="text-gray-600">Bài viết của: </span>
                                        <Link
                                            onClick={() => handDetailUser(post.author?._id)}
                                            className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            {post.author.firstName} {post.author.lastName}
                                        </Link>
                                    </div>

                                    <div className="flex justify-between gap-3 mt-3 pt-3 border-t border-gray-100">
                                        <button
                                            onClick={() => handleBookmarkClick(post._id)}
                                            className="flex-1 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors duration-200"
                                        >
                                            Bỏ lưu
                                        </button>
                                        <button
                                            onClick={() => handDetailPost(post._id)}
                                            className="flex-1 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors duration-200"
                                        >
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center w-full col-span-1 sm:col-span-2 lg:col-span-3 h-60 bg-gray-50 rounded-lg">
                        <div className="text-center">
                            <span className="block text-xl font-semibold text-gray-500 mb-2">
                                Chưa có bài viết nào được lưu
                            </span>
                            <p className="text-gray-400">
                                Các bài viết bạn đánh dấu sẽ xuất hiện ở đây
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

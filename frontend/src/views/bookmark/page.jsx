import React from 'react'
import { useState, useEffect } from 'react'
import { getAllBookmark, getHomeFeed, handleRemoveBookmark } from '../../service/PostService'
import { profileUserCurrent } from '../../service/ProfilePersonal'
import Loading from '../../components/Loading'
import { Link } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
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
        <div className='grid place-items-center mt-5 gap-4 px-4'>
            <h1 className='text-2xl font-semibold text-center'>Tất cả bài viết đã lưu</h1>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-5 w-full max-w-6xl'>
                {loading ? (
                    <Loading />
                ) : (
                    data.length > 0 ? (
                        data.map((post, index) => (
                            <div key={index} className="card bg-base-100 w-full shadow-xl border rounded-lg p-4">
                                <div className="card-body">
                                    <h2 className="card-title text-lg font-semibold">{post.content || "Không có nội dung"}</h2>

                                    {post?.img?.length > 0 && (
                                        <div className="carousel rounded-box w-full h-64 relative overflow-hidden">
                                            {post?.img?.length > 1 && (
                                                <button onClick={() => handlePrev(post)}
                                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full">
                                                    ‹
                                                </button>
                                            )}
                                            <div className="carousel-item w-full flex justify-center">
                                                <FilePreview file={post.img} />
                                            </div>
                                            {post?.img?.length > 1 && (
                                                <button onClick={() => handleNext(post)}
                                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full">
                                                    ›
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-2">
                                        <span>Bài viết đã lưu của:</span>
                                        <Link onClick={() => handDetailUser(post.author?._id)}
                                            className='font-semibold link-primary ml-1'>
                                            {post.author.firstName} {post.author.lastName}
                                        </Link>
                                    </div>

                                    <div className="card-actions justify-between mt-3">
                                        <button onClick={() => handleBookmarkClick(post._id)}
                                            className="btn btn-error text-white w-full sm:w-auto">
                                            Bỏ lưu
                                        </button>
                                        <button onClick={() => handDetailPost(post._id)}
                                            className="btn btn-primary w-full sm:w-auto">
                                            Xem bài viết
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center justify-center w-full col-span-1 md:col-span-3 lg:col-span-4 h-[200px]">
                            <span className='text-center text-lg font-semibold text-gray-500'>Chưa lưu bài viết nào!</span>
                        </div>
                    )
                )}
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>

    )
}

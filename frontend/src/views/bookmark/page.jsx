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
        <div className="container mx-auto">
            <h1 className="text-2xl font-semibold text-center my-5">
                Tất cả bài viết đã lưu
            </h1>
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ">
                {loading ? (
                    <Loading />
                ) : data.length > 0 ? (
                    data.map((post, index) => (
                        <div
                            key={index}
                            className=" bg-base-100 shadow-xl border-[1px] border-gray-600 rounded-sm w-full"
                        >
                            <div className="">
                                <h2 className="card-title text-lg p-2">
                                    {post.content ? post.content : "không có nội dung"}
                                </h2>

                                {post?.img?.length > 0 ? (
                                    <div className="relative w-full h-48 md:h-64 overflow-hidden">
                                        {post?.img?.length > 1 && (
                                            <button
                                                onClick={() => handlePrev(post)}
                                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full z-10 hover:bg-gray-700 transition-colors"
                                            >
                                                ‹
                                            </button>
                                        )}
                                        <div className="carousel-item w-full h-full flex items-center justify-center">
                                            <FilePreview file={post.img} />
                                        </div>
                                        {post?.img?.length > 1 && (
                                            <button
                                                onClick={() => handleNext(post)}
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full z-10 hover:bg-gray-700 transition-colors"
                                            >
                                                ›
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="relative w-full h-48 md:h-64 flex items-center justify-center bg-gray-100">
                                        <span className="text-gray-500">NO IMAGE/VIDEO</span>
                                    </div>
                                )}


                                <div className=" m-2">
                                    <span className="text-sm text-gray-600">Bài viết đã lưu của: </span>
                                    <Link
                                        onClick={() => handDetailUser(post.author?._id)}
                                        className="font-semibold text-blue-500 hover:underline"
                                    >
                                        {post.author.firstName} {post.author.lastName}
                                    </Link>
                                </div>

                                <div className="card-actions justify-between m-2">
                                    <button
                                        onClick={() => handleBookmarkClick(post._id)}
                                        className="btn btn-error text-white"
                                    >
                                        Bỏ lưu
                                    </button>
                                    <button
                                        onClick={() => handDetailPost(post._id)}
                                        className="btn btn-primary "
                                    >
                                        Xem bài viết
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center w-full col-span-1 sm:col-span-2 lg:col-span-3 h-48">
                        <span className="text-center text-lg font-semibold text-gray-500">
                            Chưa lưu bài viết nào!
                        </span>
                    </div>
                )}
            </div>
        </div>


    )
}

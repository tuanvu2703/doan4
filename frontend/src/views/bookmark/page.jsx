import React from 'react'
import { useState, useEffect } from 'react'
import { getAllBookmark, getHomeFeed, handleRemoveBookmark } from '../../service/PostService'
import { profileUserCurrent } from '../../service/ProfilePersonal'
import Loading from '../../components/Loading'
import { Link } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import NotificationCss from '../../module/cssNotification/NotificationCss'
export default function Bookmark() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true);
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
    console.log(data.img);
    return (
        <div className='grid place-items-center mt-5 gap-4'>
            <h1 className='text-2xl font-semibold'>Tất cả bài viết đã lưu</h1>
            <div className='grid grid-cols-3 gap-5'>
                {loading ? (
                    <Loading />
                ) : (
                    data.length > 0 ? (
                        data.map((post, index) => (
                            <div key={index} className="card bg-base-100 w-[400px] shadow-xl border-[1px]">
                                <div className="card-body">
                                    <h2 className="card-title">{post.content ? post.content : "không có nội dung"}</h2>

                                    <img
                                        className='rounded-sm object-contain'
                                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                        src={post?.img.length > 0 ? post?.img : "https://th.bing.com/th/id/R.218efd88e8e82a6843e43af00c39f00f?rik=mgiu7r8uAEeNTA&pid=ImgRaw&r=0"}
                                        alt=''
                                    />
                                    <div>
                                        <span>bài viết đã lưu của:</span>
                                        <Link onClick={() => handDetailUser(post.author?._id)}
                                            className='font-semibold link-primary'> {post.author.firstName} {post.author.lastName}</Link>
                                    </div>

                                    <div className="card-actions justify-end mt-3">
                                        <button onClick={() => handleBookmarkClick(post._id)} className="btn btn-error text-white">Bỏ lưu</button>
                                        <button onClick={() => handDetailPost(post._id)} className="btn btn-primary">Xem bài viết</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center justify-center w-full col-span-3 h-[200px]">
                            <span className='text-center text-lg font-semibold text-gray-500'>Chưa lưu bài viết nào!</span>
                        </div>
                    )
                )}
            </div>
            <div >
                <ToastContainer position="top-right" autoClose={3000} />
            </div >
        </div>
    )
}

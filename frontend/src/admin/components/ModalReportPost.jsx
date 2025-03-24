import React from 'react'
import { useState, useEffect } from 'react'
import { getDetailPost } from '../../service/PostService';
import { OtherProfile } from '../../service/OtherProfile';
import { profileUserCurrent } from '../../service/ProfilePersonal';
import { Link } from 'react-router-dom';
import { differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import AVTUser from '../../views/post/AVTUser';
import FilePreview from '../../components/fileViewer';
import { UserProvider } from '../../service/UserContext';
export default function ModalReportPost({ postId }) {
    const [post, setPost] = useState({});
    const [user, setUser] = useState({})
    const [userLogin, setUserLogin] = useState({})
    useEffect(() => {
        const fetchdata = async () => {
            try {
                const response = await getDetailPost(postId)
                if (response) {
                    setPost(response.data)
                    const responseUser = await OtherProfile(response.data.author)
                    setUser(responseUser.data)
                    const responseUserPersonal = await profileUserCurrent()
                    setUserLogin(responseUserPersonal.data)
                }
            } catch (error) {
                console.error("Error liking the post:", error);
            }
        }
        fetchdata()
    }, [postId]);

    //format Privacy
    const formatPrivacy = (privacy) => {
        switch (privacy) {
            case 'public':
                return <span className="text-blue-500">công khai</span>;
            case 'friends':
                return <span className="text-green-500">bạn bè</span>;
            case 'private':
                return <span className="text-black">chỉ mình tôi</span>;
            default:
                return <span>{privacy}</span>;
        }
    };
    // Time CreateAt Post
    const formatDate = (date) => {
        const postDate = new Date(date);
        const currentDate = new Date();
        const minutesDifference = differenceInMinutes(currentDate, postDate);
        const hoursDifference = differenceInHours(currentDate, postDate);
        const daysDifference = differenceInDays(currentDate, postDate);

        if (minutesDifference < 60) {
            return `${minutesDifference} phút trước`;
        } else if (hoursDifference < 24) {
            return `${hoursDifference} giờ trước`;
        } else if (daysDifference <= 30) {
            return `${daysDifference} ngày trước`;
        } else {
            return postDate.toLocaleDateString('vi-VN');
        }
    };
    return (
        <dialog id={`my_modal_report_post_${postId}`} className="modal text-black">
            <div className="modal-box">
                <form method="dialog">
                    {/* if there is a button in form, it will close the modal */}
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <div className="flex flex-col md:flex-row justify-between">
                    <div className="flex gap-3">
                        <AVTUser user={user} />
                        <article className="grid gap-5">
                            <div className="grid">
                                <Link
                                    className="font-bold text-lg hover:underline"
                                    to={`/user/${user._id}`}
                                >
                                    {user.lastName} {user.firstName}
                                </Link>
                                <div className="flex gap-2">
                                    <span className="text-xs">{formatDate(post.createdAt)}</span>
                                    <span className="text-xs">{formatPrivacy(post.privacy)}</span>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>

                {/* Nội dung bài viết */}
                <p className="mt-2">{post.content}</p>

                {post?.img?.length > 0 && (
                    <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
                        {post?.img?.length > 1 && (
                            <button
                                // onClick={() => handlePrev(posts)}
                                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
                            >
                                ‹
                            </button>
                        )}
                        <div className="carousel-item w-full items-center justify-center pointer-events-none">
                            <UserProvider>
                                <FilePreview file={post.img} mh={600} />
                            </UserProvider>
                        </div>

                        {post?.img?.length > 1 && (
                            <button
                                // onClick={() => handleNext(post)}
                                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
                            >
                                ›
                            </button>
                        )}
                    </div>
                )}
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    )
}

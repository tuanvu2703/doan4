import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HandThumbUpIcon, ChatBubbleLeftIcon, ShareIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';
import AVTUser from './AVTUser';
import { handleLike, handleDisLike, handleUnDisLike, handleUnLike } from '../../service/PostService';
import 'animate.css';
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { getAllOtherPosts } from '../../service/OtherProfile';
import { profileUserCurrent } from '../../service/ProfilePersonal';
import DropdownOtherPost from './components/DropdownOtherPost';
import { useUser } from '../../service/UserContext';
import FilePreview from '../../components/fileViewer';
import FileViewer from '../../components/fileViewer';
export default function AllPostOther({ user }) {
    const [posts, setPosts] = useState([]);
    const [userLogin, setUserLogin] = useState({})
    const [copied, setCopied] = useState(false);
    const [currentIndexes, setCurrentIndexes] = useState({});
    const [expandedPosts, setExpandedPosts] = useState({}); // State to track expanded posts
    const { id } = useParams();
    const { setShowZom } = useUser()


    // Toggle function to expand/collapse post content
    const toggleExpand = (postId) => {
        setExpandedPosts(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    useEffect(() => {
        const fetchdata = async () => {
            try {
                const response = await getAllOtherPosts(id)
                if (response) {
                    const sortedPosts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setPosts(sortedPosts)
                    const responseUserPersonal = await profileUserCurrent()
                    setUserLogin(responseUserPersonal.data)
                }
            }
            catch (error) {
                console.error("Error fetching users:", error);
            }
        }
        fetchdata()
    }, [id]);
    // console.log(posts)

    if (!posts.length) {
        return <span className='text-xl mt-3 text-gray-500'>Chưa đăng bài viết nào!</span>;
    }
    //Like
    const handleLikeClick = async (postId) => {
        try {
            const post = posts.find(post => post._id === postId);
            if (post.likes.includes(userLogin._id)) {
                // Optimistically update the UI
                setPosts(posts.map(post =>
                    post._id === postId ? { ...post, likes: post.likes.filter(id => id !== userLogin._id) } : post
                ));
                await handleUnLike(postId);
            } else {
                // Optimistically update the UI
                setPosts(posts.map(post =>
                    post._id === postId ? { ...post, likes: [...post.likes, userLogin._id], dislikes: post.dislikes.filter(id => id !== userLogin._id) } : post
                ));
                await handleLike(postId);
                await handleUnDisLike(postId); // Undislike when liking
            }
        } catch (error) {
            console.error("Error liking the post:", error);
        }
    };
    //Dislike 
    const handleDislikeClick = async (postId) => {
        try {
            const post = posts.find(post => post._id === postId);
            if (post.dislikes.includes(userLogin._id)) {
                // Optimistically update the UI
                setPosts(posts.map(post =>
                    post._id === postId ? { ...post, dislikes: post.dislikes.filter(id => id !== userLogin._id) } : post
                ));
                await handleUnDisLike(postId);
            } else {
                // Optimistically update the UI
                setPosts(posts.map(post =>
                    post._id === postId ? { ...post, dislikes: [...post.dislikes, userLogin._id], likes: post.likes.filter(id => id !== userLogin._id) } : post
                ));
                await handleDisLike(postId);
                await handleUnLike(postId); // Unlike when disliking
            }
        } catch (error) {
            console.error("Error disliking the post:", error);
        }
    }
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
            return format(postDate, 'dd/MM/yyyy HH:mm');
        }
    };
    //
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


    const openModal = (file) => {
        setShowZom({ file: file, show: true });
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

    //share
    const handleCopyLink = (postId) => {
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/post/${postId}`; // Use the base URL
        navigator.clipboard
            .writeText(link)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000); // Reset trạng thái sau 2 giây
            })
            .catch((err) => {
                console.error("Không thể sao chép liên kết: ", err);
            });
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
            <div className="break-words text-gray-800 py-1 sm:py-2 px-0 sm:px-1 leading-relaxed w-full max-w-2xl text-sm sm:text-base mt-0.5 sm:mt-1 mb-1 sm:mb-2">
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
                        {isExpanded ? "Thu gọn" : "Xem thêm"}
                    </button>
                )}
            </div>
        );
    };

    
    return (
        <>
            {posts.map((post) => (
                <div
                    key={post._id}
                    className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 mb-6 max-w-3xl mx-auto w-full"
                >
                    {/* Header: AVT + thông tin người dùng và Dropdown */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-shrink-0">
                            <AVTUser user={user} />
                        </div>
                        <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-start">
                                <article>
                                    <Link
                                        to="#"
                                        className="font-semibold text-base hover:underline text-gray-800 break-words line-clamp-1"
                                    >
                                        {user.lastName} {user.firstName}
                                    </Link>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <span className="text-xs">{formatDate(post.createdAt)}</span>
                                        <span className="text-xs">•</span>
                                        <span className="text-xs">{formatPrivacy(post.privacy)}</span>
                                    </div>
                                </article>
                                <div className="flex-shrink-0">
                                    <DropdownOtherPost postId={post._id} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Nội dung bài viết - with character limit */}
                    {renderPostContent(post)}

                    {/* Hình ảnh/Video */}
                    {post.img.length > 0 && (
                        <div className="relative overflow-hidden rounded-lg shadow-sm my-3 bg-gray-50">
                            <div className="w-full flex justify-center">
                                <FileViewer file={post.img} mh={500} />
                            </div>
                        </div>
                    )}
                    {post.gif && (
                        <div className='flex justify-center my-3'>
                            <img
                                className="rounded-xl shadow-md max-h-[450px] object-contain"
                                src={post.gif}
                                alt="Gif content" />
                        </div>
                    )}

                    {/* Footer: Like, Dislike, Comment và Share */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleLikeClick(post._id)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors duration-200 ${post.likes.includes(userLogin._id)
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {post.likes.includes(userLogin._id) ? (
                                    <HandThumbUpIcon className="w-5 h-5 animate__heartBeat text-blue-600" />
                                ) : (
                                    <HandThumbUpIcon className="w-5 h-5" />
                                )}
                                <span className="text-sm font-medium">{post.likes.length}</span>
                            </button>
                            <button
                                onClick={() => handleDislikeClick(post._id)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors duration-200 ${post.dislikes.includes(userLogin._id)
                                    ? 'text-red-600 bg-red-50'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {post.dislikes.includes(userLogin._id) ? (
                                    <HandThumbDownIcon className="w-5 h-5 animate__heartBeat text-red-600" />
                                ) : (
                                    <HandThumbDownIcon className="w-5 h-5" />
                                )}
                                <span className="text-sm font-medium">{post.dislikes.length}</span>
                            </button>
                        </div>
                        <div className="flex gap-4">
                            <Link
                                to={`/post/${post._id}`}
                                className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
                            >
                                <ChatBubbleLeftIcon className="w-5 h-5" />
                                <span className="text-sm font-medium">{post.comments.length}</span>
                            </Link>
                            <button
                                onClick={() => handleCopyLink(post._id)}
                                className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
                            >
                                <ShareIcon className="w-5 h-5" />
                                {copied && <span className="text-xs text-green-600 absolute mt-6">Link đã được sao chép!</span>}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </>

    )
}

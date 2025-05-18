import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HandThumbUpIcon, ChatBubbleLeftIcon, ShareIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';
import AVTUser from './AVTUser';
import { handleLike, handleDisLike, handleUnDisLike, handleUnLike, getHomeFeed } from '../../service/PostService';
import 'animate.css';
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import DropdownOtherPost from './components/DropdownOtherPost';
import DropdownPostPersonal from './components/DropdownPostPersonal';
import Loading from '../../components/Loading';
import { profileUserCurrent } from '../../service/ProfilePersonal';
import FileViewer from '../../components/fileViewer';


export default function HomePost({ onPostsUpdated }) {
    const [posts, setPosts] = useState([]);
    const [displayedPosts, setDisplayedPosts] = useState([]); // Tracks the posts currently displayed
    const [userLogin, setUserLogin] = useState({});
    const [loading, setLoading] = useState(true);
    const [postsToShow, setPostsToShow] = useState(10); // Controls the number of posts to display
    const [copied, setCopied] = useState({}); // Changed from boolean to object to track by post ID
    const [currentIndexes, setCurrentIndexes] = useState({});
    const [expandedPosts, setExpandedPosts] = useState({}); // Track which posts are expanded

    useEffect(() => {
        const fetchdata = async () => {
            setLoading(true);
            const response = await getHomeFeed();
            if (response) {
                const sortedPosts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setPosts(sortedPosts);
                setDisplayedPosts(sortedPosts.slice(0, postsToShow)); // Display initial posts
                const responseUserPersonal = await profileUserCurrent();
                setUserLogin(responseUserPersonal.data);
            }
            setLoading(false);
        };
        setTimeout(fetchdata, 1000);
    }, [postsToShow]);

    // Function to add a new post to the posts array
    const addNewPost = (newPost) => {
        const updatedPosts = [newPost, ...posts];
        setPosts(updatedPosts);
        setDisplayedPosts(updatedPosts.slice(0, postsToShow));
    };

    // Expose the addNewPost function to parent components
    useEffect(() => {
        if (onPostsUpdated) {
            onPostsUpdated(addNewPost);
        }
    }, [onPostsUpdated, posts]);

    useEffect(() => {
        setDisplayedPosts(posts.slice(0, postsToShow));
    }, [posts, postsToShow]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
                loadMorePosts();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [postsToShow, posts]);

    const loadMorePosts = () => {
        setPostsToShow((prev) => prev + 10); // Increment by 5
    };

    // Carousel Handlers
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
    // Time Format Function
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
    //share
    const handleCopyLink = (postId) => {
        const link = `${window.location.href}post/${postId}`; // Lấy URL hiện tại
        navigator.clipboard
            .writeText(link)
            .then(() => {
                setCopied(prev => ({ ...prev, [postId]: true }));
                setTimeout(() => {
                    setCopied(prev => ({ ...prev, [postId]: false }));
                }, 2000); // Reset trạng thái sau 2 giây
            })
            .catch((err) => {
                console.error("Không thể sao chép liên kết: ", err);
            });
    };

    const formatPrivacy = (privacy) => {
        switch (privacy) {
            case 'public':
                return <span className="text-blue-500">công khai</span>;
            case 'friends':
                return <span className="text-green-500">bạn bè</span>;
            case 'private':
                return <span className="text-black">chỉ mình tôi</span>;
            case 'thisGroup':
                return <span className="text-gray-500">Nhóm</span>;
            default:
                return <span>{privacy}</span>;
        }
    };

    // Toggle content expansion for a specific post
    const toggleContentExpansion = (postId) => {
        setExpandedPosts(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    // Function to render content with truncation if needed
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

    // Add this handler function to remove deleted posts
    const handlePostDeleted = (deletedPostId) => {
        const updatedPosts = posts.filter(post => post._id !== deletedPostId);
        setPosts(updatedPosts);
        setDisplayedPosts(updatedPosts.slice(0, postsToShow));
    };

    console.log(posts)
    return (
        <>
            {loading ? (
                <Loading />
            ) : (
                <>
                    {displayedPosts.length > 0 ? (
                        displayedPosts.map((post) => {
                            if (!post || !post.author) return null; // Skip invalid posts
                            // Ensure post data properties exist
                            const postData = {
                                ...post,
                                img: post.img || [],
                                likes: post.likes || [],
                                dislikes: post.dislikes || [],
                                comments: post.comments || []
                            };

                            return (
                                <div
                                    key={postData._id}
                                    className="grid p-3 sm:p-4 md:p-5 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 gap-4 bg-white mb-5"
                                >
                                    <div className="flex items-start gap-2 sm:gap-4">
                                        <AVTUser user={postData.author} />
                                        <div className="flex flex-col w-full">
                                            <div className="flex justify-between items-center w-full">
                                                <article className="flex flex-col">
                                                    <div className="flex flex-wrap items-center">
                                                        <Link
                                                            className="font-semibold text-sm sm:text-base md:text-lg hover:text-blue-600 transition-colors duration-200 text-gray-800"
                                                            to={`/user/${postData.author._id}`}
                                                        >
                                                            {postData.author.lastName} {postData.author.firstName}
                                                        </Link>
                                                        {postData.group && (
                                                            <>
                                                                <span className="mx-1 text-gray-500">▸</span>
                                                                <Link
                                                                    className="font-semibold text-sm sm:text-base md:text-lg hover:text-blue-600 transition-colors duration-200 text-gray-800"
                                                                    to={`/group/${postData.group._id}`}
                                                                >
                                                                    {postData.group.groupName}
                                                                </Link>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span>{formatDate(postData.createdAt)}</span>
                                                        <span>•</span>
                                                        {formatPrivacy(postData.privacy)}
                                                    </div>
                                                </article>
                                                {userLogin._id === postData.author._id ? (
                                                    <DropdownPostPersonal postId={postData._id} onPostDeleted={handlePostDeleted} />
                                                ) : (
                                                    <DropdownOtherPost postId={postData._id} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Nội dung bài viết - với giới hạn 60 ký tự */}
                                    {renderPostContent(postData)}
                                    {/* Hình ảnh/video */}
                                    {postData.img.length > 0 && (
                                        <div className="relative w-full overflow-hidden rounded-xl shadow-lg max-w-3xl mx-auto my-3">
                                            {postData.img.length > 1 && (
                                                <button
                                                    onClick={() => handlePrev(postData)}
                                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800/60 hover:bg-gray-800/80 text-white p-1 sm:p-2 rounded-full z-10 transition-all duration-200 text-base sm:text-xl font-bold w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center"
                                                >
                                                    ‹
                                                </button>
                                            )}
                                            <div className="carousel-item w-full flex justify-center bg-gray-100/30 p-1">
                                                <FileViewer file={postData.img[currentIndexes[postData._id] || 0]} mh={450} />
                                            </div>
                                            {postData.img.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={() => handleNext(postData)}
                                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800/60 hover:bg-gray-800/80 text-white p-1 sm:p-2 rounded-full z-10 transition-all duration-200 text-base sm:text-xl font-bold w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center"
                                                    >
                                                        ›
                                                    </button>
                                                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                                                        {postData.img.map((_, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={`h-1.5 sm:h-2 rounded-full ${idx === (currentIndexes[postData._id] || 0) ? 'w-3 sm:w-4 bg-white' : 'w-1.5 sm:w-2 bg-white/60'} transition-all duration-200`}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    {postData.gif && (
                                        <div className='flex justify-center my-3'>
                                            <img
                                                className="rounded-xl shadow-md max-h-[300px] sm:max-h-[350px] md:max-h-[450px] object-contain"
                                                src={postData.gif}
                                                alt="Gif content" />
                                        </div>
                                    )}
                                    {/* Các nút like, comment, share */}
                                    <div className="flex flex-wrap justify-between items-center mt-2 pt-3 border-t border-gray-200">
                                        <div className="flex gap-2 sm:gap-4">
                                            <button
                                                onClick={() => handleLikeClick(postData._id)}
                                                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full hover:bg-blue-50 transition-all duration-200"
                                            >
                                                {postData.likes.includes(userLogin._id) ? (
                                                    <HandThumbUpIcon className="size-4 sm:size-5 animate__animated animate__heartBeat text-blue-600" />
                                                ) : (
                                                    <HandThumbUpIcon className="size-4 sm:size-5 text-gray-600" />
                                                )}
                                                <span className={`text-xs sm:text-sm font-medium ${postData.likes.includes(userLogin._id) ? 'text-blue-600' : 'text-gray-600'}`}>
                                                    {postData.likes.length > 0 ? postData.likes.length : ''}
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => handleDislikeClick(postData._id)}
                                                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full hover:bg-red-50 transition-all duration-200"
                                            >
                                                {postData.dislikes.includes(userLogin._id) ? (
                                                    <HandThumbDownIcon className="size-4 sm:size-5 animate__animated animate__heartBeat text-red-600" />
                                                ) : (
                                                    <HandThumbDownIcon className="size-4 sm:size-5 text-gray-600" />
                                                )}
                                                <span className={`text-xs sm:text-sm font-medium ${postData.dislikes.includes(userLogin._id) ? 'text-red-600' : 'text-gray-600'}`}>
                                                    {postData.dislikes.length > 0 ? postData.dislikes.length : ''}
                                                </span>
                                            </button>
                                        </div>
                                        <div className="flex gap-2 sm:gap-4 mt-1 sm:mt-0">
                                            <Link
                                                to={`/post/${postData._id}`}
                                                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full hover:bg-gray-100 transition-all duration-200"
                                            >
                                                <ChatBubbleLeftIcon className="size-4 sm:size-5 text-gray-600" />
                                                <span className="text-xs sm:text-sm font-medium text-gray-600">
                                                    {postData.comments.length > 0 ? postData.comments.length : ''}
                                                </span>
                                            </Link>
                                            <button
                                                onClick={() => handleCopyLink(postData._id)}
                                                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full hover:bg-gray-100 transition-all duration-200"
                                            >
                                                <ShareIcon className="size-4 sm:size-5 text-gray-600" />
                                                {copied[postData._id] && <span className="text-xs text-green-600 font-medium">Đã sao chép!</span>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8 text-gray-600">Không có bài viết nào</div>
                    )}

                </>
            )
            }
        </>
    );
}

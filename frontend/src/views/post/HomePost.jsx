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


export default function HomePost() {
    const [posts, setPosts] = useState([]);
    const [displayedPosts, setDisplayedPosts] = useState([]); // Tracks the posts currently displayed
    const [userLogin, setUserLogin] = useState({});
    const [loading, setLoading] = useState(true);
    const [postsToShow, setPostsToShow] = useState(10); // Controls the number of posts to display
    const [currentIndex, setCurrentIndex] = useState(0);
    const [copied, setCopied] = useState(false);
    const [currentIndexes, setCurrentIndexes] = useState({});

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
    }, []);

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
                setCopied(true);
                setTimeout(() => setCopied(false), 2000); // Reset trạng thái sau 2 giây
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
            default:
                return <span>{privacy}</span>;
        }
    };

    return (
        <>
            {loading ? (
                <Loading />
            ) : (
                <>
                    {displayedPosts.length > 0 ? (
                        displayedPosts.map((post) => {
                            if (!post || !post.author) return null; // Skip invalid posts
                            return (
                                <div
                                    key={post._id}
                                    className="grid p-4 border border-gray-300 rounded-lg shadow-md shadow-zinc-300 gap-3 bg-white"
                                >
                                    <div className="flex items-start gap-3">
                                        <AVTUser user={post.author} />
                                        <div className="grid gap-2 w-full">
                                            <div className="flex justify-between items-center flex-wrap">
                                                <article className="text-wrap grid gap-2">
                                                    <div className="grid">
                                                        <Link
                                                            className="break-words font-bold text-lg hover:link max-w-[80vw] sm:max-w-[60vw]"
                                                            to={`/user/${post.author._id}`}
                                                        >
                                                            {post.author.lastName} {post.author.firstName}
                                                        </Link>
                                                        <div className="flex gap-2 text-xs text-gray-600">
                                                            <span>{formatDate(post.createdAt)}</span>
                                                            <span>{formatPrivacy(post.privacy)}</span>
                                                        </div>
                                                    </div>
                                                </article>
                                                {userLogin._id === post.author._id ? (
                                                    <DropdownPostPersonal postId={post._id} />
                                                ) : (
                                                    <DropdownOtherPost postId={post._id} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Nội dung bài viết */}
                                    <p className="break-words w-full">{post.content}</p>
                                    {/* Hình ảnh/video */}
                                    {post.img.length > 0 && (
                                        <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
                                            {post.img.length > 1 && (
                                                <button
                                                    onClick={() => handlePrev(post)}
                                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full z-10"
                                                >
                                                    ‹
                                                </button>
                                            )}
                                            <div className="carousel-item w-full flex justify-center">
                                                <FileViewer file={post.img[0]} mh={400} />
                                            </div>
                                            {post.img.length > 1 && (
                                                <button
                                                    onClick={() => handleNext(post)}
                                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full z-10"
                                                >
                                                    ›
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    {post.gif && (
                                        <div className='flex justify-center'>
                                            <img
                                                style={{ maxWidth: '100%', maxHeight: '400px' }}
                                                src={post.gif}
                                                alt="" />
                                        </div>

                                    )}
                                    {/* Các nút like, comment, share */}
                                    <div className="flex justify-between flex-wrap gap-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleLikeClick(post._id)}
                                                className="flex items-center gap-1"
                                            >
                                                {post.likes.includes(userLogin._id) ? (
                                                    <HandThumbUpIcon className="size-5 animate__heartBeat text-blue-500" />
                                                ) : (
                                                    <HandThumbUpIcon className="size-5 hover:text-blue-700" />
                                                )}
                                                <span>{post.likes.length}</span>
                                            </button>
                                            <button
                                                onClick={() => handleDislikeClick(post._id)}
                                                className="flex items-center gap-1"
                                            >
                                                {post.dislikes.includes(userLogin._id) ? (
                                                    <HandThumbDownIcon className="size-5 animate__heartBeat text-red-500" />
                                                ) : (
                                                    <HandThumbDownIcon className="size-5 hover:text-red-700" />
                                                )}
                                                <span>{post.dislikes.length}</span>
                                            </button>
                                        </div>
                                        <Link to={`/post/${post._id}`} className="flex items-center gap-1">
                                            <ChatBubbleLeftIcon className="size-5" />
                                            <span>{post.comments.length}</span>
                                        </Link>
                                        <button onClick={() => handleCopyLink(post._id)} className="flex items-center gap-1">
                                            <ShareIcon className="size-5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div>No posts available</div>
                    )}

                </>
            )
            }

        </>
    );
}

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { HandThumbUpIcon, ChatBubbleLeftIcon, ShareIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';
import AVTUser from './AVTUser';
import authToken from '../../components/authToken';
import { handleLike, handleDisLike, handleUnDisLike, handleUnLike } from '../../service/PostService';
import 'animate.css';
import DropdownPostPersonal from './components/DropdownPostPersonal';
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import Loading from '../../components/Loading';
import Apiuri from '../../service/apiuri';
import FilePreview from '../../components/fileViewer';
const uri = Apiuri.Apiuri()
export default function PostPersonal({ user }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        const fetchdata = async () => {
            setLoading(true);
            axios.get(`${uri}/post/crpost`, {
                headers: {
                    Authorization: `Bearer ${authToken.getToken()}`, // Use your auth token provider
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    //sort
                    const sortedPosts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setPosts(sortedPosts);
                    setLoading(false);
                })

                .catch(error => {
                    // console.error("Error fetching post data:", error);
                })
        }
        fetchdata()
    }, []);
    //Like
    const handleLikeClick = async (postId) => {
        try {
            const post = posts.find(post => post._id === postId);
            if (post.likes.includes(user._id)) {
                // Optimistically update the UI
                setPosts(posts.map(post =>
                    post._id === postId ? { ...post, likes: post.likes.filter(id => id !== user._id) } : post
                ));
                await handleUnLike(postId);
            } else {
                // Optimistically update the UI
                setPosts(posts.map(post =>
                    post._id === postId ? { ...post, likes: [...post.likes, user._id], dislikes: post.dislikes.filter(id => id !== user._id) } : post
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
            if (post.dislikes.includes(user._id)) {
                // Optimistically update the UI
                setPosts(posts.map(post =>
                    post._id === postId ? { ...post, dislikes: post.dislikes.filter(id => id !== user._id) } : post
                ));
                await handleUnDisLike(postId);
            } else {
                // Optimistically update the UI
                setPosts(posts.map(post =>
                    post._id === postId ? { ...post, dislikes: [...post.dislikes, user._id], likes: post.likes.filter(id => id !== user._id) } : post
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
                return <span className="text-rose-700">chỉ mình tôi</span>;
            default:
                return <span>{privacy}</span>;
        }
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

    return (
        <>
            {loading ? (
                <Loading />
            ) : (
                posts.length > 0 ? (
                    posts.map((post) => (
                        <div key={post._id} className='grid p-6 border border-gray-300 rounded-lg shadow-md shadow-zinc-300 gap-3 w-full max-w-3xl mx-auto'>
                            <div className='flex items-start gap-3'>
                                <AVTUser user={user} />
                                <div className='grid gap-2 w-full'>
                                    <div className='flex justify-between'>
                                        <article className='text-wrap grid gap-5'>
                                            <div className='grid'>
                                                <Link className='font-bold text-lg hover:link break-words w-full' to="#">{user.lastName} {user.firstName}</Link>
                                                <div className='flex gap-2 text-xs'>
                                                    <span>{formatDate(post.createdAt)}</span>
                                                    <span>{formatPrivacy(post.privacy)}</span>
                                                </div>
                                            </div>
                                        </article>
                                        <DropdownPostPersonal postId={post._id} />
                                    </div>
                                </div>
                            </div>
                            {/* content */}
                            <p className='break-words w-full'>{post.content}</p>
                            {/* image/video */}
                            {post.img.length > 0 && (
                                <div className='flex justify-center'>
                                    <FilePreview file={post.img} />
                                </div>
                            )}
                            {/* like, comment, share */}
                            <div className='flex justify-between flex-wrap gap-3'>
                                <div className='flex gap-2'>
                                    <button onClick={() => handleLikeClick(post._id)} className='flex items-end gap-1'>
                                        {post.likes.includes(user._id)
                                            ? <HandThumbUpIcon className='size-5 animate__heartBeat' color='blue' />
                                            : <HandThumbUpIcon className='size-5 hover:text-blue-700' />
                                        }
                                        <span>{post.likes.length}</span>
                                    </button>
                                    <button onClick={() => handleDislikeClick(post._id)} className='flex items-end gap-1'>
                                        {post.dislikes.includes(user._id)
                                            ? <HandThumbDownIcon className='size-5 animate__heartBeat' color='red' />
                                            : <HandThumbDownIcon className='size-5 hover:text-red-700' />
                                        }
                                        <span>{post.dislikes.length}</span>
                                    </button>
                                </div>
                                <Link to={`/post/${post._id}`} className='flex items-end gap-1'>
                                    <ChatBubbleLeftIcon className='size-5' />
                                    <span>{post.comments.length}</span>
                                </Link>
                                <button onClick={() => handleCopyLink(post._id)} className='flex items-end gap-1'>
                                    <ShareIcon className='size-5' />
                                </button>
                            </div>
                        </div>

                    ))
                ) : (
                    <span>Chưa đăng bài viết nào!</span>
                )
            )}
        </>
    )
}

import React, { useEffect, useState } from 'react'
import { getComment, handleLike, handleUnLike } from '../../../service/CommentService';
import AVTUser from '../AVTUser';
import { Link } from 'react-router-dom';
import { differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import Loading from '../../../components/Loading';
import { HeartIcon } from '@heroicons/react/24/outline';
import 'animate.css';
import { useParams } from 'react-router-dom';

export default function CommentReply({ open, user, cmtId, onCommentAdded }) {
    const [comment, setComment] = useState([])
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const fetchReplies = async () => {
        try {
            const response = await getComment(id)
            if (response) {
                const sortedComments = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setComment(sortedComments)
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (open) {
            fetchReplies();
        }
    }, [id, open]);

    // Refresh when a new comment is added
    useEffect(() => {
        if (onCommentAdded) {
            fetchReplies();
        }
    }, [onCommentAdded]);
    console.log(comment)
    //format Time CreateAt Comment
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

    //Like
    const handleLikeClick = async (cmtId) => {
        try {
            const cmt = comment.find(e => e._id === cmtId)
            if (cmt.likes.includes(user._id)) {
                // Optimistically update the UI
                cmt.likes = cmt.likes.filter(id => id !== user._id)
                setComment([...comment])
                await handleUnLike(cmtId);
            } else {
                // Optimistically update the UI
                cmt.likes = [...cmt.likes, user._id]
                setComment([...comment])
                await handleLike(cmtId);
            }
        } catch (error) {
            console.error("Error liking the post:", error);
        }
    }
    if (!open) return null;

    // Filter for replies to the specific comment
    const repliesForComment = comment.filter(cmt => cmt?.replyTo[0] === cmtId);
    console.log(repliesForComment)
    return (
        <div className="space-y-3 mt-3">
            {loading ? (
                <Loading />
            ) : (
                repliesForComment.length === 0 ? (
                    <div className="text-sm text-gray-500 py-2">Chưa có phản hồi nào</div>
                ) : (
                    repliesForComment.map((cmt) => (
                        <div key={cmt._id} className="py-3">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <AVTUser user={cmt?.author} />
                                </div>
                                <div className="flex-grow">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Link
                                            to={`/user/${cmt?.author?._id}`}
                                            className="text-base font-medium hover:underline text-gray-900"
                                        >
                                            {cmt?.author?.lastName} {cmt?.author?.firstName}
                                        </Link>
                                        <span className="text-xs text-gray-500">{formatDate(cmt.createdAt)}</span>
                                    </div>
                                    <div className="mt-2 text-gray-700">
                                        {cmt?.content}
                                    </div>
                                    <div className="mt-2 flex items-center gap-4">
                                        <button
                                            onClick={() => handleLikeClick(cmt?._id)}
                                            className="flex items-center gap-1.5 text-sm group"
                                        >
                                            {cmt?.likes?.includes(user._id)
                                                ? <HeartIcon className='fill-red-600 text-red-600 size-4 animate__animated animate__heartBeat' />
                                                : <HeartIcon className='size-4 text-gray-500 group-hover:text-red-600 transition-colors' />
                                            }
                                            <span className={cmt?.likes?.includes(user._id) ? "text-red-600" : "text-gray-500 group-hover:text-red-600"}>
                                                {cmt?.likes?.length || 0}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )
            )}
        </div>
    )
}

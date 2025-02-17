import React, { useEffect, useState } from 'react'
import { getComment, handleLike, handleUnLike } from '../../../service/CommentService';
import AVTUser from '../AVTUser';
import { Link } from 'react-router-dom';
import { differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import Loading from '../../../components/Loading';

export default function CommentReply({ open, postId, user, cmtId }) {
    const [comment, setComment] = useState([])
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchdata = async () => {
            try {
                const response = await getComment(postId)
                if (response) {
                    const sortedComments = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setComment(sortedComments)
                }
            } catch (error) {
                console.error("Error liking the post:", error);
            }
            finally {
                setLoading(false);
            }
        }
        fetchdata()
    }
        , [postId]);

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

    console.log(comment)
    return (
        <>
            {open === true && (
                <div className=' mt-5 p-2  border-2'>

                    các phản hồi của bình luận này
                    {loading ? (
                        <Loading />
                    ) : (
                        comment.length === 0 ? (
                            <div className="text-center p-4">Chưa có phản hồi nào</div>
                        ) : (
                            comment.filter(cmt => cmt?.replyTo[0] === cmtId).length === 0 ? (
                                <div className="text-center p-4">Chưa có phản hồi nào</div>
                            ) : (
                                comment.map((cmt) => (
                                    cmt?.replyTo[0] === cmtId && (
                                        <div key={cmt._id} className="bg-card dark:bg-card-foreground p-4 rounded-lg rounded-b-none border-b-[1px]">
                                            <div className=''>
                                                <div className="flex items-center gap-2 ">
                                                    {/* <img className="h-12 w-12 rounded-full mr-4" src="https://placehold.co/50x50" alt="user-avatar" /> */}
                                                    <AVTUser user={cmt?.author} />
                                                    <div>
                                                        <Link to={`/user/${cmt?.author?._id}`} className="text-lg font-semibold">{cmt?.author?.lastName} {cmt?.author?.firstName}</Link>
                                                        <p className="text-sm text-muted-foreground">{formatDate(cmt.createdAt)}</p>
                                                    </div>
                                                </div>
                                                <p className="text-base mt-4">{cmt?.content}</p>
                                                <div className="flex items-center justify-between mt-4">
                                                    <div className='flex gap-1'>
                                                        <span>{cmt?.likes?.length}</span>
                                                        <button onClick={() => handleLikeClick(cmt?._id)} className={"flex items-end gap-1"}>
                                                            {cmt?.likes?.includes(user._id)
                                                                ? <div className='text-blue-700 animate__heartBeat'>Like</div>
                                                                : <div className='text-gray-700 '>Like</div>
                                                            }
                                                        </button>
                                                    </div>
                                                    {/* <button onClick={() => handleReply(e._id)} className="text-secondary">Phản hồi</button> */}
                                                </div>
                                            </div>
                                            {/* <FormReply open={openReplyId === e._id} keycmt={e} /> */}
                                        </div>
                                    )
                                ))
                            )
                        )
                    )}
                </div>
            )}
        </>
    )
}

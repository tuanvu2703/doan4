import React, { useEffect, useState } from 'react'
import { getComment, handleLike, handleUnLike } from '../../../service/CommentService';
import { differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import AVTUser from '../AVTUser';
import 'animate.css';
import { Link } from 'react-router-dom';
import FormReply from './FormReply';
import CommentReply from './CommentReply';
import { HeartIcon } from '@heroicons/react/24/outline';



export default function Comment({ postId, user }) {
  const [comment, setComment] = useState([])
  const [openReplyId, setOpenReplyId] = useState(null);
  const [isReplyOpen, setIsReplyOpen] = useState(false);

  const fetchComments = async () => {
    try {
      const response = await getComment(postId)
      if (response) {
        const sortedComments = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setComment(sortedComments)
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }

  useEffect(() => {
    fetchComments();
  }, [postId]);

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

  const handleReply = (cmtId) => {
    setOpenReplyId(openReplyId === cmtId ? null : cmtId);
  }

  const handleReplyList = (cmtId) => {
    setIsReplyOpen(isReplyOpen === cmtId ? null : cmtId);
  }
  //

  console.log(comment)
  return (
    <div>
      <div className='mt-3 border-[1px] rounded-xl grid gap-5'>
        {comment.filter((com_e) => com_e.replyTo.length === 0).map((e) => (
          <div key={e._id} className="bg-card dark:bg-card-foreground p-4 rounded-lg rounded-b-none border-b-2 ">
            <div className=' '>
              <div className="flex items-center gap-2 ">
                {/* <img className="h-12 w-12 rounded-full mr-4" src="https://placehold.co/50x50" alt="user-avatar" /> */}
                <AVTUser user={e?.author} />
                <div>

                  <Link to={`/user/${e?.author?._id}`} className="text-lg font-semibold">{e?.author?.lastName} {e?.author?.firstName}</Link>
                  <p className="text-sm text-muted-foreground">{formatDate(e.createdAt)}</p>
                </div>
              </div>
              <p className="text-base mt-4">{e?.content}</p>
              <div className="flex items-center justify-between mt-4">
                <div className='flex gap-1 justify-center items-center'>
                  <span>{e?.likes?.length}</span>
                  <button onClick={() => handleLikeClick(e?._id)} className={"flex items-end gap-1"}>
                    {e?.likes?.includes(user._id)
                      ? <HeartIcon className='fill-red-600 text-red-600 size-5 animate__heartBeat' />
                      : <HeartIcon className=' size-5 text-red-600 '>Like</HeartIcon>
                    }
                  </button>

                </div>
                <button onClick={() => handleReply(e._id)} className="text-secondary">Phản hồi</button>
              </div>
            </div>
            <FormReply open={openReplyId === e._id} keycmt={e} />
            <button onClick={() => handleReplyList(e._id)}>Xem các phản hồi</button>
            {isReplyOpen && <CommentReply open={isReplyOpen === e._id} postId={postId} user={user} cmtId={e._id} />}
          </div>
        ))}

      </div>
    </div>
  )
}

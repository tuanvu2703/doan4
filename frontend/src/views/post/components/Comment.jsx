import React, { useEffect, useState } from 'react'
import { getComment, handleLike, handleUnLike } from '../../../service/CommentService';
import { differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import AVTUser from '../AVTUser';
import 'animate.css';
import { Link } from 'react-router-dom';
import FormReply from './FormReply';
import CommentReply from './CommentReply';
import { HeartIcon, ChatBubbleLeftIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useParams } from 'react-router-dom';
export default function Comment({ user, refreshComments }) {
  const [comment, setComment] = useState([])
  const [openReplyId, setOpenReplyId] = useState(null);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const { id } = useParams();
  const fetchComments = async () => {
    try {
      const response = await getComment(id)
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
  }, [id]);

  // Add a refresher effect when the refreshComments prop changes
  useEffect(() => {
    if (refreshComments) {
      fetchComments();
    }
  }, [refreshComments]);

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

  const handleCommentAdded = () => {
    fetchComments();
    if (refreshComments) refreshComments();
  };
  return (
    <div className="space-y-4">
      {comment.filter((com_e) => com_e.replyTo.length === 0).map((e) => (
        <div key={e._id} className="bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <AVTUser user={e?.author} />
              </div>
              <div className="flex-grow">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/user/${e?.author?._id}`}
                    className="text-base font-medium hover:underline text-gray-900"
                  >
                    {e?.author?.lastName} {e?.author?.firstName}
                  </Link>
                  <span className="text-xs text-gray-500 ">{formatDate(e.createdAt)}</span>
                </div>
                <div className="mt-2 text-gray-700 ">
                  {e?.content}
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <button
                    onClick={() => handleLikeClick(e?._id)}
                    className="flex items-center gap-1.5 text-sm group"
                  >
                    {e?.likes?.includes(user._id)
                      ? <HeartIcon className='fill-red-600 text-red-600 size-4 animate__animated animate__heartBeat' />
                      : <HeartIcon className='size-4 text-gray-500 group-hover:text-red-600 transition-colors' />
                    }
                    <span className={e?.likes?.includes(user._id) ? "text-red-600" : "text-gray-500 group-hover:text-red-600"}>
                      {e?.likes?.length || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => handleReply(e._id)}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <ChatBubbleLeftIcon className="w-4 h-4" />
                    <span>Phản hồi</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-2">
              <FormReply
                open={openReplyId === e._id}
                keycmt={e}
                onCommentAdded={handleCommentAdded}
              />
            </div>
            {e?.replies && e?.replies?.length > 0 && (
              <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => handleReplyList(e._id)}
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  {isReplyOpen === e._id ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                  <span>{isReplyOpen === e._id ? 'Ẩn phản hồi' : `Xem ${e.replies.length} phản hồi`}</span>
                </button>

                {isReplyOpen === e._id &&
                  <div className="mt-2 pl-2 border-l-2 border-gray-200 dark:border-gray-700">

                    <CommentReply
                      open={true}
                      user={user}
                      cmtId={e._id}
                      onCommentAdded={handleCommentAdded}
                    />
                  </div>
                }

              </div>
            )}
          </div>
        </div>
      ))}

      {comment.filter((com_e) => com_e.replyTo.length === 0).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
        </div>
      )}
    </div>
  )
}

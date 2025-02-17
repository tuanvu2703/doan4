import React from 'react'
import { Form, Link, useParams } from 'react-router-dom';
import AVTUser from '../AVTUser';
import { HandThumbUpIcon, ChatBubbleLeftIcon, ShareIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { getDetailPost, handleUnLike, handleLike, handleUnDisLike, handleDisLike } from '../../../service/PostService';
import { profileUserCurrent } from '../../../service/ProfilePersonal';
import { OtherProfile } from '../../../service/OtherProfile';
import { differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import DropdownPostPersonal from './DropdownPostPersonal';
import DropdownOtherPost from './DropdownOtherPost';
import FormComment from './FormComment';
import Comment from './Comment';
import 'animate.css';
import FilePreview from '../../../components/fileViewer';

export default function DetailPost() {


  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState({})
  const [userLogin, setUserLogin] = useState({})
  const [currentIndexes, setCurrentIndexes] = useState({});
  const { id } = useParams();

  const fetchComments = async () => {
    try {
      const response = await getDetailPost(id)
      if (response) {
        setPosts(response.data)
        const responseUser = await OtherProfile(response.data.author)
        setUser(responseUser.data)
        const responseUserPersonal = await profileUserCurrent()
        setUserLogin(responseUserPersonal.data)
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
    }
  }

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const response = await getDetailPost(id)
        if (response) {
          setPosts(response.data)
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
  }, [id]);

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

  //Like
  const handleLikeClick = async (postId) => {
    try {
      const post = posts
      if (post.likes.includes(userLogin._id)) {
        // Optimistically update the UI
        setPosts({ ...post, likes: post.likes.filter(id => id !== userLogin._id) });
        await handleUnLike(postId);
      } else {
        // Optimistically update the UI
        setPosts({ ...post, likes: [...post.likes, userLogin._id], dislikes: post.dislikes.filter(id => id !== userLogin._id) });
        await handleLike(postId);
        await handleUnDisLike(postId); // Dislike when liking
      }
    } catch (error) {
      console.error("Error liking the post:", error);
    }
  }
  //Dislike
  const handleDislikeClick = async (postId) => {
    try {
      const post = posts
      if (post.dislikes.includes(userLogin._id)) {
        // Optimistically update the UI
        setPosts({ ...post, dislikes: post.dislikes.filter(id => id !== userLogin._id) });
        await handleUnDisLike(postId);
      } else {
        // Optimistically update the UI
        setPosts({ ...post, dislikes: [...post.dislikes, userLogin._id], likes: post.likes.filter(id => id !== userLogin._id) });
        await handleDisLike(postId);
        await handleUnLike(postId); // Unlike when disliking
      }
    } catch (error) {
      console.error("Error disliking the post:", error);
    }
  }
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


  // console.log(posts)
  return (
    <div className='grid justify-center'>
      <div className='w-full max-w-2xl'>
        <div key={posts._id}
          className='flex items-start w-full p-6 border border-gray-300 rounded-lg shadow-md shadow-zinc-300 gap-3'>
          <div className='grid gap-2 w-full'>
            <div className='flex justify-between'>
              <div className='flex gap-3'>
                <AVTUser user={user} />
                <article className='text-wrap grid gap-5'>
                  <div className='grid'>
                    <Link className='font-bold text-lg hover:link' to={`/user/${user._id}`}>{user.lastName} {user.firstName}</Link>
                    <div className='flex gap-2'>
                      <span className='text-xs'>{formatDate(posts.createdAt)}</span>
                      <span className='text-xs'>{formatPrivacy(posts.privacy)}</span>
                    </div>
                  </div>
                </article>
              </div>
              {userLogin._id === posts.author ? (
                <DropdownPostPersonal postId={posts._id} />
              ) : (
                <DropdownOtherPost postId={posts._id} />
              )}
            </div>
            <p>{posts.content}</p>
            {posts?.img?.length > 0 && (
              <div className="carousel rounded-box w-full h-64 relative">
                {posts?.img?.length > 1 && (
                  <button onClick={() => handlePrev(posts)} className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full">‹</button>
                )}
                <div className="carousel-item w-full items-center">
                  <FilePreview file={posts.img} />
                </div>
                {posts?.img?.length > 1 && (
                  <button onClick={() => handleNext(posts)} className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full">›</button>
                )}
              </div>
            )}
            <div className='flex justify-between'>
              <div className='flex gap-2'>
                <button onClick={() => handleLikeClick(posts._id)} className={"flex items-end gap-1"}>
                  {posts?.likes?.includes(userLogin._id)
                    ? <HandThumbUpIcon className="size-5 animate__heartBeat" color='blue' />
                    : <HandThumbUpIcon className="size-5 hover:text-blue-700" />
                  }
                  <span>{posts?.likes?.length}</span>
                </button>
                <button onClick={() => handleDislikeClick(posts._id)} className={"flex items-end gap-1"}>
                  {posts?.dislikes?.includes(userLogin._id)
                    ? <HandThumbDownIcon className="size-5 animate__heartBeat" color='red' />
                    : <HandThumbDownIcon className="size-5 hover:text-red-700" />
                  }
                  <span>{posts?.dislikes?.length}</span>
                </button>
              </div>
              <button className='flex items-end gap-1'>
                <ChatBubbleLeftIcon className="size-5" />
                <span>{posts?.comments?.length}</span>
              </button>
              <button>
                <ShareIcon className="size-5" />
              </button>
            </div>
          </div>
        </div>
        <FormComment postId={posts._id} onCommentAdded={fetchComments} />
        <Comment postId={posts._id} user={userLogin} />
      </div>
    </div>
  )
}


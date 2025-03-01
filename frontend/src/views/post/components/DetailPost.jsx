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
    <div className="grid justify-center p-4">
      <div className="w-full max-w-[700px] mx-auto min-w-[300px] sm:min-w-[400px] md:min-w-[500px] lg:min-w-[600px]">
        <div
          key={posts._id}
          className="flex flex-col md:flex-row items-start w-full p-6 border border-gray-300 rounded-lg shadow-md shadow-zinc-300 gap-3"
        >
          <div className="grid gap-2 w-full">
            {/* Header: Thông tin tác giả và dropdown */}
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
                      <span className="text-xs">{formatDate(posts.createdAt)}</span>
                      <span className="text-xs">{formatPrivacy(posts.privacy)}</span>
                    </div>
                  </div>
                </article>
              </div>
              <div>
                {userLogin._id === posts.author ? (
                  <DropdownPostPersonal postId={posts._id} />
                ) : (
                  <DropdownOtherPost postId={posts._id} />
                )}
              </div>
            </div>

            {/* Nội dung bài viết */}
            <p className="mt-2">{posts.content}</p>

            {/* Carousel hiển thị hình ảnh (nếu có) */}
            {posts?.img?.length > 0 && (
              <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
                {posts?.img?.length > 1 && (
                  <button
                    onClick={() => handlePrev(posts)}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
                  >
                    ‹
                  </button>
                )}
                <div className="carousel-item w-full items-center justify-center">
                  <FilePreview file={posts.img} mh={600} />
                </div>
                {posts?.img?.length > 1 && (
                  <button
                    onClick={() => handleNext(posts)}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
                  >
                    ›
                  </button>
                )}
              </div>
            )}

            {/* Footer: Các nút tương tác */}
            <div className="flex justify-between flex-wrap gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => handleLikeClick(posts._id)}
                  className="flex items-center gap-1"
                >
                  {posts?.likes?.includes(userLogin._id) ? (
                    <HandThumbUpIcon className="w-5 h-5 animate__heartBeat text-blue-500" />
                  ) : (
                    <HandThumbUpIcon className="w-5 h-5 hover:text-blue-700" />
                  )}
                  <span>{posts?.likes?.length}</span>
                </button>
                <button
                  onClick={() => handleDislikeClick(posts._id)}
                  className="flex items-center gap-1"
                >
                  {posts?.dislikes?.includes(userLogin._id) ? (
                    <HandThumbDownIcon className="w-5 h-5 animate__heartBeat text-red-500" />
                  ) : (
                    <HandThumbDownIcon className="w-5 h-5 hover:text-red-700" />
                  )}
                  <span>{posts?.dislikes?.length}</span>
                </button>
              </div>

              <button className="flex items-center gap-1">
                <ChatBubbleLeftIcon className="w-5 h-5" />
                <span>{posts?.comments?.length}</span>
              </button>

              <button className="flex items-end gap-1">
                <ShareIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Form Comment và Comment */}
        <div className="mt-4">
          <FormComment postId={posts._id} onCommentAdded={fetchComments} />
          <Comment postId={posts._id} user={userLogin} />
        </div>
      </div>
    </div>
  )
}


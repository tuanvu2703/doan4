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

  const [copied, setCopied] = useState(false);
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState({})
  const [userLogin, setUserLogin] = useState({})
  const [currentIndexes, setCurrentIndexes] = useState({});
  const [expandedPosts, setExpandedPosts] = useState({});
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

  //share
  const handleCopyLink = (postId) => {
    const link = `${window.location.href}`; // Lấy URL hiện tại
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


  // console.log(posts)
  return (
    <div className="grid justify-center p-4">
      <div className="w-full max-w-[700px] mx-auto min-w-[300px] sm:min-w-[400px] md:min-w-[500px] lg:min-w-[800px] bg-white">
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
            {posts.isActive === false ? (
              <div className="mt-2 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                <p className="font-medium">Bài viết này đã bị báo cáo hoặc tạm khóa.</p>
              </div>
            ) : (
              renderPostContent(posts)
            )}

            {/* Carousel hiển thị hình ảnh (nếu có) */}
            {posts?.img?.length > 0 && (
              <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto ">
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
            {posts.gif && (
              <div className='flex justify-center my-3'>
                <img
                  className="rounded-xl shadow-md max-h-[450px] object-contain"
                  src={posts.gif}
                  alt="Gif content" />
              </div>
            )}

            {/* Footer: Các nút tương tác */}
            <div className="flex flex-wrap justify-between items-center mt-2 pt-3 border-t border-gray-200">
              <div className="flex gap-2 sm:gap-4">
                <button
                  onClick={() => handleLikeClick(posts._id)}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full hover:bg-blue-50 transition-all duration-200"
                >
                  {posts?.likes?.includes(userLogin._id) ? (
                    <HandThumbUpIcon className="size-4 sm:size-5 animate__animated animate__heartBeat text-blue-600" />
                  ) : (
                    <HandThumbUpIcon className="size-4 sm:size-5 text-gray-600" />
                  )}
                  <span className={`text-xs sm:text-sm font-medium ${posts?.likes?.includes(userLogin._id) ? 'text-blue-600' : 'text-gray-600'}`}>
                    {posts?.likes?.length > 0 ? posts?.likes?.length : ''}
                  </span>
                </button>
                <button
                  onClick={() => handleDislikeClick(posts._id)}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full hover:bg-red-50 transition-all duration-200"
                >
                  {posts?.dislikes?.includes(userLogin._id) ? (
                    <HandThumbDownIcon className="size-4 sm:size-5 animate__animated animate__heartBeat text-red-600" />
                  ) : (
                    <HandThumbDownIcon className="size-4 sm:size-5 text-gray-600" />
                  )}
                  <span className={`text-xs sm:text-sm font-medium ${posts?.dislikes?.includes(userLogin._id) ? 'text-red-600' : 'text-gray-600'}`}>
                    {posts?.dislikes?.length > 0 ? posts?.dislikes?.length : ''}
                  </span>
                </button>
              </div>
              <div className="flex gap-2 sm:gap-4 mt-1 sm:mt-0">
                <button className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full hover:bg-gray-100 transition-all duration-200">
                  <ChatBubbleLeftIcon className="size-4 sm:size-5 text-gray-600" />
                  <span className="text-xs sm:text-sm font-medium text-gray-600">
                    {posts?.comments?.length > 0 ? posts?.comments?.length : ''}
                  </span>
                </button>
                <button
                  onClick={() => handleCopyLink(posts._id)}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full hover:bg-gray-100 transition-all duration-200"
                >
                  <ShareIcon className="size-4 sm:size-5 text-gray-600" />
                  {copied && <span className="text-xs text-green-600 font-medium">Đã sao chép!</span>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form Comment và Comment */}
        <div className="mt-6 bg-gray-50 rounded-lg shadow-sm p-4">
          <FormComment postId={posts._id} onCommentAdded={fetchComments} />
          <div className="mt-4 border-t pt-4">
            <h3 className="font-medium text-lg mb-4">Bình luận</h3>
            <Comment postId={posts._id} user={userLogin} refreshComments={fetchComments} />
          </div>
        </div>
      </div>
    </div>
  )
}


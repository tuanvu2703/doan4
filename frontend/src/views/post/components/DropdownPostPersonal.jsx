import React from 'react'
import { PencilSquareIcon, BookmarkIcon, EllipsisHorizontalIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import NotificationCss from '../../../module/cssNotification/NotificationCss'
import { deletePost } from '../../../service/PostService'
export default function DropdownPostPersonal({ postId }) {

  const handleDeletePost = async () => {
    try {
      await deletePost(postId)
      toast.success('Xóa bài viết thành công', NotificationCss.Success);
    } catch (error) {
      console.error('Error deleting post:', error)
    }
    finally {
      setTimeout(() => {
        window.location.reload()
      },1000)
    }
  }


  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="p-2 hover:bg-gray-300 rounded-full">
        <EllipsisHorizontalIcon className="size-5" />
      </div>
      <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">

        <li>
          <Link className=" data-[focus]:bg-[#3f3f46] p-2 rounded-md flex items-center gap-2" to={`/updatepost/${postId}`}>
            <PencilSquareIcon className="size-5 text-sky-600" />
            Chỉnh sửa bài viết
          </Link>
        </li>
        <li>
          <button
            onClick={() => handleDeletePost()}
            className=" data-[focus]:bg-[#3f3f46] p-2 rounded-md flex items-center gap-2" >
            <TrashIcon className="size-5  text-red-600" />
            Xóa bài viết
          </button>
        </li>
      </ul>
    </div>
  )
}

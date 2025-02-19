import React from 'react'
import { PencilSquareIcon, BookmarkIcon, EllipsisHorizontalIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { handleAddBookmark } from '../../../service/PostService';
import { toast } from 'react-toastify';
import NotificationCss from '../../../module/cssNotification/NotificationCss';

export default function DropdownOtherPost({ postId }) {
    const handleBookmarkAdd = async () => {
        try {
            const rs = await handleAddBookmark(postId);
            toast.success(rs?.message ? rs.message : 'Đã lưu bài viết', NotificationCss.Success);
        } catch (error) {
            console.error('Error bookmarking post:', error);
        }
    };
    return (
        <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="p-2 hover:bg-gray-300 rounded-full">
                <EllipsisHorizontalIcon className="size-5" />
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                <li>

                    <button
                        onClick={handleBookmarkAdd}
                        className=" data-[focus]:bg-[#3f3f46] p-2 rounded-md flex items-center gap-2" to="#">
                        <BookmarkIcon className="size-5 text-amber-600" />
                        Lưu bài viết
                    </button>
                </li>

                <li>
                    <Link className=" data-[focus]:bg-[#3f3f46] p-2 rounded-md flex items-center gap-2" to="#">
                        <TrashIcon className="size-5  text-red-600" />
                        Ẩn bài viêt
                    </Link>
                </li>
            </ul>
        </div>
    )
}

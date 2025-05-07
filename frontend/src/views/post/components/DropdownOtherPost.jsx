import React from 'react'
import { FlagIcon, BookmarkIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import { getAllBookmark, handleAddBookmark } from '../../../service/PostService';
import { toast } from 'react-toastify';
import NotificationCss from '../../../module/cssNotification/NotificationCss';
import { useState, useEffect } from 'react';
import ReportForm from './ReportForm';
export default function DropdownOtherPost({ postId }) {
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [bookmark, setBookmark] = useState(false)

    // useEffect(() => {
    //     const fetchBookMark = async () => {
    //         try {
    //             const response = await getAllBookmark(postId);
    //             setBookmark(response.data);
    //         } catch (error) {
    //             console.error('Error checking bookmark:', error);
    //         }
    //     };
    //     fetchBookMark();
    // }, [])

    const handleBookmarkAdd = async (e) => {
        e.preventDefault();
        try {
            const rs = await handleAddBookmark(postId);
            toast.success(rs?.message ? rs.message : 'Đã lưu bài viết', NotificationCss.Success);
        } catch (error) {
            console.error('Error bookmarking post:', error);
        } finally {
            setDropdownOpen(false);
        }
    };
    return (
        <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="p-2 hover:bg-gray-300 rounded-full" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <EllipsisHorizontalIcon className="size-5" />
            </div>
            {dropdownOpen && (
                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">

                    <li>
                        <button
                            onClick={handleBookmarkAdd}
                            className=" data-[focus]:bg-[#3f3f46] p-2 rounded-md flex items-center gap-2" to="#">
                            <BookmarkIcon className="size-5 text-amber-600 " />
                            <span className=''>Lưu bài viết</span>
                        </button>
                    </li>

                    <li>
                        <button onClick={() => document.getElementById(`my_modal_report_${postId}`).showModal()} className=" p-2 rounded-md flex items-center gap-2" to="#">
                            <FlagIcon className="size-5  text-red-600" />
                            <span className=''>Báo cáo bài viết</span>
                        </button>
                    </li>
                </ul>
            )}
            <ReportForm postId={postId} />
        </div>
    )
}

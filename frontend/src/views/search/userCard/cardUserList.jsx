import React, { useState, useCallback, useEffect } from 'react';
import userImg from '../../../img/user.png';
import friend from '../../../service/friend';
import { ToastContainer, toast } from 'react-toastify';
import NotificationCss from '../../../module/cssNotification/NotificationCss'
import { useContext } from 'react';
import { useUser } from '../../../service/UserContext';
import Loading from '../../../components/Loading';
const CardUserList = ({ userdata: initialUserData }) => {

    const [userdata, setUserdata] = useState(initialUserData);
    const [seding, setSending] = useState(true)
    // WebSocket message handler


    // Add friend functionality
    const handAddFriend = useCallback(async (id) => {
        setSending(false)
        try {
            const rs = await friend.AddFriend(id);
            console.log(rs.message);
            //friendrequest
            if (rs.success) {
                setUserdata((prev) => ({ ...prev, status: 'waiting' }));
                toast.success(rs?.message || 'Đã gửi yêu cầu kết bạn', NotificationCss.Success);
            } else {
                toast.error(rs?.message || 'Gửi yêu cầu kết bạn thất bại', NotificationCss.Fail);
            }
        } catch (error) {
            console.error(error);
        }
        setSending(true)
    }, []); // Add empty array to ensure it's only created once
    const handCloseFriend = async (id) => {
        setSending(false)
        try {
            const rs = await friend.cancelFriend(id);
            if (rs.success) {
                setUserdata((prev) => ({ ...prev, status: 'no friend' }));
                toast.success(rs?.message || 'Đã hủy kết bạn', NotificationCss.Success);
            } else {
                toast.error(rs?.message || 'Lỗi khi hủy kết bạn', NotificationCss.Fail);
            }
        } catch (error) {
            console.error(error);
        }
        setSending(true)
    };

    const handCancelRequest = async (id) => {
        setSending(false)
        try {
            const rs = await friend.cancelFriendRequest(id);
            console.log(rs)
            if (rs.success) {
                setUserdata((prev) => ({ ...prev, status: 'no friend' }));
                toast.success(rs?.message || 'Đã hủy yêu cầu kết bạn', NotificationCss.Success);
            } else {
                toast.error(rs?.message || 'Lỗi khi hủy yêu cầu kết bạn', NotificationCss.Fail);
            }
        } catch (error) {
            console.error(error);
        }
        setSending(true)
    };

    const handDetailUser = (id) => {
        window.location.href = `/user/${id}`;
    };
    console.log(userdata)
    return (
        <div>
            <button
                onClick={() => handDetailUser(userdata._id)}
                className="w-full  mx-auto flex flex-wrap sm:flex-nowrap rounded-lg hover:bg-gray-100 justify-between items-center p-2 sm:p-3 gap-3"
            >
                {/* Avatar và Thông tin người dùng */}
                <div className="flex flex-row items-center gap-3">
                    <img
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-black cursor-pointer"
                        src={userdata.avatar || userImg}
                        alt=""
                    />
                    <div className="flex flex-col pl-2 max-w-[180px] sm:max-w-[250px]">
                        <div className="text-start font-semibold truncate">
                            {userdata.firstName || ''} {userdata.lastName || ''}
                        </div>
                        <div className="text-sm text-gray-600">Số bài viết</div>
                    </div>
                </div>

                {/* Nút kết bạn */}
                <div className="py-2">
                    {seding ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (userdata._id && userdata.status) {
                                    switch (userdata.status) {
                                        case 'no friend':
                                            handAddFriend(userdata._id);
                                            break;
                                        case 'friend':
                                            handCloseFriend(userdata._id);
                                            break;
                                        default:
                                            handCancelRequest(userdata._id);
                                            break;
                                    }
                                }
                            }}
                            className={`rounded-xl p-2 min-w-24 shadow-sm text-sm truncate
                    ${userdata.status === 'friend' || userdata.status === 'waiting' || userdata.status === 'pending'
                                    ? 'hover:text-red-600 text-red-500 hover:bg-red-200 bg-red-100'
                                    : 'hover:text-blue-600 text-blue-500 hover:bg-blue-200 bg-blue-100'
                                }`}
                        >
                            <strong>
                                {userdata.status === 'no friend'
                                    ? 'Thêm bạn'
                                    : userdata.status === 'friend'
                                        ? 'Xóa bạn'
                                        : userdata.status === 'pending'
                                            ? 'Từ chối'
                                            : 'Hủy yêu cầu'}
                            </strong>
                        </button>
                    ) : (
                        <Loading />
                    )}
                </div>
            </button>
        </div>

    );
};

export default CardUserList;

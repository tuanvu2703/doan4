import React from 'react'
import { Link } from 'react-router-dom'
import user from '../../../service/user';
import { useEffect, useState } from 'react';
import imgUser from '../../../img/user.png'
import friend from '../../../service/friend';
import Loading from '../../../components/Loading';
import { ToastContainer, toast } from 'react-toastify';
import NotificationCss from '../../../module/cssNotification/NotificationCss';

export default function FriendCard({ iduser, idrequest, onAccept, onDecline }) {
    const [userdata, setUserdata] = useState({});
    const [loading, setLoading] = useState(true); // Loading state
    useEffect(() => {
        const fetchdata = async () => {
            try {
                const res = await user.getProfileUser(iduser);
                if (res.success) {
                    setUserdata(res.data)
                    console.log(res.data)
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false); // Stop loading
            }
        };
        fetchdata();
    }, [iduser]);

    if (loading) {
        return (
            <Loading />
        )
    }

    const handAddFriend = async (id) => {
        try {
            const rs = await friend.accectRequestAddFriend(id)
            if (rs.success) {
                toast.success(rs?.data?.message ? rs.data.message : 'thêm bạn bè thành công', NotificationCss.Success);
                if (onAccept) onAccept(idrequest);
            } else {
                toast.error(rs?.data?.message ? rs.data.message : 'lỗi khi đồng ý kết bạn', NotificationCss.Fail);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handDeclineFriend = async (id) => {
        try {
            const rs = await friend.declineRequestAddFriend(id)
            if (rs.success) {
                toast.success(rs?.message ? rs.message : 'Đã từ chối kết bạn', NotificationCss.Fail);
                if (onDecline) onDecline(idrequest);
            } else {
                toast.error(rs?.message ? rs.message : 'hủy thất bại do lỗi', NotificationCss.Fail);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="border border-gray-300 shadow-lg w-full rounded-lg">
            <Link to={`/user/${userdata?._id}`} className="block">
                <img
                    className="w-full aspect-square rounded-t-lg object-cover"
                    src={userdata?.avatar ? userdata.avatar : imgUser}
                    alt="User Avatar"
                />
            </Link>

            <div className="p-4 text-center">
                <h3 className="font-semibold text-lg" title={`${userdata?.firstName || ''} ${userdata?.lastName || ''}`}>
                    {userdata
                        ? `${(userdata.firstName || '')} ${(userdata.lastName || '')}`
                        : "No Name"}
                </h3>
            </div>

            <div className="flex flex-col gap-3 px-4 pb-4">
                <button
                    onClick={userdata?._id ? () => handAddFriend(idrequest) : undefined}
                    className="w-full bg-blue-600 py-2.5 text-white text-base rounded-lg transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Xác nhận
                </button>

                <button
                    onClick={userdata?._id ? () => handDeclineFriend(idrequest) : undefined}
                    className="w-full bg-gray-300 py-2.5 text-base text-black rounded-lg transition-all hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                    Từ chối
                </button>
            </div>
            <ToastContainer style={{ marginTop: '55px' }} />
        </div>
    )
}

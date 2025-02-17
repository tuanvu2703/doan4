import React from 'react'
import { Link } from 'react-router-dom'
import user from '../../../service/user';
import { useEffect, useState } from 'react';
import imgUser from '../../../img/user.png'
import friend from '../../../service/friend';
import Loading from '../../../components/Loading';
import { ToastContainer, toast } from 'react-toastify';
import NotificationCss from '../../../module/cssNotification/NotificationCss';

export default function FriendCard({ iduser, idrequest }) {
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
                window.location.reload();
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
                window.location.reload();
            } else {
                toast.error(rs?.message ? rs.message : 'hủy thất bại do lỗi', NotificationCss.Fail);
            }
            // console.log(rs);
        } catch (error) {
            console.error(error);
        }
    };
    const handDetailUser = async (id) => {
        window.location.href = `/user/${id}`;
    };

    return (
        <>
            <div className="border border-gray-300 shadow-2xl max-w-52 rounded-lg m-2">

                <Link onClick={() => handDetailUser(userdata?._id)}>
                    <img
                        className="w-full aspect-square rounded-t-lg bg-gray-400"
                        src={
                            userdata?.avatar
                                ? userdata.avatar
                                : imgUser
                        }
                        alt="User Avatar"
                    />
                </Link>

                <div className="p-2 text-center ">
                    <strong className='font-semibold text-nowrap overflow-hidden text-ellipsis max-w-52'>
                        {userdata
                            ? `${(userdata.firstName || '').slice(0, 10)} ${(userdata.lastName || '').slice(0, 10)}`
                            : "No Name"}
                    </strong>

                </div>

                <div className="flex flex-col gap-2 px-2 mb-2">
                    <button
                        onClick={userdata?._id ? () => handAddFriend(idrequest) : undefined}
                        className="w-full bg-blue-600 py-2 text-white rounded-lg transition-transform transform hover:scale-105"
                    >
                        Xác nhận
                    </button>

                    <button
                        onClick={userdata?._id ? () => handDeclineFriend(idrequest) : undefined}
                        className="w-full bg-gray-300 py-2 text-black rounded-lg transition-transform transform hover:scale-105"
                    >
                        Từ chối
                    </button>
                </div>
                <ToastContainer style={{ marginTop: '55px' }} />
            </div>

        </>
    )
}

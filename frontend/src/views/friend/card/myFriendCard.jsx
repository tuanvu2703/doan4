import React from 'react'
import { Link } from 'react-router-dom'
import user from '../../../service/user';
import { useEffect, useState } from 'react';
import imgUser from '../../../img/user.png'
import friend from '../../../service/friend';
import DropdownMyfriend from '../DropdownMyfriend'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { ToastContainer, toast } from 'react-toastify';
import {
    HeartIcon,
    ChatBubbleOvalLeftIcon,
    NoSymbolIcon,
    UserMinusIcon
} from '@heroicons/react/16/solid'
import Loading from '../../../components/Loading';
import NotificationCss from '../../../module/cssNotification/NotificationCss';


export default function FriendCard({ iduser, idrequest }) {
    const [userdata, setUserdata] = useState({});
    const [friendStatus, setFriendStatus] = useState(null);
    const [loading, setLoading] = useState(true); // Loading state
    const [friends, setFriends] = useState(userdata.friends); // Assuming userdata contains a list of friends
    useEffect(() => {
        const fetchdata = async () => {

            try {
                const res = await user.getProfileUser(iduser);
                if (res.success) {
                    setUserdata(res.data)
                    // console.log(res.data)
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
    const handDetailUser = async (id) => {
        window.location.href = `/user/${id}`;
    };
    const chaneUrl = async (url) => {
        window.location.href = String(url);
    };
    const handRemoveFriend = async (id) => {
        try {
            const rs = await friend.cancelFriend(id);
            if (rs.success) {
                toast.success(rs?.message ? rs.message : 'Đã hủy kết bạn', NotificationCss.Success);
                setFriendStatus("pending");
                setFriends(friends.filter(friend => friend.id !== id)); // Update the friends list
            } else {
                toast.error(rs?.message ? rs.message : 'hủy kết bạn thất bại', NotificationCss.Fail);
            }

        } catch (error) {
            toast.error('hủy kết bạn thất bại', NotificationCss.Fail);
        }
    };
    return (
        <div className="border border-gray-300 shadow-2xl max-w-52 rounded-lg flex justify-between flex-col ">

            <Link onClick={() => handDetailUser(userdata?._id)}>
                <img
                    className={`${userdata?.avatar ? '' : ' p-3'} w-full aspect-square rounded-t-lg  bg-gray-400`}
                    src={
                        userdata?.avatar
                            ? userdata.avatar
                            : imgUser
                    }
                    alt="User Avatar"
                />
            </Link>

            <div className="p-2 text-center">
                <strong>
                    {userdata
                        ? `${(userdata.lastName || '').slice(0, 10)} ${(userdata.firstName || '').slice(0, 10)}`
                        : "No Name"}
                </strong>

            </div>

            <div className="flex flex-row gap-2 px-2 mb-2 items-center">
                <button
                    onClick={() => handDetailUser(userdata?._id)}
                    className="w-full  bg-gray-300 py-2 text-black rounded-lg transition-transform transform hover:scale-105"
                >
                    Xem trang cá nhân
                </button>
                <div className='flex justify-center items-center'>
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="p-2 hover:bg-gray-300 rounded-full">
                            <ChevronDownIcon className="size-4 fill-gray-500" />
                        </div>
                        <ul tabIndex={0} className="dropdown-content  menu bg-base-100  rounded-box z-[1] w-52 p-2 shadow-md shadow-gray-500">

                            <li>
                                <Link
                                    onClick={userdata?._id ? () => chaneUrl(`/messenger/?iduser=${userdata._id}`) : undefined}
                                    className="  data-[focus]:bg-[#3f3f46] p-2 rounded-md flex items-center gap-2" to="#">
                                    <ChatBubbleOvalLeftIcon className="size-5 fill-blue-300" />
                                    Nhắn tin
                                </Link>
                            </li>
                            <li>
                                <Link
                                    onClick={() => userdata ? handRemoveFriend(userdata._id) : ''}
                                    className=" data-[focus]:bg-[#3f3f46] p-2 rounded-md flex items-center gap-2">
                                    <UserMinusIcon className="size-5 fill-red-500" />
                                    Hủy kết bạn
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

        </div>

    )
}

import React, { useState, useEffect } from 'react';
import {
    UserPlusIcon,
    NoSymbolIcon,
    ChatBubbleLeftRightIcon,
    UserMinusIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from "react-router-dom";

import friend from '../../../service/friend';
import { ToastContainer, toast } from 'react-toastify';
import NotificationCss from '../../../module/cssNotification/NotificationCss';
import { useUser } from '../../../service/UserContext';
export default function HeadOtherProfiles({ dataProfile }) {
    const navigate = useNavigate();
    const { userContext, setShowZom } = useUser();
    const [friendStatus, setFriendStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingRequest, setLoadingRequest] = useState(true);
    console.log(userContext._id)
    console.log(dataProfile._id)
    const openModal = (file) => {
        setShowZom({ file: file, show: true });
    };
    useEffect(() => {
        const fetchFriendStatus = async () => {
            if (dataProfile?._id) {
                setLoading(true);
                if (userContext._id === dataProfile._id) {
                    navigate('/myprofile');
                }
                const result = await friend.checkFriend(dataProfile._id);
                if (result.success) {
                    console.log(result.status)
                    setFriendStatus(result.status);
                } else {

                }
                setLoading(false);
            }
        };
        fetchFriendStatus();
    }, [dataProfile]);

    const handAddFriend = async (id) => {
        setLoadingRequest(false)
        try {
            const rs = await friend.AddFriend(id);
            if (rs.success) {
                toast.success(rs?.message ? rs.message : 'Đã gửi yêu cầu kết bạn', NotificationCss.Success);
                setFriendStatus("waiting");
            } else {
                toast.error(rs?.message ? rs.message : 'gửi yêu cầu kết bạn thất bại', NotificationCss.Fail);
            }
            console.log(rs);
        } catch (error) {
            console.error(error);
        }
        setLoadingRequest(true);
    };
    const handRemoveFriend = async (id) => {
        setLoadingRequest(false)
        try {
            const rs = await friend.cancelFriend(id);
            if (rs.success) {
                toast.success(rs?.message ? rs.message : 'Đã hủy kết bạn', NotificationCss.Success);
                setFriendStatus("no friend");
            } else {
                toast.error(rs?.message ? rs.message : 'hủy kết bạn thất bại', NotificationCss.Fail);
            }
            console.log(rs);
        } catch (error) {
            console.error(error);
        }
        setLoadingRequest(true);
    };
    const handCancelRequest = async (id) => {
        setLoadingRequest(false)
        try {
            const rs = await friend.cancelFriendRequest(id);
            if (rs.success) {
                setFriendStatus("no friend");
                toast.success(rs?.message || 'Đã hủy yêu cầu kết bạn', NotificationCss.Success);
            } else {
                toast.error(rs?.message || 'Lỗi khi hủy yêu cầu kết bạn', NotificationCss.Fail);
            }
        } catch (error) {
            console.error(error);
        }
        setLoadingRequest(true);
    };
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="spinner-border animate-spin inline-block w-16 h-16 border-4 border-sky-600 rounded-full"></div>
            </div>
        );
    }
    return (
        <>
            <div className="">
                <div
                    className="h-[300px] rounded-2xl z-0 grid bg-cover bg-no-repeat border-4"
                    style={{
                        backgroundImage: `url(${dataProfile && dataProfile.coverImage
                            ? dataProfile.coverImage
                            : 'https://mcdn.wallpapersafari.com/medium/91/45/MehDBZ.jpg'
                            })`,
                        backgroundPosition: '10%',
                    }}
                    onClick={()=>openModal(dataProfile?.coverImage||'https://mcdn.wallpapersafari.com/medium/91/45/MehDBZ.jpg')}
                >

                </div>

                <div className="flex flex-col items-center justify-center relative"
                    style={{ marginTop: "-80px", }}>
                    <img
                        className="rounded-full h-40 w-40  mb-2 "

                        alt=""
                        onClick={()=>openModal(dataProfile?.coverImage||'https://th.bing.com/th/id/OIP.PKlD9uuBX0m4S8cViqXZHAHaHa?rs=1&pid=ImgDetMain')}
                        src={`${dataProfile && dataProfile.avatar
                            ? dataProfile.avatar
                            : 'https://th.bing.com/th/id/OIP.PKlD9uuBX0m4S8cViqXZHAHaHa?rs=1&pid=ImgDetMain.png'
                            }`}
                    />
                    <h1 className="font-bold text-2xl text-center mb-2" style={{zIndex:'20px'}}>
                        {dataProfile?.lastName} {dataProfile?.firstName}
                    </h1>
                    <div className="flex gap-2 justify-center mb-5">
                        {/* {friendStatus} */}
                        {
                            loadingRequest == true ? friendStatus === "friend" ? (
                                <button
                                    onClick={() => dataProfile ? handRemoveFriend(dataProfile._id) : ''}
                                    className="bg-red-600 text-white p-2 rounded-full flex items-center gap-1"
                                >
                                    <UserMinusIcon className="size-5 fill-white" />
                                    Xóa bạn bè
                                </button>
                            ) : friendStatus === "pending" ? (
                                <button
                                    onClick={() => dataProfile ? handCancelRequest(dataProfile._id) : ''}
                                    className="bg-red-600 text-white p-2 rounded-full flex items-center gap-1"
                                >
                                    <UserMinusIcon className="size-5 fill-white" />
                                    từ chối
                                </button>
                            ) : friendStatus === "waiting" ? (
                                <button
                                    onClick={() => dataProfile ? handCancelRequest(dataProfile._id) : ''}
                                    className="bg-blue-600 text-white p-2 rounded-full flex items-center gap-1"
                                >
                                    <UserMinusIcon className="size-5 fill-white" />
                                    Hủy yêu cầu
                                </button>
                            ) : (

                                <button
                                    onClick={() => dataProfile ? handAddFriend(dataProfile._id) : ''}
                                    className="bg-sky-600 text-white p-2 rounded-full flex items-center gap-1"
                                >
                                    <UserPlusIcon className="size-5 fill-white" />
                                    Kết bạn
                                </button>
                            ) :
                                <div className='flex flex-row justify-center items-center pr-2'>
                                    <div className="spinner-border animate-spin inline-block w-4 h-4 border-4 border-sky-600 rounded-full mr-2"></div>đang xử lý...
                                </div>


                        }
                        <button
                            onClick={() => {
                                window.location.href = `/messenger/inbox/?iduser=${dataProfile._id}`;
                            }}

                            className="bg-green-600 text-white p-2 rounded-full flex items-center gap-1">
                            <ChatBubbleLeftRightIcon className="size-5" />
                            Nhắn tin
                        </button>
                        <button className="bg-red-600 text-white p-2 rounded-full flex items-center gap-1">
                            <NoSymbolIcon className="size-5" />
                            Chặn
                        </button>
                    </div>


                </div>
            </div>
        </>

    );
}

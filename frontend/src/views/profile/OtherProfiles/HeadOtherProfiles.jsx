import React, { useState, useEffect } from 'react';
import {
    UserPlusIcon,
    NoSymbolIcon,
    ChatBubbleLeftRightIcon,
    UserMinusIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from "react-router-dom";

import friend from '../../../service/friend';
import { toast } from 'react-toastify';
import NotificationCss from '../../../module/cssNotification/NotificationCss';
import { useUser } from '../../../service/UserContext';
import { useParams } from 'react-router-dom';
export default function HeadOtherProfiles({ dataProfile }) {
    const navigate = useNavigate();
    const { userContext, setShowZom } = useUser();
    const [requestFriend, setRequestFriend] = useState([]);
    const [friendStatus, setFriendStatus] = useState(null);
    const [friendList, setFriendList] = useState([]);
    const [FriendInvitation, setFriendInvitation] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingRequest, setLoadingRequest] = useState(true);
    const { id } = useParams();

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
                const result = await friend.checkFriend();
                const request = await friend.getListFriendRequest();
                const invitation = await friend.getAllFriendInvitation();
                setRequestFriend(request.data || []);
                setFriendList(result.data);
                setFriendInvitation(invitation.data || []);

                // Check if the current profile is in friend list
                if (result.data && result.data.length > 0) {
                    const isFriend = result.data.some(friendItem =>
                        (friendItem.sender && (friendItem.sender._id === id || friendItem.sender === id)) ||
                        (friendItem.receiver && (friendItem.receiver._id === id || friendItem.receiver === id))
                    );

                    if (isFriend) {
                        setFriendStatus("friend");
                    } else {
                        // Check if there's a pending request
                        const hasSentRequest = request.data && request.data.some(req => req.receiver === id);
                        setFriendStatus(hasSentRequest ? "waiting" : "no friend");
                    }
                } else {
                    setFriendStatus("no friend");
                }

                setLoading(false);
            }
        };
        fetchFriendStatus();
    }, [dataProfile, id, userContext._id, navigate, friendStatus]);
    console.log("Friend Invitation:", FriendInvitation);
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

        } catch (error) {
            console.error(error);
        }
        setLoadingRequest(true);
    };
    const handCancelRequest = async (id) => {
        setLoadingRequest(false)
        try {
            if (!id) {
                console.error("Request ID is null");
                toast.error('Không thể tìm thấy yêu cầu kết bạn', NotificationCss.Fail);
                setLoadingRequest(true);
                return;
            }

            const rs = await friend.cancelFriendRequest(id);
            if (rs.success) {
                setFriendStatus("no friend");
                // Remove the canceled request from requestFriend to update UI immediately
                setRequestFriend(prev => prev.filter(req => req._id !== id));
                toast.success(rs?.message || 'Đã hủy yêu cầu kết bạn', NotificationCss.Success);
            } else {
                toast.error(rs?.message || 'Lỗi khi hủy yêu cầu kết bạn', NotificationCss.Fail);
            }
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi hủy yêu cầu', NotificationCss.Fail);
        }
        setLoadingRequest(true);
    };

    // Check for any pending invitations from the profile being viewed
    const hasPendingInvitation = () => {
        return FriendInvitation && FriendInvitation.some(invitation =>
            invitation.sender === id || (invitation.sender && invitation.sender._id === id)
        );
    };

    // Find the invitation ID if exists
    const findInvitationId = () => {
        if (FriendInvitation && FriendInvitation.length > 0) {
            const invitation = FriendInvitation.find(inv =>
                inv.sender === id || (inv.sender && inv.sender._id === id)
            );
            return invitation ? invitation._id : null;
        }
        return null;
    };

    // Handle accepting friend request
    const handleAccept = async (id) => {
        try {
            const rs = await friend.accectRequestAddFriend(id)
            if (rs.success) {
                toast.success(rs?.data?.message ? rs.data.message : 'thêm bạn bè thành công', NotificationCss.Success);
                setFriendStatus("friend");
                // Update the FriendInvitation list
                setFriendInvitation(prev => prev.filter(inv => inv._id !== id));
            } else {
                toast.error(rs?.data?.message ? rs.data.message : 'lỗi khi đồng ý kết bạn', NotificationCss.Fail);
            }
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi chấp nhận lời mời', NotificationCss.Fail);
        }
    };

    const handDeclineFriend = async (id) => {
        try {
            const rs = await friend.declineRequestAddFriend(id)
            if (rs.success) {
                toast.success(rs?.message ? rs.message : 'Đã từ chối kết bạn', NotificationCss.Success);
                // Update the FriendInvitation list
                setFriendInvitation(prev => prev.filter(inv => inv._id !== id));
            } else {
                toast.error(rs?.message ? rs.message : 'hủy thất bại do lỗi', NotificationCss.Fail);
            }
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi từ chối lời mời', NotificationCss.Fail);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="spinner-border animate-spin inline-block w-16 h-16 border-4 border-sky-600 rounded-full"></div>
            </div>
        );
    }

    // Check if current user sent a friend request to this profile
    const isSentRequest = requestFriend && requestFriend.some(req => req.receiver === id);

    // Improved function to find the correct request ID
    const findRequestId = () => {
        if (requestFriend && requestFriend.length > 0) {
            const request = requestFriend.find(req =>
                (req.receiver === id) || (req.receiver && req.receiver._id === id)
            );
            return request ? request._id : null;
        }
        return null;
    };

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
                    onClick={() => openModal(dataProfile?.coverImage || 'https://mcdn.wallpapersafari.com/medium/91/45/MehDBZ.jpg')}
                >

                </div>

                <div className="flex flex-col items-center justify-center relative"
                    style={{ marginTop: "-80px", }}>
                    <img
                        className="rounded-full h-40 w-40  mb-2 "

                        alt=""
                        onClick={() => openModal(dataProfile?.coverImage || 'https://th.bing.com/th/id/OIP.PKlD9uuBX0m4S8cViqXZHAHaHa?rs=1&pid=ImgDetMain')}
                        src={`${dataProfile && dataProfile.avatar
                            ? dataProfile.avatar
                            : 'https://th.bing.com/th/id/OIP.PKlD9uuBX0m4S8cViqXZHAHaHa?rs=1&pid=ImgDetMain.png'
                            }`}
                    />
                    <h1 className="font-bold text-2xl text-center mb-2" style={{ zIndex: '20px' }}>
                        {dataProfile?.lastName} {dataProfile?.firstName}
                    </h1>
                    <div className="flex gap-2 justify-center mb-5">
                        {/* {friendStatus} */}
                        {
                            loadingRequest === true ? (
                                hasPendingInvitation() ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                const invitationId = findInvitationId();
                                                if (invitationId) {
                                                    handleAccept(invitationId);
                                                } else {
                                                    toast.error('Không thể tìm thấy lời mời kết bạn', NotificationCss.Fail);
                                                }
                                            }}
                                            className="bg-sky-600 text-white p-2 rounded-full flex items-center gap-1"
                                        >
                                            <CheckIcon className="size-5" />
                                            Chấp nhận
                                        </button>
                                        <button
                                            onClick={() => {
                                                const invitationId = findInvitationId();
                                                if (invitationId) {
                                                    handDeclineFriend(invitationId);
                                                } else {
                                                    toast.error('Không thể tìm thấy lời mời kết bạn', NotificationCss.Fail);
                                                }
                                            }}
                                            className="bg-red-600 text-white p-2 rounded-full flex items-center gap-1"
                                        >
                                            <XMarkIcon className="size-5" />
                                            Từ chối
                                        </button>
                                    </>
                                ) : isSentRequest || friendStatus === "waiting" ? (
                                    <button
                                        onClick={() => {
                                            const requestId = findRequestId();
                                            if (requestId) {
                                                handCancelRequest(requestId);
                                            } else {
                                                toast.error('Không thể tìm thấy yêu cầu kết bạn', NotificationCss.Fail);
                                            }
                                        }}
                                        className="bg-blue-600 text-white p-2 rounded-full flex items-center gap-1"
                                    >
                                        <UserMinusIcon className="size-5 fill-white" />
                                        Hủy lời mời
                                    </button>
                                ) : friendStatus === "friend" ? (
                                    <button
                                        onClick={() => dataProfile ? handRemoveFriend(dataProfile._id) : ''}
                                        className="bg-red-600 text-white p-2 rounded-full flex items-center gap-1"
                                    >
                                        <UserMinusIcon className="size-5 fill-white" />
                                        Hủy bạn bè
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => dataProfile ? handAddFriend(dataProfile._id) : ''}
                                        className="bg-sky-600 text-white p-2 rounded-full flex items-center gap-1"
                                    >
                                        <UserPlusIcon className="size-5 fill-white" />
                                        Kết bạn
                                    </button>
                                )
                            ) : (
                                <div className='flex flex-row justify-center items-center pr-2'>
                                    <div className="spinner-border animate-spin inline-block w-4 h-4 border-4 border-sky-600 rounded-full mr-2"></div>đang xử lý...
                                </div>
                            )
                        }
                        <button
                            onClick={() => {
                                window.location.href = `/messenger/inbox/?iduser=${dataProfile._id}`;
                            }}

                            className="bg-green-600 text-white p-2 rounded-full flex items-center gap-1">
                            <ChatBubbleLeftRightIcon className="size-5" />
                            Nhắn tin
                        </button>
                        {/* <button className="bg-red-600 text-white p-2 rounded-full flex items-center gap-1">
                            <NoSymbolIcon className="size-5" />
                            Chặn
                        </button> */}
                    </div>


                </div>
            </div>
        </>

    );
}

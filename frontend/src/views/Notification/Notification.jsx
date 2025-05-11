import { Link } from 'react-router-dom'
import { getAllNoti, getUnReadNoti, getIsReadNoti, readNoti } from '../../service/noti'
import AVTUser from '../post/AVTUser'
import { useState, useEffect } from 'react'
import { profileUserCurrent } from '../../service/ProfilePersonal'

export default function Notification({ closeDropdown }) {
    const [AllNotification, setAllNotification] = useState([])
    const [unreadNotifications, setUnreadNotifications] = useState([])
    const [readNotifications, setReadNotifications] = useState([])
    const [isLoadingAll, setIsLoadingAll] = useState(true)
    const [isLoadingUnread, setIsLoadingUnread] = useState(true)
    const [isLoadingRead, setIsLoadingRead] = useState(true)
    const [activeTab, setActiveTab] = useState("all")
    const [userCurrent, setUserCurrent] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const response = await getAllNoti()
                const user = await profileUserCurrent()
                setUserCurrent(user.data)
                if (response) {
                    setAllNotification(response)
                } else {
                    console.warn("No data found in response.")
                }
            } catch (error) {
                setError(error)
            } finally {
                setIsLoadingAll(false)
            }
        }
        fetchAllData()
    }, [])

    useEffect(() => {
        const fetchUnreadData = async () => {
            if (activeTab === "unread") {
                try {
                    const response = await getUnReadNoti()
                    if (response) {
                        setUnreadNotifications(response)
                    } else {
                        console.warn("No unread notifications found.")
                    }
                } catch (error) {
                    setError(error)
                } finally {
                    setIsLoadingUnread(false)
                }
            }
        }
        fetchUnreadData()
    }, [activeTab])

    useEffect(() => {
        const fetchReadData = async () => {
            if (activeTab === "read") {
                try {
                    const response = await getIsReadNoti()
                    if (response) {
                        setReadNotifications(response)
                    } else {
                        console.warn("No read notifications found.")
                    }
                } catch (error) {
                    setError(error)
                } finally {
                    setIsLoadingRead(false)
                }
            }
        }
        fetchReadData()
    }, [activeTab])

    //handle Read Notification
    const handleReadNotification = async (notificationId) => {
        try {
            const response = await readNoti(notificationId)
            if (response) {
                setAllNotification((prevNotifications) =>
                    prevNotifications.map((noti) =>
                        noti._id === notificationId ? { ...noti, readBy: [...(noti.readBy || []), userCurrent._id] } : noti
                    )
                )
                // Remove from unread notifications if we're on that tab
                setUnreadNotifications(prevNotifications =>
                    prevNotifications.filter(noti => noti._id !== notificationId)
                )
            }
        }
        catch (error) {
            console.error("Error reading notification:", error)
        }
    }

    // Helper function to check if notification is read by current user
    const isReadByCurrentUser = (notification) => {
        return notification.readBy && notification.readBy.includes(userCurrent?._id);
    }

    // Helper function to format the date
    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'vừa xong';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} phút trước`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} giờ trước`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} ngày trước`;
        } else {
            return date.toLocaleDateString('vi-VN');
        }
    };

    // Helper function to format user name
    const formatUserName = (owner) => {
        if (!owner) return '';
        return `${owner.firstName} ${owner.lastName}`;
    };

    return (
        <div role="tabpanel" className="tabs tabs-bordered tabs-lg grid grid-cols-1 justify-center w-full overflow-auto max-h-[80vh]">
            <input
                type="radio"
                name="my_tabs_1"
                role="tab"
                className="tab tab-bordered"
                aria-label="Tất cả"
                defaultChecked
                onClick={() => setActiveTab("all")}
            />
            <div role="tabpanel" className="tab-content p-1 md:p-3">
                <div className='flex flex-col gap-2'>
                    {isLoadingAll ? (
                        <div className="text-center py-8">
                            <p>Đang tải thông báo...</p>
                        </div>
                    ) : AllNotification.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>Chưa có thông báo nào</p>
                        </div>
                    ) : (
                        AllNotification.map((noti) => (
                            noti.isRead ? (
                                <Link
                                    to={`/post/${noti.data.postId}`}
                                    key={noti._id}
                                    className='block w-full p-2 md:p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-blue-400 bg-white'
                                    onClick={closeDropdown}
                                >
                                    <div className='w-full'>
                                        <div className='flex flex-wrap justify-between items-start gap-1 mb-1'>
                                            <div className='grid min-w-0'>
                                                <span className='font-semibold text-blue-600'>{formatUserName(noti.ownerId)}</span>
                                                <span className='text-gray-700'> {noti.data.message}</span>
                                            </div>
                                            <span className='text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium shrink-0'>Đã đọc</span>
                                        </div>
                                        <div className='text-xs text-gray-500 text-right mt-1'>
                                            {formatTimeAgo(noti.createdAt)}
                                        </div>
                                    </div>
                                </Link>
                            ) : (
                                <Link
                                    to={`/post/${noti.data.postId}`}
                                    key={noti._id}
                                    className='block w-full p-2 md:p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-gray-400 bg-white'
                                    onClick={() => {
                                        handleReadNotification(noti._id);
                                        closeDropdown();
                                    }}
                                >
                                    <div className='w-full'>
                                        <div className='flex flex-wrap justify-between items-start gap-1 mb-1'>
                                            <div className='grid min-w-0'>
                                                <span className='font-semibold text-gray-700'>{formatUserName(noti.ownerId)}</span>
                                                <span className='text-gray-700'> {noti.data.message}</span>
                                            </div>
                                            <span className='text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium shrink-0'>Chưa đọc</span>
                                        </div>
                                        <div className='text-xs text-gray-500 text-right mt-1'>
                                            {formatTimeAgo(noti.createdAt)}
                                        </div>
                                    </div>
                                </Link>
                            )
                        ))
                    )}
                </div>
            </div>

            <input
                type="radio"
                name="my_tabs_1"
                role="tab"
                className="tab tab-bordered"
                aria-label="Chưa đọc"
                onClick={() => setActiveTab("unread")}
            />
            <div role="tablist" className="tab-content p-1 md:p-3">
                <div className='flex flex-col gap-2'>
                    {isLoadingUnread && activeTab === "unread" ? (
                        <div className="text-center py-8">
                            <p>Đang tải thông báo chưa đọc...</p>
                        </div>
                    ) : activeTab === "unread" && unreadNotifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>Chưa có thông báo nào chưa đọc</p>
                        </div>
                    ) : activeTab === "unread" && (
                        unreadNotifications.map((noti) => (
                            <Link
                                to={`/post/${noti.data.postId}`}
                                key={noti._id}
                                className='block w-full p-2 md:p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-gray-400 bg-white'
                                onClick={() => {
                                    handleReadNotification(noti._id);
                                    closeDropdown();
                                }}
                            >
                                <div className='w-full'>
                                    <div className='flex flex-wrap justify-between items-start gap-1 mb-1'>
                                        <div className='grid min-w-0'>
                                            <span className='font-semibold text-gray-700'>{formatUserName(noti.ownerId)}</span>
                                            <span className='text-gray-700'> {noti.data.message}</span>
                                        </div>
                                        <span className='text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium shrink-0'>Chưa đọc</span>
                                    </div>
                                    <div className='text-xs text-gray-500 text-right mt-1'>
                                        {formatTimeAgo(noti.createdAt)}
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            <input
                type="radio"
                name="my_tabs_1"
                role="tab"
                className="tab tab-bordered"
                aria-label="Đã đọc"
                onClick={() => setActiveTab("read")}
            />
            <div role="tabpanel" className="tab-content p-1 md:p-3">
                <div className='flex flex-col gap-2'>
                    {isLoadingRead && activeTab === "read" ? (
                        <div className="text-center py-8">
                            <p>Đang tải thông báo đã đọc...</p>
                        </div>
                    ) : activeTab === "read" && readNotifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>Chưa có thông báo nào đã đọc</p>
                        </div>
                    ) : activeTab === "read" && (
                        readNotifications.map((noti) => (
                            <Link
                                to={`/post/${noti.data.postId}`}
                                key={noti._id}
                                className='block w-full p-2 md:p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-blue-400 bg-white'
                                onClick={closeDropdown}
                            >
                                <div className='w-full'>
                                    <div className='flex flex-wrap justify-between items-start gap-1 mb-1'>
                                        <div className='grid min-w-0'>
                                            <span className='font-semibold text-blue-600'>{formatUserName(noti.ownerId)}</span>
                                            <span className='text-gray-700'> {noti.data.message}</span>
                                        </div>
                                        <span className='text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium shrink-0'>Đã đọc</span>
                                    </div>
                                    <div className='text-xs text-gray-500 text-right mt-1'>
                                        {formatTimeAgo(noti.createdAt)}
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
import React, { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading';
import friend from '../../service/friend';
import NotificationCss from '../../module/cssNotification/NotificationCss';

const ButtonStatus = ({ _id, status }) => {
    const [sending, setSending] = useState(true);
    const [currentStatus, setCurrentStatus] = useState(status);

    // Add friend functionality
    const handleAddFriend = useCallback(async (id) => {
        setSending(false);
        try {
            const response = await friend.AddFriend(id);
            if (response.success) {
                setCurrentStatus('waiting');
                toast.success(response.message || 'Friend request sent successfully', NotificationCss.Success);
            } else {
                toast.error(response.message || 'Failed to send friend request', NotificationCss.Fail);
            }
        } catch (error) {
            console.error('Error adding friend:', error);
            toast.error('Unexpected error occurred', NotificationCss.Fail);
        } finally {
            setSending(true);
        }
    }, []);

    // Cancel friendship
    const handleCancelFriendship = useCallback(async (id) => {
        setSending(false);
        try {
            const response = await friend.cancelFriend(id);
            if (response.success) {
                setCurrentStatus('no friend');
                toast.success(response.message || 'Friendship canceled successfully', NotificationCss.Success);
            } else {
                toast.error(response.message || 'Failed to cancel friendship', NotificationCss.Fail);
            }
        } catch (error) {
            console.error('Error canceling friendship:', error);
            toast.error('Unexpected error occurred', NotificationCss.Fail);
        } finally {
            setSending(true);
        }
    }, []);

    // Cancel friend request
    const handleCancelRequest = useCallback(async (id) => {
        setSending(false);
        try {
            const response = await friend.cancelFriendRequest(id);
            if (response) {
                setCurrentStatus('no friend');
                toast.success(response.message || 'Friend request canceled successfully', NotificationCss.Success);
            } else {
                toast.error(response.message || 'Failed to cancel friend request', NotificationCss.Fail);
            }
        } catch (error) {
            console.error('Error canceling friend request:', error);
            toast.error('Unexpected error occurred', NotificationCss.Fail);
        } finally {
            setSending(true);
        }
    }, []);

    const handleClick = (e) => {
        e.stopPropagation();
        if (!_id || !currentStatus) return;

        switch (currentStatus) {
            case 'no friend':
                handleAddFriend(_id);
                break;
            case 'friend':
                handleCancelFriendship(_id);
                break;
            default:
                handleCancelRequest(_id);
                break;
        }
    };

    return (
        <div className="py-5">
            {sending ? (
                <button
                    onClick={handleClick}
                    className={`rounded-xl p-2 min-w-24 shadow-sm shadow-gray-300 ${
                        currentStatus === 'friend'
                            ? 'hover:text-red-600 text-red-500 hover:bg-red-200 bg-red-100'
                            : 'hover:text-blue-600 text-blue-500 hover:bg-blue-200 bg-blue-100'
                    }`}
                >
                    <strong className="text-sm">
                        {currentStatus === 'no friend'
                            ? 'Add Friend'
                            : currentStatus === 'friend'
                            ? 'Cancel Friend'
                            : 'Cancel Request'}
                    </strong>
                </button>
            ) : (
                <Loading />
            )}
        </div>
    );
};

export default ButtonStatus;

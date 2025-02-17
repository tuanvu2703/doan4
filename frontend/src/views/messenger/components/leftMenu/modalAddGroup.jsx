import React, { useState, useEffect } from 'react';
import Files from '../rightMenu/component/files';
import PictureAndVideo from '../rightMenu/component/pictureAndVideo';
import { UserGroupIcon, PlusIcon } from '@heroicons/react/24/solid';
import { Box, IconButton, Modal, Button, Checkbox } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { PhotoIcon } from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import friend from '../../../../service/friend';
import Loading from '../../../../components/Loading';
import UserFriendCard from './userFriendCard';
import CardFriendAddGroup from '../rightMenu/component/cardFriendAddGroup';
import group from '../../../../service/group';
import { useNavigate } from "react-router-dom";

import { toast } from 'react-toastify';
import NotificationCss from '../../../../module/cssNotification/NotificationCss';

const ModalAddGroup = ({ openModal, setOpenModal }) => {
    const [selectedFriends, setSelectedFriends] = useState([]); // Selected friends list
    const [searchTerm, setSearchTerm] = useState("");
    const [friends, setFriends] = useState([]); // Friends data
    const [loading, setLoading] = useState(true);
    const [sendingAddGroup, setSendingAddGroup] = useState(true);
    const navigate = useNavigate();
    const toggleFriendSelection = (friendId) => {
        setSelectedFriends((prevSelected) =>
            prevSelected.includes(friendId)
                ? prevSelected.filter((id) => id !== friendId) // Remove if selected
                : [...prevSelected, friendId] // Add if not selected
        );
    };

    const handleCloseModal = () => {
        setOpenModal(); // Close modal
    };

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value); // Update search term
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await friend.getListMyFriend();
                if (res.success) {
                    setFriends(res.data);
                } else {
                    setFriends([]);
                }
            } catch (error) {
                console.error("Error fetching friend list:", error);
                setFriends([]);
            } finally {
                setLoading(false); // Stop loading
            }
        };
        fetchData();
    }, []);

    // Function to remove friend from selected list
    const removeFriendFromSelection = (friendId) => {
        setSelectedFriends((prevSelected) =>
            prevSelected.filter((id) => id !== friendId)
        );
    };

    // Filter friends based on search term
    const filteredFriends = friends.filter((friend) => {
        const friendName = friend.receiver
            ? `${friend.receiver.firstName} ${friend.receiver.lastName}`
            : friend.sender
                ? `${friend.sender.firstName} ${friend.sender.lastName}`
                : '';
        return friendName.toLowerCase().includes(searchTerm.toLowerCase());
    });
    const handCreateGroup = async () => {
        if (!selectedFriends.length) {
            return toast.error("Vui lòng chọn thành viên cho nhóm", NotificationCss.Fail);
        }

        try {
            const groupName = document.querySelector("input[placeholder='Nhập tên nhóm']").value;
            if (!groupName.trim()) {
                return toast.error("Tên nhóm không được để trống", NotificationCss.Fail);
            }
            setSendingAddGroup(false)
            const response = await group.createGroup(groupName, selectedFriends);
            if (response.success) {
                console.log(response.data._id)
                const res = await group.sendMessGroup(response.data._id, 'Chào mừng', '');
                toast.success(response.data.message || "Nhóm được tạo thành công", NotificationCss.Success);
                setOpenModal();
                setSelectedFriends([]); // Clear selection
                navigate(`/messenger/group/?idgroup=${response.data._id}`);
                window.location.reload();
                setSendingAddGroup(true)
            } else {
                setSendingAddGroup(true)
                toast.error(response.data || "Không tạo được nhóm", NotificationCss.Fail);
            }
        } catch (error) {
            setSendingAddGroup(true)
            console.error("Group creation error:", error);
            toast.error("Đã xảy ra lỗi không mong muốn", NotificationCss.Fail);
        }
        setSendingAddGroup(true)
    };

    return (
        <>
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
            >
                <Box
                    sx={{
                        minWidth: '500px',
                        maxHeight: '90vh', // Ensure modal fits within the viewport
                        position: 'relative',
                        backgroundColor: 'white',
                        padding: 0.4,
                        borderRadius: 1,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* Modal Header */}
                    <div>
                        <IconButton
                            onClick={handleCloseModal}
                            sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                            }}
                        >
                            <CloseIcon color="error" />
                        </IconButton>
                        <div className="w-full border-b-2 p-2">
                            <strong>Tạo nhóm</strong>
                        </div>
                        {/* Search Input */}
                        <div className="w-[96%] ml-[2%] flex justify-center items-center">
                            <div className="w-full border-b-2 p-3 flex flex-col items-center">
                                <div className="w-full flex flex-row mb-2">
                                    <label htmlFor="file-input" className="mr-1">
                                        <IconButton component="span">
                                            <PhotoIcon className="size-7 fill-sky-600" />
                                        </IconButton>
                                    </label>
                                    <input
                                        className="outline-none w-full border-b border-b-gray-500"
                                        placeholder="Nhập tên nhóm"
                                    />
                                </div>
                                <div className="relative flex justify-center w-full">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={handleInputChange}
                                        className="w-full rounded-3xl border border-gray-300 pr-8 pl-9 py-2 text-black bg-white focus:outline-none"
                                        placeholder="Tìm kiếm..."
                                    />
                                    <a className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <MagnifyingGlassIcon className="h-4 w-4 fill-black" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex justify-between">
                        {/* Friends List */}
                        <div className="flex-grow px-2 py-4 custom-scroll" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {loading ? (
                                <Loading />
                            ) : (
                                filteredFriends.length > 0 ?
                                    filteredFriends.map((friend, index) => (
                                        <div key={index} className="flex items-center mb-2 justify-center">
                                            <div className="hover:bg-gray-200 px-2 rounded-md shadow-sm w-full">
                                                <button className="flex items-center py-2 w-full">
                                                    <Checkbox
                                                        checked={selectedFriends.includes(friend.receiver?._id || friend.sender?._id)}
                                                        onChange={() =>
                                                            toggleFriendSelection(friend.receiver?._id || friend.sender?._id)
                                                        }
                                                    />
                                                    {friend.receiver && friend.receiver._id ? (
                                                        <CardFriendAddGroup iduser={friend.receiver._id} />
                                                    ) : friend.sender && friend.sender._id ? (
                                                        <CardFriendAddGroup iduser={friend.sender._id} />
                                                    ) : null}
                                                </button>
                                            </div>
                                        </div>
                                    )) : 'Không có bạn bè nào'
                            )}
                        </div>

                        {/* Selected Friends List */}
                        {selectedFriends.length > 0 && (
                            <div className="flex-grow px-2 py-4 custom-scroll border-l" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {selectedFriends.map((friendId) => {
                                    const selectedFriend = friends.find((friend) => friend.id === friendId);
                                    return (
                                        <div key={friendId} className="flex items-center mb-2 justify-center relative">
                                            <CardFriendAddGroup iduser={friendId} />
                                            <button
                                                onClick={() => removeFriendFromSelection(friendId)}
                                                className="absolute top-0 right-0 p-1 text-red-500"
                                            >
                                                <XMarkIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {
                        sendingAddGroup == true ?
                            <div className="w-full border-t-2 p-2 flex justify-end">
                                <button
                                    onClick={handleCloseModal}
                                    className="bg-gray-300 mr-2 w-24 p-2 rounded-lg text-black">Hủy</button>
                                <button
                                    onClick={() => { handCreateGroup() }}
                                    className="bg-blue-500 w-24 p-2 rounded-lg text-white">Tạo nhóm</button>
                            </div>
                            :
                            <div className='flex flex-row justify-center items-center pr-2'>
                                <div className="spinner-border animate-spin inline-block w-4 h-4 border-4 border-sky-600 rounded-full mr-2"></div>đang xử lý...
                            </div>
                    }

                </Box>
            </Modal>
        </>

    );
};

export default ModalAddGroup;
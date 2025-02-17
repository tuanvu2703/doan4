import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/16/solid';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import imgUser from '../../../img/user.png';
import user from '../../../service/user';
import messenger from '../../../service/messenger';
import { useUser } from '../../../service/UserContext';
import { format } from 'date-fns';
import useWebSocket from './usewebsocket';
import Loading from '../../../components/Loading';
import { Button, Typography, Box, IconButton, Modal } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { PhotoIcon } from '@heroicons/react/24/solid';

const MessengerInbox = () => {
    const { userContext } = useUser();
    const location = useLocation();

    const [textareaHeight, setTextareaHeight] = useState(40);
    const [iduser, setIdUser] = useState(null);
    const [userdata, setUserdata] = useState({});
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false); // Added sending state
    const [message, setMessage] = useState('');
    const [messengerdata, setMessengerdata] = useState([]);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    //file
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [openModal, setOpenModal] = useState(false); // Trạng thái modal
    const [modalImage, setModalImage] = useState(null); // Ảnh phóng to

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messengerdata]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const userId = queryParams.get('iduser');
        setIdUser(userId);
    }, [location.search]);

    useEffect(() => {
        if (!iduser || iduser === '') {
            setError('User ID is missing or invalid.');
            setLoading(false);
            return;
        }
        const fetchUserData = async () => {
            try {
                const res = await user.getProfileUser(iduser);
                if (res.success) {
                    setUserdata(res.data);
                } else {
                    setError('User does not exist.');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('An error occurred while fetching user data.');
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [iduser]);
    //file
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile)); // Tạo URL preview cho ảnh
        }
    };
    const handleRemoveFile = () => {
        setFile(null);
        setPreview(null);
    };
    const handleOpenModal = (img) => {
        if (!img) {
            setModalImage(preview); // Đặt ảnh vào modal
        } else {
            setModalImage(img);
        }
        setOpenModal(true); // Mở modal
    };

    const handleCloseModal = () => {
        setOpenModal(false); // Đóng modal
    };

    useEffect(() => {
        if (iduser === '' || !iduser) return;
        const fetchMessengerData = async () => {
            try {
                const res = await messenger.getListMessengerByUser(iduser);
                if (res.success) {
                    setMessengerdata(res.data);
                }
            } catch (error) {
                console.error('Error fetching messenger data:', error);
            }
        };
        fetchMessengerData();
    }, [iduser]);

    const onMessageReceived = useCallback(
        (newMessage) => {
            if (!newMessage.receiver) {
                newMessage.receiver = userContext._id;
            }
            if (!newMessage.createdAt) {
                newMessage.createdAt = new Date().toISOString();
            }

            if (newMessage.receiver === userContext._id && newMessage.sender !== userContext._id) {
                setMessengerdata((prevMessages) => [...prevMessages, newMessage]);
            }
        },
        [userContext._id]
    );

    useWebSocket(onMessageReceived);

    const handleInputChange = useCallback((e) => {
        const textarea = e.target;
        const currentValue = textarea.value;

        setMessage(currentValue);

        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
        setTextareaHeight(textarea.scrollHeight);
    }, []);

    const handleSendMessenger = useCallback(async () => {
        if (!message.trim() || sending) return; // Prevent sending if already in progress

        setSending(true); // Set sending state
        try {
            const res = await messenger.sendMess(iduser, message.trim(), file);

            if (res.success) {
                setMessage('');
                setFile(null);
                setPreview(null);
                setTextareaHeight(40);
            } else {
                alert(res.data.message);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false); // Reset sending state
        }
    }, [iduser, message, sending, file]);

    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessenger();
            }
        },
        [handleSendMessenger]
    );

    if (loading) {
        return <Loading />;
    }
    if (!iduser) {
        return <div className="text-red-500 text-center mt-4">{error}</div>;
    }

    const groupedMessages = messengerdata.reduce((acc, message) => {
        const createdAtDate = new Date(message.createdAt);
        if (isNaN(createdAtDate)) {
            console.error('Invalid date value:', message.createdAt);
            return acc;
        }

        const date = format(createdAtDate, 'yyyy-MM-dd');
        if (!acc[date]) acc[date] = [];
        acc[date].push(message);
        return acc;
    }, {});
    console.log(groupedMessages)
    return (
        <div className="flex flex-col h-full w-full">
            <div className="p-2 flex items-center border-b h-14 bg-white shadow-sm">
                <button onClick={() => window.location.href = `/user/${userdata?._id}`}>
                    <img
                        className="w-10 h-10 rounded-full mr-2"
                        src={userdata?.avatar || imgUser}
                        alt="User Avatar"
                    />
                </button>
                <h3 className="font-semibold">{`${userdata.lastName || ''} ${userdata.firstName || ''}`.trim()}</h3>
            </div>


            <div className='overflow-y-scroll p-4 pt-1 h-full'>
                {Object.keys(groupedMessages).map((date) => (
                    <div key={date} className=" h-full">
                        <div className="mb-4 pb-2 px-3"> 
                            <div className="text-center text-gray-500 text-sm my-2">
                                {format(new Date(date), 'MMMM dd, yyyy')}
                            </div>
                            {groupedMessages[date].map((mess, index) => (
                                <React.Fragment key={`${mess._id}-${index}`}>

                                    <div className={`flex w-full ${mess?.author?._id === mess?.receiver
                                        ? 'justify-end'
                                        : mess.receiver === userContext._id
                                            ? ''
                                            : 'justify-end'}`}>
                                        <div className=''>
                                            <div
                                                className={clsx(
                                                    'rounded-lg shadow-md shadow-slate-300 pb-2 border min-w-28 min-h-11 my-2',
                                                    mess?.author?._id === mess?.receiver
                                                        ? 'bg-blue-100 ml-24 '
                                                        : mess.receiver === userContext._id
                                                            ? 'bg-white mr-24 '
                                                            : 'bg-blue-100 ml-24 '
                                                )}
                                            >
                                                {mess?.mediaURL?.length > 0 && mess.mediaURL.map((img, imgIndex) => (
                                                    <div key={imgIndex} className='w-full bg-white flex justify-center'>
                                                        <img
                                                            onClick={() => handleOpenModal(img)}
                                                            src={img} alt={`Message Media ${imgIndex}`} className="max-w-full max-h-72 object-cover rounded-t-lg" />
                                                    </div>
                                                ))}
                                                <p className="text-black p-2">{mess.content}</p>
                                                <p className="text-xs text-gray-400 text-left pl-2">
                                                    {format(new Date(mess.createdAt), 'hh:mm a')}
                                                </p>
                                            </div>
                                        </div>

                                    </div>
                                    {
                                        groupedMessages[date].length == index + 1 ? <div ref={messagesEndRef} /> : ''
                                    }
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="w-full flex p-2 border-t-2 border-gray-200 bottom-0 flex-col">

                <div className='w-full'>
                    {
                        preview &&
                        <Box sx={{ position: 'relative', display: 'inline-block' }}>
                            <img
                                src={preview}
                                alt="Preview"
                                style={{
                                    maxWidth: '200px',
                                    maxHeight: '60px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                }}
                                onClick={() => handleOpenModal('')} // Mở modal khi click vào ảnh
                            />
                            {/* Nút xóa file */}
                            <IconButton
                                onClick={handleRemoveFile}
                                key={file.id}
                                sx={{
                                    position: 'absolute',
                                    top: 1,
                                    right: 1,
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                                }}
                            >
                                <CloseIcon color="error" />
                            </IconButton>
                        </Box>
                    }
                </div>
                {sending ? (
                    <div className='flex items-center gap-2 justify-center text-blue-500 text-xl uppercase'>
                        <span className="loading loading-spinner loading-md"></span>
                        <strong>Đang gửi tin nhắn <span className="dots">...</span></strong>
                    </div>
                ) :
                    <>
                        <div className='flex items-center w-full'>
                            <label htmlFor="file-input" className='mr-1'>
                                <IconButton component="span">
                                    <PhotoIcon className="size-7 fill-sky-600" />
                                </IconButton>
                            </label>
                            <input
                                type="file"
                                id="file-input"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                                accept="image/*" // Chỉ nhận file ảnh
                            />
                            <textarea
                                className="rounded-lg border p-2 w-full resize-none text-sm  shadow-inner shadow-gray-400 focus:outline-none"
                                rows={1}
                                style={{ height: `${textareaHeight}px`, maxHeight: '5rem', minHeight: '40px' }}
                                placeholder="Nhập @, tin nhắn"
                                value={message}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                            />
                            <button onClick={handleSendMessenger} className="ml-2" disabled={sending}>
                                <PaperAirplaneIcon className="h-8 w-8 fill-sky-500" />
                            </button>

                        </div>

                    </>
                }
                {/* Modal phóng to ảnh */}
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
                    <Box sx={{ position: 'relative', backgroundColor: 'black', padding: 0.4, borderRadius: 2 }}>
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
                        <img
                            className=''
                            src={modalImage}
                            alt="Modal Preview"
                            style={{
                                maxWidth: '90vw',
                                maxHeight: '90vh',
                                borderRadius: '8px',
                            }}
                        />
                    </Box>
                </Modal>
            </div>

        </div >
    );
};

export default MessengerInbox;
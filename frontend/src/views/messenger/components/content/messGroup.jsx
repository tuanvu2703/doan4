import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { toast } from 'react-toastify';

import { PaperAirplaneIcon, ArrowDownIcon } from '@heroicons/react/16/solid';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Box, IconButton } from '@mui/material';
import { ChevronRightIcon, ChevronLeftIcon, ArrowUturnLeftIcon, PhotoIcon } from "@heroicons/react/24/solid";
import CloseIcon from '@mui/icons-material/Close';


import imgUser from '../../../../img/user.png';
import messenger from '../../../../service/messenger';
import { useUser } from '../../../../service/UserContext';
import { format } from 'date-fns';
import Loading from '../../../../components/Loading';
import { MessengerContext } from '../../layoutMessenger';
import NotificationCss from '../../../../module/cssNotification/NotificationCss';
import group from '../../../../service/group';
import { io } from 'socket.io-client';
import authToken from '../../../../components/authToken';
import FileViewChane from '../../../../components/fileViewChane';


const MessengerInbox = () => {
    const { userContext } = useUser();
    const { RightShow, handleHiddenRight, setContent, setInboxData } = useContext(MessengerContext);
    const location = useLocation();
    const [textareaHeight, setTextareaHeight] = useState(40);
    const [idGroup, setIdgroup] = useState(null);
    // const [userdata, setUserdata] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingHeader, setLoadingHeader] = useState(true);
    const [loadingMess, setLoadingMess] = useState(true);
    const [noRoll, setNoRoll] = useState(false);
    const [sending, setSending] = useState(false); // Added sending state
    const [message, setMessage] = useState('');
    const [messengerdata, setMessengerdata] = useState([]);
    const [dataGroup, setDataGroup] = useState([]);
    const messagesEndRef = useRef(null);
    const [socket, setSocket] = useState(null);



    //file
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [previewFull, setPreviewFull] = useState(null);
    const [token, setToken] = useState(null);
    const { setShowZom } = useUser();
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        setIdgroup(queryParams.get('idgroup'));
        setDataGroup([])
        setLoadingMess(false)
    }, [location]);
    const openModal = (file) => {
        setShowZom({ file: file, show: true });
    };
    const [openDialog, setOpenDialog] = useState(false); // For controlling the confirmation dialog
    const [messageToRevoke, setMessageToRevoke] = useState(null); // Store message to be revoked

    const [hoveredMessageId, setHoveredMessageId] = useState(null);


    const handleRevokedClick = async (messageId) => {
        setMessageToRevoke(messageId); // Store the message ID to revoke
        setOpenDialog(true); // Open the confirmation dialog
    };

    const confirmRevokeMessage = async () => {
        if (!messageToRevoke) return; // Ensure there's a valid message to revoke
        try {
            const res = await messenger.revokedMesage(messageToRevoke); // API call to revoke the message
            if (res.success) {
                setMessengerdata((prevMessages) =>
                    prevMessages.map((message) =>
                        message._id === messageToRevoke ? { ...message, content: null, mediaURL: null } : message
                    )
                );
                toast.success(res?.message || 'Bạn vừa thu hồi tin nhắn thành công', NotificationCss.Success);
            } else {
                console.log("Failed to revoke message:", res);
                toast.error(res?.message || 'Lỗi khi thu hồi tin nhắn', NotificationCss.Fail);
            }
        } catch (error) {
            console.log("Error revoking message:", error);
        } finally {
            setOpenDialog(false); // Close the dialog
            setMessageToRevoke(null); // Clear the message ID
        }
    };
    useEffect(() => {
        setToken(authToken.getToken())
    }, [authToken.getToken()]);
    const cancelRevokeMessage = () => {
        setOpenDialog(false); // Close the dialog
        setMessageToRevoke(null); // Clear the message ID
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewFull(selectedFile); // Tạo URL preview cho ảnh
            setPreview(URL.createObjectURL(selectedFile)); // Tạo URL preview cho ảnh
        }
    };
    const handleRemoveFile = () => {
        setFile(null);
        setPreview(null);
        setPreviewFull(null)
    };

    useEffect(() => {
        if (idGroup === '' || !idGroup) return;
        const fetchMessengerData = async () => {
            try {
                const res = await group.getMessengerGroup(idGroup);
                if (res.success) {
                    setMessengerdata(res.data.messages);
                    setDataGroup(res.data)
                    // console.log(res.data.messages)
                }
            } catch (error) {
                console.log('Error fetching messenger data:', error);
            }
        };
        fetchMessengerData();
        setContent('group');
        setLoading(false);

        setTimeout(() => {
            setLoadingHeader(false)
            setLoadingMess(true);
        }, 1000);
    }, [idGroup]);


    useEffect(() => {

        // Kiểm tra và xử lý điều kiện bên trong hook
        if (!messengerdata || Object.keys(messengerdata).length === 0) {
            return; // Không làm gì nếu `groupedMessages` không hợp lệ
        }

        // Cập nhật dữ liệu nếu `groupedMessages` tồn tại
        const inboxUpdate = {
            data: dataGroup,
            messenger: messengerdata,
        };

        setInboxData(inboxUpdate);
    }, [messengerdata, dataGroup, setInboxData]);




    const handleInputChange = useCallback((e) => {
        const textarea = e.target;
        const currentValue = textarea.value;

        setMessage(currentValue);

        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
        setTextareaHeight(textarea.scrollHeight);
    }, []);
    const onMessageReceived = useCallback(
        (newMessage) => {
            console.log(newMessage.forGroup)
            console.log(idGroup)
            if (newMessage.forGroup == idGroup) {
                if (!newMessage.receiver) {
                    newMessage.receiver = userContext._id;
                }
                if (!newMessage.createdAt) {
                    newMessage.createdAt = new Date().toISOString();
                }

                // Modified condition to check if message already exists by its ID
                setMessengerdata((prevMessages) => {
                    // Check if the message already exists to prevent duplicates
                    const messageExists = prevMessages.some(msg => msg._id === newMessage._id);
                    if (!messageExists) {
                        return [...prevMessages, newMessage];
                    }
                    return prevMessages;
                });
            }
        },
        [userContext._id, socket, idGroup]
    );
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' }); // Cuộn đến tin nhắn cuối
        }
    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            scrollToBottom(); // Tự động cuộn mỗi khi dữ liệu tin nhắn thay đổi
        }, 500); // Delay of 1 second (1000ms)

        return () => clearTimeout(timeout); // Cleanup the timeout on unmount or before the next invocation
    }, [messengerdata]);

    // useWebSocket(onMessageReceived);

    const handleSendMessenger = useCallback(async () => {
        if ((!message.trim() && !file) || sending) return;

        setSending(true);
        try {
            const res = await group.sendMessGroup(idGroup, message.trim(), file);
            if (res.success) {
                // If response contains the new message, add it immediately to prevent duplicates
                if (res.data && res.data.message) {
                    setMessengerdata(prevMessages => [...prevMessages, res.data.message]);
                }

                setMessage("");
                setFile(null);
                setPreview(null);
                setTextareaHeight(40);
            } else {
                alert(res.message || 'Failed to send message');
            }
            // socket.emit("sendMessage", { idGroup, content: message.trim() });
        } catch (error) {
            console.log("Error sending message:", error);
        } finally {
            setSending(false);
        }
    }, [idGroup, message, sending, file]);


    useEffect(() => {
        if (idGroup && token) {
            const URL = process.env.REACT_APP_API_SOCKET_URL
            const socketConnection = io(URL, {
                extraHeaders: {
                    Authorization: `Bearer ${authToken.getToken()}`,
                },
            });
            // socketConnection.on("connect", () => {
            // console.log("Connected to WebSocket with ID:", socketConnection.id);
            socketConnection.emit("joinGroup", idGroup);
            // console.log("Connected to WebSocket Group with ID:", idGroup);
            // });

            socketConnection.on("newmessagetogroup", (data) => {
                onMessageReceived(data);
            });
            // setSocket(socketConnection);
            return () => {
                socketConnection.off("newmessagetogroup");
                socketConnection.disconnect();
            };
        }
    }, [idGroup, token]);


    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessenger();
            }
        },
        [handleSendMessenger]
    );
    if (!idGroup || idGroup.length < 1) {
        return <div className="text-red-500 text-center mt-4"></div>;//{error}
    }
    if (loading) {
        return <Loading />;
    }
    const groupedMessages = messengerdata.reduce((acc, message) => {
        try {
            const createdAtDate = new Date(message.createdAt);
            if (isNaN(createdAtDate)) {
                // console.warn('Invalid date:', message.createdAt);

                return acc; // Skip invalid dates
            }

            const dateKey = format(createdAtDate, 'yyyy-MM-dd');
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(message);
        } catch (error) {
            console.log('Error grouping message:', error);
        }
        return acc;
    }, {});

    return (
        <div className="flex flex-col h-full ">
            <div className="p-2 flex border-b h-14 bg-white shadow-sm">
                {
                    loadingHeader === true ? (
                        <div className='w-full flex flex-row items-center'>
                            <Loading />
                        </div>
                    ) : (
                        <div className='w-full flex flex-row items-center'>
                            <button >
                                {/* onClick={() => window.location.href = `/user/${userdata?._id}`} */}
                                <img
                                    className="w-10 h-10 rounded-full mr-2"
                                    src={dataGroup?.group?.avatarGroup[0] || imgUser}
                                    alt="User Avatar"
                                />
                            </button>
                            <h3 className="font-semibold text-nowrap max-w-sm overflow-hidden text-ellipsis flex items-center justify-center">
                                {dataGroup?.group?.name ? dataGroup?.group?.name : <Loading />}
                            </h3>
                        </div>
                    )




                }

                <div className=" flex justify-end">
                    <button onClick={handleHiddenRight} >
                        {
                            RightShow ? <ChevronRightIcon className="h-8 w-8 text-gray-700" />
                                :
                                <ChevronLeftIcon className="h-8 w-8 text-gray-700" />
                        }
                    </button>
                </div>
            </div>

            <div className="overflow-y-scroll h-full p-4 pt-1 bg-gray-100">

                {
                    loadingMess === false ?
                        <span className="loading loading-spinner loading-lg">Đang tải tin nhắn</span>
                        :
                        Object.entries(groupedMessages).map(([date, messages]) => (
                            <div key={date} className="mb-4">
                                <div className="text-center text-gray-500 text-sm my-2">
                                    {format(new Date(date), 'MMMM dd, yyyy')}
                                </div>
                                {messages.map((message, index) => (
                                    <div
                                        // ref={
                                        //     index === messages.length - 1
                                        //         ? messagesEndRef
                                        //         : null
                                        // }
                                        key={message?._id}
                                        className={`flex ${message?.sender?._id === userContext._id ? 'justify-end' : ''} `}

                                        onMouseEnter={() => {
                                            if (message?.sender?._id === userContext._id

                                            ) {
                                                setHoveredMessageId(message._id);
                                            }
                                        }} // Set the hovered message
                                        onMouseLeave={() => setHoveredMessageId(null)} // Clear the hovered message
                                    >
                                        {
                                            hoveredMessageId === message?._id && message?.sender?._id === userContext._id ?
                                                <div>
                                                    <div className='h-full justify-center flex p-2 items-center'>
                                                        <button onClick={() => handleRevokedClick(message._id)}>
                                                            <ArrowUturnLeftIcon className="h-6 w-7 text-gray-500 bg-gray-100 rounded-sm " />
                                                        </button>
                                                    </div>
                                                </div>
                                                : ''
                                        }
                                        {
                                            message?.sender?._id !== userContext._id ?
                                                <div className='h-full pt-2'>
                                                    <button onClick={() => window.location.href = `/user/${message?.sender?._id}`}>
                                                        <img
                                                            className="w-10 h-10 rounded-full mr-2"
                                                            src={message?.sender?.avatar || imgUser}
                                                            alt="User Avatar"
                                                        />
                                                    </button>
                                                </div>
                                                : ''
                                        }


                                        <div

                                            className={clsx(
                                                'rounded-lg shadow-md p-2 my-2 min-w-28',
                                                message?.sender?._id === userContext._id ? 'bg-blue-100' : 'bg-white'
                                            )}
                                        >

                                            {message?.sender?._id !== userContext._id ?
                                                <p className="text-xs text-gray-400 mb-2 font-semibold text-nowrap overflow-hidden text-ellipsis max-w-52">
                                                    {message?.sender?.lastName}
                                                    {message?.sender?.firstName}
                                                </p>
                                                : ''}
                                            {message?.mediaURL?.length > 0 && message.mediaURL.map((url, idx) => {
                                                const isVideo = url.endsWith(".mp4"); // Check if the URL ends with '.mp4'
                                                return isVideo ? (
                                                    <video
                                                        key={idx}
                                                        controls
                                                        className="max-w-full max-h-72 rounded-t-lg"
                                                    >
                                                        <source src={url} type="video/mp4" />
                                                        Your browser does not support the video tag.
                                                    </video>
                                                ) : (
                                                    <img
                                                        key={idx}
                                                        src={url}
                                                        alt="Media"
                                                        className="max-w-full max-h-72 object-cover rounded-t-lg"
                                                        onClick={() => {
                                                            openModal(url)
                                                        }}
                                                    />
                                                );
                                            })}
                                            {
                                                message?.mediaURL === null ? (
                                                    <p className={`pb-2 ${message?.content ? 'text-black' : 'text-gray-400'}`}>
                                                        {message?.content ? message.content : 'Tin nhắn đã được thu hồi'}
                                                    </p>
                                                ) : (
                                                    <p className="pb-2 text-black break-words max-w-prose">
                                                        {message?.content || ''}
                                                    </p>
                                                )
                                            }
                                            <p className="text-xs text-gray-400">
                                                {format(new Date(message?.createdAt), 'hh:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        ))

                }
                <div ref={messagesEndRef}></div>

            </div>
            {
                messagesEndRef.current ? <div className=' w-full flex justify-end'
                >
                    <button
                        onClick={scrollToBottom}
                        className="relative pr-28">
                        <ArrowDownIcon
                            style={{ marginBottom: '20px' }}
                            className="w-12 h-12 rounded-full opacity-20 text-gray-300 hover:bg-gray-200 hover:text-gray-400 hover:opacity-100 absolute bottom-0 left-1/2 transform -translate-x-1/2" />

                    </button>
                </div> : ''
            }

            <div className="w-full flex p-2 border-t-2 border-gray-200 bottom-0 flex-col">

                <div className='w-full'>
                    {
                        preview &&
                        <Box sx={{ position: 'relative', display: 'inline-block' }}>

                            <div
                                onClick={() => {
                                    openModal(preview)
                                }}
                                style={{
                                    maxWidth: '200px',
                                    maxHeight: '1100px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',

                                }}
                            >
                                <FileViewChane file={previewFull} />
                            </div>
                            {/* Nút xóa file */}
                            <IconButton
                                onClick={handleRemoveFile}
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
                {/* Confirmation Dialog */}
                <Dialog open={openDialog} onClose={cancelRevokeMessage}>
                    <DialogTitle>Xác nhận thu hồi tin nhắn</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Bạn có chắc chắn muốn thu hồi tin nhắn này? Thao tác này không thể hoàn tác.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={cancelRevokeMessage} color="secondary">
                            Hủy
                        </Button>
                        <Button onClick={confirmRevokeMessage} color="primary">
                            Thu hồi
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div >
    );
};

export default MessengerInbox;
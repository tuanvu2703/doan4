import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import { format } from 'date-fns';
import { io } from 'socket.io-client';

import { PaperAirplaneIcon, ArrowDownIcon } from '@heroicons/react/16/solid';
import { useLocation } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ChevronRightIcon, ChevronLeftIcon, ArrowUturnLeftIcon, PhotoIcon, PhoneIcon, VideoCameraIcon } from "@heroicons/react/24/solid";

import imgUser from '../../../../img/user.png';
import user from '../../../../service/user';
import messenger from '../../../../service/messenger';
import { useUser } from '../../../../service/UserContext';
import authToken from '../../../../components/authToken';
import Loading from '../../../../components/Loading';
import { MessengerContext } from '../../layoutMessenger';
import NotificationCss from '../../../../module/cssNotification/NotificationCss';
import FileViewChane from '../../../../components/fileViewChane';
import { FaceSmileIcon } from '@heroicons/react/24/outline';
import DropdownEmoji from '../../../../components/DropdownEmoji';

const MessengerInbox = () => {
    const { userContext } = useUser();
    const { RightShow, handleHiddenRight, setContent, setInboxData } = useContext(MessengerContext);
    const location = useLocation();
    const [textareaHeight, setTextareaHeight] = useState(40);
    const [iduser, setIdUser] = useState(null);
    const [userdata, setUserdata] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingHeaer, setLoadingHeader] = useState(true);
    const [sending, setSending] = useState(false); // Added sending state
    const [message, setMessage] = useState('');
    const [messengerdata, setMessengerdata] = useState([]);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    //file
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [previewFull, setPreviewFull] = useState(null);

    const [hoveredMessageId, setHoveredMessageId] = useState(null);
    const [openDialog, setOpenDialog] = useState(false); // For controlling the confirmation dialog
    const [messageToRevoke, setMessageToRevoke] = useState(null); // Store message to be revoked
    const { setShowZom } = useUser();
    const [socket, setSocket] = useState(null); // Trạng thái kết nối socket
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const userId = queryParams.get('iduser');
        setIdUser(userId);
        setMessengerdata([])
    }, [location.search]);

    const openModal = (file) => {
        setShowZom({ file: file, show: true });
    };
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
                    prevMessages.filter((message) => message._id !== messageToRevoke)
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
            // Clear the message ID
        }
    };
    const cancelRevokeMessage = () => {
        setOpenDialog(false); // Close the dialog
        setMessageToRevoke(null); // Clear the message ID
    };
    const scrollToBottom = () => {

        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        }

    };
    useEffect(() => {
        const timeout = setTimeout(() => {
            scrollToBottom(); // Tự động cuộn mỗi khi dữ liệu tin nhắn thay đổi
        }, 1000); // Delay of 1 second (1000ms)

        return () => clearTimeout(timeout); // Cleanup the timeout on unmount or before the next invocation
    }, [messengerdata]);


    useEffect(() => {
        if (iduser === '' || !iduser) return;
        const fetchMessengerData = async () => {
            try {
                const res = await messenger.getListMessengerByUser(iduser);
                if (res.success) {
                    // console.log('next')
                    // console.log(res.data)
                    setMessengerdata(res.data);
                }
            } catch (error) {
                console.log('Error fetching messenger data:', error);
            }
        };
        fetchMessengerData();

    }, [iduser]);

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
                console.log('Error fetching user data:', error);
                setError('An error occurred while fetching user data.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
        setContent('inbox');
        setLoadingHeader(false)
    }, [iduser]);
    //file
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


    const onMessageReceived = useCallback(
        (newMessage) => {
            console.log('sau nay')
            console.log(newMessage)
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
        [userContext._id, socket]
    );
    // useWebSocket(onMessageReceived);
    useEffect(() => {
        if (iduser) {
            const URL = process.env.REACT_APP_API_SOCKET_URL
            const socketConnection = io(URL, {
                extraHeaders: {
                    Authorization: `Bearer ${authToken.getToken()}`,
                },
            });
            // socketConnection.on("connect", () => {
            // console.log("Connected to WebSocket with ID:", socketConnection.id);
            // socket.emit("joinGroup", idGroup);
            // console.log("Connected to WebSocket Group with ID:", idGroup);
            // });

            socketConnection.on("newmessage", (data) => {
                onMessageReceived(data);
            });
            // setSocket(socketConnection);
            return () => {
                socketConnection.off("newmessage");
                socketConnection.disconnect();
            };
        }
    }, [iduser]);


    useEffect(() => {
        // Kiểm tra và xử lý điều kiện bên trong hook
        if (!messengerdata || Object.keys(messengerdata).length === 0) {
            return; // Không làm gì nếu `groupedMessages` không hợp lệ
        }

        // Cập nhật dữ liệu nếu `groupedMessages` tồn tại
        const inboxUpdate = {
            data: userdata,
            messenger: messengerdata,
        };

        setInboxData(inboxUpdate);
    }, [messengerdata, userdata, setInboxData]);



    const handleInputChange = useCallback((e) => {
        const textarea = e.target;
        const currentValue = textarea.value;

        setMessage(currentValue);

        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
        setTextareaHeight(textarea.scrollHeight);
    }, []);

    const handleSendMessenger = useCallback(async () => {

        if (!message.trim() && !file || sending) return; // Prevent sending if already in progress
        // console.log('aaa')
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
    // revokedMesage
    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessenger();
            }
        },
        [handleSendMessenger]
    );


    // Emoji
    const handleEmojiClick = (emoji) => {
        setMessage((prevMessage) => prevMessage + emoji);
    };


    if (loading) {
        return <Loading />;
    }
    if (!iduser) {
        return <div className="text-red-500 text-center mt-4"></div>;//{error}
    }

    const groupedMessages = messengerdata.reduce((acc, message) => {
        const createdAtDate = new Date(message.createdAt);
        if (isNaN(createdAtDate)) {
            // console.error('Invalid date value:', message.createdAt);
            return acc;
        }

        const date = format(createdAtDate, 'yyyy-MM-dd');
        if (!acc[date]) acc[date] = [];
        acc[date].push(message);
        return acc;
    }, {});
    console.log(groupedMessages)
    return (
        <div className="flex flex-col h-full ">
            <div className="p-2 flex border-b h-14 bg-white shadow-sm">
                <div className='w-full flex flex-row items-center'>
                    {
                        loadingHeaer ? <Loading /> :
                            <>
                                <button onClick={() => window.location.href = `/user/${userdata?._id}`}>
                                    <img
                                        className="w-10 h-10 rounded-full mr-2"
                                        src={userdata?.avatar || imgUser}
                                        alt="User Avatar"
                                    />
                                </button>
                                <h3 className="font-semibold text-nowrap max-w-sm overflow-hidden text-ellipsis">
                                    {`${userdata.lastName || ''} ${userdata.firstName || ''}`.trim()}
                                </h3>
                            </>
                    }


                </div>
                <div className=" flex justify-end  items-center gap-1">
                    <PhoneIcon className="h-8 w-8 text-gray-700 p-1 hover:bg-gray-300 hover:scale-110 hover:duration-1000 rounded-full aspect-square" />
                    <VideoCameraIcon className="h-8 w-8 text-gray-700 p-1 hover:bg-gray-300 hover:scale-110 hover:duration-1000 rounded-full aspect-square" />
                    <button onClick={handleHiddenRight} >
                        {
                            RightShow ? <ChevronRightIcon className="h-8 w-8 text-gray-700 p-1 hover:bg-gray-300 hover:scale-110 hover:duration-1000 rounded-full aspect-square" />
                                :
                                <ChevronLeftIcon className="h-8 w-8 text-gray-700  p-1 hover:bg-gray-300 hover:scale-110 hover:duration-1000 rounded-full aspect-square" />
                        }
                    </button>
                </div>
            </div>
            <div className='overflow-y-scroll h-full p-4 pt-1 bg-gray-100'>
                {Object.keys(groupedMessages).map((date) => (
                    <div key={date} className="">
                        <div className="mb-4 pb-2 px-3 ">
                            <div className="text-center text-gray-500 text-sm my-2">
                                {format(new Date(date), ' dd')} <span>tháng</span> {format(new Date(date), 'MM')} 
                            </div>
                            {
                                groupedMessages[date].map((mess, index) => (
                                    <React.Fragment key={`${mess._id}-${index}`}>
                                        <div
                                            className={`flex 

                                                ${mess?.author?._id ? (
                                                    mess?.author?._id === userContext._id ?
                                                        'justify-end pl-16' : 'pr-16'
                                                ) : (
                                                    mess?.sender === userContext._id ?
                                                        'justify-end pl-16' : 'pr-16'
                                                )
                                                }
                                              `}

                                            onMouseEnter={() => {
                                                if ((mess?.author?._id === userContext._id) || (mess?.sender === userContext._id)) {
                                                    setHoveredMessageId(mess._id);
                                                }
                                            }} // Set the hovered message
                                            onMouseLeave={() => setHoveredMessageId(null)} // Clear the hovered message
                                        >

                                            <div className='flex flex-row '>
                                                {hoveredMessageId === mess._id && (
                                                    <div className='h-full flex p-2 items-center'>
                                                        <button onClick={() => handleRevokedClick(mess._id)}>
                                                            <ArrowUturnLeftIcon className="h-6 w-7 text-gray-500 bg-gray-100 rounded-sm " />
                                                        </button>
                                                    </div>
                                                )}
                                                <div
                                                    className={clsx(
                                                        ' rounded-lg shadow-md shadow-slate-300 pb-2 border min-w-28 min-h-11 my-2 ',

                                                        // mess?.sender == userContext._id && mess?.receiver != userContext._id && !mess?.author ?
                                                        //     'bg-blue-100 1' :
                                                        //     mess?.sender != userContext._id && mess?.receiver == userContext._id && !mess?.author ?
                                                        //         'bg-white 2' :
                                                        //         mess?.author?._id == mess?.sender && mess?.sender == userContext._id ?
                                                        //             'bg-blue-100 3' :
                                                        //             mess?.author?._id == mess?.sender && mess?.sender != userContext._id &&
                                                        //             'bg-white 4'
                                                        mess?.author?._id ? (
                                                            mess?.author?._id === userContext._id ?
                                                                'bg-blue-100' : 'bg-white'
                                                        ) : (
                                                            mess?.sender === userContext._id ?
                                                                'bg-blue-100' : 'bg-white'
                                                        )
                                                    )}
                                                >
                                                    {/* <div>Recall</div> */}
                                                    {mess?.mediaURL?.length > 0 && mess.mediaURL.map((url, index) => {
                                                        const isVideo = url.endsWith(".mp4"); // Check if the URL ends with '.mp4'
                                                        return (
                                                            <div key={index} className="w-full bg-white flex justify-center">
                                                                {isVideo ? (
                                                                    <video
                                                                        controls
                                                                        className="max-w-full max-h-72 object-cover rounded-t-lg"
                                                                    >
                                                                        <source src={url} type="video/mp4" />
                                                                        Trình duyệt của bạn không hỗ trợ video.
                                                                    </video>
                                                                ) : (
                                                                    <img
                                                                        onClick={() => {
                                                                            openModal(url)
                                                                        }}

                                                                        src={url}
                                                                        alt={`Message Media ${index}`}
                                                                        className="max-w-full max-h-72 object-cover rounded-t-lg"
                                                                    />
                                                                )}
                                                            </div>
                                                        );
                                                    })}

                                                    <p className="text-black p-2 break-words max-w-prose">{mess.content === 'The message has been revoked' ? ('Tin nhắn đã được thu hồi') : (`${mess.content}`)}</p>
                                                    <p className="text-xs text-gray-400 text-left pl-2">
                                                        {format(new Date(mess.createdAt), 'hh:mm')}
                                                    </p>
                                                </div>

                                            </div>
                                            {/* Show "Recall" button when the message is hovered */}
                                        </div>
                                        {/* Scroll to the bottom */}
                                        {/* {groupedMessages[date].length === index + 1 ? <div ref={messagesEndRef} /> : ''} */}
                                    </React.Fragment>
                                ))

                            }
                        </div>
                    </div>
                ))}
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
                            {/* <img
                                src={preview}
                                alt="Preview"
                                style={{
                                    maxWidth: '200px',
                                    maxHeight: '60px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                }}
                                onClick={() => {
                                    openModal(preview)
                                }}
                            /> */}
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
                                placeholder="Nhập nội dung tin nhắn"
                                value={message}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                            />
                            <div className="dropdown dropdown-top dropdown-end ">
                                <FaceSmileIcon tabIndex={0} role="button" className='size-7 fill-yellow-500 text-white' />
                                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                                    <DropdownEmoji onEmojiClick={handleEmojiClick} />
                                </ul>
                            </div>
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
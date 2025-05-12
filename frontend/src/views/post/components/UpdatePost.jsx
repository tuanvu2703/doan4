import React from 'react'
import { useState, useEffect, useRef } from 'react' // Thêm useRef
import { useParams } from 'react-router-dom'
import { getDetailPost, updatePost, updatePrivacyPost } from '../../../service/PostService';
import { profileUserCurrent } from '../../../service/ProfilePersonal';
import PublicIcon from '@mui/icons-material/Public'; // MUI's "Public" icon
import GroupIcon from '@mui/icons-material/Group'; // MUI's "Group" icon for Friends
import LockIcon from '@mui/icons-material/Lock'; // MUI's "Lock" icon for Only Me
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'; // MUI's dropdown arrow icon
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import EmojiPicker from 'emoji-picker-react'; // Thêm import EmojiPicker
import clsx from 'clsx';
import { PhotoIcon } from '@heroicons/react/24/solid'
import { toast } from 'react-toastify';
import NotificationCss from '../../../module/cssNotification/NotificationCss';

export default function UpdatePost() {
    const [posts, setPosts] = useState([]);
    const [userLogin, setUserLogin] = useState({})
    const [visibility, setVisibility] = useState('Tất cả mọi người'); // State for visibility option
    const [showDropdown, setShowDropdown] = useState(false); // State to toggle dropdown visibility
    const [rows, setRows] = useState(3);
    const [privacy, setPrivacy] = useState('');
    const [filePreview, setFilePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); // State để hiện/ẩn emoji picker
    const textareaRef = useRef(null); // Reference cho textarea để chèn emoji
    const emojiPickerRef = useRef(null); // Reference cho việc kiểm soát hiển thị emoji picker

    const [formData, setFormData] = useState({
        content: '',
        files: null,
        privacy: '',
    });
    const { id } = useParams();


    useEffect(() => {
        const fetchdata = async () => {
            try {
                const response = await getDetailPost(id)
                if (response) {
                    setPosts(response.data)
                    setVisibility(response.data.privacy);
                    const responseUserPersonal = await profileUserCurrent()
                    setUserLogin(responseUserPersonal.data)
                }
            } catch (error) {
                console.error("Error liking the post:", error);
            }
        }
        fetchdata()
    }, [id]);

    const handleVisibilityChange = (newVisibility, valuePrivacy) => {
        setVisibility(newVisibility); // Update the visibility state
        setShowDropdown(false); // Close dropdown after selection
        setPrivacy(valuePrivacy);
    };

    const renderVisibilityIcon = (visibility) => {
        switch (visibility) {
            case 'Tất cả mọi người':
                //setPrivacy('public')
                return <PublicIcon className="text-blue-500" />;
            case 'Chỉ bạn bè':
                // setDataPrivacy('friends')
                return <GroupIcon className="text-green-500" />;
            case 'Riêng tư':
                // setDataPrivacy('private')
                return <LockIcon className="text-gray-500" />;
            default:
                return null;
        }
    };

    useEffect(() => {
        setFormData({ "privacy": privacy })
    }, [privacy]); // Empty dependency array means it runs only once
    const maxRows = 12;

    const handleInputChange = (event) => {
        const textareaLineHeight = 24;
        const previousRows = event.target.rows;
        event.target.rows = 3;
        const currentRows = Math.floor(event.target.scrollHeight / textareaLineHeight);
        if (currentRows === previousRows) {
            event.target.rows = currentRows;
        }
        if (currentRows >= maxRows) {
            event.target.rows = maxRows;
            event.target.scrollTop = event.target.scrollHeight;
        } else {
            event.target.rows = currentRows;
        }
        setRows(currentRows < maxRows ? currentRows : maxRows);
        //
        const { name, value } = event.target
        setFormData({
            ...formData,
            [name]: value
        })
    };
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // setFormData((prevData) => ({ ...prevData, files: file }));
            setFilePreview(URL.createObjectURL(file));
        }
        setFormData({ ...formData, img: file });
    };
    useEffect(() => {
        if (posts.content || posts.files) {
            setFormData({
                content: posts.content || "",
                files: posts.files || null,
                privacy: posts.privacy
            });
        }
    }, [posts]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await updatePost(id, formData.content);
            const responsePrivacy = await updatePrivacyPost(id, formData.privacy);
            if (response || responsePrivacy) {
                toast.success('Chỉnh sửa thành công.', NotificationCss.Success);
                // window.location.href = `/post/${id}`;
            }
            else {
                toast.error('Chỉnh sửa thất bại.', NotificationCss.Error);
            }
        } catch (error) {
            console.error('Error updating post:', error);
        } finally {
            setTimeout(() => {
                window.location.href = `/post/${id}`;
            }, 1000)
        }
    }

    // Hàm xử lý khi chọn emoji
    const onEmojiClick = (emojiObject) => {
        const emoji = emojiObject.emoji;
        const textarea = textareaRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = formData.content;
            const newText = text.substring(0, start) + emoji + text.substring(end, text.length);
            setFormData({ ...formData, content: newText });

            // Đặt lại con trỏ sau khi chèn emoji
            setTimeout(() => {
                textarea.selectionStart = start + emoji.length;
                textarea.selectionEnd = start + emoji.length;
                textarea.focus();
            }, 10);
        }
        setShowEmojiPicker(false);
    };

    // Đóng emoji picker khi click bên ngoài
    useEffect(() => {
        function handleClickOutside(event) {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target) &&
                event.target.id !== "emoji-button") {
                setShowEmojiPicker(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const visibilityText = formData.privacy === 'public'
        ? 'Tất cả mọi người'
        : formData.privacy === 'friends'
            ? 'bạn bè'
            : 'Riêng tư';
    console.log(formData.privacy)

    return (<div className="bg-background min-h-screen flex justify-center items-center p-4 sm:p-6">
        <div className="bg-white w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl p-4 sm:p-6 rounded-xl shadow-xl border border-gray-200 transition-all hover:shadow-2xl">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center sm:text-left text-teal-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Chỉnh sửa bài viết
            </h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
                <div className="space-y-4">
                    {/* Profile and Privacy */}
                    <div className="flex items-center space-x-3 relative">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex-shrink-0 overflow-hidden">
                            <img
                                className='h-full w-full object-cover rounded-full shadow-md'
                                src={`${userLogin.avatar ? userLogin.avatar : "https://th.bing.com/th/id/OIP.PKlD9uuBX0m4S8cViqXZHAHaHa?rs=1&pid=ImgDetMain"}`} alt='' />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <strong className="text-sm sm:text-lg text-gray-700 truncate max-w-[120px] sm:max-w-none">
                                {userLogin.lastName} {userLogin.firstName}
                            </strong>
                            <button
                                type='button'
                                className="flex items-center p-1.5 sm:p-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors text-xs sm:text-sm"
                                onClick={() => setShowDropdown(!showDropdown)}
                                aria-label="Edit privacy"
                            >
                                {renderVisibilityIcon(visibility)}
                                <span className="ml-1 hidden sm:inline">{visibilityText}</span>
                                <ArrowDropDownIcon fontSize="small" />
                            </button>

                            {/* Dropdown for selecting visibility */}
                            {showDropdown && (
                                <div className="absolute top-full left-0 sm:left-auto right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-2 p-1 z-10 w-52">
                                    <button
                                        type='button'
                                        className="w-full text-left py-2 px-3 rounded-md hover:bg-gray-100 flex items-center"
                                        onClick={() => handleVisibilityChange('Tất cả mọi người', "public")}
                                    >
                                        <PublicIcon className="mr-2 text-blue-500" /> Tất cả mọi người
                                    </button>
                                    <button
                                        type='button'
                                        className="w-full text-left py-2 px-3 rounded-md hover:bg-gray-100 flex items-center"
                                        onClick={() => handleVisibilityChange('Chỉ bạn bè', "friends")}
                                    >
                                        <GroupIcon className="mr-2 text-green-500" /> Chỉ bạn bè
                                    </button>
                                    <button
                                        type='button'
                                        className="w-full text-left py-2 px-3 rounded-md hover:bg-gray-100 flex items-center"
                                        onClick={() => handleVisibilityChange('Riêng tư', "private")}
                                    >
                                        <LockIcon className="mr-2 text-gray-500" /> Riêng tư
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Textarea */}
                    <div className="mt-3">                            <textarea
                        ref={textareaRef}
                        className={clsx(
                            'text-base sm:text-lg w-full resize-none rounded-lg bg-gray-50 py-3 px-4 text-gray-800',
                            'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white',
                            'overflow-y-auto min-h-[120px] max-h-[40vh] sm:max-h-[50vh] transition-all',
                            'border border-gray-200',
                            'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'
                        )}
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        style={{ lineHeight: '1.5rem' }}
                        placeholder="Chia sẻ suy nghĩ của bạn..."
                    />

                        {filePreview && (
                            <div className="mt-3 relative">
                                <img src={filePreview} alt="Preview" className="max-w-full h-auto rounded-lg border border-gray-200" />
                                <button
                                    type="button"
                                    onClick={() => setFilePreview(null)}
                                    className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                                    aria-label="Remove image"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        )}                            <div className="flex justify-between items-center mt-3 border-t pt-3">
                            <div className="relative">
                                <button
                                    type="button"
                                    id="emoji-button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className='p-2 rounded-full hover:bg-gray-200 transition-colors'
                                    aria-label="Insert emoji"
                                >
                                    <EmojiEmotionsIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                                </button>

                                {showEmojiPicker && (
                                    <div
                                        ref={emojiPickerRef}
                                        className="absolute bottom-12 left-0 z-10"
                                        style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                                    >
                                        <EmojiPicker
                                            onEmojiClick={onEmojiClick}
                                            width={280}
                                            height={350}
                                            previewConfig={{ showPreview: false }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="file-input-wrapper">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="files"
                                    name='files'
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="files" className="cursor-pointer flex items-center justify-center">
                                    <div className='p-2 rounded-full hover:bg-gray-200 transition-colors'>
                                        <PhotoIcon className='h-5 w-5 sm:h-6 sm:w-6 fill-sky-600' />
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>                    <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2.5 rounded-lg font-medium text-white transition duration-300 ${loading ?
                        'bg-gray-400 cursor-not-allowed' :
                        'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 shadow-md hover:shadow-lg'}`}
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang xử lý...
                        </div>
                    ) : 'Chỉnh sửa'}
                </button>
            </form>
        </div>
    </div>
    )
}

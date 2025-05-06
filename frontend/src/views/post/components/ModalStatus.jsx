import { useEffect, useState } from 'react';
import axios from 'axios';
import PublicIcon from '@mui/icons-material/Public';
import GroupIcon from '@mui/icons-material/Group';
import LockIcon from '@mui/icons-material/Lock';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import clsx from 'clsx';
import authToken from '../../../components/authToken';
import { PhotoIcon, FaceSmileIcon, GifIcon, GlobeAltIcon } from '@heroicons/react/24/solid';
import Loading from '../../../components/Loading';
import FileViewChane from '../../../components/fileViewChane';
import DropdownEmoji from '../../../components/DropdownEmoji';
import Gif from './Gif';
import { useNavigate } from 'react-router-dom';
import { set } from 'date-fns';

export default function ModalStatus({ user, onCloseModal, addNewPost, group }) {
    const navigate = useNavigate();
    const [open, setOpen] = useState(true);
    const [rows, setRows] = useState(3);
    const [visibility, setVisibility] = useState('Tất cả mọi người');
    const [privacy, setPrivacy] = useState('public');
    const [showDropdown, setShowDropdown] = useState(false);
    const [showGifDropdown, setShowGifDropdown] = useState(false); // State to control GIF dropdown visibility
    const [alertVisible, setAlertVisible] = useState(false);
    const [filePreview, setFilePreview] = useState(null);
    const [gifPreview, setGifPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [nodata, setNodata] = useState(false);
    const [formData, setFormData] = useState({
        content: '',
        files: null,
        gif: null,
        privacy: privacy,
    });

    useEffect(() => {
        setFormData({ "privacy": privacy });
    }, [privacy]);


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
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFilePreview(URL.createObjectURL(file));
            setGifPreview(null); // Remove GIF preview if an image is selected
        }
        setFormData({ ...formData, files: file, gif: null }); // Clear GIF from formData
        setShowGifDropdown(false); // Close the GIF dropdown if an image is selected
    };
    const handleVisibilityChange = (newVisibility, valuePrivacy) => {
        setVisibility(newVisibility);
        setShowDropdown(false);
        setPrivacy(valuePrivacy);
    };

    const renderVisibilityIcon = (visibility) => {
        if (group) {
            return <GlobeAltIcon className="text-gray-500 size-6 sm:size-7" />;
        }
        switch (visibility) {
            case 'Tất cả mọi người':
                return <PublicIcon className="text-blue-500" fontSize="small" />;
            case 'Chỉ bạn bè':
                return <GroupIcon className="text-green-500" fontSize="small" />;
            case 'Riêng tư':
                return <LockIcon className="text-gray-500" fontSize="small" />;
            default:
                return <PublicIcon className="text-blue-500" fontSize="small" />;
        }
    };

    const handleFileRemove = () => {
        setFilePreview(null);
        setFormData({ ...formData, files: null });
    };

    const handleGifRemove = () => {
        setGifPreview(null);
        setFormData({ ...formData, gif: null });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.content && !formData.files && !formData.gif) {
            setNodata(true);
            return;
        }
        const data = new FormData();
        data.append('content', formData.content || '');
        data.append('files', formData.files || '');
        data.append('gif', formData.gif || '');
        data.append('privacy', group ? 'thisGroup' : formData.privacy); // Set privacy to "thisGroup" if group exists
        if (group) {
            data.append('group', group || group);
        }
        try {
            setLoading(true);
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/post/createPost`, data, {
                headers: {
                    Authorization: `Bearer ${authToken.getToken()}`,
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.status === 201) {
                setAlertVisible(true);

                // Use the addNewPost function if available
                if (addNewPost && response.data) {
                    const newPost = {
                        ...response.data,
                        author: user, // Add author information
                        likes: [],
                        dislikes: [],
                        comments: [],
                        img: response.data.img || [],
                        createdAt: new Date().toISOString()
                    };
                    addNewPost(newPost);
                }

                setTimeout(() => {
                    setOpen(false);
                    setAlertVisible(false); // Reset the alert visibility
                    // Reset the form instead of reloading
                    setFormData({
                        content: '',
                        files: null,
                        gif: null,
                        privacy: privacy,
                    });
                    setFilePreview(null);
                    setGifPreview(null);
                    document.getElementById('my_modal_1').close();
                }, 1000);
            } else {
                console.log('Có lỗi xảy ra, vui lòng thử lại.');
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('Lỗi:', error.response ? error.response.data : error.message);
        }
    };

    const handleEmojiClick = (emoji) => {
        setFormData({
            ...formData,
            content: (formData.content || '') + emoji // Đảm bảo content luôn là chuỗi
        });
    };

    const handleGifSelect = (gifUrl) => {
        setFormData({
            ...formData,
            gif: gifUrl,
            files: null // Clear image from formData
        });
        setFilePreview(null); // Remove image preview if a GIF is selected
        setShowGifDropdown(false); // Close the GIF dropdown after selecting a GIF
    };
    return (
        <dialog id="my_modal_1" className="modal">
            <form className="modal-box w-11/12 max-w-3xl mx-auto" method='POST' encType="multipart/form-data" onSubmit={handleSubmit}>
                {alertVisible && (
                    <div role="alert" className="alert alert-success">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs sm:text-sm">Đăng post thành công!</span>
                    </div>
                )}
                <div className="border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-4 flex justify-center relative">
                    <strong className="text-black text-base sm:text-xl" style={{ fontWeight: 'bold' }}>
                        Tạo bài đăng
                    </strong>
                    <form method="dialog">
                        <button onClick={() => setFormData('')} className="btn btn-sm btn-circle btn-ghost absolute right-1 sm:right-2 top-1 sm:top-2">✕</button>
                    </form>
                </div>
                <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full flex items-center justify-center">
                            <img
                                className='h-8 w-8 sm:h-12 sm:w-12 aspect-square rounded-full shadow-md flex items-center justify-center'
                                src={`${user.avatar ? user.avatar : "https://th.bing.com/th/id/OIP.PKlD9uuBX0m4S8cViqXZHAHaHa?rs=1&pid=ImgDetMain"}`} alt='' />
                        </div>
                        <div>
                            <strong className="text-sm sm:text-lg text-gray-600">
                                {user.lastName} {user.firstName}
                            </strong>
                            <button
                                type='button'
                                className="flex items-center p-1 sm:p-2 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-200"
                                onClick={() => setShowDropdown(!showDropdown)}
                                aria-label="Edit privacy. Sharing with Public."
                            >
                                {renderVisibilityIcon(visibility)}
                                <span className="ml-1 text-xs sm:text-sm">{group ? "Nhóm" : visibility}</span>
                                <ArrowDropDownIcon fontSize="small" />
                            </button>
                            {showDropdown && !group && (
                                <div className="absolute bg-white border border-gray-300 rounded-md shadow-md mt-1 p-1 sm:mt-2 sm:p-2 max-w-48 sm:max-w-56 z-10">
                                    <button
                                        type='button'
                                        className="w-full text-left py-1 sm:py-2 px-2 sm:px-4 hover:bg-gray-100 text-xs sm:text-sm"
                                        onClick={() => handleVisibilityChange('Tất cả mọi người', "public")}
                                    >
                                        <PublicIcon className="mr-1 sm:mr-2 text-nowrap" fontSize="small" /> Tất cả mọi người
                                    </button>
                                    <button
                                        type='button'
                                        className="w-full text-left py-1 sm:py-2 px-2 sm:px-4 hover:bg-gray-100 text-xs sm:text-sm"
                                        onClick={() => handleVisibilityChange('Chỉ bạn bè', "friends")}
                                    >
                                        <GroupIcon className="mr-1 sm:mr-2 text-nowrap" fontSize="small" /> Chỉ bạn bè
                                    </button>
                                    <button
                                        type='button'
                                        className="w-full text-left py-1 sm:py-2 px-2 sm:px-4 hover:bg-gray-100 text-xs sm:text-sm"
                                        onClick={() => handleVisibilityChange('Riêng tư', "private")}
                                    >
                                        <LockIcon className="mr-1 sm:mr-2 text-nowrap" fontSize="small" /> Riêng tư
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <textarea
                            className={clsx(
                                'text-sm sm:text-base md:text-lg border-none w-full resize-none rounded-lg bg-gray-100 py-2 px-3 text-black',
                                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-200',
                                'overflow-y-auto max-h-[40vh] sm:max-h-[50vh] md:max-h-[60vh]'
                            )}
                            name="content"
                            value={formData.content}
                            rows={rows}
                            maxLength={4000}
                            placeholder="Viết nội dung của bạn..."
                            onChange={handleInputChange}
                            style={{ lineHeight: '1.5rem' }}
                        />
                        {nodata && (<div className="text-red-500 text-xs sm:text-sm">Vui lòng nhập nội dung/hình ảnh/gif </div>)}
                        <div className='w-full flex justify-center'>
                            {filePreview && (
                                <div className="flex justify-center">
                                    <FileViewChane file={formData?.files} onDelete={handleFileRemove} />
                                </div>
                            )}
                        </div>
                        {formData.gif && (
                            <div className="mt-2 sm:mt-4 flex justify-center">
                                <img src={formData.gif} alt=""
                                    style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain' }}
                                    className="max-h-[100px] sm:max-h-[150px] md:max-h-[200px]"
                                />
                                <button
                                    type="button"
                                    className="relative bg-red-500 p-1 sm:p-3 text-white rounded-r-md text-xs sm:text-sm"
                                    onClick={() => setFormData({ ...formData, gif: null })}
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                        <div className="flex justify-end w-full gap-1 sm:gap-2">
                            <div className="file-input-wrapper">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="files"
                                    name='files'
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="files" className="file-input-button cursor-pointer">
                                    <div className='p-1 rounded-xl hover:bg-slate-300'>
                                        <PhotoIcon className='size-5 sm:size-7 fill-sky-600' />
                                    </div>
                                </label>
                            </div>
                            <div className="dropdown dropdown-top dropdown-end">
                                <FaceSmileIcon tabIndex={0} className='size-6 sm:size-8 fill-yellow-500' />
                                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-36 sm:w-52 p-1 sm:p-2 shadow">
                                    <DropdownEmoji onEmojiClick={handleEmojiClick} />
                                </ul>
                            </div>
                            <div className="relative">
                                <GifIcon
                                    className='size-6 sm:size-8 fill-green-500 cursor-pointer hover:opacity-80'
                                    onClick={() => setShowGifDropdown(!showGifDropdown)}
                                />
                                {showGifDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowGifDropdown(false)}></div>
                                        <div className="absolute z-50 bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 w-64 sm:w-96 max-h-96 overflow-hidden">
                                            <div className="p-1 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
                                                <span className="font-medium text-sm sm:text-base text-gray-700 px-2">Chọn GIF</span>
                                                <button
                                                    className="text-gray-500 hover:text-gray-700"
                                                    onClick={() => setShowGifDropdown(false)}
                                                >
                                                    <span className="text-xl">×</span>
                                                </button>
                                            </div>
                                            <Gif onGifSelect={handleGifSelect} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-action mt-2 sm:mt-4">
                    {loading ? <p><Loading /></p> :
                        <div className='flex gap-2 sm:gap-3'>
                            <form method="dialog">
                                <button
                                    onClick={() => setFormData('')}
                                    className="bg-red-500 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-red-600 transition duration-150 text-xs sm:text-sm">Hủy đăng bài</button>
                            </form>
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-blue-600 transition duration-150 text-xs sm:text-sm"
                            >
                                Đăng bài
                            </button>
                        </div>
                    }
                </div>
            </form>
        </dialog>
    );
}
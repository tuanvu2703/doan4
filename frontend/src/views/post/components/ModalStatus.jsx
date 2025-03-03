import { useEffect, useState } from 'react';
import axios from 'axios';
import PublicIcon from '@mui/icons-material/Public';
import GroupIcon from '@mui/icons-material/Group';
import LockIcon from '@mui/icons-material/Lock';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import clsx from 'clsx';
import authToken from '../../../components/authToken';
import { PhotoIcon, FaceSmileIcon, GifIcon } from '@heroicons/react/24/solid';
import Loading from '../../../components/Loading';
import FileViewChane from '../../../components/fileViewChane';
import Emoji from '../../../components/Emoji';
import Gif from './Gif';


export default function ModalStatus({ user }) {
    const [open, setOpen] = useState(true);
    const [rows, setRows] = useState(3);
    const [visibility, setVisibility] = useState('Tất cả mọi người');
    const [privacy, setPrivacy] = useState('public');
    const [showDropdown, setShowDropdown] = useState(false);
    const [showGifDropdown, setShowGifDropdown] = useState(false); // State to control GIF dropdown visibility
    const [alertVisible, setAlertVisible] = useState(false);
    const [filePreview, setFilePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [nodata, setNodata] = useState(false);
    const [formData, setFormData] = useState({
        content: '',
        files: null,
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
        }
        setFormData({ ...formData, files: file });
        setShowGifDropdown(false); // Close the GIF dropdown if an image is selected
    };
    const handleVisibilityChange = (newVisibility, valuePrivacy) => {
        setVisibility(newVisibility);
        setShowDropdown(false);
        setPrivacy(valuePrivacy);
    };

    const renderVisibilityIcon = (visibility) => {
        switch (visibility) {
            case 'Tất cả mọi người':
                return <PublicIcon className="text-blue-500" />;
            case 'Chỉ bạn bè':
                return <GroupIcon className="text-green-500" />;
            case 'Riêng tư':
                return <LockIcon className="text-gray-500" />;
            default:
                return <PublicIcon className="text-blue-500" />;
        }
    };

    const handleFileRemove = () => {
        setFilePreview(null);
        setFormData({ ...formData, files: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.content && !formData.files) {
            setNodata(true);
            return;
        }
        const data = new FormData();
        data.append('content', formData.content || '');
        data.append('files', formData.files || '');
        data.append('privacy', formData.privacy);
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
                setTimeout(() => {
                    setOpen(false);
                    window.location.reload();
                }, 1000);
            } else {
                alert('Có lỗi xảy ra, vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Lỗi:', error.response ? error.response.data : error.message);
        }
    };

    const handleEmojiClick = (emoji) => {
        setFormData({
            ...formData,
            content: formData.content + emoji
        });
    };


    const handleGifSelect = (gifUrl) => {
        setFormData({
            ...formData,
            files: gifUrl
        });
        setFilePreview(null); // Remove image preview if a GIF is selected
        setShowGifDropdown(false); // Close the GIF dropdown after selecting a GIF
    };
    return (
        <dialog id="my_modal_1" className="modal">
            <form className="modal-box" method='POST' encType="multipart/form-data" onSubmit={handleSubmit}>
                {alertVisible && (
                    <div role="alert" className="alert alert-success">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Đăng post thành công!</span>
                    </div>
                )}
                <div className="border-b border-gray-300 py-3 px-4 flex justify-center">
                    <strong className="text-black text-xl" style={{ animation: 'colorWave 1s linear infinite', fontWeight: 'bold' }}>
                        Tạo bài đăng
                    </strong>
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                </div>
                <div className="p-4 space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-gray-600 h-12 w-12 rounded-full flex items-center justify-center text-white">
                            <img
                                className='h-12 aspect-square rounded-full shadow-md flex items-center justify-center'
                                src={`${user.avatar ? user.avatar : "https://th.bing.com/th/id/OIP.PKlD9uuBX0m4S8cViqXZHAHaHa?rs=1&pid=ImgDetMain"}`} alt='' />
                        </div>
                        <div>
                            <strong className="text-lg text-gray-600">
                                {user.lastName} {user.firstName}
                            </strong>
                            <button
                                type='button'
                                className="flex items-center p-2 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-200"
                                onClick={() => setShowDropdown(!showDropdown)}
                                aria-label="Edit privacy. Sharing with Public."
                            >
                                {renderVisibilityIcon(visibility)}
                                <span className="ml-1 text-sm">{visibility}</span>
                                <ArrowDropDownIcon fontSize="small" />
                            </button>
                            {showDropdown && (
                                <div className="absolute bg-white border border-gray-300 rounded-md shadow-md mt-2 p-2 max-w-56 ">
                                    <button
                                        type='button'
                                        className="w-full text-left py-2 px-4 hover:bg-gray-100"
                                        onClick={() => handleVisibilityChange('Tất cả mọi người', "public")}
                                    >
                                        <PublicIcon className="mr-2 text-nowrap" /> Tất cả mọi người
                                    </button>
                                    <button
                                        type='button'
                                        className="w-full text-left py-2 px-4 hover:bg-gray-100"
                                        onClick={() => handleVisibilityChange('Chỉ bạn bè', "friends")}
                                    >
                                        <GroupIcon className="mr-2 text-nowrap" /> Chỉ bạn bè
                                    </button>
                                    <button
                                        type='button'
                                        className="w-full text-left py-2 px-4 hover:bg-gray-100"
                                        onClick={() => handleVisibilityChange('Riêng tư', "private")}
                                    >
                                        <LockIcon className="mr-2 text-nowrap" /> Riêng tư
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <textarea
                            className={clsx(
                                'sm:text-lg border-none w-full resize-none rounded-lg bg-gray-100 py-2 px-3 text-black',
                                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-200',
                                'overflow-y-auto max-h-[60vh]'
                            )}
                            name="content"
                            value={formData.content}
                            rows={rows}
                            maxLength={4000}
                            placeholder="Viết nội dung của bạn..."
                            onChange={handleInputChange}
                            style={{ lineHeight: '1.5rem' }}
                        />
                        {nodata && (<div className="text-red-500">Vui lòng nhập nội dung hoặc chọn ảnh</div>)}
                        {filePreview && (
                            <div className="mt-4">
                                <FileViewChane file={formData?.files} onDelete={handleFileRemove} />
                            </div>
                        )}
                        {formData.files && (
                            <div className="mt-4 relative">
                                <img src={formData.files} alt="Selected GIF" />
                                <button
                                    type="button"
                                    className="absolute top-0 right-0  text-white rounded-full p-2"
                                    onClick={() => setFormData({ ...formData, files: null })}
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                        <div className="flex justify-end w-full gap-2">
                            <div className="file-input-wrapper ">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="files"
                                    name='files'
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="files" className="file-input-button cursor-pointer">
                                    <div className=' p-1 rounded-xl hover:bg-slate-300'>
                                        <PhotoIcon className='size-7 fill-sky-600 ' />
                                    </div>
                                </label>
                            </div>
                            <div className="dropdown dropdown-top dropdown-end ">
                                <FaceSmileIcon tabIndex={0} className='size-8 fill-yellow-500 ' />
                                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                                    <Emoji onEmojiClick={handleEmojiClick} />
                                </ul>
                            </div>
                            <div className="dropdown dropdown-top dropdown-end ">
                                <GifIcon tabIndex={10} className='size-8 fill-green-500' onClick={() => setShowGifDropdown(!showGifDropdown)} />
                                {showGifDropdown && (
                                    <ul tabIndex={10} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-96 p-2 shadow">
                                        <Gif onGifSelect={handleGifSelect} />
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-action">
                    {loading ? <p><Loading /></p> :
                        <div className='flex gap-3'>
                            <form method="dialog">
                                <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-150">Hủy đăng bài</button>
                            </form>
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-150"
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
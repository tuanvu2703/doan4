import React from 'react'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getDetailPost, updatePost, updatePrivacyPost } from '../../../service/PostService';
import { profileUserCurrent } from '../../../service/ProfilePersonal';
import PublicIcon from '@mui/icons-material/Public'; // MUI's "Public" icon
import GroupIcon from '@mui/icons-material/Group'; // MUI's "Group" icon for Friends
import LockIcon from '@mui/icons-material/Lock'; // MUI's "Lock" icon for Only Me
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'; // MUI's dropdown arrow icon
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
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
    const visibilityText = formData.privacy === 'public'
        ? 'Tất cả mọi người'
        : formData.privacy === 'friends'
            ? 'bạn bè'
            : 'Riêng tư';
    console.log(formData.privacy)

    return (
        <div className="bg-background text-primary-foreground min-h-screen flex items-center justify-center">
            <div className="bg-card w-full max-w-md p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Chỉnh sửa bài viết </h2>
                <form onSubmit={handleSubmit} enctype="multipart/form-data" className="space-y-4">
                    <div className="p-4 space-y-4">
                        {/* Profile and Privacy */}

                        <div className="flex items-center space-x-3">
                            <div className="bg-gray-600 h-12 w-12 rounded-full flex items-center justify-center text-white">
                                <img
                                    className='h-12 aspect-square rounded-full shadow-md flex items-center justify-center'
                                    src={`${userLogin.avatar ? userLogin.avatar : "https://th.bing.com/th/id/OIP.PKlD9uuBX0m4S8cViqXZHAHaHa?rs=1&pid=ImgDetMain"}`} alt='' />
                            </div>
                            <div>
                                <strong className="text-lg text-gray-600">
                                    {userLogin.lastName} {userLogin.firstName}
                                </strong>
                                <button
                                    type='button'
                                    className="flex items-center p-2 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-200"
                                    onClick={() => setShowDropdown(!showDropdown)} // Toggle dropdown on click

                                    aria-label="Edit privacy. Sharing with Public."
                                >

                                    {renderVisibilityIcon(visibility)} {/* Dynamically render icon */}
                                    <span className="ml-1 text-sm">
                                        <span className="ml-1 text-sm">{visibilityText}</span>
                                    </span>
                                    <ArrowDropDownIcon fontSize="small" />
                                </button>

                                {/* Dropdown for selecting visibility */}
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

                        {/* Textarea */}

                        <div>
                            <textarea
                                className={clsx(
                                    'sm:text-lg border-none w-full resize-none rounded-lg bg-gray-100 py-2 px-3 text-black',
                                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-200',
                                    'overflow-y-auto max-h-[60vh]' // Expands up to 60% of viewport height
                                )}
                                name="content"
                                value={formData.content}
                                // rows={rows}

                                onChange={handleInputChange}
                                style={{ lineHeight: '1.5rem' }}
                            />
                            {filePreview && (
                                <div className="mt-4">
                                    <img src={filePreview} alt="Preview" className="max-w-full h-auto rounded-lg" />
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
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="w-full  bg-teal-600 py-2 rounded-md hover:bg-teal-500 transition duration-300">Chỉnh sửa</button>
                </form>
            </div>
        </div>
    )
}

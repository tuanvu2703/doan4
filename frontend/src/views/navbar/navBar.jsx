import { React, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, UserGroupIcon, ChatBubbleLeftIcon, SpeakerWaveIcon, BookmarkIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { Tabs, Tab } from '@mui/material';
import SearchBar from './SearchBar';
import DropdownProfile from './DropdownProfile';
import authToken from "../../components/authToken";
import { profileUserCurrent } from '../../service/ProfilePersonal';
import { useUser } from '../../service/UserContext';
import { ToastContainer } from 'react-toastify';
import Notification from '../Notification/Notification';
import AllNotification from '../Notification/AllNotification';
export default function Navbar() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { userContext, setUserContext } = useUser(); // Access user data from context
    useEffect(() => {
        const fetchData = async () => {
            const response = await profileUserCurrent(); // Assume profileUserCurrent fetches user data
            if (response && response.data) {
                setUserContext(response.data); // Update the user state in context
            } else {
                console.warn("No data found in response.");
            }
        };
        fetchData();
    }, []);
    const location = useLocation();
    const isActiveTab = (path) => location.pathname === path;
    const isActiveString = (path) => window.location.pathname.startsWith(path);
    const active = isActiveString('/friends');

    const handleDropdownToggle = () => {
        setDropdownOpen(!dropdownOpen);
    }

    // Add function to close dropdown
    const closeDropdown = () => {
        setDropdownOpen(false);
    };

    return (

        <div className="navbar fixed bg-base-100 z-50 border-b-[1px] border-b-gray-500 bg-gradient-to-r from-[#22D1EE] to-[#E1F3F5] to-50%  p-0">
            <div className="navbar-start">
                <div className="dropdown">
                    <button onClick={handleDropdownToggle} className="btn btn-ghost lg:hidden z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </button>
                    {dropdownOpen && (
                        <ul tabIndex={0} className="menu menu-sm dropdown-content bg-white border-gray-300 border rounded-box z-10 mt-3 w-52 p-2 shadow">
                            <Tab
                                component={Link}
                                to="/"
                                icon={<HomeIcon className={`h-6 w-full ${isActiveTab('/') ? 'text-blue-500' : 'text-gray-500'}`} />}
                                aria-label="Home"
                                onClick={closeDropdown}
                            />
                            <Tab
                                component={Link}
                                to="/friends"
                                icon={<UserGroupIcon className={`h-6 w-full ${active ? 'text-blue-500' : 'text-gray-500'}`} />}
                                aria-label="Friends"
                                onClick={closeDropdown}
                            />
                            <Tab
                                component={Link}
                                to="/messenger"
                                icon={<ChatBubbleLeftIcon className={`h-6 w-full ${isActiveTab('/messenger') ? 'text-blue-500' : 'text-gray-500'}`} />}
                                aria-label="Messenger"
                                onClick={closeDropdown}
                            />
                            <Tab
                                component={Link}
                                to="/bookmark"
                                icon={<BookmarkIcon className={`h-6 w-full ${isActiveTab('/bookmark') ? 'text-blue-500' : 'text-gray-500'}`} />}
                                aria-label="Bookmark"
                                onClick={closeDropdown}
                            />
                            <Tab
                                component={Link}
                                to="/group"
                                icon={<GlobeAltIcon className={`h-6 w-full ${isActiveTab('/bookmark') ? 'text-blue-500' : 'text-gray-500'}`} />}
                                aria-label="Bookmark"
                                onClick={closeDropdown}
                            />
                        </ul>
                    )}
                </div>
                <div className="flex gap-2 items-center ml-7">
                    <button className={` z-10`}>
                        <Link to="/">
                            <img src="https://i.pinimg.com/originals/0b/a9/99/0ba999174e4b5ac7e73a85cb0fe0aeb1.png" alt="Logo" className="h-12 aspect-square rounded-full shadow-md" />
                        </Link>
                    </button>
                    <div className={`hidden sm:grid`}>
                        <Link to="/">
                            <h1 className='font-bold text-xl'>NEMO</h1>
                            <h2 className=' text-lg'>ANTISOCIAL</h2>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="navbar-center">
                <div className="form-control">
                    <SearchBar />
                </div>
            </div>
            <div className="navbar-end">
                <div className="dropdown dropdown-end">
                    <div role="button" tabIndex={0} className="btn btn-ghost btn-circle">
                        <div className="indicator">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="badge badge-xs badge-primary indicator-item"></span>
                        </div>
                    </div>
                    <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-base-100 rounded-box z-[1] w-auto max-w-[90vw] sm:w-96 p-2 shadow"
                    >
                        <div className="block sm:hidden">
                            <AllNotification />
                        </div>
                        <div className="hidden sm:block">
                            <Notification />
                        </div>
                    </ul>


                </div>
                {authToken.getToken() !== null ? (
                    <DropdownProfile user={userContext} />
                ) : (
                    <div className="m-1 z-10">
                        <Link to="/login" className="bg-[#007bff] px-3 py-3 rounded-lg">Đăng nhập</Link>
                    </div>
                )}
            </div>
        </div>
    );
}

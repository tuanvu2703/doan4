import { React, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, UserGroupIcon, ChatBubbleLeftIcon, SpeakerWaveIcon, BookmarkIcon } from '@heroicons/react/24/outline';
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
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    // const [chanecontainer, setChanecontainer] = useState(windowSize.width < 767)
    // useEffect(() => {
    //     // Hàm cập nhật kích thước màn hình
    //     const handleResize = () => {
    //         setWindowSize({
    //             width: window.innerWidth,
    //             height: window.innerHeight,
    //         });
    //         setChanecontainer(window.innerWidth > 767);
    //     };

    //     // Thêm event listener khi cửa sổ thay đổi kích thước
    //     window.addEventListener("resize", handleResize);
    //     // Cleanup event listener khi component bị unmount
    //     // return () => {
    //     //     window.removeEventListener("resize", handleResize);
    //     // };
    // }, []);
    return (
        // <>
        //     <div className="navbar fixed bg-white border border-b-gray-300 shadow-[0_1px_5px_rgba(0,0,0,0.2)] text-black p-0 z-10">
        //         <div className="flex-1">
        // <div className="dropdown">
        //     <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden z-10">
        //         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
        //         </svg>
        //     </div>

        //                 {!authToken.getToken() ? (
        //                     <div></div>
        //                 ) : (
        // <ul tabIndex={0} className="menu menu-sm dropdown-content bg-gray-100 border-gray-300 border rounded-box z-10 mt-3 w-52 p-2 shadow">
        //     <Tab
        //         component={Link}
        //         to="/"
        //         icon={<HomeIcon className={`h-6 w-full ${isActiveTab('/') ? 'text-blue-500' : 'text-gray-500'}`} />}
        //         aria-label="Home"
        //     />
        //     <Tab
        //         component={Link}
        //         to="/friends"
        //         icon={<UserGroupIcon className={`h-6 w-full ${active ? 'text-blue-500' : 'text-gray-500'}`} />}
        //         aria-label="Friends"
        //     />
        //     <Tab
        //         component={Link}
        //         to="/messenger"
        //         icon={<ChatBubbleLeftIcon className={`h-6 w-full ${isActiveTab('/messenger') ? 'text-blue-500' : 'text-gray-500'}`} />}
        //         aria-label="Messenger"
        //     />
        //     <Tab
        //         component={Link}
        //         to="/bookmark"
        //         icon={<BookmarkIcon className={`h-6 w-full ${isActiveTab('/bookmark') ? 'text-blue-500' : 'text-gray-500'}`} />}
        //         aria-label="Bookmark"
        //     />
        // </ul>
        //                 )}
        //             </div>

        // <div className="flex gap-24">
        // <div className="flex gap-2 items-center">
        //     <button className={`pl-7 pr-2 z-10 ${windowSize.width < 400 ? 'hidden' : ''}`}>
        //         <Link to="/">
        //             <img src={logoweb} alt="Logo" className="h-12 aspect-square rounded-full shadow-md flex items-center justify-center" />
        //         </Link>
        //     </button>
        //     <div className=' grid'>
        //         <Link to="/">
        //             <h1 className='font-bold text-xl'>NEMO</h1>
        //             <h2 className=' text-lg'>ANTISOCIAL</h2>
        //         </Link>
        //     </div>
        // </div>
        // <div className="form-control">
        //     <SearchBar />
        // </div>
        //             </div>
        //         </div>

        //         <div className="flex-none gap-2">
        //             <button className="btn btn-ghost btn-circle">
        //                 <div className="indicator">
        //                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        //                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        //                     </svg>
        //                     <span className="badge badge-xs badge-primary indicator-item"></span>
        //                 </div>
        //             </button>

        // {authToken.getToken() !== null ? (
        //     <DropdownProfile user={userContext} />
        // ) : (
        //     <div className="m-1 z-10">
        //         <Link to="/login" className="bg-[#007bff] px-3 py-3 rounded-lg">Đăng nhập</Link>
        //     </div>
        // )}
        //         </div>
        //     </div>

        //     <ToastContainer style={{ marginTop: '55px' }} limit={3} />
        // </>
        <div className="navbar fixed bg-base-100 z-50 border-b-[1px] border-b-gray-500 bg-gradient-to-r from-[#22D1EE] to-[#E1F3F5] to-50%  p-0">
            <div className="navbar-start">
                <details className="dropdown">
                    <summary tabIndex={0} role="button" className="btn btn-ghost lg:hidden z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </summary>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content bg-gray-100 border-gray-300 border rounded-box z-10 mt-3 w-52 p-2 shadow">
                        <Tab
                            component={Link}
                            to="/"
                            icon={<HomeIcon className={`h-6 w-full ${isActiveTab('/') ? 'text-blue-500' : 'text-gray-500'}`} />}
                            aria-label="Home"
                        />
                        <Tab
                            component={Link}
                            to="/friends"
                            icon={<UserGroupIcon className={`h-6 w-full ${active ? 'text-blue-500' : 'text-gray-500'}`} />}
                            aria-label="Friends"
                        />
                        <Tab
                            component={Link}
                            to="/messenger"
                            icon={<ChatBubbleLeftIcon className={`h-6 w-full ${isActiveTab('/messenger') ? 'text-blue-500' : 'text-gray-500'}`} />}
                            aria-label="Messenger"
                        />
                        <Tab
                            component={Link}
                            to="/bookmark"
                            icon={<BookmarkIcon className={`h-6 w-full ${isActiveTab('/bookmark') ? 'text-blue-500' : 'text-gray-500'}`} />}
                            aria-label="Bookmark"
                        />
                    </ul>
                </details>
                <div className="flex gap-2 items-center ml-7">
                    <button className={` z-10`}>
                        <Link to="/">
                            <img src="https://i.pinimg.com/originals/0b/a9/99/0ba999174e4b5ac7e73a85cb0fe0aeb1.png" alt="Logo" className="h-12 aspect-square rounded-full shadow-md" />
                        </Link>
                    </button>
                    <div className={` grid xs:hidden`}>
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

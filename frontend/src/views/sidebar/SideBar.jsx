import React from 'react'

import { HomeIcon, UserGroupIcon, ChatBubbleLeftIcon, BookmarkIcon, GlobeAltIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function SideBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isActiveTab = (path) => {
        if (path === '/') {
            // Special case for home page to avoid matching everything
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };



    // Close sidebar when navigating on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };

        // Initial setup
        handleResize();

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Toggle sidebar for mobile
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <>
            <aside className={`mt-16 fixed z-[1] top-0 left-0 h-full border-r-2 bg-white shadow-md transition-all duration-300 
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0 w-64 md:w-1/6 lg:w-1/6`}>
                <ul className="mt-2 px-2">
                    <Link
                        to="/"
                        className={`hover:bg-[#D4D4D8] rounded-md flex items-center gap-4 p-2 my-1
                            ${isActiveTab('/') ? 'bg-[#E4E4E7]' : 'text-gray-500'}`}
                        onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                    >
                        <HomeIcon className='w-8 h-8' />
                        <span className="text-sm font-medium">Trang chủ</span>
                    </Link>
                    <Link
                        to="/friends"
                        className={`hover:bg-[#D4D4D8] rounded-md flex items-center gap-4 p-2 my-1
                            ${isActiveTab('/friends') ? 'bg-[#E4E4E7]' : 'text-gray-500'}`}
                        onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                    >
                        <UserGroupIcon className='w-8 h-8' />
                        <span className="text-sm font-medium">Bạn bè</span>
                    </Link>
                    <Link
                        to="/messenger"
                        className={`hover:bg-[#D4D4D8] rounded-md flex items-center gap-4 p-2 my-1
                            ${isActiveTab('/messenger') ? 'bg-[#E4E4E7]' : 'text-gray-500'}`}
                        onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                    >
                        <ChatBubbleLeftIcon className='w-8 h-8' />
                        <span className="text-sm font-medium">Nhắn tin</span>
                    </Link>
                    <Link
                        to="/bookmark"
                        className={`hover:bg-[#D4D4D8] rounded-md flex items-center gap-4 p-2 my-1
                            ${isActiveTab('/bookmark') ? 'bg-[#E4E4E7]' : 'text-gray-500'}`}
                        onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                    >
                        <BookmarkIcon className='w-8 h-8' />
                        <span className="text-sm font-medium">Lưu trữ</span>
                    </Link>
                    <Link
                        to="/group"
                        className={`hover:bg-[#D4D4D8] rounded-md flex items-center gap-4 p-2 my-1
                            ${isActiveTab('/group') ? 'bg-[#E4E4E7]' : 'text-gray-500'}`}
                        onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                    >
                        <GlobeAltIcon className='w-8 h-8' />
                        <span className="text-sm font-medium">Nhóm</span>
                    </Link>
                </ul>
            </aside>

            {/* Overlay for mobile when sidebar is open */}
            {sidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[0]"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}
        </>
    )
}

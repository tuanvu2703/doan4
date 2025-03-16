import React from 'react'

import { HomeIcon, UserGroupIcon, ChatBubbleLeftIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function SideBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const isActiveTab = (path) => location.pathname === path;
    const [isMessengerPath, SetIsMessengerPath] = useState(true);
    useEffect(() => {
        SetIsMessengerPath(/^\/messenger(\/|$)/.test(location.pathname));
    }, [location]);
    console.log(isMessengerPath);
    return (
        <>
            {isMessengerPath ? (
                <aside className={`mt-16 fixed z-[1] top-0 left-0 h-full border-l-2  bg-gradient-to-t from-[#22D1EE] to-[#E1F3F5] to-50% shadow-md transition-transform duration-300`}>
                    <ul className="mt-2">
                        <Link
                            to="/"
                            className={`hover:bg-blue-100 rounded-2xl flex items-center gap-6 p-2 ${isActiveTab('/') ? 'text-blue-500' : 'text-gray-500'} `}
                        >
                            <HomeIcon className='size-11' />

                        </Link>
                        <Link
                            to="/friends"
                            className={`hover:bg-green-100 rounded-2xl flex items-center gap-6 p-2 ${isActiveTab('/friends') ? 'text-green-500' : 'text-gray-500'} `}
                        >
                            <UserGroupIcon className='size-11' />
                        </Link>
                        <Link
                            onClick={() => navigate('/messenger')}
                            className={`hover:bg-yellow-100 rounded-2xl flex items-center gap-6 p-2 ${isActiveTab('/messenger') ? 'text-yellow-500' : 'text-gray-500'} `}
                        >
                            <ChatBubbleLeftIcon className='size-11' />
                        </Link>
                        <Link
                            to="/bookmark"
                            className={`hover:bg-red-100 rounded-2xl flex items-center gap-6 p-2 ${isActiveTab('/bookmark') ? 'text-red-500' : 'text-gray-500'} `}
                        >
                            <BookmarkIcon className='size-11' />
                        </Link>
                    </ul>
                </aside>
            ) : (
                <aside className={`mt-16 fixed z-[1] top-0 left-0 h-full border-l-2 w-1/4 md:w-1/5 lg:w-1/6 xl:w-1/5 bg-gradient-to-t from-[#22D1EE] to-[#E1F3F5] to-50% shadow-md transition-transform duration-300`}>
                    <ul className="mt-2">
                        <Link
                            to="/"
                            className={`hover:bg-blue-100 rounded-2xl flex items-center gap-6 p-2 ${isActiveTab('/') ? 'text-blue-500' : 'text-gray-500'} `}
                        >
                            <HomeIcon className='size-11' />
                            <span className="text-sm font-medium">Trang chủ</span>
                        </Link>
                        <Link
                            to="/friends"
                            className={`hover:bg-green-100 rounded-2xl flex items-center gap-6 p-2 ${isActiveTab('/friends') ? 'text-green-500' : 'text-gray-500'} `}
                        >
                            <UserGroupIcon className='size-11' />
                            <span className="text-sm font-medium">Bạn bè</span>
                        </Link>
                        <Link
                            to="/messenger"
                            className={`hover:bg-yellow-100 rounded-2xl flex items-center gap-6 p-2 ${isActiveTab('/messenger') ? 'text-yellow-500' : 'text-gray-500'} `}
                        >
                            <ChatBubbleLeftIcon className='size-11' />
                            <span className="text-sm font-medium">Nhắn tin</span>
                        </Link>
                        <Link
                            to="/bookmark"
                            className={`hover:bg-red-100 rounded-2xl flex items-center gap-6 p-2 ${isActiveTab('/bookmark') ? 'text-red-500' : 'text-gray-500'} `}
                        >
                            <BookmarkIcon className='size-11' />
                            <span className="text-sm font-medium">Lữu trữ</span>
                        </Link>
                    </ul>
                </aside>
            )}
        </>
    )
}

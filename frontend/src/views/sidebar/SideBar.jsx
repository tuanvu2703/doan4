import React from 'react'

import { HomeIcon, UserGroupIcon, ChatBubbleLeftIcon, BookmarkIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
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

    return (
        <>
            {isMessengerPath ? (
                <aside className={`mt-16 fixed z-[1] top-0 left-0 h-full border-l-2 shadow-md transition-transform duration-300`}>
                    <ul className="mt-2">
                        <Link
                            to="/"
                            className={`hover:bg-[#D4D4D8] rounded-md  flex items-center gap-6 p-2 ${isActiveTab('/') ? ' bg-[#E4E4E7]' : 'text-gray-500'} `}
                        >
                            <HomeIcon className='size-11' />

                        </Link>
                        <Link
                            to="/friends"
                            className={`hover:bg-[#D4D4D8] rounded-md  flex items-center gap-6 p-2 ${isActiveTab('/friends') ? ' bg-[#E4E4E7]' : 'text-gray-500'} `}
                        >
                            <UserGroupIcon className='size-11' />
                        </Link>
                        <Link
                            onClick={() => navigate('/messenger')}
                            className={`hover:bg-[#D4D4D8] rounded-md  flex items-center gap-6 p-2 ${isActiveTab('/') ? ' bg-[#E4E4E7]' : 'text-gray-500'} `}
                        >
                            <ChatBubbleLeftIcon className='size-11' />
                        </Link>
                        <Link
                            to="/bookmark"
                            className={`hover:bg-[#D4D4D8] rounded-md  flex items-center gap-6 p-2 ${isActiveTab('/bookmark') ? ' bg-[#E4E4E7]' : 'text-gray-500'} `}
                        >
                            <BookmarkIcon className='size-11' />
                        </Link>
                        <Link
                            to="/group"
                            className={`hover:bg-[#D4D4D8] rounded-md  flex items-center gap-6 p-2 ${isActiveTab('/group') ? ' bg-[#E4E4E7]' : 'text-gray-500'} `}
                        >
                            <GlobeAltIcon className='size-11' />
                        </Link>
                    </ul>
                </aside>
            ) : (
                <aside className={`mt-16 fixed z-[1] top-0 left-0 h-full border-l-2 w-1/4 md:w-1/4 lg:w-1/5 xl:w-1/6 bg-white to-50% shadow-md transition-transform duration-300`}>
                    <ul className="mt-2">
                        <Link
                            to="/"
                            className={`hover:bg-[#D4D4D8] rounded-md  flex items-center gap-6 p-2 ${isActiveTab('/') ? ' bg-[#E4E4E7]' : 'text-gray-500'} `}
                        >
                            <HomeIcon className='size-11' />
                            <span className="text-sm font-medium">Trang chủ</span>
                        </Link>
                        <Link
                            to="/friends"
                            className={`hover:bg-[#D4D4D8] rounded-md  flex items-center gap-6 p-2 ${isActiveTab('/friends') ? ' bg-[#E4E4E7]' : 'text-gray-500'} `}
                        >
                            <UserGroupIcon className='size-11' />
                            <span className="text-sm font-medium">Bạn bè</span>
                        </Link>
                        <Link
                            to="/messenger"
                            className={`hover:bg-[#D4D4D8] rounded-md  flex items-center gap-6 p-2 ${isActiveTab('/messenger') ? ' bg-[#E4E4E7]' : 'text-gray-500'} `}
                        >
                            <ChatBubbleLeftIcon className='size-11' />
                            <span className="text-sm font-medium">Nhắn tin</span>
                        </Link>
                        <Link
                            to="/bookmark"
                            className={`hover:bg-[#D4D4D8] rounded-md  flex items-center gap-6 p-2 ${isActiveTab('/bookmark') ? ' bg-[#E4E4E7]' : 'text-gray-500'} `}
                        >
                            <BookmarkIcon className='size-11' />
                            <span className="text-sm font-medium">Lữu trữ</span>
                        </Link>
                        <Link
                            to="/group"
                            className={`hover:bg-[#D4D4D8] rounded-md  flex items-center gap-6 p-2 ${isActiveTab('/group') ? ' bg-[#E4E4E7]' : 'text-gray-500'} `}
                        >
                            <GlobeAltIcon className='size-11' />
                            <span className="text-sm font-medium">Nhóm</span>
                        </Link>
                    </ul>
                </aside>
            )}
        </>
    )
}

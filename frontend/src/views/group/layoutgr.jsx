import React from 'react'
import { useState, useEffect } from 'react'
import { getPublicGroupById } from '../../service/publicGroup';
import { Link, Outlet, useParams } from 'react-router-dom'
import { GlobeAltIcon, LockClosedIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { useLocation } from 'react-router-dom';
export default function Layoutgr() {
    const [groups, setGroups] = useState({});
    const [showMobileInfo, setShowMobileInfo] = useState(false);
    const { groupid } = useParams();
    const location = useLocation();
    const basePath = location.pathname.split('/').slice(0, 3).join('/');
    const tabs = [
        {
            name: 'Bài đăng',
            href: `${basePath}`
        },
        {
            name: 'Thành viên',
            href: `${basePath}/member`
        },
    ];
    const currentTab = tabs.find((tab) => location.pathname === tab.href);
    useEffect(() => {
        async function fetchGroups() {
            try {
                const response = await getPublicGroupById(groupid);
                setGroups(response);
            } catch (error) {
                console.error("Error fetching groups:", error);
            }
        }
        fetchGroups();
    }, [groupid])

    return (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 px-2 sm:px-4">
            <div className="col-span-1 md:col-span-6">
                <div className="relative">
                    <img
                        className='w-full h-32 sm:h-48 md:h-64 lg:h-80 object-cover rounded-xl shadow-md border-2 border-gray-300'
                        src={groups.avatargroup}
                        alt={groups.groupName || 'Group cover'}
                    />
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg bg-black bg-opacity-30 px-2 py-1 rounded-lg">
                            {groups.groupName}
                        </h1>

                        <button
                            onClick={() => setShowMobileInfo(!showMobileInfo)}
                            className="block sm:hidden bg-white p-2 rounded-full shadow-lg">
                            <InformationCircleIcon className="h-6 w-6 text-blue-500" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile info panel */}
            {showMobileInfo && (
                <div className="col-span-1 block sm:hidden bg-white rounded-lg p-4 shadow-lg transition-all duration-300 ease-in-out">
                    <div className="flex justify-between items-center mb-3">
                        <h1 className="font-semibold text-lg">Thông tin nhóm</h1>
                        <button onClick={() => setShowMobileInfo(false)} className="text-gray-500">×</button>
                    </div>
                    <div className="space-y-2">
                        <span className="font-semibold block">Giới thiệu</span>
                        {groups.typegroup === 'public' ? (
                            <div className="bg-blue-50 p-2 rounded-lg">
                                <div className="flex items-center gap-2 text-blue-500">
                                    <span className="font-semibold">Nhóm công khai</span>
                                    <GlobeAltIcon className="h-5 w-5" />
                                </div>
                                <span className="text-sm">Bất kỳ ai cũng có thể nhìn thấy mọi người trong nhóm và những gì họ đăng!</span>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-2 rounded-lg">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <span className="font-semibold">Nhóm riêng tư</span>
                                    <LockClosedIcon className="h-5 w-5" />
                                </div>
                                <span className="text-sm">Chỉ thành viên trong nhóm mới có thể nhìn thấy mọi người trong nhóm và những gì họ đăng!</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <div className="hidden sm:block col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 bg-white rounded-lg p-4 shadow-lg sticky top-16 self-start transition-all duration-300 ease-in-out">
                <div className="space-y-3">
                    <h1 className="font-semibold text-lg border-b pb-2">Thông tin</h1>
                    <div className="space-y-4">
                        <span className="text-xl sm:text-2xl font-bold block">{groups.groupName}</span>
                        <span className="font-semibold block">Giới thiệu</span>
                        {groups.typegroup === 'public' ? (
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 text-blue-500 mb-1">
                                    <span className="font-semibold">Nhóm công khai</span>
                                    <GlobeAltIcon className="h-5 w-5" />
                                </div>
                                <span className="text-sm">Bất kỳ ai cũng có thể nhìn thấy mọi người trong nhóm và những gì họ đăng!</span>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                    <span className="font-semibold">Nhóm riêng tư</span>
                                    <LockClosedIcon className="h-5 w-5" />
                                </div>
                                <span className="text-sm">Chỉ thành viên trong nhóm mới có thể nhìn thấy mọi người trong nhóm và những gì họ đăng!</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="col-span-1 sm:col-span-4 md:col-span-4 bg-white rounded-lg p-4 shadow-md">
                <div className="flex justify-center w-full gap-2 sm:gap-4 p-3 sm:p-5 border-b mb-4">
                    {tabs.map(({ name, href }) => (
                        <Link
                            key={name}
                            to={href}
                            className={`rounded-full py-1 sm:py-2 px-3 sm:px-4 text-sm font-semibold transition-all duration-200 hover:bg-gray-100 focus:outline-none ${currentTab?.href === href ? 'bg-gray-600 text-white hover:bg-gray-700' : 'text-gray-700'}`}>
                            {name}
                        </Link>
                    ))}
                </div>
                <Outlet />
            </div>
        </div>
    )
}

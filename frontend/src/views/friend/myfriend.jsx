import React from 'react';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';


export default function Myfriend() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Hàm toggle để mở/đóng sidebar

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };
    return (
        <div className="flex">
            {/* Sidebar */}
            <div className="fixed right-0 h-full bg-white shadow-md shadow-slate-500 w-64 md:w-1/5 lg:w-1/6 p-4 hidden md:flex flex-col">
                <div className="w-full border-b border-gray-400 py-4 text-2xl">
                    <strong>Bạn bè</strong>
                </div>
                <div className="flex flex-col w-full pt-3">
                    <a href='/friends'>
                        <button className="w-full p-3 pl-5 rounded-2xl text-start hover:bg-blue-100">
                            <strong>Trang chủ</strong>
                        </button>
                    </a>
                    <a href='/friends/requests'>
                        <button className="w-full p-3 pl-5 rounded-2xl text-start hover:bg-blue-100">
                            <strong>Lời mời kết bạn</strong>
                        </button>
                    </a>
                    <a href='/friends/list'>
                        <button className="w-full p-3 pl-5 rounded-2xl text-start hover:bg-blue-100">
                            <strong>Bạn bè</strong>
                        </button>
                    </a>
                </div>
            </div>

            {/* Nội dung chính */}
            <div className="w-full md:pr-[20%] h-full">
                <Outlet />
            </div>

            <>
                {/* Nút mở sidebar trên mobile */}
                <button
                    onClick={toggleSidebar}
                    className="fixed bottom-5 right-5 bg-blue-400 text-white p-3 rounded-full md:hidden z-50"
                >
                    ☰
                </button>

                {/* Sidebar mở bên phải */}
                <div
                    className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    {/* Header của Sidebar */}
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-semibold">Menu</h2>
                    </div>
                    {/* Nội dung của Sidebar */}
                    <nav className="p-4">
                        <div className="w-full border-b border-gray-400 py-4 text-2xl">
                            <strong>Bạn bè</strong>
                        </div>
                        <div className="flex flex-col w-full pt-3">
                            <a href='/friends'>
                                <button className="w-full p-3 pl-5 rounded-2xl text-start hover:bg-blue-100">
                                    <strong>Trang chủ</strong>
                                </button>
                            </a>
                            <a href='/friends/requests'>
                                <button className="w-full p-3 pl-5 rounded-2xl text-start hover:bg-blue-100">
                                    <strong>Lời mời kết bạn</strong>
                                </button>
                            </a>
                            <a href='/friends/list'>
                                <button className="w-full p-3 pl-5 rounded-2xl text-start hover:bg-blue-100">
                                    <strong>Bạn bè</strong>
                                </button>
                            </a>
                        </div>
                    </nav>
                </div>

                {/* Overlay (mờ nền khi sidebar mở) */}
                {isSidebarOpen && (
                    <div
                        onClick={toggleSidebar}
                        className="fixed inset-0 bg-black opacity-50 md:hidden z-30"
                    ></div>
                )}
            </>
        </div>

    );
}

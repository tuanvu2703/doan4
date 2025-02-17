import React from 'react';
import { Outlet } from 'react-router-dom';

export default function Myfriend() {
    return (
        <div className='h-screen'
            style={{
                marginTop: '-64px',
                paddingTop: '64px'
            }}
        >
            {/* Sidebar chuyển sang bên phải */}
            <div className="flex flex-col shadow-md shadow-slate-500 w-1/5 fixed right-0 items-center min-h-full px-4">
                <div className="w-full border-b border-b-gray-400 py-4 text-2xl">
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

            {/* Nội dung chính dịch sang trái để chừa chỗ cho sidebar */}
            <div className="pr-[20%] h-full w-full">
                <Outlet />
            </div>
        </div>
    );
}

import { Link, Outlet } from "react-router-dom";
import { useState } from "react";

export default function LayoutSearch() {

    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    return (
        <div className="relative">
            {/* Nút mở Sidebar chỉ hiển thị trên mobile */}
            <button
                className="fixed bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full md:hidden z-50 shadow-lg"
                onClick={() => setMobileSidebarOpen(true)}
            >
                ☰
            </button>

            {/* Nội dung chính với margin phải để tránh bị che sidebar trên desktop */}
            <div className="w-full md:w-[80%] px-4 md:mr-[20%]">
                <Outlet />
            </div>

            {/* Sidebar cố định trên desktop */}
            <div className="fixed top-16 right-0 w-full md:w-1/5 min-h-screen hidden md:flex flex-col shadow-md shadow-slate-500 items-center px-4">
                <div className="w-full border-b border-b-gray-400 py-4 text-2xl">
                    <strong>Kết quả tìm kiếm</strong>
                </div>
                <div className="flex flex-col w-full pt-3">
                    <strong className="pb-2">Bộc lọc</strong>
                    <Link
                        to={`/search/all`}
                        className="w-full p-3 pl-5 rounded-2xl text-start hover:bg-blue-100"
                    >
                        <strong>Tất cả</strong>
                    </Link>
                    <Link
                        to={`/search/content`}
                        className="w-full p-3 pl-5 rounded-2xl text-start hover:bg-blue-100"
                    >
                        <strong>Bài viết</strong>
                    </Link>
                    <Link
                        to={`/search/user`}
                        className="w-full p-3 pl-5 rounded-2xl text-start hover:bg-blue-100"
                    >
                        <strong>Mọi người</strong>
                    </Link>
                </div>
            </div>

            {/* Sidebar cho Mobile: xuất hiện dưới dạng overlay từ bên phải */}
            {mobileSidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop mờ, nhấn vào đây để đóng sidebar */}
                    <div
                        className="absolute inset-0 bg-black opacity-50"
                        onClick={() => setMobileSidebarOpen(false)}
                    ></div>

                    {/* Nội dung sidebar được căn về bên phải */}
                    <div className="absolute top-16 right-0 bg-white w-4/5 max-w-sm min-h-screen shadow-lg p-4">
                        {/* Nút đóng sidebar */}
                        <button
                            className="absolute top-4 right-4 text-2xl"
                            onClick={() => setMobileSidebarOpen(false)}
                        >
                            &times;
                        </button>
                        <div className="w-full border-b border-b-gray-400 py-4 text-2xl">
                            <strong>Kết quả tìm kiếm</strong>
                        </div>
                        <div className="flex flex-col w-full pt-3">
                            <strong className="pb-2">Bộc lọc</strong>
                            <Link
                                to={`/search/all`}
                                className="w-full p-3 pl-5 rounded-2xl text-start hover:bg-blue-100"
                                onClick={() => setMobileSidebarOpen(false)}
                            >
                                <strong>Tất cả</strong>
                            </Link>
                            <Link
                                to={`/search/content`}
                                className="w-full p-3 pl-5 rounded-2xl text-start hover:bg-blue-100"
                                onClick={() => setMobileSidebarOpen(false)}
                            >
                                <strong>Bài viết</strong>
                            </Link>
                            <Link
                                to={`/search/user`}
                                className="w-full p-3 pl-5 rounded-2xl text-start hover:bg-blue-100"
                                onClick={() => setMobileSidebarOpen(false)}
                            >
                                <strong>Mọi người</strong>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>

    )
};
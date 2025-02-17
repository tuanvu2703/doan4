import { Link, Outlet } from "react-router-dom";

export default function LayoutSearch() {
    const handChaneSearch = () => {
    }
    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            <div className="w-full md:w-[80%] px-4">
                <Outlet />
            </div>
            <div className="flex flex-col shadow-md shadow-slate-500 w-full md:w-1/5 min-h-screen fixed md:static right-0 items-center px-4 hidden md:flex">
                <div className="w-full border-b border-b-gray-400 py-4 text-2xl">
                    <strong>Kết quả tìm kiếm</strong>
                </div>
                <div className="flex flex-col w-full pt-3">
                    <strong className="pb-2">Bộc lọc</strong>
                    <Link to={`/search/all`} className="w-full p-3 pl-5 rounded-2xl text-start hover:bg-blue-100 ">
                        <strong>Tất cả</strong>
                    </Link>
                    <Link to={`/search/content`} className="w-full p-3 pl-5 rounded-2xl text-start hover:bg-blue-100">
                        <strong>Bài viết</strong>
                    </Link>
                    <Link to={`/search/user`} className="w-full p-3 pl-5 rounded-2xl text-start hover:bg-blue-100">
                        <strong>Mọi người</strong>
                    </Link>
                </div>
            </div>
        </div>
    )
};
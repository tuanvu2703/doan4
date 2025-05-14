import React from 'react'
import { Squares2X2Icon, CubeIcon, IdentificationIcon, FlagIcon } from '@heroicons/react/24/solid'
import { Link, Outlet, useLocation } from 'react-router-dom'


export default function SideBarAdmin() {
    const location = useLocation();
    const isActiveTab = (path) => location.pathname === path;
    return (
        // <div className='h-screen w-full sm:w-1/3 md:w-1/4 lg:w-1/5 bg-[#393E46]'>
        // <div className='text-center'>
        //     <div className='py-7 mx-7 font-semibold text-2xl border-b-2 border-[#EEEEEE]'>
        //         ADMINISTRATOR
        //     </div>
        // </div>

        //     <div className='my-5 mx-2'>
        //         <ul className=' text-lg'>
        //             {/* DASHBOARD */}
        // <Link to={'/admin'}>
        //     <li className='flex items-center gap-4 py-3 px-7 hover:bg-[#00ADB5]'>

        // <Squares2X2Icon className='size-7 fill-current' />
        // <span className='max-sm:hidden'>Dashboard</span>
        //     </li>
        // </Link>

        //             <Link to={"user-management"}>
        //                 <li className='flex items-center gap-4 py-3 px-7 hover:bg-[#00ADB5]'>
        //                     <IdentificationIcon className='size-7 fill-current ' />
        //                     <span className='max-sm:hidden'>User</span>
        //                 </li>
        //             </Link>
        //             <li className='flex items-center gap-4 py-3 px-7 hover:bg-[#00ADB5]'>
        //                 <CubeIcon className='size-7 fill-current ' />
        //                 <span className='max-sm:hidden'>Posts</span>
        //             </li>
        //             <li className='flex items-center gap-4 py-3 px-7 hover:bg-[#00ADB5]'>
        //                 <TagIcon className='size-7 fill-current ' />
        //                 <span className='max-sm:hidden'>Tags</span>
        //             </li>
        //             <li className='flex items-center gap-4 py-3 px-7 hover:bg-[#00ADB5]'>
        //                 <ChatBubbleLeftRightIcon className='size-7 fill-current' />
        //                 <span className='max-sm:hidden'>Comments</span>
        //             </li>
        //         </ul>
        //     </div>
        // </div>
        <div className="drawer lg:drawer-open">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content flex flex-col ">
                {/* Page content here */}
                <label htmlFor="my-drawer-2" className="btn fixed bg-black text-white drawer-button lg:hidden top-0 left-0">
                    Menu
                </label>
                <Outlet />
            </div>
            <div className="drawer-side">
                <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>

                <ul className="menu bg-[#050709] min-h-full w-72 p-4 border-r-[1px]">
                    {/* Sidebar content here */}
                    <div className='text-center'>
                        <div className='py-7  font-semibold text-[#FFFFFF] text-2xl border-b-2 border-[#FFFFFF]'>
                            Administrator
                        </div>
                    </div>
                    <div className={`py-3 px-7 my-2 hover:bg-[#353535] rounded-md ${isActiveTab('/admin') ? 'bg-[#1D1D1D]' : ''}`}>
                        <Link className='flex items-center gap-4' to={'/admin'}>
                            <Squares2X2Icon className='size-7 fill-current' />
                            <span >Dashboard</span>
                        </Link>
                    </div>
                    <div className={`py-3 px-7 my-2 hover:bg-[#353535] rounded-md ${isActiveTab('/admin/user') ? 'bg-[#1D1D1D]' : ''}`}>
                        <Link className='flex items-center gap-4' to={'/admin/user'}>
                            <IdentificationIcon className='size-7 fill-current ' />
                            <span>User Management</span>
                        </Link>
                    </div>
                    <div className={`py-3 px-7 my-2 hover:bg-[#353535] rounded-md ${isActiveTab('/admin/post') ? 'bg-[#1D1D1D]' : ''}`}>
                        <Link className='flex items-center gap-4' to={'/admin/post'}>
                            <CubeIcon className='size-7 fill-current ' />
                            <span>Post Management</span>
                        </Link>
                    </div>

                    <div className={`py-3 px-7 my-2 hover:bg-[#353535] rounded-md ${isActiveTab('/admin/report/post') ? 'bg-[#1D1D1D]' : ''}`}>
                        <Link className='flex items-center gap-4' to={'/admin/report/post'}>
                            <FlagIcon className='size-7 fill-current ' />
                            <span>Report Post Management</span>
                        </Link>
                    </div>

                    <div className={`py-3 px-7 my-2 hover:bg-[#353535] rounded-md ${isActiveTab('/admin/report/post') ? 'bg-[#1D1D1D]' : ''}`}>
                        <Link className='flex items-center gap-4' to={'/admin/apeal'}>
                            <FlagIcon className='size-7 fill-current ' />
                            <span>Apeal Post Management</span>
                        </Link>
                    </div>
                </ul>
            </div>
        </div>
    )
}

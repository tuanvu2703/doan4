import { React, useState } from 'react'

import { Link } from 'react-router-dom'
import { UserCircleIcon, ShieldExclamationIcon, ArrowRightEndOnRectangleIcon } from '@heroicons/react/24/solid'
import ChangePass from '../../auth/ChangePassPage'
import LogOut from '../Status/Logout'

export default function DropdownProfile({ user }) {
    const [logout, setLogout] = useState(false)

    function sys() {
        setLogout(!logout);
    }

    return (
        <div className="dropdown dropdown-end hover:bg-[#91ced9] p-2 rounded-sm mx-3">
            <div tabIndex={0} role="button" className=" flex flex-row items-center">
                <img
                    className='rounded-full aspect-square w-10'
                    alt="Profile"
                    src={`${user && user.avatar ? user.avatar : "https://th.bing.com/th/id/OIP.PKlD9uuBX0m4S8cViqXZHAHaHa?rs=1&pid=ImgDetMain"}`} />
                <h3
                    className="font-semibold truncate overflow-hidden whitespace-nowrap ml-3"
                    title={user ? ` ${user.firstName || ''}`.trim() : "No Name"}
                >
                    {user ? ` ${user.firstName || ''}`.trim() : "No Name"}
                </h3>
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-300 rounded-box z-[1] w-52 p-2 shadow gap-2">
                <li>
                    <Link to={"myprofile"} className="btn btn-outline btn-info">
                        <UserCircleIcon className='size-5' />
                        Trang cá nhân
                    </Link>
                </li>
                <li>
                    <Link to={"changepass"} className="btn btn-outline btn-accent">
                        <ShieldExclamationIcon className='size-5' />
                        Đổi mật khẩu
                    </Link>
                </li>
                <li>
                    <Link onClick={sys} className="btn btn-outline btn-error">
                        <ArrowRightEndOnRectangleIcon className='size-5' />
                        Đăng xuất
                    </Link>
                </li>
            </ul>
            {logout && (
                <LogOut btnOffLogout={sys} />
            )}
        </div>
    )
}

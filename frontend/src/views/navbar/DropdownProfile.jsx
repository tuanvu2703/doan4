import { React, useState } from 'react'

import { Link } from 'react-router-dom'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import ChangePass from '../../auth/ChangePassPage'
import LogOut from '../Status/Logout'

export default function DropdownProfile({ user }) {
    const [logout, setLogout] = useState(false)

    function sys() {
        setLogout(!logout);
    }

    return (
        <div className="dropdown dropdown-end hover:bg-gray-300 p-3 rounded-3xl">
            <div tabIndex={0} role="button" className="ml-3 flex flex-row items-center">
                <img
                    className="rounded-full aspect-square w-10"
                    alt="Profile"
                    src={`${user && user.avatar ? user.avatar : "https://th.bing.com/th/id/OIP.PKlD9uuBX0m4S8cViqXZHAHaHa?rs=1&pid=ImgDetMain"}`}
                />
                {/* Ẩn tên user trên màn hình nhỏ */}
                <h3
                    className="font-semibold truncate w-[110px] overflow-hidden whitespace-nowrap ml-3 hidden md:block"
                    title={user ? ` ${user.firstName || ''}`.trim() : "No Name"}
                >
                    {user ? ` ${user.firstName || ''}`.trim() : "No Name"}
                </h3>
            </div>

            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box w-52 p-2 shadow gap-2">
                <li>
                    <Link to={"myprofile"} className="btn">
                        <UserCircleIcon className="size-5" />
                        Trang cá nhân
                    </Link>
                </li>
                <li>
                    <Link to={"changepass"} className="btn">
                        Đổi mật khẩu
                    </Link>
                </li>
                <li>
                    <Link onClick={sys} className="btn btn-error">
                        Đăng xuất
                    </Link>
                </li>
            </ul>

            {logout && <LogOut btnOffLogout={sys} />}
        </div>

    )
}

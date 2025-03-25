import { React, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserCircleIcon, ShieldExclamationIcon, ArrowRightEndOnRectangleIcon } from '@heroicons/react/24/solid'
import authToken from '../../components/authToken'

export default function DropdownProfile({ user }) {

    const [dropdownOpen, setDropdownOpen] = useState(false)

    function logout() {
        authToken.deleteToken();
        
        setTimeout(() => {
            window.location.href = '/login';
        }, 10); 
    }


    function handleLinkClick() {
        setDropdownOpen(false);
    }


    return (
        <div className="dropdown dropdown-end hover:bg-[#91ced9] p-2 rounded-sm mx-3">
            <div tabIndex={0} role="button" className=" flex flex-row items-center" onClick={() => setDropdownOpen(!dropdownOpen)}>
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
            {dropdownOpen && (
                <ul tabIndex={0} className="dropdown-content menu bg-base-300 rounded-box z-[1] w-52 p-2 shadow gap-2">
                    <li>
                        <Link to={"myprofile"} className="btn btn-outline btn-info" onClick={handleLinkClick}>
                            <UserCircleIcon className='size-5' />
                            Trang cá nhân
                        </Link>
                    </li>
                    <li>
                        <Link to={"changepass"} className="btn btn-outline btn-accent" onClick={handleLinkClick}>
                            <ShieldExclamationIcon className='size-5' />
                            Đổi mật khẩu
                        </Link>
                    </li>
                    <li>
                        <button onClick={() => logout()} className="btn btn-outline btn-error">
                            <ArrowRightEndOnRectangleIcon className='size-5' />
                            Đăng xuất
                        </button>
                    </li>
                </ul>
            )}

        </div>
    )
}
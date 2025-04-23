
import {
    ChevronDownIcon,
    HeartIcon,
    ChatBubbleOvalLeftIcon,
    NoSymbolIcon,
    UserMinusIcon
} from '@heroicons/react/16/solid'
import { Link } from 'react-router-dom'
import friend from '../../service/friend';
import NotificationCss from '../../module/cssNotification/NotificationCss';
import { useState } from 'react';

import { toast } from 'react-toastify';

export default function DropdownMyfriend({ userdata }) {
    const [friendStatus, setFriendStatus] = useState(null);
    const chaneUrl = async (url) => {
        window.location.href = String(url);
    };

    const handRemoveFriend = async (id) => {
        try {
            const rs = await friend.cancelFriend(id);
            if (rs.success) {
                toast.success(rs?.message ? rs.message : 'Đã hủy kết bạn', NotificationCss.Success);
                setFriendStatus("pending");

            } else {
                toast.error(rs?.message ? rs.message : 'hủy kết bạn thất bại', NotificationCss.Fail);
            }
        } catch (error) {
            toast.error('hủy kết bạn thất bại', NotificationCss.Fail);
        }
    };
    return (
        <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="p-2 hover:bg-gray-300 rounded-full">
                <ChevronDownIcon className="size-5 fill-black" />
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow border-[1px] border-gray-300">
                {/* <li>
                    <Link className="  data-[focus]:bg-[#3f3f46] p-2 rounded-md flex items-center gap-2" to="#">
                        <HeartIcon className="size-5 fill-red-600" />
                        Yêu thích
                    </Link>
                </li> */}
                <li>
                    <Link onClick={userdata?._id ? () => chaneUrl(`/messenger/?iduser=${userdata?.receiver?._id || userdata?.sender?._id}`) : undefined}
                        className="  data-[focus]:bg-[#3f3f46] p-2 rounded-md flex items-center gap-2" >
                        <ChatBubbleOvalLeftIcon className="size-5 fill-blue-300" />
                        Nhắn tin
                    </Link>
                </li>
                {/* <li>
                    <Link className="  data-[focus]:bg-[#3f3f46] p-2 rounded-md flex items-center gap-2" to="#">
                        <NoSymbolIcon className="size-5 fill-red-800" />
                        Chặn
                    </Link>
                </li> */}
                <li>
                    <Link onClick={() => userdata ? handRemoveFriend(userdata?.receiver?._id || userdata?.sender?._id) : ''}
                        className=" data-[focus]:bg-[#3f3f46] p-2 rounded-md flex items-center gap-2" >
                        <UserMinusIcon className="size-5 fill-red-500" />
                        Hủy kết bạn
                    </Link>
                </li>
            </ul>
        </div>


        // <Menu>
        //     <MenuButton>
        //         {/* <ChevronDownIcon className="size-7 fill-white/60" /> */}
        //         {nameBTN}
        //     </MenuButton>
        //     <MenuItems anchor="bottom" className="w-52 bg-[#343455] rounded-md p-1">
        //         <MenuItem>
        // <a className="text-white block data-[focus]:bg-[#3f3f46] p-2 rounded-md flex items-center gap-2" href="#">
        //     <HeartIcon className="size-5 fill-red-600" />
        //     Yêu thích
        // </a>
        //         </MenuItem>
        //         <MenuItem>
        // <a className="text-white block data-[focus]:bg-[#3f3f46] p-2 rounded-md flex items-center gap-2" href="#">
        //     <ChatBubbleOvalLeftIcon className="size-5 fill-blue-300" />
        //     Nhắn tin
        // </a>
        //         </MenuItem>
        //         <MenuItem>
        // <a className="text-white block data-[focus]:bg-[#3f3f46] p-2 rounded-md flex items-center gap-2" href="#">
        //     <NoSymbolIcon className="size-5 fill-red-800" />
        //     Chặn
        // </a>
        //         </MenuItem>
        //         <MenuItem>
        // <a className="text-white block data-[focus]:bg-[#3f3f46] p-2 rounded-md flex items-center gap-2" href="#">
        //     <UserMinusIcon className="size-5 fill-red-500" />
        //     Hủy kết bạn
        // </a>
        //         </MenuItem>
        //     </MenuItems>
        // </Menu>
    )
}

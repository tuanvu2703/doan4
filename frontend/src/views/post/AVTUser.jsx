import React from 'react'
import CardUser from './CardUser'
import usersrv from '../../service/user';
export default function AVTUser({ user }) {
    const handDetailUser = async (id) => {
        window.location.href = `/user/${id}`;
    };
    return (
        <div div className="dropdown dropdown-hover"
            // lý do ấn nút bạn bè , nhắn tin khi dropdow bị đẩy sang detail user 
            onClick={() => handDetailUser(user._id)}
        //this, reper handDetailUser Lozz Vu
        >
            <div tabIndex={0} >
                <img
                    className='aspect-square w-12 rounded-full border-[1px] border-black cursor-pointer'
                    src={`${user?.avatar ? user?.avatar : "https://th.bing.com/th/id/OIP.PKlD9uuBX0m4S8cViqXZHAHaHa?rs=1&pid=ImgDetMain"}`} alt='' />
            </div>
            {/* <ul tabIndex={0} className="dropdown-content menu bg-white border-2 rounded-box z-10 w-[350px] p-1 shadow">
                <CardUser user={user} />
            </ul> */}
        </div >

    )
}

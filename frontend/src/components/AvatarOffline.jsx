import React from 'react'

export default function AvatarOffline({ avatar }) {
    return (
        <div className="avatar offline">
            <div className="w-12 rounded-full border-[1px]">
                <img src={avatar ? avatar : "https://th.bing.com/th/id/OIP.PKlD9uuBX0m4S8cViqXZHAHaHa?rs=1&pid=ImgDetMain"} alt='' />
            </div>
        </div>
    )
}

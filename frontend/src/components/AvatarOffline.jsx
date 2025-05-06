import React from 'react'

export default function AvatarOffline({ avt }) {
    return (
        <div className="avatar offline">
            <div className="w-12 rounded-full">
                <img src={avt || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} alt='' />
            </div>
        </div>
    )
}

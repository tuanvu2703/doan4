import React from 'react'

export default function AvatarOnline({ avt }) {
    return (
        <div className="avatar avatar-online">
            <div className="w-24 rounded-full">
                <img src={`${avt}`} alt=''/>
            </div>
        </div>
    )
}

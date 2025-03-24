import React from 'react'

export default function Stat({ title, value, desc, icon }) {
    return (
        <div className="stats shadow rounded-sm bg-[#292929] text-[#FFFFFF]">
            <div className="stat">
                <div className="stat-figure ">
                    {icon}
                </div>
                <div className="stat-title text-[#FFFFFF]">{title}</div>
                <div className="stat-value text-[#FFFFFF]">{value}</div>
            </div>
        </div>
    )
}

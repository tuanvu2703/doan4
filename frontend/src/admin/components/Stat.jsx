import React from 'react'

export default function Stat({ title, value, desc, icon }) {
    return (
        <div className="stats shadow rounded-sm">
            <div className="stat">
                <div className="stat-figure">
                    {icon}
                </div>
                <div className="stat-title">{title}</div>
                <div className="stat-value">{value}</div>
                <div className="stat-desc">21% more than last month</div>
            </div>
        </div>
    )
}

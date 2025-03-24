import React from 'react'
import { Outlet } from 'react-router-dom'
import SideBarAdmin from './SideBarAdmin'

export default function LayoutAdmin() {
    return (
        <div className='bg-[#050709] text-[#EEEEEE]'>
            <SideBarAdmin />
        </div>
    )
}

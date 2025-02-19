import React from 'react'
import { Outlet } from 'react-router-dom'

import HeadProfile from '../components/HeadProfile'
import MenuProfile from '../components/MenuProfile'


export default function Personal() {

    return (
        <div className="flex justify-center sm:px-6 lg:px-8">
            <div className="w-full max-w-[1200px]">
                <HeadProfile />
                <MenuProfile />
                <div className="flex justify-center">
                    <div className="w-full max-w-[800px] min-h-screen">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>

    )
}

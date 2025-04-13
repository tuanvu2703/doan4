import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import ModalCreateGroup from '../../../components/ModalCreateGroup';

export default function SelectGroup() {

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
            <div className="flex flex-col gap-8 bg-white rounded-lg shadow-md p-6">
                <button
                    onClick={() => document.getElementById('my_modal_create_group').showModal()}
                    className='bg-white hover:bg-gray-50 transition-colors duration-200 rounded-md border border-gray-300 py-2 px-4 text-center font-medium hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'>
                    Tạo nhóm mới
                </button>

                <div className='flex flex-col gap-4'>
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Nhóm đã tham gia</h2>

                    <div className="grid gap-2 sm:grid-cols-1 md:grid-cols-1">
                        <Link to={"detail"} className="block w-full">
                            <div className='flex gap-3 items-center p-3 hover:bg-gray-100 rounded-md border border-transparent hover:border-gray-200 transition-all duration-200'>
                                <img src="https://www.w3schools.com/howto/img_avatar.png" alt="" className='w-12 h-12 rounded-full object-cover' />
                                <div className="flex flex-col">
                                    <span className="font-medium">Nhóm 1</span>
                                    <span className="text-sm text-gray-500">5 thành viên</span>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
            <ModalCreateGroup />
        </div>
    )
}

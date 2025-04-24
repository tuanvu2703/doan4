import React from 'react'

export default function RowFriendRight() {
    return (
        <div className='fixed right-0 h-screen bg-white w-1/5 rounded-lg'>
            <div className='p-3'>
                <div className='text-center font-semibold text-xl'>Bạn bè</div>
                <div className='flex items-center gap-3 my-2'>
                    <div className='flex items-center gap-3 my-2'>
                        <img src="https://th.bing.com/th/id/OIP.lSYjKabdyrW-9CcKmVXmtQHaHI?rs=1&pid=ImgDetMain" alt="user" className='w-12 h-12 rounded-full border-gray-300 border-2' />
                    </div>
                    <div>
                        <h3 className='font-semibold'>Nguyễn Văn A</h3>
                        <p className='text-sm text-gray-500'>Hà Nội</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

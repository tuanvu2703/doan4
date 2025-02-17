import React from 'react'
import PostPersonal from '../../post/PostPersonal.jsx'
import PostStatus from '../../post/components/PostStatus.jsx'
import { useState, useEffect } from 'react'
import { profileUserCurrent } from '../../../service/ProfilePersonal.js'




export default function MyPosts() {
    const [userLogin, setUserLogin] = useState({})

    useEffect(() => {
        const fetchdata = async () => {
            const responseUserPersonal = await profileUserCurrent()
            setUserLogin(responseUserPersonal?.data)
        }
        fetchdata()
    }, []);
    return (
        <div className="grid gap-5 mt-5 rounded-md px-4 sm:px-6 lg:px-8">
            <PostStatus user={userLogin} />
            <div>
                <p className='text-xl font-semibold'>Bài viết của tôi</p>
                <div className='grid gap-3 grid-cols-1'>
                    <PostPersonal user={userLogin} />
                </div>
            </div>
        </div>
    )
}

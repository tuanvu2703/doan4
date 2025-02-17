import React from 'react'
import { Link } from 'react-router-dom'
import user from '../../../service/user';
import { useEffect, useState } from 'react';
import friend from '../../../service/friend';
import DropdownMyfriend from '../DropdownMyfriend'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
export default function MyFriendCard({ userdata }) {
    // const [userdata, setUserdata] = useState({});
    // const [loading, setLoading] = useState(true); // Loading state
    // useEffect(() => {
    //     const fetchdata = async () => {

    //         try {
    //             const res = await user.getProfileUser(iduser);
    //             if (res.success) {
    //                 setUserdata(res.data)
    //                 console.log(res.data)
    //             }
    //         } catch (error) {
    //             console.error('Error fetching user data:', error);
    //         } finally {
    //             setLoading(false); // Stop loading
    //         }
    //     };
    //     fetchdata();
    // }, [iduser]);
    // if (loading) {
    //     return (
    //         <div className="w-full h-full flex justify-center items-center">
    //             Loading...
    //         </div>
    //     )
    // }
    const handBlock = async (id) => {
        try {

            const rs = await friend.accectRequestAddFriend(id)
            if (rs.success) {
                console.log(rs)
                if (rs.data.message && rs.data) {
                    alert(rs.data.message);
                } else {
                    alert('thêm bạn bè thành công');
                }
                window.location.reload();
            } else {
                alert(rs.data.message);
            }
        } catch (error) {
            console.error(error);
        }
    };
    const handCancel = async (id) => {
        try {
            const rs = await friend.cancelFriend(id)
            if (rs.success) {
                alert(rs.data.message);
                window.location.reload();
            } else {
                alert(rs.data.message);
            }
            // console.log(rs);
        } catch (error) {
            console.error(error);
        }
    };
    return (
        <div className=''>
            <div className='border border-gray-300 shadow-md max-w-56 max-h-96 h-80 rounded-lg '>
                <Link>
                    <img className='h-52 w-full p-2' alt=''
                        src="https://www.didongmy.com/vnt_upload/news/05_2024/anh-27-meme-dang-yeu-didongmy.jpg" />
                </Link>
                <Link className='text-black px-3 font-bold flex justify-center'>
                    {userdata ? (userdata.firstName ? userdata.firstName : '', userdata.lastName ? userdata.lastName : '') : 'No Name'}
                </Link>
                <div className='flex justify-around mt-5 items-center'>
                    <button
                        className=" rounded bg-sky-600 p-3 text-sm text-white data-[hover]:bg-sky-500 data-[active]:bg-sky-700 data-[disabled]:bg-gray-500"
                    >
                        Xem trang cá nhân
                    </button>

                    <DropdownMyfriend nameBTN={<ChevronDownIcon className="size-7 fill-white/60" />} />
                </div>
            </div>
        </div>

    )
}

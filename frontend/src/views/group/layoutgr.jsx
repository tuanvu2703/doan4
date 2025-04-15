import React from 'react'
import { useState, useEffect } from 'react'
import { getPublicGroupById } from '../../service/publicGroup';
import { Outlet, useParams } from 'react-router-dom'
import { GlobeAltIcon, LockClosedIcon } from '@heroicons/react/24/solid';
export default function Layoutgr() {
    const [groups, setGroups] = useState({});
    const [members, setMembers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { groupid } = useParams();

    useEffect(() => {
        async function fetchGroups() {
            try {
                const response = await getPublicGroupById(groupid);
                setGroups(response);
            } catch (error) {
                console.error("Error fetching groups:", error);
            }
        }
        fetchGroups();
    }, [groupid])
    console.log(groups);
    return (
        <div className="grid grid-cols-6 gap-2">
            <div className="col-span-6">
                <img
                    className='max-h-80 border-b-4 border-l-2 border-r-2 border-gray-500 w-full object-cover rounded-xl shadow-md'
                    src={groups.avatargroup}
                    alt={groups.avatargroup}
                />
            </div>
            <div className="col-span-2 bg-white row-start-2 rounded-lg p-5 sticky top-12 shadow-lg self-start ">
                <div className='grid'>
                    <h1 className='font-semibold text-lg mb-2'>Thông tin</h1>
                    <span className='text-3xl font-bold '>{groups.groupName}</span>
                    <span className='font-semibold'>Giới thiệu</span>
                    {/* <span>{groups.desc}</span> */}
                    {groups.typegroup === 'public' ? (
                        <div>
                            <div className='flex items-center gap-2 text-blue-500'>
                                <span className='font-semibold'>Nhóm công khai</span>
                                <GlobeAltIcon className='size-6 ' />
                            </div>
                            <span>Bất kỳ ai cũng có thể nhìn thấy mọi người trong nhóm và những gì họ đăng!</span>
                        </div>
                    ) : (
                        <div>
                            <div className='flex items-center gap-2 text-gray-500'>
                                <span className='font-semibold'>Nhóm riêng tư</span>
                                <LockClosedIcon className='size-6' />
                            </div>
                            <span>Chỉ thành viên trong nhóm mới có thể nhìn thấy mọi người trong nhóm và những gì họ đăng!</span>
                        </div>
                    )}
                </div>
            </div>
            <div>

            </div>
            <div className="col-span-4 row-start-2 rounded-lg bg-white p-4 text-center">
                <Outlet />
            </div>
        </div >
    )
}

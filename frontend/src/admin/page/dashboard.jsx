import React from 'react'
import Stat from '../components/Stat'
import { useState, useEffect } from 'react'
import { UserIcon, CubeIcon, FlagIcon, CheckBadgeIcon, EllipsisHorizontalCircleIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline'

import { getAllPost, getALlReport, getAllUser } from '../../service/admin'

export default function Dashboard() {
    const [user, setUser] = useState([])
    const [post, setPost] = useState([])
    const [report, setReport] = useState([])
    const [rppending, setRpPending] = useState([])
    const [rpdone, setRpDone] = useState([])
    const [rpreject, setRpReject] = useState([])
    const [postHidden, setPostHidden] = useState([])
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const responseUser = await getAllUser();
                const responsePost = await getAllPost();
                const responseReport = await getALlReport();
                setUser(responseUser.data);
                setPost(responsePost.data);
                setReport(responseReport.data);
                setPostHidden(responsePost.data.filter((post) => post.isActive === false));
                setRpPending(responseReport.data.filter((report) => report.status === 'pending'))
                setRpDone(responseReport.data.filter((report) => report.status === 'resolved'))
                setRpReject(responseReport.data.filter((report) => report.status === 'rejected'))
            }
            catch (error) {
                console.error("Error fetching users:", error);
            }
        }
        fetchData()
    }, [])
    return (
        <div className='py-3 px-5 w-full'>
            <div className='grid grid-cols-3 gap-4 mx-auto justify-center '>
                <Stat title={"Tổng số người dùng"} value={user.length} icon={<UserIcon className='size-8 text-sky-600' />} />
                <Stat title={"Tổng số bài viết"} value={post.length} icon={<CubeIcon className='size-8 text-green-600' />} />
                <Stat title={"Tổng số báo cáo bài viết"} value={report.length} icon={<FlagIcon className='size-8 text-red-600' />} />
                <Stat title={"Tổng số báo cáo chờ xử lý"} value={rppending.length} icon={<EllipsisHorizontalCircleIcon className='size-8 text-gray-400' />} />
                <Stat title={"Tổng số báo cáo đã xử lý"} value={rpdone.length} icon={<CheckBadgeIcon className='size-8 text-green-600' />} />
                <Stat title={"Tổng số báo cáo đã từ chối xử lý"} value={rpreject.length} icon={<ArchiveBoxXMarkIcon className='size-8 text-red-600' />} />
                <Stat title={"Tổng số bài viết đã ẩn"} value={postHidden.length} icon={<ArchiveBoxXMarkIcon className='size-8 text-red-600' />} />
            </div>
        </div>
    )
};

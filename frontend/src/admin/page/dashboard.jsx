import React from 'react'
import Stat from '../components/Stat'
import { useState, useEffect } from 'react'
import { UserIcon, CubeIcon, FlagIcon, CheckBadgeIcon, EllipsisHorizontalCircleIcon, ArchiveBoxXMarkIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { ReportOff } from '@mui/icons-material'
import { getAllPeal, getAllPost, getALlReport, getAllUser } from '../../service/admin'

export default function Dashboard() {
    const [user, setUser] = useState([])
    const [post, setPost] = useState([])
    const [report, setReport] = useState([])
    const [rppending, setRpPending] = useState([])
    const [apeal, setApeal] = useState([])
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
                const responseApeal = await getAllPeal();
                setApeal(responseApeal.data);
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
                <Stat title={"Total number of users"} value={user.length} icon={<UserIcon className='size-8 text-sky-600' />} />
                <Stat title={"Total number of posts"} value={post.length} icon={<CubeIcon className='size-8 text-green-600' />} />
                <Stat title={"Total number of post reports"} value={report.length} icon={<FlagIcon className='size-8 text-red-600' />} />
                <Stat title={"Total number of pending reports"} value={rppending.length} icon={<EllipsisHorizontalCircleIcon className='size-8 text-gray-400' />} />
                <Stat title={"Total number of resolved reports"} value={rpdone.length} icon={<CheckBadgeIcon className='size-8 text-green-600' />} />
                <Stat title={"Total number of rejected reports"} value={rpreject.length} icon={<ArchiveBoxXMarkIcon className='size-8 text-red-600' />} />
                <Stat title={"Total number of hidden posts"} value={postHidden.length} icon={<EyeSlashIcon className='size-8 text-red-600' />} />
                <Stat title={"Total number of appealed posts"} value={apeal.length} icon={<ReportOff className='size-8 text-red-600' />} />
            </div>
        </div>
    )
};

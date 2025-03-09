import React from 'react'
import Stat from '../components/Stat'
import { useState, useEffect } from 'react'
import { UserIcon, CubeIcon, ChatBubbleLeftIcon, FlagIcon } from '@heroicons/react/24/outline'
import CommentsDisabledOutlinedIcon from '@mui/icons-material/CommentsDisabledOutlined'
import { getAllPost, getALlReport, getAllUser } from '../../service/admin'

export default function Dashboard() {
    const [user, setUser] = useState([])
    const [post, setPost] = useState([])
    const [report, setReport] = useState([])
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

            </div>
        </div>
    )
};

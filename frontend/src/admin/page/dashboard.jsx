import React from 'react'
import Stat from '../components/Stat'
import { UserIcon, CubeIcon, ChatBubbleLeftIcon, FlagIcon } from '@heroicons/react/24/outline'
import CommentsDisabledOutlinedIcon from '@mui/icons-material/CommentsDisabledOutlined';


export default function Dashboard() {

    return (
        <div className='py-3 px-5 w-full'>
            <div className='grid grid-cols-3 gap-4 mx-auto justify-center '>
                <Stat title={"Tổng số người dùng"} value={"123"} icon={<UserIcon className='size-8 text-sky-600' />} />
                <Stat title={"Tổng số bài viết"} value={"123"} icon={<CubeIcon className='size-8 text-green-600' />} />
                <Stat title={"Tổng số bình luận"} value={"123"} icon={<ChatBubbleLeftIcon className='size-8 text-yellow-500' />} />
                <Stat title={"Tổng số báo cáo bài viết"} value={"123"} icon={<FlagIcon className='size-8 text-red-600' />} />
                <Stat title={"Tổng số báo cáo bình luận"} value={"123"} icon={<CommentsDisabledOutlinedIcon className='size-8 text-red-600' />} />
            </div>
        </div>
    )
};

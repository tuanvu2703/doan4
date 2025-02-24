import {
    ArchiveBoxXMarkIcon,
    ChevronDownIcon,
    PencilIcon,
    Square2StackIcon,
    TrashIcon,
    BellIcon
} from '@heroicons/react/16/solid'
import { Link } from 'react-router-dom'
import AVTUser from '../post/AVTUser'

export default function Notification() {
    return (
        <div role="tabpanel" className="tabs tabs-bordered tabs-lg grid grid-cols-1 sm:grid-cols-2 justify-center w-full overflow-auto">
            <input type="radio" name="my_tabs_1" role="tab" className="tab" aria-label="Thông báo" />
            <div role="tabpanel" className="tab-content bg-gray-300 m-2 p-2 rounded-md">
                <div className='flex items-center gap-3'>
                    <AVTUser user={""} />
                    <div className='grid'>
                        <a className="link link-hover font-semibold">Vũ</a>
                        <span> đã gửi cho bạn lời mời kết bạn </span>
                    </div>
                </div>
            </div>

            <input
                type="radio"
                name="my_tabs_1"
                role="tab"
                className="tab"
                aria-label="Tin nhắn"
                defaultChecked />
            <div role="tablist" className="tab-content w-full text-center p-2"></div>
        </div>
    )
}
import { Link } from 'react-router-dom'
import { getAllNoti } from '../../service/noti'
import AVTUser from '../post/AVTUser'
import { useState, useEffect } from 'react'

export default function Notification({ closeDropdown }) {
    const [AllNotification, setAllNotification] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getAllNoti()
                if (response) {
                    setAllNotification(response)
                } else {
                    console.warn("No data found in response.")
                }
            } catch (error) {
                setError(error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])
    if (isLoading) {
        return <div>Loading...</div>
    }
    console.log(AllNotification)
    return (
        <div role="tabpanel" className="tabs tabs-bordered tabs-lg grid grid-cols-1 sm:grid-cols-2 justify-center w-full overflow-auto">
            <input type="radio" name="my_tabs_1" role="tab" className="tab" aria-label="Tất cả" defaultChecked />
            <div role="tabpanel" className="tab-content  m-2 p-2 rounded-md">
                <div className='flex flex-col gap-2'>
                    {AllNotification.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>Chưa có thông báo nào</p>
                        </div>
                    ) : (
                        AllNotification.map((noti) => (
                            noti.isRead ? (
                                <Link
                                    to={`/post/${noti.data.postId}`}
                                    key={noti._id}
                                    className='flex items-center gap-3 text-nowrap p-3 rounded-md'
                                    onClick={closeDropdown}
                                >
                                    {/* <AVTUser user={noti.data} /> */}
                                    <div className='flex items-center gap-3'>
                                        {/* <a className="link link-hover font-semibold">{noti.ownerId}</a> */}
                                        <span> {noti.data.message} </span>
                                    </div>
                                </Link>
                            ) : (
                                <Link
                                    to={`/post/${noti.data.postId}`}
                                    key={noti._id}
                                    className='flex items-center gap-3 text-nowrap p-3 bg-blue-50 border-l-4 border-blue-500 rounded-md shadow-sm'
                                    onClick={closeDropdown}
                                >
                                    {/* <AVTUser user={noti.data} /> */}
                                    <div className='grid'>
                                        {/* <a className="link link-hover font-semibold">{noti.ownerId}</a> */}
                                        <span className='font-medium'> {noti.data.message} </span>
                                        <span className='text-xs text-blue-500'>Chưa đọc</span>
                                    </div>
                                </Link>
                            )
                        ))
                    )}
                </div>
            </div>

            <input
                type="radio"
                name="my_tabs_1"
                role="tab"
                className="tab"
                aria-label="Chưa đọc"
            />
            <div role="tablist" className="tab-content bg-gray-100 m-2 p-2 rounded-md">
                <div className='flex flex-col gap-2'>
                    {AllNotification.filter(noti => !noti.isRead).length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>Chưa có thông báo nào chưa đọc</p>
                        </div>
                    ) : (
                        AllNotification.filter(noti => !noti.isRead).map((noti) => (
                            <div key={noti._id} className='flex items-center gap-3 text-nowrap p-3 bg-blue-50 border-l-4 border-blue-500 rounded-md shadow-sm'>
                                <AVTUser user={""} />
                                <div className='grid'>
                                    <a className="link link-hover font-semibold">Vũ</a>
                                    <span className='font-medium'> {noti.data.message} </span>
                                    <span className='text-xs text-blue-500'>Chưa đọc</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <input type="radio" name="my_tabs_1" role="tab" className="tab" aria-label="Đã đọc" />
            <div role="tabpanel" className="tab-content bg-gray-100 m-2 p-2 rounded-md">
                <div className='flex flex-col gap-2'>
                    {AllNotification.filter(noti => noti.isRead).length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>Chưa có thông báo nào đã đọc</p>
                        </div>
                    ) : (
                        AllNotification.filter(noti => noti.isRead).map((noti) => (
                            <div key={noti._id} className='flex items-center gap-3 text-nowrap p-3 rounded-md'>
                                <AVTUser user={""} />
                                <div className='grid'>
                                    <a className="link link-hover font-semibold">Vũ</a>
                                    <span> {noti.data.message} </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
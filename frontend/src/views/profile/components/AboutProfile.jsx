
import { PencilSquareIcon } from '@heroicons/react/24/solid'

import ModalUpdateProfile from './ModalUpdateProfile'
import { useEffect, useState } from 'react';
import { profileUserCurrent } from '../../../service/ProfilePersonal';
export default function About() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [dataProfile, setDataProfile] = useState({})

    useEffect(() => {

        const fetchdata = async () => {
            try {
                setLoading(true)
                const response = await profileUserCurrent();
                setDataProfile(response.data)
            }
            catch (error) {
                setError(error)
            }
            finally {
                setLoading(false)
            }
        }
        fetchdata()
    }, [])
    return (
        <div className='w-full py-4 px-10 bg-gradient-to-r from-[#ebf4f5] to-[#b5c6e0] rounded-lg border-[1px] shadow-lg '>
            <div className="px-4 sm:px-0 flex justify-between">
                <h3 className="text-2xl font-semibold leading-7">Thông tin cá nhân</h3>
                <button
                    onClick={() => document.getElementById('my_modal_1').showModal()}>
                    <PencilSquareIcon className='size-8' />
                </button>
                <ModalUpdateProfile />
            </div>
            <div className="mt-6 border-t-[1px] border-gray-100">
                <dl className="divide-y divide-gray-500">
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium leading-6 ">Email</dt>
                        <dd className="mt-1 text-sm leading-6  sm:col-span-2 sm:mt-0">{dataProfile.email}</dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium leading-6 ">ngày/tháng/năm sinh</dt>
                        <dd className="mt-1 text-sm leading-6  sm:col-span-2 sm:mt-0">{dataProfile.birthday}</dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium leading-6 ">Số điện thoại</dt>
                        <dd className="mt-1 text-sm leading-6  sm:col-span-2 sm:mt-0">{dataProfile.numberPhone}</dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium leading-6 ">Giới tính</dt>
                        <dd className="mt-1 text-sm leading-6  sm:col-span-2 sm:mt-0">{dataProfile.gender ? "Nam" : "Nữ"}</dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium leading-6 ">Bạn đang ở</dt>
                        <dd className="mt-1 text-sm leading-6  sm:col-span-2 sm:mt-0">
                            {dataProfile.address}
                        </dd>
                    </div>
                </dl>
            </div >
        </div >
    )
}

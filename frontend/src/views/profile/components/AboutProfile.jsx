import { PencilSquareIcon } from '@heroicons/react/24/solid'
import { EnvelopeIcon, PhoneIcon, MapPinIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline'

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
        <div className='w-full py-6 px-10 bg-gradient-to-r from-[#f0f7fa] to-[#d0e4f5] rounded-lg border-[1px] border-gray-200 shadow-lg transition-all duration-300'>
            <div className="px-4 sm:px-0 flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold leading-7 text-gray-800">Thông tin cá nhân</h3>
                <button
                    className="bg-white p-2 rounded-full shadow-md hover:bg-blue-50 transition-all duration-300"
                    onClick={() => document.getElementById('my_modal_1').showModal()}>
                    <PencilSquareIcon className='size-6 text-blue-600' />
                </button>
                <ModalUpdateProfile />
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="text-center py-10 text-red-500">
                    Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.
                </div>
            ) : (
                <div className="mt-6 border-t border-gray-200">
                    <dl className="divide-y divide-gray-200">
                        <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 hover:bg-blue-50/30 transition-colors rounded-md">
                            <dt className="flex items-center text-sm font-medium text-gray-700">
                                <EnvelopeIcon className="h-5 w-5 text-blue-500 mr-2" />
                                Email
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 font-medium">{dataProfile.email}</dd>
                        </div>
                        <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 hover:bg-blue-50/30 transition-colors rounded-md">
                            <dt className="flex items-center text-sm font-medium text-gray-700">
                                <CalendarIcon className="h-5 w-5 text-blue-500 mr-2" />
                                Ngày sinh
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 font-medium">{dataProfile.birthday}</dd>
                        </div>
                        <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 hover:bg-blue-50/30 transition-colors rounded-md">
                            <dt className="flex items-center text-sm font-medium text-gray-700">
                                <PhoneIcon className="h-5 w-5 text-blue-500 mr-2" />
                                Số điện thoại
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 font-medium">{dataProfile.numberPhone}</dd>
                        </div>
                        <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 hover:bg-blue-50/30 transition-colors rounded-md">
                            <dt className="flex items-center text-sm font-medium text-gray-700">
                                <UserIcon className="h-5 w-5 text-blue-500 mr-2" />
                                Giới tính
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 font-medium">
                                {dataProfile.gender ? "Nam" : "Nữ"}
                            </dd>
                        </div>
                        <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 hover:bg-blue-50/30 transition-colors rounded-md">
                            <dt className="flex items-center text-sm font-medium text-gray-700">
                                <MapPinIcon className="h-5 w-5 text-blue-500 mr-2" />
                                Địa chỉ
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 font-medium">
                                {dataProfile.address}
                            </dd>
                        </div>
                    </dl>
                </div>
            )}
        </div>
    )
}

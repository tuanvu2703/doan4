import React from 'react'
import { useEffect, useState } from 'react';
import { OtherProfile } from '../../../service/OtherProfile';
import { useParams } from 'react-router-dom';

export default function AboutOtherProfile() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [dataProfile, setDataProfile] = useState({})
    const { id } = useParams();
    useEffect(() => {

        const fetchdata = async () => {
            try {
                setLoading(true)
                const response = await OtherProfile(id);
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
    }, [id])

    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto py-8 px-6 bg-white/60 backdrop-blur-sm rounded-xl shadow-lg animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="py-4 border-b border-gray-200">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                        <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-4xl mx-auto py-6 px-8 bg-red-50 rounded-lg border border-red-200 shadow-md">
                <h3 className="text-xl font-medium text-red-600">Không thể tải thông tin người dùng</h3>
                <p className="text-red-500 mt-2">Vui lòng thử lại sau</p>
            </div>
        );
    }

    return (
        <div className='w-full max-w-4xl mx-auto py-6 px-8 bg-gradient-to-r from-white/80 to-slate-100/90 rounded-xl border shadow-lg transition-all hover:shadow-xl'>
            <div className="px-4 sm:px-0 flex justify-between items-center border-b border-gray-200 pb-4">
                <h3 className="text-2xl font-bold leading-7 text-gray-800">Thông tin cá nhân</h3>
            </div>
            <div className="mt-4">
                <dl className="divide-y divide-gray-200">
                    <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 hover:bg-slate-50/70 rounded-lg transition-colors">
                        <dt className="text-sm font-semibold leading-6 text-gray-700">Email</dt>
                        <dd className="mt-1 text-base leading-6 text-gray-900 sm:col-span-2 sm:mt-0">{dataProfile.email}</dd>
                    </div>
                    <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 hover:bg-slate-50/70 rounded-lg transition-colors">
                        <dt className="text-sm font-semibold leading-6 text-gray-700">Ngày/tháng/năm sinh</dt>
                        <dd className="mt-1 text-base leading-6 text-gray-900 sm:col-span-2 sm:mt-0">{dataProfile.birthday}</dd>
                    </div>
                    <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 hover:bg-slate-50/70 rounded-lg transition-colors">
                        <dt className="text-sm font-semibold leading-6 text-gray-700">Số điện thoại</dt>
                        <dd className="mt-1 text-base leading-6 text-gray-900 sm:col-span-2 sm:mt-0">{dataProfile.numberPhone}</dd>
                    </div>
                    <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 hover:bg-slate-50/70 rounded-lg transition-colors">
                        <dt className="text-sm font-semibold leading-6 text-gray-700">Giới tính</dt>
                        <dd className="mt-1 text-base leading-6 text-gray-900 sm:col-span-2 sm:mt-0">
                            {dataProfile.gender ?
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">Nam</span> :
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-pink-100 text-pink-800">Nữ</span>
                            }
                        </dd>
                    </div>
                    <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 hover:bg-slate-50/70 rounded-lg transition-colors">
                        <dt className="text-sm font-semibold leading-6 text-gray-700">Bạn đang ở</dt>
                        <dd className="mt-1 text-base leading-6 text-gray-900 sm:col-span-2 sm:mt-0">
                            {dataProfile.address}
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    )
}

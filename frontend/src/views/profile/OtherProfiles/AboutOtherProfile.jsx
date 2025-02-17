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

    return (
        <div className='w-full py-4 px-10 bg-gradient-to-r from-[#dbd3d3] to-[#b6a8a8] rounded-lg border-[1px] shadow-lg border-[#000000]'>
            <div className="px-4 sm:px-0 flex justify-between">
                <h3 className="text-2xl font-semibold leading-7">Thông tin cá nhân</h3>
            </div>
            <div className="mt-6 border-t-[1px] border-gray-100">
                <dl className="divide-y divide-gray-500">
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt classNamze="text-sm font-medium leading-6 ">Email</dt>
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

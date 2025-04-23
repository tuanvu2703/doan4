import React, { useEffect, useState } from 'react'
import HeadOtherProfiles from './HeadOtherProfiles'
import { OtherProfile } from '../../../service/OtherProfile'
import { useParams } from 'react-router-dom'
import MenuProfile from '../components/MenuProfile'
import { Outlet } from 'react-router-dom'
import MenuOtherProfiles from './MenuOtherProfiles'


export default function OtherProfiles() {
    const [dataProfile, setDataProfile] = useState({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const { id } = useParams();

    useEffect(() => {
        const fetchdata = async () => {
            setLoading(true)
            const response = await OtherProfile(id);
            if (response)
                setDataProfile(response.data)
        }
        fetchdata()
    }, [id])

    return (
        <div className='flex place-content-center '>

            <div className='w-full  max-w-screen-xl'>
                <HeadOtherProfiles dataProfile={dataProfile} />
                <MenuOtherProfiles />
                <div className='flex place-content-center'>
                    <div className='w-full max-w-[800px] min-h-screen'>
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    )
}

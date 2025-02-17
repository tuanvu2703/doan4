import React from 'react'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import AllPostOther from '../../post/AllPostOther';
import { OtherProfile } from '../../../service/OtherProfile';
export default function OtherPosts() {
    // const [otherPosts, setOtherPosts] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [dataProfile, setDataProfile] = useState({})
    const { id } = useParams();
    useEffect(() => {
        const fetchdata = async () => {
            try {
                setLoading(true)
                const response = await OtherProfile(id);
                if (response) {
                    setDataProfile(response.data)
                }
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
        <div>
            <p className='text-xl break-words w-screen max-w-2xl'>Bài viết của {dataProfile.lastName} {dataProfile.firstName}</p>
            <div className='grid gap-3'>
                <AllPostOther user={dataProfile} />
            </div>
        </div>
    )
}

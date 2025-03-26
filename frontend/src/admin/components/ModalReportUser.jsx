import React from 'react'
import AVTUser from '../../views/post/AVTUser'
import { useState, useEffect } from 'react'
import { getProfileUser } from '../../service/user';
import { Link } from 'react-router-dom';

export default function ModalReportUser({ userId }) {
    const [user, setUser] = useState({})

    useEffect(() => {
        const fetchdata = async () => {
            try {
                const responseUser = await getProfileUser(userId);
                setUser(responseUser.data)

            } catch (error) {
                console.error("Error liking the post:", error);
            }
        }
        fetchdata()
    }, [userId]);
    return (
        <dialog id={`my_modal_report_user_${userId}`} className="modal text-black">
            <div className="modal-box">
                <form method="dialog">
                    {/* if there is a button in form, it will close the modal */}
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <AVTUser user={userId} />
                <div className="grid gap-3">
                    <Link to={`/user/${userId}`}>
                        <span className="font-bold text-lg hover:underline">
                            {user?.lastName} {user?.firstName}
                        </span>
                    </Link>
                    <span>Email: {user?.email}</span>
                    <span>Phone: {user?.numberPhone}</span>
                    <span>Birthday: {user?.birthday}</span>

                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </div>
        </dialog>
    )
}

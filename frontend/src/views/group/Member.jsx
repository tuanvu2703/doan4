import React, { useState, useEffect } from 'react';
import { getMemberGroup } from '../../service/publicGroup';
import { Link, useParams } from 'react-router-dom';
export default function Member() {
    const [members, setMembers] = useState([]);
    const { groupid } = useParams();

    useEffect(() => {
        async function fetchMembers() {
            const data = await getMemberGroup(groupid);
            setMembers(data);
        }
        fetchMembers();
    }, [groupid]);

    return (
        <div className=" min-h-screen">
            <h1 className="text-3xl font-bold text-center text-sky-600 mb-6">Thành viên nhóm</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {members.map((m) => (
                    <Link to={`/user/${m.member._id}`} key={m._id} className="bg-white shadow-md rounded-lg p-4 text-center">
                        {/* <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-blue-500"
                        /> */}
                        <h2 className="text-lg font-semibold text-gray-800 flex">{m.member.lastName} {m.member.firstName}</h2>
                    </Link>
                ))}
            </div>
        </div>
    );
}

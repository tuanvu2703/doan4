import React from 'react'
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import ModalCreateGroup from '../../../components/ModalCreateGroup';
import { getPublicGroupParticipated } from '../../../service/publicGroup';
import { getMemberGroup } from '../../../service/publicGroup';
export default function SelectGroup() {
    const [groups, setGroups] = useState([]);
    const [members, setMembers] = useState([]);
    const [refresh, setRefresh] = useState(false); // Add refresh state

    useEffect(() => {
        async function fetchGroups() {
            try {
                const response = await getPublicGroupParticipated();
                setGroups(response);
            } catch (error) {
                console.error("Error fetching groups:", error);
            }
        }
        fetchGroups();
    }, [refresh]); // Add refresh as a dependency

    useEffect(() => {
        async function fetchMembers() {
            try {
                const memberPromises = groups.map(async (group) => {
                    const response = await getMemberGroup(group._id);
                    return { groupId: group._id, count: response.length, owner: response.member }; // Extract group ID and member count
                });
                const membersData = await Promise.all(memberPromises);
                setMembers(membersData);
            } catch (error) {
                console.error("Error fetching members:", error);
            }
        }
        fetchMembers();
    }, [groups]);

    const getMemberCount = (groupId) => {
        const memberData = members.find((member) => member.groupId === groupId);
        return memberData ? memberData.count : 0;
    };

    const getGroupOwner = (groupId) => {
        const memberData = members.find((member) => member.groupId === groupId);
        return memberData && memberData.role === 'owner' ? memberData.member.firstName : 'Unknown';
    };

    const handleNewGroup = (newGroup) => {
        setGroups((prevGroups) => [...prevGroups, newGroup]);
        setRefresh((prev) => !prev); // Trigger refresh
    };

    console.log(members);
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
            <div className="flex flex-col gap-8 bg-white rounded-lg shadow-md p-6">
                <button
                    onClick={() => document.getElementById('my_modal_create_group').showModal()}
                    className='bg-white hover:bg-gray-50 transition-colors duration-200 rounded-md border border-gray-300 py-2 px-4 text-center font-medium hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'>
                    Tạo nhóm mới
                </button>

                <div className='flex flex-col gap-4'>
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Nhóm đã tham gia</h2>

                    <div className="grid gap-2 sm:grid-cols-1 md:grid-cols-1">
                        {groups.map((r) => (
                            <Link key={r.id} to={`/group/${r._id}`} className="block w-full">
                                <div className='flex gap-3 items-center p-3 hover:bg-gray-100 rounded-md border border-transparent hover:border-gray-200 transition-all duration-200'>
                                    <img src={r.avatargroup} alt="" className='w-12 h-12 rounded-full object-cover border-[1px]' />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{r.groupName}</span>
                                        <span className="text-sm text-gray-500">{getMemberCount(r._id)} thành viên</span>
                                        {/* <span className="text-sm text-gray-500">Tạo bởi {getGroupOwner(r._id)}</span> */}
                                    </div>

                                </div>
                            </Link>
                        ))}

                    </div>
                </div>
            </div>
            <ModalCreateGroup onNewGroup={handleNewGroup} />
        </div>
    )
}

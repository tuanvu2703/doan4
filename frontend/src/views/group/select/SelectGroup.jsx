import React from 'react'
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import ModalCreateGroup from '../../../components/ModalCreateGroup';
import { getAllGroup, getPublicGroupParticipated, requestJoinGroup } from '../../../service/publicGroup';
import { getMemberGroup } from '../../../service/publicGroup';
export default function SelectGroup() {
    const [myGroups, setMyGroups] = useState([]);
    const [members, setMembers] = useState([]);
    const [refresh, setRefresh] = useState(false); // Add refresh state
    const [allGroups, setAllGroups] = useState([]);
    useEffect(() => {
        async function fetchGroups() {
            try {
                const response = await getPublicGroupParticipated();
                const sortedGroups = response.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const allGroupsResponse = await getAllGroup();
                const sortedAllGroups = allGroupsResponse.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setMyGroups(sortedGroups);
                setAllGroups(sortedAllGroups);
            } catch (error) {
                console.error("Error fetching groups:", error);
            }
        }
        fetchGroups();
    }, [refresh]); // Add refresh as a dependency

    useEffect(() => {
        async function fetchMyMembers() {
            try {
                const memberPromises = myGroups.map(async (group) => {
                    const response = await getMemberGroup(group._id);
                    return { groupId: group._id, count: response.length, owner: response.member }; // Extract group ID and member count
                });
                const membersData = await Promise.all(memberPromises);
                setMembers(membersData);
            } catch (error) {
                console.error("Error fetching members:", error);
            }
        }
        fetchMyMembers();
    }, [myGroups]);

    useEffect(() => {
        async function fetchAllGroupMembers() {
            try {
                const memberPromises = allGroups.map(async (group) => {
                    const response = await getMemberGroup(group._id);
                    return { groupId: group._id, count: response.length, owner: response.member }; // Extract group ID and member count
                });
                const membersData = await Promise.all(memberPromises);
                setMembers(membersData);
            } catch (error) {
                console.error("Error fetching members:", error);
            }
        }
        fetchAllGroupMembers();
    }, [allGroups]);

    const getMemberCount = (groupId) => {
        const memberData = members.find((member) => member.groupId === groupId);
        return memberData ? memberData.count : 0;
    };

    const getGroupOwner = (groupId) => {
        const memberData = members.find((member) => member.groupId === groupId);
        return memberData && memberData.role === 'owner' ? memberData.member.firstName : 'Unknown';
    };

    const handleNewGroup = (newGroup) => {
        setMyGroups((prevGroups) => [...prevGroups, newGroup]);
        setRefresh((prev) => !prev); // Trigger refresh
    };

    // Check if the user is already a member of a group
    const isGroupMember = (groupId) => {
        return myGroups.some(group => group._id === groupId);
    };

    // Handle joining a group
    const handleJoinGroup = async (groupId) => {
        try {
            const response = await requestJoinGroup(groupId);
            if (response) {
                // Successfully joined the group
                setRefresh((prev) => !prev); // Trigger refresh
            } else {
                // Handle error case
                console.error("Failed to join group:", response);
            }
        }
        catch (error) {
            console.error("Error joining group:", error);
        }
    };
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
            <div className="flex flex-col gap-8 bg-white rounded-lg shadow-md p-6">
                <button
                    onClick={() => document.getElementById('my_modal_create_group').showModal()}
                    className='bg-white hover:bg-gray-50 transition-colors duration-200 rounded-md border border-gray-300 py-2 px-4 text-center font-medium hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'>
                    Tạo nhóm mới
                </button>

                <div className='flex flex-col gap-4'>
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Nhóm của tôi</h2>

                    <div className="grid gap-2 sm:grid-cols-1 md:grid-cols-1">
                        {myGroups.map((r) => (
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
                        {myGroups.length === 0 && (
                            <div className="flex items-center justify-center w-full h-32 border border-dashed rounded-md">
                                <span className="text-gray-500">Bạn chưa tạo nhóm nào</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className='flex flex-col gap-4'>
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Tất cả các nhóm</h2>
                    <div className="grid gap-2 sm:grid-cols-1 md:grid-cols-1">
                        {allGroups.map((r) => (
                            <div key={r.id} className="block w-full">
                                <div className='flex gap-3 items-center p-3 rounded-md border border-transparent transition-all duration-200'>
                                    <img src={r.avatargroup} alt="" className='w-12 h-12 rounded-full object-cover border-[1px]' />
                                    <div className="flex flex-col flex-grow">
                                        <Link to={`/group/${r._id}`} className="font-medium hover:underline">{r.groupName}</Link>
                                        <span className="text-sm text-gray-500">{getMemberCount(r._id)} thành viên</span>
                                        {/* <span className="text-sm text-gray-500">Tạo bởi {getGroupOwner(r._id)}</span> */}
                                    </div>

                                    <button
                                        onClick={(e) => handleJoinGroup(r._id)}
                                        className="ml-auto px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                                    >
                                        Yêu cầu tham gia
                                    </button>
                                </div>
                            </div>
                        ))}
                        {allGroups.length === 0 && (
                            <div className="flex items-center justify-center w-full h-32 border border-dashed rounded-md">
                                <span className="text-gray-500">Không có nhóm nào tồn tại</span>
                            </div>
                        )}
                    </div>


                </div>
            </div>
            <ModalCreateGroup onNewGroup={handleNewGroup} />
        </div>
    )
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import friend from '../../../service/friend';
import FriendCard from '../card/friendCard';
import Loading from '../../../components/Loading';


export default function FriendInvitation() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
        const fetchdata = async () => {
            try {
                const res = await friend.getAllFriendInvitation();
                if (res.success) {
                    setRequests(res.data);
                } else {
                    setRequests([]);
                }
            } catch (error) {
                console.error('Error fetching friend requests:', error);
                setRequests([]);
            } finally {
                setLoading(false); // Stop loading
            }
        };
        fetchdata();
    }, []);



    return (
        <div className="w-full h-full px-6 py-4 flex flex-col overflow-x-hidden custom-scroll bg-gray-50">
            <strong className="text-2xl mb-4 w-full text-center text-gray-700">Lời mời kết bạn</strong>
            {loading ? (
                <Loading />
            ) : requests.length === 0 ? (
                <div className="w-full h-full flex justify-center items-center text-center text-gray-500">
                    Chưa có lời mời kết bạn nào
                </div>
            ) : (
                <div className="w-full grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-6">
                    {requests.map((request, index) => (
                        <div key={index} className="flex justify-center">
                            <FriendCard
                                iduser={request.sender}
                                idrequest={request._id}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

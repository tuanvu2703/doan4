import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import friend from '../../../service/friend';
import FriendCard from '../card/friendCard';
import MyFriendCard from '../card/myFriendCard';
import Loading from '../../../components/Loading';


export default function MyAllFriend() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
        const fetchdata = async () => {
            try {
                const res = await friend.getListMyFriend();
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
    // console.log(requests)


    return (
        <div className="w-full h-full min-hsc px-5 flex flex-col">
            <strong className="text-xl ml-2 mb-2 w-full text-center pt-3">Danh sách bạn bè</strong>
            {loading ? (
                <Loading />
            ) : requests.length === 0 ? (
                // Show "No Requests" message
                <div className="w-full h-full flex justify-center items-center text-center">
                    Chưa có bạn bè nào
                </div>
            ) : (
                // Render Friend Cards in a responsive grid
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 custom ">
                    {requests.map((request, index) => (
                        <MyFriendCard
                            iduser={request?.receiver?._id || request?.sender?._id}
                            idrequest={request._id}
                            key={index}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

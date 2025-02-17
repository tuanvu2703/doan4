import friend from "../../../../service/friend";
import UserFriendCard from "./userFriendCard";
import Loading from "../../../../components/Loading";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

const AllFriend = () => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredFriends, setFilteredFriends] = useState([]);
    const [visibleCount, setVisibleCount] = useState(6); // Items currently visible
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await friend.getListMyFriend();
                if (res.success) {
                    setFriends(res.data);
                    setFilteredFriends(res.data);
                } else {
                    setFriends([]);
                    setFilteredFriends([]);
                }
            } catch (error) {
                console.error("Error fetching friend list:", error);
                setFriends([]);
                setFilteredFriends([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredFriends(friends);
        } else {
            const filtered = friends.filter((friend) => {
                const friendName = friend.receiver
                    ? `${friend.receiver.firstName} ${friend.receiver.lastName}`
                    : friend.sender
                    ? `${friend.sender.firstName} ${friend.sender.lastName}`
                    : "";
                return friendName.toLowerCase().includes(searchTerm.toLowerCase());
            });
            setFilteredFriends(filtered);
        }
    }, [searchTerm, friends]);

    const handleSeeMore = () => {
        setVisibleCount((prevCount) => prevCount + 6);
    };

    return (
        <>
            {loading ? (
                <Loading />
            ) : (
                <>
                    {/* Search Input */}
                    <div className="border-b flex justify-between items-center h-[56px]">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleInputChange}
                            className="w-full rounded-3xl border border-gray-300 pr-8 pl-9 py-2 text-black bg-white focus:outline-none"
                            placeholder="Tìm kiếm..."
                        />
                        <a className="absolute ml-2 text-gray-400">
                            <MagnifyingGlassIcon className="h-4 w-4 fill-black" />
                        </a>
                    </div>

                    {/* Scrollable Friends List */}
                    <div className="overflow-y-scroll flex-1 custom-scroll">
                        <ul className="flex flex-col">
                            {filteredFriends.length === 0 ? (
                                <li className="px-2 py-4 text-center text-gray-400">Không có bạn bè nào.</li>
                            ) : (
                                filteredFriends.slice(0, visibleCount).map((friend, index) => (
                                    <li key={index} className="hover:bg-blue-300 px-2 py-3 rounded-md shadow-sm">
                                        <button
                                            onClick={() =>
                                                navigate(`inbox/?iduser=${friend?.receiver?._id || friend?.sender?._id}`)
                                            }
                                            className="flex items-center w-full"
                                        >
                                            {friend.receiver && friend.receiver._id && (
                                                <UserFriendCard iduser={friend.receiver._id} />
                                            )}
                                            {friend.sender && friend.sender._id && (
                                                <UserFriendCard iduser={friend.sender._id} />
                                            )}
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>

                        {visibleCount < filteredFriends.length && (
                            <button
                                onClick={handleSeeMore}
                                className="w-full py-2 text-center text-blue-500 hover:underline"
                            >
                                Xem thêm
                            </button>
                        )}
                    </div>
                </>
            )}
        </>
    );
};

export default AllFriend;

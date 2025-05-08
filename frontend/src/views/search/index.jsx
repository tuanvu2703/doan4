import React, { useEffect, useState } from 'react';
import CardUserList from './userCard/cardUserList';
import { useUser } from '../../service/UserContext';
import { getHomeFeed } from '../../service/PostService';
import Loading from '../../components/Loading';
import user from '../../service/user';
import CardPost from './CardPost';

export default function Searchpage() {
    const { userContext } = useUser();
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [userLimit, setUserLimit] = useState(8); // Initial limit for users
    const [postLimit, setPostLimit] = useState(8); // Initial limit for posts

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await user.getAllUser();
                const resPost = await getHomeFeed();
                setUsers(res.data);
                setPosts(resPost.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleLoadMoreUsers = () => {
        setUserLimit((prev) => prev + 8); // Increment user limit by 8
    };

    const handleLoadMorePosts = () => {
        setPostLimit((prev) => prev + 8); // Increment post limit by 8
    };

    if (loading) {
        return <p className='text-center mt-5'><Loading /></p>;
    }

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-4xl px-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {/* Danh sách mọi người */}
                    <div className="px-4 py-3 shadow-md bg-white w-full rounded-lg relative">
                        <h3 className="text-xl font-bold mb-4 border-b pb-2 sticky top-0 bg-white z-10 pt-2">Mọi người</h3>
                        <div className="space-y-3">
                            {users.slice(0, userLimit).map((user, index) => (
                                userContext._id === user._id ? null : (
                                    <CardUserList userdata={user} key={index} />
                                )
                            ))}
                        </div>
                        {userLimit < users.length && (
                            <div className="w-full flex justify-center mt-4">
                                <button
                                    onClick={handleLoadMoreUsers}
                                    className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                >
                                    Xem thêm
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Danh sách bài đăng */}
                    <div className="px-4 py-3 shadow-md bg-white w-full rounded-lg relative">
                        <h3 className="text-xl font-bold mb-4 border-b pb-2 sticky top-0 bg-white z-10 pt-2">Bài đăng</h3>
                        <div className="space-y-4">
                            {posts.slice(0, postLimit).map((post, index) => (
                                <CardPost post={post} key={index} />
                            ))}
                        </div>
                        {postLimit < posts.length && (
                            <div className="w-full flex justify-center mt-4">
                                <button
                                    onClick={handleLoadMorePosts}
                                    className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                >
                                    Xem thêm
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

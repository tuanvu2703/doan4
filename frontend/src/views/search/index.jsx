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
        <div className="w-full flex flex-col items-center pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-4xl">
                {/* Danh sách mọi người */}
                <div className="px-4 py-3 shadow-md shadow-gray-300 w-full rounded-lg">
                    <strong className="text-lg">Mọi người</strong>
                    {users.slice(0, userLimit).map((user, index) => (
                        userContext._id === user._id ? null : (
                            <CardUserList userdata={user} key={index} />
                        )
                    ))}
                    {userLimit < users.length && (
                        <div className="w-full flex justify-center">
                            <button
                                onClick={handleLoadMoreUsers}
                                className="mt-3 text-blue-500 hover:text-blue-700"
                            >
                                Xem thêm
                            </button>
                        </div>
                    )}
                </div>

                {/* Danh sách bài đăng */}
                <div className="px-4 py-3 shadow-md shadow-gray-300 w-full rounded-lg">
                    <strong className="text-lg">Bài đăng</strong>
                    {posts.slice(0, postLimit).map((post, index) => (
                        <CardPost post={post} key={index} />
                    ))}
                    {postLimit < posts.length && (
                        <div className="w-full flex justify-center">
                            <button
                                onClick={handleLoadMorePosts}
                                className="mt-3 text-blue-500 hover:text-blue-700"
                            >
                                Xem thêm
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
}

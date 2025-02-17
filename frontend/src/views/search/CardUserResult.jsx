import React from 'react'
import { useState, useEffect, useCallback } from "react";
import { getSearchUser } from '../../service/SearchService';
import Loading from '../../components/Loading';
import friend from '../../service/friend';
import { toast } from 'react-toastify';
import NotificationCss from '../../module/cssNotification/NotificationCss';
import userImg from '../../img/user.png';
import user from '../../service/user';
import { debounce } from 'lodash';
import ButtonStatus from './buttonStatus';
import CardUserList from './userCard/cardUserList';
import { useUser } from '../../service/UserContext';
export default function CardUserResult({ query }) {
    const { userContext } = useUser();
    const [userdatas, setUserdatas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState([]); // State to store all users
    const [userLimit, setUserLimit] = useState(8); // Initial limit for users
    useEffect(() => {
        async function fetchAllPosts() {
            setLoading(true);
            try {
                const response = await user.getAllUser(); // Fetch all posts
                const sortedPosts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setAllUsers(sortedPosts);
                setUserdatas(sortedPosts); // Initially display all posts
            } catch (error) {
                console.error(error);
                setAllUsers([]);
                setUserdatas([]);
            } finally {
                setLoading(false);
            }
        }

        fetchAllPosts();
    }, []);
    const handleLoadMoreUsers = () => {
        setUserLimit((prev) => prev + 8); // Increment user limit by 8
    };
    
    useEffect(() => {
        const debouncedFetchData = debounce(async () => {
            if (query === '') {
                setUserdatas(allUsers); // Display all posts if no query
                return;
            }
            setLoading(true);
            try {
                const response = await getSearchUser(query);
                const sortedPosts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setUserdatas(sortedPosts);
            } catch (error) {
                console.error(error);
                setUserdatas([]);
            } finally {
                setLoading(false);
            }
        }, 500); // 300ms debounce delay

        debouncedFetchData();

        return () => {
            debouncedFetchData.cancel();
        };
    }, [query, allUsers]);





    const handDetailUser = (id) => {
        window.location.href = `/user/${id}`;
    };
    if (loading) {
        return <p className='text-center mt-5'><Loading /></p>;
    }

    if (userdatas.length === 0) {
        return <p className='mt-5'>không tìm thấy dữ liệu, vui lòng nhập tên người dùng</p>;
    }

    console.log(userdatas)
    return (
        <>
            {
                userdatas.slice(0, userLimit).map((user, index) => (
                    userContext._id === user._id ? null : (
                        <CardUserList userdata={user} key={index} />
                    )
                ))
            }
            {userLimit < userdatas.length && (
                <div className='w-full flex justify-center'>
                    <button
                        onClick={handleLoadMoreUsers}
                        className="mt-3 text-blue-500 hover:text-blue-700"
                    >
                        Xem thêm
                    </button>
                </div>
            )}
        </>
    )
}

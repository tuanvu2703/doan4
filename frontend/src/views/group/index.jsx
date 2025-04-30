import React from 'react'
import PostStatus from '../post/components/PostStatus'
import { useState, useEffect, useCallback } from 'react'
import { profileUserCurrent } from '../../service/ProfilePersonal';
import { useParams } from 'react-router-dom';
import AllPostGroup from './AllPostGroup';
export default function Group() {
    const [user, setUser] = useState({})
    const [addNewPostFunction, setAddNewPostFunction] = useState(null);
    const [groups, setGroups] = useState({});
    useEffect(() => {
        const fetchdata = async () => {
            const response = await profileUserCurrent();
            if (response && response.data) {
                setUser(response.data)
            }
        }
        fetchdata()
    }, [])
    const { groupid } = useParams();
    // Use useCallback to maintain function reference stability
    const handlePostsUpdated = useCallback((addNewPost) => {
        setAddNewPostFunction(() => addNewPost);
    }, []);
    return (
        <div>
            <PostStatus user={user} addNewPost={addNewPostFunction} groupId={groupid} />
            <AllPostGroup onPostsUpdated={handlePostsUpdated} groupId={groupid} />
        </div>
    )
}

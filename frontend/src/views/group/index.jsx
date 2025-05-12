import React from 'react'
import PostStatus from '../post/components/PostStatus'
import { useState, useEffect, useCallback } from 'react'
import { profileUserCurrent } from '../../service/ProfilePersonal';
import { useParams } from 'react-router-dom';
import AllPostGroup from './AllPostGroup';
import { getMemberGroup } from '../../service/publicGroup';
export default function Group() {
    const [user, setUser] = useState({})
    const { groupid } = useParams();
    const [addNewPostFunction, setAddNewPostFunction] = useState(null);
    const [memberGroup, setMemberGroup] = useState([])
    useEffect(() => {
        const fetchdata = async () => {
            const response = await profileUserCurrent();
            const responseMemberGroup = await getMemberGroup(groupid);
            setMemberGroup(responseMemberGroup)
            if (response && response.data) {
                setUser(response.data)
            }
        }
        fetchdata()
    }, [groupid])
    // Use useCallback to maintain function reference stability
    const handlePostsUpdated = useCallback((addNewPost) => {
        setAddNewPostFunction(() => addNewPost);
    }, []);
    return (
        <div>
            {
                memberGroup.some(m => m.member && m.member._id === user._id) ? (
                    <PostStatus user={user} addNewPost={addNewPostFunction} groupId={groupid} />
                ) : (
                    <div>Bạn không phải là thành viên của nhóm, không có quyền đăng bài viết</div>
                )
            }
            <AllPostGroup onPostsUpdated={handlePostsUpdated} groupId={groupid} />
        </div>
    )
}

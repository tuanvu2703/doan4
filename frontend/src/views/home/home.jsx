import PostStatus from "../post/components/PostStatus.jsx";
import { useState, useEffect, useCallback } from "react";
import { profileUserCurrent } from "../../service/ProfilePersonal.js";

import HomePost from "../post/HomePost.jsx";
import SideHome from "../../components/SideHome.jsx";


function Home() {
    const [user, setUser] = useState({})
    const [addNewPostFunction, setAddNewPostFunction] = useState(null);

    useEffect(() => {
        const fetchdata = async () => {
            const response = await profileUserCurrent();
            if (response && response.data) {
                setUser(response.data)
            }
        }
        fetchdata()
    }, [])

    // Use useCallback to maintain function reference stability
    const handlePostsUpdated = useCallback((addNewPost) => {
        setAddNewPostFunction(() => addNewPost);
    }, []);

    return (
        <div className="flex justify-center max-w-2xl px-4 sm:px-6 lg:px-6">
            <div className="grid gap-5 mt-3 rounded-md pb-4 w-full">
                {/* <Story /> */}
                <PostStatus user={user} addNewPost={addNewPostFunction} />
                <HomePost onPostsUpdated={handlePostsUpdated} />
            </div>
            <div className="hidden lg:block">
                <SideHome />
            </div>
        </div>
    );
}
export default Home;

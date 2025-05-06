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
        <div className="flex justify-between max-w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 mx-auto">
            <div className="grid gap-4 mt-3 rounded-md pb-4 w-full md:w-3/4 lg:w-2/3">
                {/* <Story /> */}
                <PostStatus user={user} addNewPost={addNewPostFunction} />
                <HomePost onPostsUpdated={handlePostsUpdated} />
            </div>
            <div className="hidden lg:block lg:w-1/3 xl:w-1/4">
                <SideHome />
            </div>
        </div>
    );
}
export default Home;

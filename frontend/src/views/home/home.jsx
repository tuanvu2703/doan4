
import Post from "../post/PostPersonal.jsx";
import PostStatus from "../post/components/PostStatus.jsx";
import { useState, useEffect } from "react";
import { profileUserCurrent } from "../../service/ProfilePersonal.js";
import Story from "../story/Story.jsx";
import HomePost from "../post/HomePost.jsx";
import SiderBarFriend from "../../sidebar/SiderBarFriend.jsx";

function Home() {
    const [user, setUser] = useState({})
    useEffect(() => {
        const fetchdata = async () => {
            const response = await profileUserCurrent();
            if (response && response.data) {
                setUser(response.data)
            }
        }
        fetchdata()
    }, [])
    return (
        <div className="flex justify-center max-w-[900px] px-4 sm:px-6 lg:px-6">
            <div className="grid gap-5 mt-3 rounded-md pb-4 w-full">
                {/* <Story /> */}
                <PostStatus user={user} />
                <HomePost />
            </div>
            <div className="hidden md:block md:w-1/5 lg:w-1/6 xl:w-1/6">
                <SiderBarFriend />
            </div>
        </div>

    );
}
export default Home;

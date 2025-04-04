
import PostStatus from "../post/components/PostStatus.jsx";
import { useState, useEffect } from "react";
import { profileUserCurrent } from "../../service/ProfilePersonal.js";

import HomePost from "../post/HomePost.jsx";


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
        <div className="flex justify-center max-w-2xl px-4 sm:px-6 lg:px-6">
            <div className="grid gap-5 mt-3 rounded-md pb-4 w-full">
                {/* <Story /> */}
                <PostStatus user={user} />
                <HomePost />
            </div>
        </div>

    );
}
export default Home;

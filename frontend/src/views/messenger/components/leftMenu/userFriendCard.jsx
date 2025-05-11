import { useState, useEffect } from "react";
import user from "../../../../service/user"; // Ensure you import the correct service or API client
import imgUser from '../../../../img/user.png'
import Loading from "../../../../components/Loading";
const UserFriendCard = ({ iduser }) => {
    const [userdata, setUserdata] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchdata = async () => {
            if (iduser) { // Check if iduser is valid
                try {
                    const res = await user.getProfileUser(iduser);
                    if (res.success) {
                        setUserdata(res.data);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                } finally {
                    setLoading(false); // Stop loading
                }
            }
        };

        fetchdata();
    }, [iduser]); // Run effect when iduser changes
    // console.log(userdata)
    if (loading) {
        return (
            <Loading />
        );
    }

    return (
        <>
            <img
                src={
                    userdata?.avatar
                        ? userdata.avatar
                        : imgUser
                }
                alt="user" className="w-12 h-12 rounded-full mr-2 border-white border-2" />
            <div className="text-start">
                <h3 className="font-semibold text-nowrap overflow-hidden text-ellipsis max-w-52">
                    {userdata
                        ? `${userdata.lastName || ''} ${userdata.firstName || ''}`.trim()
                        : "No Name"}
                </h3>



            </div>

        </>
    );
};

export default UserFriendCard;

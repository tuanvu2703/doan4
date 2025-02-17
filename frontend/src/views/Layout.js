import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./navbar/navBar";
import LeftListMenu from "./menu/LeftMenuList";
import authToken from "../components/authToken";
import { useEffect, useCallback, useState } from "react";
import { UserProvider } from "../service/UserContext";
import socket from "../service/webSocket/socket";
import { toast } from "react-toastify";
import NotificationCss from "../module/cssNotification/NotificationCss";
import SocketLayout from "../service/webSocket/socketLayout";
import imgUser from "../img/user.png"
import { profileUserCurrent } from '../service/ProfilePersonal';
import SideBar from "../sidebar/SideBar";

export default function Layout() {
    const navigate = useNavigate();
    const [userCurrent, setUserCurrent] = useState({});
    const [disconnect, setDisconnect] = useState(true);
    if (disconnect == true) {
        socket.on("connect", () => {
            console.log("Connected to WebSocket server with ID:", socket.id);
            setDisconnect(false)
        });
    } else {
        socket.on("disconnect", () => {
            console.log("Disconnected from server");
            setDisconnect(true)
        });
    }

    const getDataUser = async () => {
        try {
            const response = await profileUserCurrent(); // Fetch user data
            if (response && response.data) {
                setUserCurrent(response.data); // Set user data to state
            } else {
                console.warn("No data found in response.");
            }
        } catch (error) {
            console.error("Error fetching user data:", error); // Handle any errors
        }
    };

    useEffect(() => {
        // Check if user is authenticated
        if (!authToken.getToken()) {
            navigate("/login");
            return;
        }
        getDataUser();
    }, [navigate]);

    useEffect(() => {
        if (userCurrent._id) {
            // console.log(userCurrent._id); // Log after state has been updated
        }
    }, [userCurrent]); // This will run whenever `userCurrent` changes

    useEffect(() => {
        socket.on("newmessage", (newMessage) => {
            if ((String(newMessage.sender._id) !== String(userCurrent._id)) && newMessage.sender._id && userCurrent._id) {
                toast.success(
                    <a href={`/messenger/inbox/?iduser=${newMessage.sender._id}`}>
                        <div className="w-full flex flex-row">
                            <div className="w-full flex items-center space-x-3">
                                <a>
                                    <img
                                        src={newMessage?.sender?.avatar ? newMessage.sender.avatar : imgUser}
                                        alt="user"
                                        className="w-12 h-12 rounded-full mr-2 border-white border-2"
                                    />
                                </a>
                                <div className="text-start">
                                    <h3
                                        className="font-semibold truncate w-[110px] overflow-hidden whitespace-nowrap"
                                        title={newMessage ? `${newMessage?.sender?.lastName || ''} ${newMessage?.sender?.firstName || ''}`.trim() : "No Name"}
                                    >
                                        {newMessage ? `${newMessage?.sender?.lastName || ''} ${newMessage?.sender?.firstName || ''}`.trim() : "No Name"}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div
                            className="line-clamp-2 overflow-hidden text-ellipsis"
                            title={newMessage?.content}
                        >
                            {newMessage ? newMessage.content : ''}
                        </div>
                    </a>,
                    NotificationCss.Mess
                );
            }
        });

        socket.on("newmessagetogroup", (newMessage) => {
            if ((String(newMessage.sender._id) !== String(userCurrent._id)) && newMessage.sender._id && userCurrent._id) {

                toast.success(
                    <a href={`/messenger/group/?idgroup=${String(newMessage.forGroup)}`}>
                        <p className="text-xs text-gray-400 mb-2 font-semibold text-nowrap overflow-hidden text-ellipsis max-w-20">
                            Tin Nhóm
                        </p>
                        <div className="w-full flex flex-row">
                            <div className="w-full flex items-center space-x-3">
                                <a>
                                    <img
                                        src={newMessage?.sender?.avatar ? newMessage.sender.avatar : imgUser}
                                        alt="user"
                                        className="w-12 h-12 rounded-full mr-2 border-white border-2"
                                    />
                                </a>
                                <div className="text-start">
                                    <h3
                                        className="font-semibold truncate w-[110px] overflow-hidden whitespace-nowrap"
                                        title={newMessage ? `${newMessage?.sender?.lastName || ''} ${newMessage?.sender?.firstName || ''}`.trim() : "No Name"}
                                    >
                                        {newMessage ? `${newMessage?.sender?.lastName || ''} ${newMessage?.sender?.firstName || ''}`.trim() : "No Name"}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div
                            className="line-clamp-2 text-xs text-gray-400 overflow-hidden text-ellipsis"
                            title={newMessage?.content}
                        >
                            Nhắn:{newMessage ? newMessage.content : ''}
                        </div>
                    </a>,
                    NotificationCss.Mess
                );
            }
        });

        // Handle disconnection
        socket.on("disconnect", () => {
            console.log("Disconnected from server");
        });

        return () => {
            socket.off("newmessage");
            socket.off("disconnect");
        };
    }, [userCurrent]);

    return (
        // <div className="max-w-screen h-full">
        //     <UserProvider>
        //         <Navbar />
        //         <div className="navbar max-w-screen"></div>
        //         <div className="flex h-screen">
        //             {/* Sidebar */}
        //             <SideBar />
        //             {/* Main Content */}
        //             <main className="bg-background w-full md:w-4/5 lg:w-5/6 xl:w-5/6 p-4 ml-auto">
        //                 <Outlet />
        //             </main>
        //         </div>
        //     </UserProvider>
        // </div>
        <div className="min-h-screen flex flex-col">
            <UserProvider>
                <Navbar />
                <div className="navbar"></div>
                <div className="container mx-auto flex flex-1 gap-4">
                    {/* Sidebar */}
                    <div className="hidden md:block md:w-1/5 lg:w-1/6 xl:w-1/6">
                        <SideBar />
                    </div>
                    {/* Main Content */}
                    <main className="bg-background w-full md:w-4/5 lg:w-5/6 xl:w-5/6 p-4">
                        <Outlet />
                    </main>
                </div>
            </UserProvider>
        </div>


    );
}

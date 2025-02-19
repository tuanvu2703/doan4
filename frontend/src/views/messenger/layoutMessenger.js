import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import LeftMessenger from "./components/LeftMessenger";
import RightMessenger from "./components/rightMessenger";
import { createContext } from "react";
import { useLocation } from "react-router-dom";
import socket from "../../service/webSocket/socket";
import useWebSocket from "../../service/webSocket/usewebsocket";

export const MessengerContext = createContext();
const LayoutMessenger = () => {
    const [RightShow, setRightShow] = useState(true);
    const location = useLocation()
    const [content, setContent] = useState(true);
    const [inboxData, setInboxData] = useState({
        data: [],
        messenger: []
    });
    const handleHiddenRight = () => {
        setRightShow(!RightShow)
    }
    useEffect(() => {
        function updateContentBasedOnURL() {
            const urlParams = new URL(window.location.href); // Lấy URL hiện tại
            const pathSegment = urlParams.pathname.split('/')[2]; // Lấy phần sau /messenger/

            if (pathSegment === 'friend') {
                setContent('inbox');
            } else if (pathSegment === 'group') {
                setContent('group');
            } else {
                //  console.log('Không nhận diện được path segment:', pathSegment);
            }
        }
        updateContentBasedOnURL()

    }, [location]);

    return (
        <MessengerContext.Provider value={{ RightShow, handleHiddenRight, content, setContent, setInboxData, inboxData }}>
            <div className="h-full w-full flex flex-col md:flex-row text-black border-2 rounded-lg max-w-[1150px] mx-auto overflow-hidden">
                {/* Sidebar Messenger */}
                <div className="h-full w-full md:w-auto">
                    <LeftMessenger />
                </div>

                {/* Main Content */}
                <div className="w-full min-w-[300px] h-full">
                    <Outlet />
                </div>

                {/* Right Messenger (Hiển thị nếu RightShow = true) */}
                {RightShow && (
                    <div className="h-full w-full md:w-auto">
                        <RightMessenger />
                    </div>
                )}
            </div>
        </MessengerContext.Provider>

    )
};
export default LayoutMessenger;

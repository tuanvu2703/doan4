import { useState, useEffect } from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { InboxIcon, UserGroupIcon, UsersIcon } from "@heroicons/react/24/solid";
import { useContext } from "react";
import AllFriend from "./leftMenu/allFriend";
import AllGroup from "./leftMenu/allGroup";
import AllInbox from "./leftMenu/allInbox";
import { MessengerContext } from "../layoutMessenger";

const LeftMessenger = () => {
    const [alignment, setAlignment] = useState(''); // Initialize alignment state
    const { setContent, content } = useContext(MessengerContext);
    const handleChange = (newAlignment) => {
        setAlignment(newAlignment);
        setContent(newAlignment);
    };
    const renderContent = () => {

        switch (content) {
            case "inbox":
                setContent("inbox")
                return <AllFriend />;
            case "group":
                setContent("group")
                return <AllGroup />;
            case "friend":
                setContent("friend")
                return <AllFriend />;
            default:
                return <AllFriend />;
        }
    };
    return (
        <div className="h-full flex flex-col border-r-gray-300 border-r w-full md:w-auto">
            <div className=" min-w-80 h-full">
                <div className="flex flex-col h-full">
                    <div className="w-full flex justify-center relative">
                        <ToggleButtonGroup
                            className="flex justify-center bg-white w-full max-w-lg h-14 rounded-none "
                            color="primary"
                            exclusive
                            aria-label="Platform"
                        >
                            {/* <ToggleButton
                                onClick={() => handleChange('inbox')}
                                value="inbox" className="flex-1 font-medium transition-all hover:bg-blue-50">
                                <InboxIcon className="h-6 w-6 text-orange-300" />
                                <span className="ml-2 text-nowrap">Tin nhắn</span>
                            </ToggleButton> */}
                            <ToggleButton
                                onClick={() => handleChange('friend')}
                                value="friend" className="flex-1 font-medium transition-all hover:bg-blue-50">
                                <UsersIcon className="h-6 w-6 text-green-400" />
                                <span className="ml-2 text-nowrap">Bạn Bè</span>
                            </ToggleButton>
                            <ToggleButton
                                onClick={() => handleChange('group')}
                                value="group" className="flex-1 font-medium transition-all hover:bg-blue-50">
                                <UserGroupIcon className="h-6 w-6 text-blue-400" />
                                <span className="ml-2 text-nowrap">Nhóm</span>
                            </ToggleButton>

                        </ToggleButtonGroup>
                    </div>

                    {/* Nội dung động */}

                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default LeftMessenger;

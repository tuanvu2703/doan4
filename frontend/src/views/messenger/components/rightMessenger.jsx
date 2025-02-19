import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import ToolInbox from "./rightMenu/toolInbox";
import ToolGroup from "./rightMenu/toolGroup";

import { MessengerContext } from "../layoutMessenger";

const RightMessenger = () => {
    const { content } = useContext(MessengerContext);

    const renderContent = () => {
        switch (content) {
            case "inbox":
                return <ToolInbox />;
            case "group":
                return <ToolGroup />;
            default:
                return <ToolInbox />;
        }
    };
    return (
        <div className="h-full flex flex-col w-full md:w-auto">
            {/* Nội dung động */}

            <div className="min-w-80 h-full">
                {renderContent()}
            </div>
        </div>
    );
};

export default RightMessenger;

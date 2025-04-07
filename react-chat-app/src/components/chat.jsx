import React, { useState, useEffect, useRef } from "react";
import useWebSocket from "./useWebsocket";
import axios from "axios";

const GroupChat = ({ userId }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isGroupLoaded, setIsGroupLoaded] = useState(false);
  const [groupId, setGroupId] = useState("");
  const [groupInfo, setGroupInfo] = useState(null); 
  const token = localStorage.getItem("token");

  const fileInput = useRef(null);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get("https://social-network-jbtx.onrender.com/user/current", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      return { firstName: "Unknown", lastName: "" };
    }
  };

  const onMessageReceived = async (newMessage) => {
    if (!newMessage.author && newMessage.authorId) {
      newMessage.author = await fetchCurrentUser();
    }
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const { sendMessage, socket } = useWebSocket(onMessageReceived);

  useEffect(() => {
    if (!groupId) return;

    const fetchGroupInfo = async () => {
      try {
        const response = await axios.get(`https://social-network-jbtx.onrender.com/chat/getmessagegroup/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.group) {
          setGroupInfo(response.data.group);
        }
      } catch (error) {
        console.error("Error fetching group info:", error);
      }
    };

    const fetchMessages = async () => {
      if (!groupId || !token) return;
      try {
        const response = await axios.get(`https://social-network-jbtx.onrender.com/chat/getmessagegroup/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.messages) {
          setMessages(response.data.messages);
        }
        setIsGroupLoaded(true);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchGroupInfo();
    fetchMessages();
  }, [groupId, token]);

  useEffect(() => {
    if (socket) {
      console.log("WebSocket connected with ID:", socket.id);
    }
  }, [socket]);

  const handleSendMessage = async () => {
    if (message.trim() || fileInput.current.files.length > 0) { // Kiểm tra nếu có nội dung hoặc file
      try {
        const formData = new FormData();
        formData.append("content", message); // Chỉ gửi nội dung văn bản nếu có
  
        if (fileInput.current && fileInput.current.files.length > 0) {
          // Sử dụng trường "files" thay vì "mediaURL"
          formData.append("files", fileInput.current.files[0]); // Nếu có file, gửi đi
        }
  
        // Gửi dữ liệu tới API
        const response = await axios.post(
          `https://social-network-jbtx.onrender.com/chat/sendmessagetogroup/${groupId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`, // Gửi token để lấy sender từ backend
            },
          }
        );
  
        console.log("Message sent successfully:", response.data);
        // Sau khi gửi tin nhắn qua API, gửi tin nhắn qua WebSocket
        sendMessage(groupId, message);
        setMessage(""); // Clear message input
      } catch (error) {
        console.error("Failed to send message", error);
      }
    }
  };

  return (
    <div className="chat-container">
      <h2>Group Chat</h2>

      <div>
        <input
          type="text"
          placeholder="Enter Group ID"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
        />
      </div>

      {isGroupLoaded && groupId && groupInfo ? (
        <div>
          <div className="group-info">
            <h3>{groupInfo.name}</h3>
            <img src={groupInfo.avatarGroup[0]} alt="Group Avatar" width={50} height={50} />
          </div>

          <div className="chat-box">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender._id === userId ? "own-message" : "other-message"}`}
              >
                <div className="message-header">
                  <strong>{msg.sender.firstName} {msg.sender.lastName}</strong>
                  {msg.sender.avatar && (
                    <img
                      src={msg.sender.avatar}
                      alt={`${msg.sender.firstName}'s Avatar`}
                      width={30}
                      height={30}
                    />
                  )}
                </div>
                <div className="message-content">
                  {msg.content}
                  {msg.mediaURL && <img src={msg.mediaURL} alt="Media" width={100} height={100} />}
                </div>
              </div>
            ))}
          </div>

          <div className="input-area">
            <input
              type="text"
              placeholder="Type a message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <input type="file" ref={fileInput} />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      ) : (
        <div>Please enter a valid Group ID to see the messages.</div>
      )}
    </div>
  );
};

export default GroupChat;

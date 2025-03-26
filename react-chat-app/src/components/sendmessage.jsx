import React, { useState } from "react";

const SendMessageForm = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (message.trim() === "") return;
    onSendMessage(message);
    setMessage("");
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Type a message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: "80%", padding: "10px" }}
      />
      <button
        onClick={handleSendMessage}
        style={{ padding: "10px 15px", marginLeft: "10px" }}
      >
        Send
      </button>
    </div>
  );
};

export default SendMessageForm;
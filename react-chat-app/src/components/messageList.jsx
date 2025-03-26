import React from "react";

const MessageList = ({ messages }) => {
  return (
    <div
      style={{
        maxHeight: "300px",
        overflowY: "auto",
        border: "1px solid #ddd",
        padding: "10px",
        marginBottom: "10px",
      }}
    >
      {messages.map((msg, index) => (
        <div key={index} style={{ marginBottom: "8px" }}>
          <strong>{msg.author?.firstName} {msg.author?.lastName}:</strong>{" "}
          {msg.content}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
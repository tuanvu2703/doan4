

import React, { useState } from "react";
import ChatComponent from './components/chat';
import EventGetewayIo from './components/EventGetewayIo';

function App() {
  const [groupId, setGroupId] = useState("");
  const [token, setToken] = useState("");

  return (
    <div>
      <h1>Group Chat</h1>

      {/* Nhập Group ID và Token */}
      <div>
        <input
          type="text"
          placeholder="Enter Group ID"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <input
          type="text"
          placeholder="Enter Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={{ padding: "5px" }}
        />
      </div>
      <EventGetewayIo />
      {/* Hiển Thị GroupChat */}
      {groupId && token && <ChatComponent groupId={groupId} token={token} />}
     
    </div>
  );
};

export default App;

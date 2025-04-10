import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import CallPage from "./components/Callcomponents";
import GroupChat from "./components/chat";
import LoginPage from "./components/login";

function App() {
  const [token, setToken] = useState(null);

  return (
    <Routes>
      <Route path="/" element={<LoginPage setToken={setToken} />} /> {/* Pass setToken as a prop */}
      <Route path="/chat" element={<GroupChat />} />
      <Route path="/call" element={<CallPage />} />
    </Routes>
  );
}

export default App;

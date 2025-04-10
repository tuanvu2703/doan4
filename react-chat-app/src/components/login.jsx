import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("https://social-network-jbtx.onrender.com/user/login", {
        email,
        password,
      });

      console.log("API Response:", res.data); // Check response

      const accessToken = res.data.accessToken;
      if (!accessToken) {
        throw new Error("Access token not received!");
      }

      setToken(accessToken); // Set token using setToken passed from App
      localStorage.setItem("token", accessToken); // Store the token in localStorage
      navigate("/chat"); // Redirect to the chat page
    } catch (err) {
      console.error("Login failed:", err);
      alert("Login failed!"); // Alert on login failure
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default LoginPage;

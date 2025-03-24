// AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { checkLogin } from '../service/user';
import { useState, useEffect } from 'react';
const AdminRoute = ({ children }) => {
  const [user, setUser] = useState({});
  useEffect(() => {
    const fetchUser = async () => {
      const response = await checkLogin();
      if (response.success) {
        setUser(response.data);
      }
    };
    fetchUser();
  }, []);
  console.log(user);
  // Giả sử thông tin người dùng được lưu ở localStorage dưới dạng JSON
  // Ví dụ: { id: 1, username: 'admin', role: "true" } hoặc { id: 2, username: 'user', role: "false" }
  // const user = JSON.parse(localStorage.getItem("user"));
  // Nếu không có user hoặc role của user là "false", chuyển hướng về trang chủ (hoặc trang đăng nhập)
  if (!user || user.role === false) {
    return <Navigate to="/" replace />;
  }

  // Nếu có quyền admin, hiển thị nội dung được bảo vệ
  return children;
};

export default AdminRoute;

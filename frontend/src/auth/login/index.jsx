import React, { useState } from 'react';
import axios from 'axios';
import API from '../../service/API';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import authToken from '../../components/authToken';
import NotificationCss from '../../module/cssNotification/NotificationCss';

import bg from '../login.jpg';

export default function Login() {
    const [formData, setFormData] = useState({
        // numberPhone: '0372830048',
        // password: 'Adsads1234@#',
    });

    const [errors, setErrors] = useState({});
    const navigate = useNavigate();


    const validateForm = () => {
        const validationErrors = {};
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.identifier);
        const isPhoneNumber = /^[0-9]{10,15}$/.test(formData.identifier);

        if (!formData.identifier) {
            validationErrors.identifier = 'Vui lòng nhập email hoặc số điện thoại.';
        } else if (!isEmail && !isPhoneNumber) {
            validationErrors.identifier = 'Định dạng không hợp lệ. Vui lòng nhập email hoặc số điện thoại.';
        }

        if (!formData.password) validationErrors.password = 'Vui lòng nhập mật khẩu.';
        return validationErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length === 0) {
            try {
                // Determine if the identifier is an email or phone number
                const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.identifier);

                // Dynamically construct the request payload
                const requestData = isEmail
                    ? { email: formData.identifier, password: formData.password }
                    : { numberPhone: formData.identifier, password: formData.password };

                // Send login request
                const response = await API.post(`/user/login`, requestData,);


                if (response.status === 201) {
                    authToken.setToken(response.data.accessToken); // Save the token
                    toast.success('Đăng nhập thành công! Chào mừng bạn trở lại.', NotificationCss.Success);
                    setTimeout(() => navigate('/fixconnectsocket'), 1000); // Redirect after 2 seconds
                } else {
                    toast.error('Đăng nhập thất bại, vui lòng thử lại.', NotificationCss.Fail);
                }
            } catch (error) {
                console.error('Lỗi:', error.response?.data || error.message);
                toast.error(
                    'Đăng nhập thất bại, vui lòng thử lại',
                    NotificationCss.Fail
                );
            }
        } else {
            setErrors(validationErrors);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    return (
        <div
            className="h-screen flex items-center justify-center"
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-lg shadow-gray-500 rounded-3xl p-10 w-full max-w-sm"
            >
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Đăng nhập</h1>

                <div className="mb-5">
                    <label htmlFor="identifier" className="block text-gray-600 text-sm font-medium">
                        Email hoặc Số điện thoại
                    </label>
                    <input
                        type="text"
                        name="identifier"
                        value={formData.identifier}
                        onChange={handleChange}
                        className="mt-2 block w-full px-4 py-3 text-gray-700 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Nhập email hoặc số điện thoại"
                    />
                    {errors.identifier && <p className="text-red-500 text-sm mt-2">{errors.identifier}</p>}
                </div>

                <div className="mb-5">
                    <label htmlFor="password" className="block text-gray-600 text-sm font-medium">
                        Mật khẩu

                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="mt-2 block w-full px-4 py-3 text-gray-700 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Nhập mật khẩu"
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-2">{errors.password}</p>}
                </div>
                <Link to="/forgotpass" className="float-right text-sm text-blue-500 hover:underline mb-2">
                    Quên mật khẩu?
                </Link>
                <button
                    onClick={handleSubmit}
                    className="w-full py-3 text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                >
                    Đăng nhập
                </button>
                <div className="flex items-center justify-between mt-3 mb-4 text-nowrap ">
                    <label htmlFor="donotaccount" className="block text-gray-600 text-sm font-medium mr-1">
                        <span className="text-sm text-gray-400">
                            Chưa có tài khoản?
                        </span>
                    </label>
                    <label htmlFor="register" className="block text-gray-600 text-sm font-medium">
                        <Link to="/register" className="text-sm text-blue-500 hover:underline">
                            Đăng ký ngay
                        </Link>
                    </label>

                </div>
                <div className=''>
                    <div className="flex items-center justify-between mt-1">
                        <div className='border-t border-gray-300 w-full'>
                        </div>
                        <span className="text-sm text-gray-600 px-3 text-center">hoặc</span>
                        <div className='border-t border-gray-300 w-full'>
                        </div>
                    </div>
                    <div className="flex justify-center mt-4">
                        <Link
                            to={"https://social-network-jbtx.onrender.com/user/google"}
                            className="flex items-center gap-2 py-2 px-4 border border-yellow-400 text-yellow-500 font-semibold rounded-lg hover:bg-yellow-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 488 512">
                                <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                            </svg>
                            GOOGLE
                        </Link>
                    </div>
                </div>
            </form>
            <ToastContainer position="top-right" autoClose={3000} />
        </div >
    );
}

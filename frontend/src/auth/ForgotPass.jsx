import React, { useState } from 'react';
import bg from './forgot.jpg';
import { forgotPassword, resetPassword, verifyOTP } from '../service/ForgotPassword';
import { toast, ToastContainer } from 'react-toastify';
import NotificationCss from '../module/cssNotification/NotificationCss';
import { Link } from 'react-router-dom';

export default function ForgotPass() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpVisible, setOtpVisible] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [verifyButtonVisible, setVerifyButtonVisible] = useState(true);
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [errors, setErrors] = useState({});
    const handleChange = (e) => setEmail(e.target.value);
    const handleOtpChange = (e) => setOtp(e.target.value);
    const handlePasswordChange = (e) => setNewPassword(e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await forgotPassword(email);
        if (response) {
            toast.success('OTP đã được gửi đến email của bạn, vui lòng nhập OTP!', NotificationCss.Success);
            setOtpVisible(true);
        } else {
            toast.error('Email chưa tồn tại', NotificationCss.Fail);
        }
    };
    //validate
    const validateField = (name, value) => {
        let newErrors = { ...errors };
        switch (name) {
            case "currentPassword":
                if (value.length < 3) {
                    newErrors.currentPassword = "Mật khẩu hiện tại phải dài ít nhất 3 ký tự.";
                } else {
                    delete newErrors.currentPassword;
                }
                break;
            case "newPassword":
                const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
                if (!passwordRegex.test(value)) {
                    newErrors.newPassword =
                        "Mật khẩu phải dài ít nhất 8 ký tự và bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.";
                } else {
                    delete newErrors.newPassword;
                }
                break;
            case "confirmNewPassword":
                if (value !== newPassword) {
                    newErrors.confirmNewPassword = "Mật khẩu xác nhận không khớp.";
                } else {
                    delete newErrors.confirmNewPassword;
                }
                break;
            default:
                break;
        }

        setErrors(newErrors);
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const response = await verifyOTP(email, otp);
        if (response) {
            toast.success('OTP đã xác thực, vui lòng nhập mật khẩu mới!', NotificationCss.Success);
            setPasswordVisible(true);
            setVerifyButtonVisible(false);
        } else {
            toast.error('OTP không đúng, vui lòng nhập lại', NotificationCss.Fail);
        }
    };


    const handleConfirmPasswordChange = (e) => {
        setConfirmNewPassword(e.target.value);
    };

    const handleReset = async (e) => {
        e.preventDefault();
        if (confirmNewPassword !== newPassword) {
            setErrors({ confirmNewPassword: "Mật khẩu xác nhận không khớp." });
            return;
        }
        const response = await resetPassword(newPassword);
        if (response) {
            toast.success('Mật khẩu đã được thay đổi', NotificationCss.Success);
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            toast.error('Có lỗi vui lòng thử lại', NotificationCss.Fail);
        }
    };
    console.log(email, otp, newPassword)
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
            <div className="max-w-md w-full bg-white bg-opacity-90 rounded-xl shadow-2xl backdrop-blur-md p-8 transform transition-transform duration-300">
                <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-6">Quên mật khẩu?</h2>
                <p className="text-center text-gray-600 mb-8">
                    Nhập email của bạn để nhận mã OTP và đặt lại mật khẩu.
                </p>
                <form className="space-y-6">
                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={handleChange}
                            required
                            disabled={otpVisible || passwordVisible}
                            className="w-full px-4 py-3 text-gray-900 placeholder-gray-400 bg-gray-100 rounded-lg shadow-inner focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="example@example.com"
                        />
                    </div>

                    {/* OTP Input */}
                    {otpVisible && (
                        <div>
                            <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
                                Mã OTP
                            </label>
                            <input
                                id="otp"
                                type="text"
                                value={otp}
                                disabled={passwordVisible}
                                onChange={handleOtpChange}
                                className="w-full px-4 py-3 text-gray-900 placeholder-gray-400 bg-gray-100 rounded-lg shadow-inner focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Nhập mã OTP"
                            />
                            {verifyButtonVisible && (
                                <button
                                    onClick={handleVerify}
                                    className="w-full py-3 mt-4 text-white font-semibold bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg shadow-lg hover:from-purple-600 hover:to-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                                >
                                    Xác thực OTP
                                </button>
                            )}
                        </div>
                    )}

                    {/* New Password Input */}
                    {passwordVisible && (
                        <div>
                            <label
                                htmlFor="newPassword"
                                className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                                Mật khẩu mới
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={handlePasswordChange}
                                className="w-full mb-2 px-4 py-3 text-gray-900 placeholder-gray-400 bg-gray-100 rounded-lg shadow-inner focus:ring-2 focus:ring-green-500 focus:outline-none"
                                placeholder="Nhập mật khẩu mới"
                            />
                            <label htmlFor="confirmNewPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                name="confirmNewPassword"
                                value={confirmNewPassword}
                                onChange={handleConfirmPasswordChange}
                                required
                                placeholder="Nhập lại mật khẩu mới"
                                className="w-full px-4 py-3 text-gray-900 placeholder-gray-400 bg-gray-100 rounded-lg shadow-inner focus:ring-2 focus:ring-green-500 focus:outline-none"
                            />
                            {errors.confirmNewPassword && (
                                <p className="mt-1 text-sm text-red-500">{errors.confirmNewPassword}</p>
                            )}
                            <button
                                onClick={handleReset}
                                className="w-full py-3 mt-4 text-white font-semibold bg-gradient-to-r from-green-500 to-teal-500 rounded-lg shadow-lg hover:from-green-600 hover:to-teal-600 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300"
                            >
                                Đặt lại mật khẩu
                            </button>
                        </div>
                    )}

                    {/* Send OTP Button */}
                    {!otpVisible && !passwordVisible && (
                        <button
                            onClick={handleSubmit}
                            className="w-full py-3 text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                        >
                            Gửi mã OTP
                        </button>
                    )}
                </form>
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
                <div className="flex items-center justify-between mt-4 mb-4 text-nowrap ">
                    <label className="block text-gray-600 text-sm font-medium mr-1">
                        <span className="text-sm text-gray-400 ">
                            Bạn đã nhớ lại mật khẩu?
                        </span>
                    </label>
                    <label className="block text-gray-600 text-sm font-medium">
                        <Link to="/login" className="text-sm text-blue-500 hover:underline">
                            Đăng nhập ngay
                        </Link>
                    </label>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>

    );
}

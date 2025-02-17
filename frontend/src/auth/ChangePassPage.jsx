import React, { useState } from 'react';
import { changepass } from '../service/AuthService';
import authToken from '../components/authToken';
import { toast } from 'react-toastify';
import NotificationCss from '../module/cssNotification/NotificationCss';

export default function ChangePassPage({ btnCancel }) {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    });

    // Validate
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
                if (value !== formData.newPassword) {
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

    // Handle change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        validateField(name, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (Object.keys(errors).length > 0) {
            toast.error('Vui lòng sửa các lỗi trước khi gửi.', NotificationCss.Fail);
            return;
        }
        try {
            setLoading(true);
            const response = await changepass(formData.currentPassword, formData.newPassword);

            if (response.success) {
                if (response.status === 200) {
                    toast.success('Đổi mật khẩu thành công.', NotificationCss.Success);
                    // Uncomment the following if needed:
                    // authToken.deleteToken();
                    // window.location.reload();
                } else {
                    toast.error(response.messenger, NotificationCss.Fail);
                }
            } else {

                // Optionally set form errors if necessary
                if (response.status === 401) {
                    toast.error('mật khẩu không chính xác', NotificationCss.Fail);
                    setErrors({ currentPassword: 'mật khẩu không chính xác' });
                } else {
                    toast.error(response.messenger, NotificationCss.Fail);
                }
            }
        }
        catch (error) {
            if (error.response && error.response.status === 401) {
                setErrors({ currentPassword: "Mật khẩu hiện tại không đúng." });
                toast.error('Mật khẩu hiện tại không đúng.', NotificationCss.Fail);
            } else {
                console.error("Error changing password:", error);
                toast.error('Đã xảy ra lỗi. Vui lòng thử lại.', NotificationCss.Fail);
            }
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-12">
            <div className="bg-white w-full max-w-md p-10 rounded-xl shadow-xl border border-gray-200">
                <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">Đổi mật khẩu</h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            required
                            placeholder="Nhập mật khẩu hiện tại"
                            className="w-full px-4 py-3 mt-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        {errors.currentPassword && (
                            <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            required
                            placeholder="Nhập mật khẩu mới"
                            className="w-full px-4 py-3 mt-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        {errors.newPassword && (
                            <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                        <input
                            type="password"
                            name="confirmNewPassword"
                            value={formData.confirmNewPassword}
                            onChange={handleInputChange}
                            required
                            placeholder="Nhập lại mật khẩu mới"
                            className="w-full px-4 py-3 mt-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        {errors.confirmNewPassword && (
                            <p className="mt-1 text-sm text-red-500">{errors.confirmNewPassword}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                    >
                        {loading ? (
                            <span className="flex justify-center items-center">
                                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 118 8 8 8 0 01-8-8z"></path>
                                </svg>
                                Đang đổi mật khẩu...
                            </span>
                        ) : (
                            "Đổi mật khẩu"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

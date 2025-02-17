import React, { useState, useEffect } from "react";

import { profileUserCurrent, updateInformation } from "../../../service/ProfilePersonal";


const ModalUpdateProfile = () => {
    const [dataProfile, setDataProfile] = useState({})
    const [errors, setErrors] = useState({});
    const [alertVisible, setAlertVisible] = useState(false);
    const [formData, setFormData] = useState({
        birthday: "",
        gender: "",
        address: "",
        email: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        const fetchdata = async () => {
            const response = await profileUserCurrent();
            if (response && response.data) {
                setDataProfile(response.data)
            }
        }
        fetchdata()
    }, [])
    useEffect(() => {
        if (dataProfile.birthday || dataProfile.gender || dataProfile.address) {
            setFormData({
                birthday: dataProfile.birthday || "",
                gender: dataProfile.gender || "",
                address: dataProfile.address || "",
                email: dataProfile.email || ""
            });
        }
    }, [dataProfile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        validateField(name, value);
    };
    //validate birthday
    const validateBirthday = (birthday) => {
        const today = new Date();
        const birthDate = new Date(birthday);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age >= 16;
    };

    //validate
    const validateField = (name, value) => {
        let newErrors = { ...errors };

        switch (name) {
            case "username":
                if (value.length < 3) {
                    newErrors.username = "Username must be at least 3 characters long";
                } else {
                    delete newErrors.username;
                }
                break;
            case "email":
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    newErrors.email = "sai định dạng email";
                } else {
                    delete newErrors.email;
                }
                break;
            case "newPassword":
                const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
                if (!passwordRegex.test(value)) {
                    newErrors.newPassword =
                        "Mật khẩu phải có ít nhất 8 ký tự và bao gồm chữ in hoa, chữ thường, số và ký tự đặc biệt.";
                } else {
                    delete newErrors.newPassword;
                }
                break;
            case "confirmNewPassword":
                if (value !== formData.newPassword) {
                    newErrors.confirmNewPassword = "Không khớp với mật khẩu mới";
                } else {
                    delete newErrors.confirmNewPassword;
                }
                break;
            default:
                break;
        }

        setErrors(newErrors);
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = { ...errors };

        if (!validateBirthday(formData.birthday)) {
            newErrors.birthday = 'Tuổi phải lớn hơn hoặc bằng 16.';
            setErrors(newErrors);
            return;
        } else {
            delete newErrors.birthday;
        }
        try {

            setIsLoading(true)
            await updateInformation(formData.birthday, formData.gender, formData.address, formData.email);
            setAlertVisible(true)

        } catch (error) {
            console.log(error);

        } finally {
            setTimeout(() => {
                window.location.reload()
            }, 3000);
        }
    };
    console.log(dataProfile)
    return (
        <dialog id="my_modal_1" className="modal">
            <div className="modal-box w-11/12 max-w-xl">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-12">
                        <h3 className="font-bold text-2xl  my-5 text-center">Cập nhật thông tin</h3>
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 hover:bg-red-600 hover:text-white">✕</button>
                        </form>

                        <div className="border-b border-gray-900/10 pb-12">

                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="col-span-full">
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-500" : "border-gray-300"}`}
                                        aria-invalid={errors.email ? "true" : "false"}
                                        aria-describedby={errors.email ? "email-error" : undefined}
                                        list="email-suggestions"
                                    />
                                    <datalist id="email-suggestions">
                                        <option value="@gmail.com" />
                                        <option value="@outlook.com" />
                                        <option value="@yahoo.com" />
                                    </datalist>
                                    {errors.email && (
                                        <p
                                            id="email-error"
                                            className="mt-1 text-sm text-red-600"
                                            role="alert"
                                        >
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                                <div className="col-span-full">
                                    <label htmlFor="birthday" className="block text-sm font-medium leading-6 text-gray-900">
                                        Ngày/tháng/năm sinh
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            name="birthday"
                                            value={formData.birthday}
                                            onChange={handleInputChange}
                                            type="date"
                                            autoComplete="birthday"
                                            className="block w-full rounded-md border-0 py-3 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                    {errors.birthday && <div className="text-red-500">{errors.birthday}</div>}
                                </div>

                                <div className="col-span-full">
                                    <label htmlFor="gender" className="block text-sm font-medium leading-6 text-gray-900">
                                        Giới tính
                                    </label>
                                    <div className="mt-2">
                                        {formData.gender === true ? (
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleInputChange}
                                                autoComplete="country-name"
                                                className="block w-full rounded-md border-0 py-3 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                            >
                                                <option value={true}>Nam</option>
                                                <option value={false}>Nữ</option>
                                            </select>
                                        ) : (
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleInputChange}
                                                autoComplete="country-name"
                                                className="block w-full rounded-md border-0 py-3 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                            >
                                                <option value={false}>Nữ</option>
                                                <option value={true}>Nam</option>
                                            </select>
                                        )}
                                    </div>
                                </div>
                                <div className="col-span-full">
                                    <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">
                                        Bạn đang ở
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            name="address"
                                            type="text"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            autoComplete="street-address"
                                            className="block w-full  text-wrap rounded-md border-0 py-3 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                    {alertVisible && (
                        <div role="alert" className="alert alert-success">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Cập nhật thành công!</span>
                        </div>
                    )}
                    <div className="modal-action mt-6 flex items-center justify-end gap-4">
                        {isLoading ? <p>Loading...</p> :
                            <div className='flex gap-4'>
                                <form method="dialog">
                                    {/* if there is a button in form, it will close the modal */}
                                    <button className="btn bg-red-600 text-white hover:bg-red-500">Hủy</button>
                                </form>
                                <button type='submit' className="btn bg-sky-600 text-white hover:bg-sky-500">Cập nhật</button>
                            </div>
                        }
                    </div>
                </form >

            </div>
        </dialog>

    );
};

export default ModalUpdateProfile;
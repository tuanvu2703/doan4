import React from 'react'
import { useState, useEffect } from 'react';
import { PhotoIcon, CloudArrowUpIcon } from '@heroicons/react/24/solid';

import { profileUserCurrent, updateName, uploadAvatar, uploadBackground } from '../../../service/ProfilePersonal';

export default function ModalUpdateAVT() {
    const [dataProfile, setDataProfile] = useState({})
    const [avatar, setAvatar] = useState(null);
    const [upAvatar, setUpAvatar] = useState(null);
    const [alertVisible, setAlertVisible] = useState(false);
    const [loading, setLoading] = useState(false)
    const [bg, setBg] = useState(null);
    const [upBg, setUpBg] = useState(null);

    const [name, setName] = useState({
        firstName: "",
        lastName: ""
    })
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
        if (dataProfile.firstName || dataProfile.lastName) {
            setName({
                firstName: dataProfile.firstName || "",
                lastName: dataProfile.lastName || ""
            });
        }
    }, [dataProfile]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const newAvatarURL = URL.createObjectURL(file);
            setAvatar(newAvatarURL);
            setDataProfile((prevData) => ({
                ...prevData,
                avatar: newAvatarURL
            }))
            setUpAvatar(file);
        }
        // setAvatar(file);
    };

    //bg
    const handleFileBgChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const newAvatarURL = URL.createObjectURL(file);
            setBg(newAvatarURL);
            setDataProfile((prevData) => ({
                ...prevData,
                coverImage: newAvatarURL
            }))
            setUpBg(file);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setName(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true)
            await updateName(name.firstName, name.lastName);
            if (upAvatar) {
                await uploadAvatar(upAvatar);
            }
            if (upBg) {
                await uploadBackground(upBg);
            }
            setAlertVisible(true)
        } catch (error) {
            console.error('Failed to update name', error);
        }
        finally {
            setTimeout(() => {
                window.location.reload()
            }, 3000);
        }
    };

    console.log(upBg)
    return (
        <dialog id="my_modal_2" className="modal ">
            <form className="modal-box" onSubmit={handleSubmit} enctype="multipart/form-data">
                <form method="dialog">
                    {/* if there is a button in form, it will close the modal */}
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <h3 className="font-bold text-lg">Cập nhật thông tin</h3>
                <div className="col-span-full grid gap-2">
                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="sm:col-span-3">

                            <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
                                Họ
                            </label>
                            <div className="mt-2">
                                <input
                                    id="lastName"
                                    name='lastName'
                                    type="text"
                                    value={name.lastName}
                                    onChange={handleChange}
                                    autoComplete="family-name"
                                    className="block w-full rounded-md border-0 py-3 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-3">
                            <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                                Tên
                            </label>
                            <div className="mt-2">
                                <input
                                    id="firstName"
                                    name='firstName'
                                    type="text"
                                    value={name.firstName}
                                    onChange={handleChange}
                                    autoComplete="given-name"
                                    className="block w-full  rounded-md border-0 py-3 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                    </div>
                    <label htmlFor="cover-photo" className="block text-sm font-medium leading-6 text-gray-900">
                        Ảnh bìa
                    </label>
                    <div className="relative h-52 w-full bg-gray-100 rounded-md overflow-hidden">
                        {dataProfile.coverImage ? (
                            <img
                                src={dataProfile.coverImage}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <PhotoIcon className="size-[80%] text-gray-400" />
                            </div>
                        )}
                        <input
                            type="file"

                            name="files"
                            onChange={handleFileBgChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            aria-label="Upload profile picture"
                        />
                    </div>
                </div>
                <div className="col-span-full mb-4">
                    <label htmlFor="photo" className="block text-sm font-medium leading-6 text-gray-900">
                        Ảnh đại diện
                    </label>
                    <div className="relative h-48 w-48 bg-gray-100 rounded-md overflow-hidden">
                        {dataProfile.avatar ? (
                            <img
                                src={dataProfile.avatar}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">

                                <CloudArrowUpIcon className="size-[80%] text-gray-400" />
                            </div>
                        )}
                        <input
                            type="file"

                            name="files"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            aria-label="Upload profile picture"
                        />

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
                <div className="modal-action">
                    {loading ? <p>Loading...</p> :
                        <div className='flex gap-4'>
                            <form method="dialog">
                                {/* if there is a button in form, it will close the modal */}
                                <button className="btn bg-red-600 text-white hover:bg-red-500">Hủy</button>
                            </form>
                            <button type='submit' className="btn bg-sky-600 text-white hover:bg-sky-500">Cập nhật</button>
                        </div>
                    }
                </div>

            </form>
        </dialog>
    )
}

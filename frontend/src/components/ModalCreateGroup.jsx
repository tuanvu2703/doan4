import React, { useEffect } from 'react'
import { useState } from 'react'
import { createPublicGroup } from '../service/publicGroup';
import Loading from './Loading';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import FileViewChane from './fileViewChane';
import NotificationCss from '../module/cssNotification/NotificationCss';
export default function ModalCreateGroup() {
    const [formData, setFormData] = useState({
        groupName: "",
        files: null,
        rules: "",
        typegroup: ""
    });
    const navigate = useNavigate();
    const [filePreview, setFilePreview] = useState(null)
    const [isFormValid, setIsFormValid] = useState(false)
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({
        groupName: false,
        files: false
    });
    const [touched, setTouched] = useState({
        groupName: false,
        files: false
    });

    useEffect(() => {
        const { groupName, files, rules, typegroup } = formData;
        const valid = groupName.trim() !== "" && files !== null && typegroup !== "";
        setIsFormValid(valid);

        setErrors({
            groupName: touched.groupName && groupName.trim() === "",
            files: touched.files && files === null
        });
    }, [formData, touched]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFilePreview(URL.createObjectURL(file));
        }
        setFormData({ ...formData, files: file });
        setTouched({ ...touched, files: true });
    };

    const handleFileRemove = () => {
        setFilePreview(null);
        setFormData({ ...formData, files: null });
        setTouched({ ...touched, files: true });
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, groupName: e.target.value });
        setTouched({ ...touched, groupName: true });
    };

    async function handleSubmit(e) {
        setIsLoading(true);
        e.preventDefault();
        // Mark all fields as touched to show errors
        setTouched({
            groupName: true,
            files: true
        });

        if (isFormValid) {
            try {
                // Create a new FormData instance
                const formDataToSend = new FormData();
                formDataToSend.append('groupName', formData.groupName);
                formDataToSend.append('rules', formData.rules);
                formDataToSend.append('typegroup', formData.typegroup);

                // Log file to verify it exists before sending
                console.log("File being uploaded:", formData.files);

                // Append the file with the correct field name
                if (formData.files) {
                    formDataToSend.append('files', formData.files, formData.files.name);
                }

                // Submit the form data
                const response = await createPublicGroup(formDataToSend);
                toast.success(response?.message ? response.message : 'Tạo nhóm thành công', NotificationCss.Success);
                console.log("Response:", response);

                // Close the modal on success
                setIsLoading(false);
                document.getElementById('my_modal_create_group').close();
            } catch (error) {
                console.error("Error creating group:", error);
            }
        }
    }

    return (
        <dialog id="my_modal_create_group" className="modal">
            <div className="modal-box">
                <form method="dialog">
                    {/* if there is a button in form, it will close the modal */}
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <h3 className="font-bold text-lg text-center my-7 border-b-black border-b-[1px]">Tạo nhóm mới</h3>
                <div className='grid gap-5'>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Tên nhóm</legend>
                        <input
                            value={formData.groupName}
                            onChange={handleInputChange}
                            onBlur={() => setTouched({ ...touched, groupName: true })}
                            type="text"
                            placeholder="Nhập tên nhóm"
                            className={`input input-md w-full ${errors.groupName ? 'input-error' : ''}`}
                            required
                        />
                        {errors.groupName && (
                            <p className="text-error text-sm mt-1">Vui lòng nhập tên nhóm</p>
                        )}
                    </fieldset>
                    {/* select privacy */}
                    <select defaultValue="Server location" className="select select-neutral">
                        <option disabled={true}>Chọn loại nhóm</option>
                        <option value={"public"}>Công khai</option>
                        <option value={"private"}>Riêng tư</option>
                    </select>


                    <div className="form-control">
                        <input
                            accept="image/*"
                            id="files"
                            name='files'
                            onChange={handleFileChange}
                            type="file"
                            className={`file-input file-input-accent w-full ${errors.files ? 'file-input-error' : ''}`}
                        />
                        {errors.files && (
                            <p className="text-error text-sm mt-1">Vui lòng chọn ảnh đại diện cho nhóm</p>
                        )}
                    </div>

                    {filePreview && (
                        <div className="flex justify-center">
                            <FileViewChane file={formData?.files} onDelete={handleFileRemove} />
                        </div>
                    )}
                </div>
                <div className="modal-action">
                    {isLoading ? (<Loading />) : (
                        <form method="dialog" className='flex gap-5'>
                            <button className="btn btn-error text-white">Hủy</button>
                            <button
                                onClick={handleSubmit}
                                className={`btn ${isFormValid ? 'btn-success' : 'btn-disabled'} text-white`}
                                disabled={!isFormValid}
                            >
                                Tạo nhóm
                            </button>
                        </form>
                    )}
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    )
}
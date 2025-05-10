import React, { useEffect } from 'react'
import { useState } from 'react'
import { createPublicGroup } from '../service/publicGroup';
import Loading from './Loading';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import FileViewChane from './fileViewChane';
import NotificationCss from '../module/cssNotification/NotificationCss';
export default function ModalCreateGroup({ onNewGroup }) {
    const [formData, setFormData] = useState({
        groupName: "",
        files: null,
        rules: [],
        summary: "",
        visibility: "public",
        discoverability: "everyone",
        tags: ""
    });
    const navigate = useNavigate();
    const [filePreview, setFilePreview] = useState(null)
    const [isFormValid, setIsFormValid] = useState(false)
    const [isLoading, setIsLoading] = useState(false);
    const [ruleInput, setRuleInput] = useState("");
    const [errors, setErrors] = useState({
        groupName: false,
        files: false,
        summary: false
    });
    const [touched, setTouched] = useState({
        groupName: false,
        files: false,
        summary: false
    });

    useEffect(() => {
        const { groupName, files, summary } = formData;
        const valid = groupName.trim() !== "" && files !== null && summary.trim() !== "";
        setIsFormValid(valid);

        setErrors({
            groupName: touched.groupName && groupName.trim() === "",
            files: touched.files && files === null,
            summary: touched.summary && summary.trim() === ""
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
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setTouched({ ...touched, [name]: true });
    };

    const handleAddRule = () => {
        if (ruleInput.trim() !== "") {
            setFormData({
                ...formData,
                rules: [...formData.rules, ruleInput.trim()]
            });
            setRuleInput("");
        }
    };

    const handleRemoveRule = (index) => {
        const updatedRules = [...formData.rules];
        updatedRules.splice(index, 1);
        setFormData({ ...formData, rules: updatedRules });
    };

    async function handleSubmit(e) {
        setIsLoading(true);
        e.preventDefault();
        // Mark all fields as touched to show errors
        setTouched({
            groupName: true,
            files: true,
            summary: true
        });

        if (!isFormValid) {
            setIsLoading(false);
            return;
        }

        try {
            // Create a new FormData instance
            const formDataToSend = new FormData();
            formDataToSend.append('groupName', formData.groupName);
            formDataToSend.append('summary', formData.summary);
            formDataToSend.append('visibility', formData.visibility);
            formDataToSend.append('discoverability', formData.discoverability);
            formDataToSend.append('tags', formData.tags);

            // Convert rules array to JSON string
            formDataToSend.append('rules', JSON.stringify(formData.rules));

            // Append the file with the correct field name
            if (formData.files) {
                formDataToSend.append('files', formData.files, formData.files.name);
            }

            // Submit the form data
            const response = await createPublicGroup(formDataToSend);
            toast.success(response?.message ? response.message : 'Tạo nhóm thành công', NotificationCss.Success);

            // Invoke the callback with the new group data
            if (onNewGroup && response?.data) {
                onNewGroup(response.data);
            }

            // Close the modal on success
            setIsLoading(false);
            document.getElementById('my_modal_create_group').close();
        } catch (error) {
            console.error("Error creating group:", error);
            toast.error("Lỗi khi tạo nhóm: " + (error.message || "Vui lòng thử lại"), NotificationCss.Error);
        } finally {
            setIsLoading(false);
            window.location.reload(); // Reload the page to reflect the new group
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
                            name="groupName"
                            placeholder="Nhập tên nhóm"
                            className={`input input-md w-full ${errors.groupName ? 'input-error' : ''}`}
                            required
                        />
                        {errors.groupName && (
                            <p className="text-error text-sm mt-1">Vui lòng nhập tên nhóm</p>
                        )}
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Mô tả nhóm</legend>
                        <textarea
                            value={formData.summary}
                            onChange={handleInputChange}
                            onBlur={() => setTouched({ ...touched, summary: true })}
                            name="summary"
                            placeholder="Mô tả ngắn về nhóm"
                            className={`textarea textarea-md w-full ${errors.summary ? 'textarea-error' : ''}`}
                            required
                        />
                        {errors.summary && (
                            <p className="text-error text-sm mt-1">Vui lòng nhập mô tả nhóm</p>
                        )}
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Quy tắc nhóm</legend>
                        <div className="flex gap-2">
                            <input
                                value={ruleInput}
                                onChange={(e) => setRuleInput(e.target.value)}
                                type="text"
                                placeholder="Nhập quy tắc nhóm"
                                className="input input-md flex-grow"
                            />
                            <button
                                type="button"
                                onClick={handleAddRule}
                                className="btn btn-primary"
                            >
                                Thêm
                            </button>
                        </div>
                        {formData.rules.length > 0 && (
                            <ul className="mt-3 list-disc list-inside">
                                {formData.rules.map((rule, index) => (
                                    <li key={index} className="flex justify-between items-center py-1">
                                        <span>{rule}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveRule(index)}
                                            className="btn btn-ghost btn-xs text-error"
                                        >
                                            Xóa
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Quyền riêng tư</legend>
                        <select
                            value={formData.visibility}
                            onChange={handleInputChange}
                            name="visibility"
                            className="select select-neutral w-full">
                            <option value="public">Công khai</option>
                            <option value="private">Riêng tư</option>
                        </select>
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Khả năng khám phá</legend>
                        <select
                            value={formData.discoverability}
                            onChange={handleInputChange}
                            name="discoverability"
                            className="select select-neutral w-full">
                            <option value="everyone">Mọi người</option>

                            <option value="invited">Chỉ người được mời</option>
                        </select>
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Thẻ</legend>
                        <input
                            value={formData.tags}
                            onChange={handleInputChange}
                            name="tags"
                            type="text"
                            placeholder="Nhập thẻ, cách nhau bởi dấu phẩy (vd: thể thao, âm nhạc, học tập)"
                            className="input input-md w-full"
                        />
                    </fieldset>

                    <div className="form-control">
                        <label className="label">Ảnh đại diện nhóm</label>
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
                        <div className='flex gap-5'>
                            <button
                                type="button"
                                onClick={() => document.getElementById('my_modal_create_group').close()}
                                className="btn btn-error text-white"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className={`btn btn-success text-white ${!isFormValid ? 'btn-disabled' : ''}`}
                            >
                                Tạo nhóm
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    )
}
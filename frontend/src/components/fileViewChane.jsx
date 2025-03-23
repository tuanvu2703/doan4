import React from 'react';
import { XCircleIcon } from '@heroicons/react/24/solid';
const FileViewChane = ({ file, onDelete }) => {
    // Determine the file type based on its extension
    const getFileType = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'webm'];
        const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'];

        if (imageExtensions.includes(extension)) return 'image';
        if (videoExtensions.includes(extension)) return 'video';
        return 'unknown';
    };

    // Get file type
    const fileType = file ? getFileType(file.name || file) : 'unknown';

    // Render preview based on file type
    return (
        <div className="relative max-w-[200px] flex ">
            {fileType === 'image' && (
                <img
                    src={URL.createObjectURL(file)}
                    alt="Selected file preview"
                    className="object-cover w-full h-full border-2 "
                />
            )}
            {fileType === 'video' && (
                <video
                    controls
                    className="object-cover w-full h-full"
                >
                    <source src={URL.createObjectURL(file)} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            )}
            {fileType === 'unknown' && (
                <div className="text-gray-600 text-sm text-center flex h-20 w-20 flex-col justify-end">
                    <div className="text-center">
                        File type not supported.
                    </div>
                </div>
            )}
            <button
                type="button"
                className="relative bg-red-500  p-3 text-white rounded-r-md"
                onClick={onDelete}
            >
                ✕
            </button>
        </div>
    );
};

export default FileViewChane;
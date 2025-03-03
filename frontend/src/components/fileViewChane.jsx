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
        <div className="relative max-w-[200px] border-2">
            {fileType === 'image' && (
                <img
                    src={URL.createObjectURL(file)}
                    alt="Selected file preview"
                    className="object-cover w-full h-full"
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
                className="absolute top-2 right-2  rounded-full p-1"
                onClick={onDelete}
            >
                <XCircleIcon className='size-5 fill-red-500' />
            </button>
        </div>
    );
};

export default FileViewChane;
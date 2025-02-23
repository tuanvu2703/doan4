import React from 'react';
import { useUser } from '../service/UserContext';

const FileViewer = ({ file, mh }) => {
    const { setShowZom } = useUser();
    const openModal = (file) => {
        setShowZom({ file: file, show: true });
    };

    // Utility to check file type
    const checkFileType = (file) => {
        if (!file || typeof file !== 'string') {
            return 'unknown';
        }

        // Check for image
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'];
        if (imageExtensions.some((ext) => file.toLowerCase().endsWith(ext))) {
            return 'picture';
        }

        // Check for video
        const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'];
        if (videoExtensions.some((ext) => file.toLowerCase().endsWith(ext))) {
            return 'video';
        }

        // Default to 'file' for unsupported types
        return 'file';
    };

    // Render a preview for a single file
    const renderSingleFilePreview = (file) => {
        const fileType = checkFileType(file);

        switch (fileType) {
            case 'picture':
                return (
                    <img
                        onClick={() => openModal(file)}
                        src={file}
                        style={{ maxWidth: '100%', maxHeight: mh }}
                        className='rounded-sm border cursor-pointer'
                        alt=""
                    />
                );
            case 'video':
                return (
                    <video
                        controls
                        style={{ maxWidth: '100%', maxHeight: mh }}
                        onClick={() => openModal(file)}
                        className="rounded-sm border cursor-pointer"
                    >
                        <source

                            src={file}
                            type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                );
            case 'file':
                return (
                    <div
                        onClick={() => openModal(file)}
                        className="rounded-sm border bg-gray-100 flex justify-center items-center cursor-pointer p-4"
                    >
                        <span>File</span>
                    </div>
                );
            default:
                return (
                    <div className="rounded border bg-gray-100 flex justify-center items-center p-4" style={{ margin: '5px' }}>
                        <span>Unknown File Type</span>
                    </div>
                );
        }
    };

    // Normalize the input to an array
    const files = Array.isArray(file) ? file : [file];

    // Render all files
    return (
        <>
            {files.map((f, index) => (
                renderSingleFilePreview(f)
            ))}
        </>
    );
};

export default FileViewer;

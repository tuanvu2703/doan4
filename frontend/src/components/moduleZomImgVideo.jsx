import React from 'react';
import { Modal, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useUser } from '../service/UserContext';

const ModuleZomImgVideo = () => {
    const { showZom, setShowZom } = useUser(); // Get values from context
    let { file, show } = showZom; // Destructure showZom object

    // console.log('File:', file);

    const handleCloseModal = () => {
        setShowZom({ ...showZom, show: false }); // Close the modal
    };

    // Handle cases where `file` is an array or other type
    if (Array.isArray(file) && file.length > 0) {
        file = file[0]; // Use the first element in the array
    } else if (typeof file !== 'string') {
        file = ''; // Fallback to an empty string for unsupported data types
    }

    // Utility to check file type
    const isVideo = (url) => url && url.toLowerCase().endsWith('.mp4');
    const isImage = (url) => {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'];
        return url && imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
    };

    const renderContent = () => {
        if (!file) {
            return (
                <Box sx={{ color: 'white', padding: 2, textAlign: 'center' }}>
                    <p>No file available</p>
                </Box>
            );
        }

        if (isVideo(file)) {
            return (
                <video
                    controls
                    className="w-full h-full object-contain rounded"
                    style={{
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                    }}
                >
                    <source src={file} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            );
        }

        if (isImage(file)) {
            return (
                <img
                    className="w-full h-full object-contain rounded"
                    src={file}
                    alt="Modal Preview"
                    style={{
                        minHeight:'90vh',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        borderRadius: '8px',
                    }}
                />
            );
        }

        return (
            <Box sx={{ color: 'white', padding: 2, textAlign: 'center' }}>
                <p>Unsupported File Format</p>
            </Box>
        );
    };

    return (
        <Modal
            open={show}
            onClose={handleCloseModal}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    backgroundColor: 'white',
                    padding: 0.4,
                    borderRadius: 2,
                }}
            >
                <IconButton
                    onClick={handleCloseModal}
                    sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.4)',
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                    }}
                >
                    <CloseIcon color="error" />
                </IconButton>
                {renderContent()}
            </Box>
        </Modal>
    );
};

export default ModuleZomImgVideo;

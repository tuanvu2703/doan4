const FilePreview = ({ preview }) => {
    // Kiểm tra loại tệp (ảnh, video, hay file)
    const checkFileType = (file) => {
        // Kiểm tra nếu file là chuỗi hợp lệ
        if (!file || typeof file !== 'string' || file==null) {
            console.log('chuoi ')
            return 'invalid';
        }

        // Kiểm tra ảnh
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'];
        if (imageExtensions.some(ext => file.toLowerCase().endsWith(ext))) {
            console.log('ảnh') 
            return 'picture';
        }

        // Kiểm tra video
        const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'];
        if (videoExtensions.some(ext => file.toLowerCase().endsWith(ext))) {
            return 'video';
        }
        console.log('ô no file rồi ')
        // Nếu không phải ảnh hoặc video, trả về 'file'
        return 'file';
    };

    const fileType = checkFileType(preview); // Kiểm tra loại tệp

    // Hàm render preview
    const renderFilePreview = () => {
        switch (fileType) {
            case 'picture':
                return (
                    <img
                        src={preview}
                        alt="Preview"
                        style={{
                            width: '100%', // Đảm bảo ảnh chiếm hết không gian
                            maxWidth: '200px', // Tối đa chiều rộng
                            height: 'auto', // Chiều cao tự động để giữ tỷ lệ
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            cursor: 'pointer', // Hiển thị con trỏ khi hover
                        }}
                    />
                );
            case 'video':
                return (
                    <video
                        controls
                        style={{
                            width: '100%', // Đảm bảo video chiếm hết không gian
                            maxWidth: '200px', // Tối đa chiều rộng
                            height: 'auto', // Chiều cao tự động để giữ tỷ lệ
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            cursor: 'pointer', // Hiển thị con trỏ khi hover
                        }}
                    >
                        <source src={preview} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                );
            case 'file':
                return (
                    <div
                        style={{
                            width: '100%', // Đảm bảo div chiếm hết không gian
                            maxWidth: '200px', // Tối đa chiều rộng
                            height: 'auto', // Chiều cao tự động
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#f0f0f0',
                            cursor: 'pointer', // Hiển thị con trỏ khi hover
                        }}
                    >
                        <span>File</span>
                    </div>
                );
            default:
                return null;
        }
    };

    return <>{renderFilePreview()}</>;
}

export default FilePreview;

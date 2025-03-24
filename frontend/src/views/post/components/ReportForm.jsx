import React, { useState } from 'react';
import { sendReport } from '../../../service/report';
import Loading from '../../../components/Loading';
import { toast } from 'react-toastify'
import NotificationCss from '../../../module/cssNotification/NotificationCss';

export default function ReportForm({ postId }) {
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState({
        type: 'post',
        reportedId: postId,
        reason: '',
    });
    const [message, setMessage] = useState('');

    const handleReasonSelect = (reason) => {
        setReport(prev => ({ ...prev, reason }));
    };

    const handleReport = async () => {
        setLoading(true);
        if (!report.reason) {
            setMessage('Vui lòng chọn lý do báo cáo.');
            return;
        }
        try {
            const rs = await sendReport(report);
            console.log('Báo cáo bài viết:', rs);
            // Nếu phản hồi có thuộc tính message thì coi là báo cáo thành công và đóng modal
            if (rs) {
                toast.success(rs?.message ? rs.message : 'Gửi báo cáo thành công', NotificationCss.Success);
                document.getElementById(`my_modal_report_${postId}`).close();
            } else {
                // Nếu không có dữ liệu phản hồi, hiển thị thông báo đã report
                setMessage('Bài viết này đã được bạn báo cáo, vui lòng không báo cáo nhiều lần!');
            }
        } catch (error) {
            console.error('Lỗi khi báo cáo bài viết:', error);
            if ((error.response && error.response.status === 500) || error.statusCode === 500) {
                setMessage('Bài viết này đã được báo cáo.');
            } else {
                setMessage('Đã xảy ra lỗi. Vui lòng thử lại.');
            }
        }
        finally {
            setLoading(false);
        }
    };
    if (loading) return <Loading />;

    return (
        <dialog id={`my_modal_report_${postId}`} className="modal">
            <div className="modal-box">
                <button
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={() => document.getElementById(`my_modal_report_${postId}`).close()}
                >
                    ✕
                </button>
                <h3 className="font-bold text-xl text-center border-b-2 pb-2">Báo cáo {postId}</h3>
                <h2 className="font-bold text-lg p-3">Tại sao bạn báo cáo bài viết này?</h2>
                <span className="p-3 block">Lưu ý: Chỉ báo cáo nội dung vi phạm để tránh trường hợp thù địch!</span>

                <div className="grid gap-3 mt-3">
                    {[
                        { key: 'spam', label: 'Quấy rối' },
                        { key: 'hate_speech', label: 'Ngôn từ kích động thù địch' },
                        { key: 'nudity', label: 'Ảnh khỏa thân, Nội dung người lớn' },
                        { key: 'fake_news', label: 'Thông tin sai sự thật, lừa đảo' },
                        { key: 'violence', label: 'Nội dung bạo lực' },
                        { key: 'other', label: 'Khác' }
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            className={`p-3 w-full rounded-md ${report.reason === key ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
                            onClick={() => handleReasonSelect(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {message && <p className="text-red-500 text-sm mt-2">{message}</p>}

                <button className="btn btn-primary w-full mt-4" onClick={handleReport}>Gửi báo cáo</button>
            </div>
        </dialog>
    );
}

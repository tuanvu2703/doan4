import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function AppealReportModal({ isOpen, onClose, postId, onSubmitAppeal }) {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            setError('Vui lòng nhập lý do kháng báo cáo');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await onSubmitAppeal(postId, reason);
            setSuccess('Kháng báo cáo đã được gửi thành công!');
            setReason('');
            setTimeout(() => {
                onClose();
                setSuccess('');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Đã xảy ra lỗi khi gửi kháng báo cáo');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate__animated animate__fadeIn">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Kháng báo cáo bài viết</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                    <div className="mb-4">
                        <label htmlFor="appeal-reason" className="block mb-2 text-sm font-medium text-gray-700">
                            Lý do kháng báo cáo
                        </label>
                        <textarea
                            id="appeal-reason"
                            rows="4"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Hãy giải thích lý do bạn cho rằng báo cáo này không chính xác..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Vui lòng giải thích chi tiết lý do tại sao bạn cho rằng báo cáo này không chính xác.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-2 bg-red-50 text-red-700 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-2 bg-green-50 text-green-700 rounded-md text-sm">
                            {success}
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                            disabled={isSubmitting}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Đang gửi...' : 'Gửi kháng báo cáo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

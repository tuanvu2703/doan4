import React from 'react'
import { useState } from 'react'
import { createComment } from '../../../service/CommentService'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'

export default function FormComment({ postId, onCommentAdded }) {
    const [formdata, setFormdata] = useState({
        content: '',
        img: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormdata({
            ...formdata,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formdata.content.trim()) return;

        setIsSubmitting(true);
        try {
            await createComment(postId, formdata.content);
            setFormdata({ ...formdata, content: '' });
            if (onCommentAdded) onCommentAdded();
        } catch (error) {
            console.log(error)
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form className="w-full" onSubmit={handleSubmit}>
            <div className="mb-2">
                <label htmlFor="comment" className="text-base font-medium text-gray-700 dark:text-gray-300">
                    Viết bình luận
                </label>
            </div>

            <div className="relative">
                <textarea
                    id="comment"
                    value={formdata.content}
                    onChange={handleChange}
                    name="content"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all duration-200 resize-none pr-[70px]"
                    placeholder="Chia sẻ suy nghĩ của bạn..."
                    required
                />

                <button
                    type="submit"
                    className="absolute bottom-3 right-3 px-4 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting || !formdata.content.trim()}
                >
                    <PaperAirplaneIcon className="h-4 w-4" />
                    <span>{isSubmitting ? 'Đang gửi...' : 'Gửi'}</span>
                </button>
            </div>
        </form>
    )
}

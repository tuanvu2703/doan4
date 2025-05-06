import React from 'react'
import { useState } from 'react';
import { createReplyComment } from '../../../service/CommentService';


export default function FormReply({ open, keycmt }) {
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
        setIsSubmitting(true);
        try {
            await createReplyComment(keycmt._id, formdata.content);

        } catch (error) {
            console.log(error)
        }
        finally {
            window.location.reload()
        }
    }
    return (
        <>
            {open === true && (
                <form onSubmit={handleSubmit} className="form-control mt-3 transition-all duration-300 animate__animated animate__fadeIn">
                    <div className="relative">
                        <textarea
                            name='content'
                            value={formdata.content}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 focus:outline-none transition-all text-sm min-h-[80px] resize-none pr-[70px]"
                            placeholder={`Phản hồi @${keycmt?.author?.lastName} ${keycmt?.author?.firstName}`}
                            required
                        >
                        </textarea>
                        <button
                            type="submit"
                            className="absolute bottom-2 right-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || !formdata.content.trim()}
                        >
                            {isSubmitting ? 'Đang gửi...' : 'Gửi'}
                        </button>
                    </div>
                </form>
            )}
        </>
    )
}

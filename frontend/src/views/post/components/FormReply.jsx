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
                <form onSubmit={handleSubmit} className="form-control">
                    <textarea
                        name='content'
                        value={formdata.content}
                        onChange={handleChange}
                        className="textarea focus:outline-none textarea-bordered rounded-b-none h-24 resize-none"
                        placeholder={`Phản hồi @${keycmt?.author?.lastName} ${keycmt?.author?.firstName}`}>
                    </textarea>
                    <button className="btn btn-outline rounded-t-none btn-info" disabled={isSubmitting}>Gửi</button>
                </form>
            )}
        </>
    )
}

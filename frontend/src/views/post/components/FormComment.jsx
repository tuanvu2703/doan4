import React from 'react'
import { useState } from 'react'
import { createComment } from '../../../service/CommentService'

export default function FormComment({ postId }) {
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
            await createComment(postId, formdata.content);

        } catch (error) {
            console.log(error)
        }
        finally {
            window.location.reload()
        }
    }
    return (
        <form className="form-control" onSubmit={handleSubmit}>
            <div className="label">
                <span className="label-text">Bình luận</span>
            </div>

            <textarea
                value={formdata.content}
                onChange={handleChange}
                name="content"
                className="textarea focus:outline-none textarea-bordered rounded-b-none h-24 resize-none"
                required
                placeholder="Viết bình luận...">

            </textarea>
            <button className="btn btn-outline rounded-t-none btn-info" disabled={isSubmitting}>Gửi</button>
        </form >
    )
}

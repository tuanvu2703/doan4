import React from 'react'
import { useState, useEffect } from 'react'
import { getAllEmoji } from '../api/Emoji'

export default function DropdownEmoji({ onEmojiClick }) {
    const [emoji, setEmoji] = useState([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmojis = async () => {
            try {
                const response = await getAllEmoji();
                setEmoji(response.data.slice(0, 150)); // Lấy 20 emoji đầu tiên
                setLoading(false);
            } catch (err) {
                setError("Không thể tải danh sách emoji!");
                setLoading(false);
            }
        };

        fetchEmojis();
    }, []);

    if (loading) {
        return <div>Đang tải...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <ul className='overflow-y-auto h-64 grid grid-cols-4'>
                {emoji.map((emoji) => (
                    <li key={emoji.slug}>
                        <button type='button' onClick={() => onEmojiClick(emoji.character)}>
                            {emoji.character}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
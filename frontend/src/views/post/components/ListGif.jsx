import React from 'react'
import { getGif } from '../../../service/gif'
import { useState, useEffect } from 'react'

export default function ListGif({ query, onGifSelect }) {
    const [gif, setGif] = useState([])

    useEffect(() => {
        async function fetchGif() {
            try {
                const response = await getGif(query) // Fetch the GifIcon
                setGif(response.data.results)
            } catch (error) {
                console.error(error)
            }
        }
        fetchGif()
    }, [query])

    return (
        <>
            {gif.map((gif, index) => (
                <li key={index} onClick={() => onGifSelect(gif.media_formats.gif.url)}>
                    <img src={gif.media_formats.gif.url} alt="gif" />
                </li>
            ))}
        </>
    )
}
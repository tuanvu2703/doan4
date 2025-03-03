import React, { Suspense, useState, useEffect } from 'react'
import Loading from '../../../components/Loading'
import ListGif from './ListGif'

export default function Gif({ onGifSelect }) {
    const [query, setQuery] = useState('excited') // Set default query to "excited"
    const [inputValue, setInputValue] = useState('')

    useEffect(() => {
        if (inputValue.trim() === '') {
            setQuery('excited')
        } else {
            setQuery(inputValue)
        }
    }, [inputValue])

    return (
        <div>
            <ul className='overflow-y-auto h-64 grid grid-cols-1'>
                <label className="input input-bordered flex items-center gap-2 rounded-none border-none">
                    <input
                        type="text"
                        onChange={e => setInputValue(e.target.value)}
                        className="grow"
                        value={inputValue}
                        placeholder="Search" />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="h-8 w-8 opacity-70 ">
                        <path
                            fillRule="evenodd"
                            d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                            clipRule="evenodd" />
                    </svg>
                </label>
                <Suspense fallback={<Loading />}>
                    <ListGif query={query} onGifSelect={onGifSelect} />
                </Suspense>
            </ul>
        </div>
    )
}
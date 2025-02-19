'use client';
import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
export default function SearchBar({ query }) {
    const [searchTerm, setSearchTerm] = useState("");
    //Search underfi
    if (query === '') {
        return null;
    }
    //REST API

    //Không tìm thấy
    // if (data.length === 0) {
    //     return <p>Không tìm thấy từ khóa: <i>"{query}"</i></p>;
    // }
    // input
    // Xử lý sự kiện khi thay đổi input
    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Xử lý sự kiện khi nhấn nút xóa
    const handleClearSearch = () => {
        setSearchTerm("/search");
    };
    return (
        <Link to={`/search/all?search=${searchTerm}`} action="" className="flex items-center rounded-full shadow-md w-full sm:w-52 border-2 border-blue-50">
            <button className="btn btn-ghost btn-circle">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </button>
            {/* onChange={(e) => debounceSearch(e.target.value)}
             defaultValue={searchParams.get("query")?.toString()} */}
        </Link>
    )
}

import { useState, useEffect, Suspense } from "react";
import { getSearchResult } from "../../service/SearchService";
import { useParams } from "react-router-dom";
import CardPost from "./CardPost";
import CardPostResult from "./CardPostResult";
const PostSearch = () => {
    const [query, setQuery] = useState('');

    return (
        <div className="mt-5">
            <label className="input input-bordered flex items-center gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="grow"
                    placeholder="Tìm kiếm bài viết..." />
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-4 w-4 opacity-70">
                    <path
                        fillRule="evenodd"
                        d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                        clipRule="evenodd" />
                </svg>
            </label>
            <Suspense fallback={<h2>Loading...</h2>}>
                <CardPostResult query={query} />
            </Suspense>
        </div>
    );
}

export default PostSearch;
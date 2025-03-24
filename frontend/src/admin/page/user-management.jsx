import React, { useState, Suspense } from 'react'
import TableUser from '../components/TableUser';
import Loading from '../../components/Loading';

export default function UserManagement() {
    const [query, setQuery] = useState('');

    return (
        <div className="overflow-x-auto mx-5 my-5 border-white border-2 rounded-sm">
            {/* <label>
                Search albums:
                <input value={query} onChange={e => setQuery(e.target.value)} />
            </label> */}
            <label className="input input-bordered flex items-center gap-2 rounded-none bg-[#292929]">
                <input
                    type="text"
                    className="grow"
                    placeholder="Search"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="white"
                    className="h-6 w-6 opacity-70 ">
                    <path
                        fillRule="evenodd"
                        d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                        clipRule="evenodd" />
                </svg>
            </label>
            <table className="table">
                {/* head */}
                <thead className=' text-[#EEEEEE]'>
                    <tr>
                        <th>
                            {/* <label>
                                <input type="checkbox" className="checkbox border-white" />
                            </label> */}
                        </th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th></th>
                    </tr>
                </thead>
                <Suspense fallback={<Loading />}>
                    <TableUser query={query} />
                </Suspense>
                {/* foot */}
                {/* <tfoot>
                    <tr>
                        <th></th>
                        <th>Name</th>
                        <th>Job</th>
                        <th>Favorite Color</th>
                        <th></th>
                    </tr>
                </tfoot> */}
            </table>
        </div>
    )
}

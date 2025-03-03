import React from 'react'
import Loading from '../../components/Loading'
import { Suspense } from 'react'
import { useState } from 'react'
import TableReport from '../components/TableReport'

export default function ReportPostManagement() {
    const [query, setQuery] = useState('')
    return (
        <div className="overflow-x-auto mx-5 my-5 border-white border-2">
            {/* <label>
                Search albums:
                <input value={query} onChange={e => setQuery(e.target.value)} />
            </label> */}
            <label className="input input-bordered flex items-center gap-2 rounded-none">
                <input
                    type="text"
                    className="grow text-black"
                    placeholder="Search"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="black"
                    className="h-4 w-4 opacity-70 ">
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
                        {/* <th>Number</th> */}
                        <th>No</th>
                        <th>Type</th>
                        <th>reported Id</th>
                        <th>Message Report</th>
                        <th>Reporter</th>
                        <th>CreateAt</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <Suspense fallback={<Loading />}>
                    <TableReport query={query} />
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

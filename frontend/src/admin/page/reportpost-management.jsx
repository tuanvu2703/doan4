import React from 'react'
import Loading from '../../components/Loading'
import { Suspense } from 'react'
import { useState } from 'react'
import TableReport from '../components/TableReport'

export default function ReportPostManagement() {
    const [query, setQuery] = useState('')


    return (
        <div className="overflow-x-auto mx-5 my-5 border-white border-2 rounded-sm">
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
            <div className="filter my-1 flex gap-2 mx-2">
                <input type="radio" name="metaframeworks" id="all" className="hidden peer/all" onClick={() => setQuery('')} />
                <label htmlFor="all" className="btn border-none bg-[#050709] text-white hover:bg-[#353535] peer-checked/all:bg-[#1D1D1D]">
                    All
                </label>

                <input type="radio" name="metaframeworks" id="hate_speech" className="hidden peer/hate_speech" onClick={() => setQuery('hate_speech')} />
                <label htmlFor="hate_speech" className="btn border-none bg-[#050709] text-white hover:bg-[#353535] peer-checked/hate_speech:bg-[#1D1D1D]">
                    hate_speech
                </label>

                <input type="radio" name="metaframeworks" id="violence" className="hidden peer/violence" onClick={() => setQuery('violence')} />
                <label htmlFor="violence" className="btn border-none bg-[#050709] text-white hover:bg-[#353535] peer-checked/violence:bg-[#1D1D1D]">
                    Violence
                </label>

                <input type="radio" name="metaframeworks" id="spam" className="hidden peer/spam" onClick={() => setQuery('spam')} />
                <label htmlFor="spam" className="btn border-none bg-[#050709] text-white hover:bg-[#353535] peer-checked/spam:bg-[#1D1D1D]">
                    Spam
                </label>

                <input type="radio" name="metaframeworks" id="nudity" className="hidden peer/nudity" onClick={() => setQuery('nudity')} />
                <label htmlFor="nudity" className="btn border-none bg-[#050709] text-white hover:bg-[#353535] peer-checked/nudity:bg-[#1D1D1D]">
                    Nudity
                </label>

                <input type="radio" name="metaframeworks" id="fake_news" className="hidden peer/fake_news" onClick={() => setQuery('fake_news')} />
                <label htmlFor="fake_news" className="btn border-none bg-[#050709] text-white hover:bg-[#353535] peer-checked/fake_news:bg-[#1D1D1D]">
                    Fake News
                </label>
            </div>

            <table className="table">
                <thead className=' text-[#EEEEEE]'>
                    <tr>
                        {/* <th></th> */}
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
            </table>
        </div>
    )
}
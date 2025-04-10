'use client'

import { useState } from 'react'



const privacy = [
    {
        id: 1,
        name: 'Tất cả mọi người',
        privacy: 'public',
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
            <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z" clipRule="evenodd" />
            <path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z" />
        </svg>
        ,
    },
    {
        id: 2,
        name: 'Chỉ bạn bè',
        privacy: 'friends',
        icon:
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
            </svg>

    },
    {
        id: 3,
        name: 'Riêng tư',
        privacy: 'private',
        icon:
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
            </svg>


    },
]

export default function SelectPrivacy({ onChange }) {
    const [selected, setSelected] = useState(privacy[0])
    const handleChange = (value) => {
        setSelected(value);
        onChange(value.privacy);
    };


    return (
        // <Listbox value={selected} onChange={handleChange}>
        //     <div className="relative mt-2">
        //         <ListboxButton className="relative w-full min-w-[200px] cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm/6">
        //             <span className="flex items-center">
        //                 {selected.icon}
        //                 <span className="ml-3 block truncate">{selected.name}</span>
        //             </span>
        //             <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
        //                 <ChevronUpDownIcon aria-hidden="true" className="h-5 w-5 text-gray-400" />
        //             </span>
        //         </ListboxButton>

        //         <ListboxOptions
        //             transition
        //             className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
        //         >
        //             {privacy.map((e) => (
        //                 <ListboxOption
        //                     key={e.id}
        //                     value={e}
        //                     className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white"
        //                 >
        //                     <div className="flex items-center">
        //                         {e.icon}
        //                         <span className="ml-3 block truncate font-normal group-data-[selected]:font-semibold">
        //                             {e.name}
        //                         </span>
        //                     </div>

        //                     <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
        //                         <CheckIcon aria-hidden="true" className="h-5 w-5" />
        //                     </span>
        //                 </ListboxOption>
        //             ))}
        //         </ListboxOptions>
        //     </div>
        // </Listbox>
        <div></div>
    )
}

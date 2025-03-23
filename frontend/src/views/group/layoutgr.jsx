import React from 'react'

export default function Layoutgr() {
    return (
        <div class="grid grid-cols-5 grid-rows-5 gap-2">
            <div class="col-span-5 bg-blue-300 p-4 text-center">IMG</div>
            <div class="col-span-2 row-span-4 row-start-2 bg-red-300 rounded-lg p-4 text-center">THÔNG TIN GR</div>
            <div class="col-span-3 row-span-4 col-start-3 row-start-2 rounded-lg bg-green-300 p-4 text-center"> Bai dang</div>
        </div>
    )
}

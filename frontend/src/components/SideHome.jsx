import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import friend from '../service/friend'
import { Link } from 'react-router-dom'
export default function SideHome() {
  const [myFriend, setMyFriend] = useState({})
  useEffect(() => {
    const fetchdata = async () => {
      const response = await friend.getListMyFriend();
      if (response) {
        setMyFriend(response.data)
      }
    }
    fetchdata()
  }, [])
  return (
    <div className='fixed right-0 bg-white h-screen w-64 shadow-sm'>
      <div className='py-2 px-4'>
        <span className='text-xl'>Bạn bè</span>
      </div>
      <div>
        <ul>
          {myFriend.length > 0 ? myFriend.map((item, index) => (
            <li key={index} className='flex items-center justify-between p-2 hover:bg-gray-100'>
              <Link to={`/user/${item.sender._id}`} className='flex items-center'>
                <img src={item.avatar} alt="" className='w-10 h-10 rounded-full mr-2' />
                <span>{item.sender.lastName} {item.sender.firstName}</span>
              </Link>
              <Link to={`/messenger/inbox/?iduser=${item.sender._id}`} className='text-blue-500'>Nhắn tin</Link>
            </li>
          )) : <div>Không có bạn bè nào</div>}
        </ul>
      </div>
    </div>
  )
}

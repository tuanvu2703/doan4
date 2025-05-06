import React, { useState, useEffect } from 'react'
import friend from '../service/friend'
import { Link } from 'react-router-dom'

export default function SideHome() {
  const [myFriend, setMyFriend] = useState([]) // Initialize as array
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchdata = async () => {
      setLoading(true)
      try {
        const response = await friend.getListMyFriend();
        if (response && response.data) {
          setMyFriend(response.data)
        }
      } catch (error) {
        console.error("Error fetching friends:", error)
      } finally {
        setLoading(false)
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
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <ul>
            {Array.isArray(myFriend) && myFriend.length > 0 ? (
              myFriend.map((item, index) => (
                <li key={index} className='flex items-center justify-between p-2 hover:bg-gray-100'>
                  <Link to={`/user/${item.sender._id}`} className='flex items-center'>
                    <img src={item.avatar} alt="" className='w-10 h-10 rounded-full mr-2' />
                    <span>{item.sender.lastName} {item.sender.firstName}</span>
                  </Link>
                  <Link to={`/messenger/inbox/?iduser=${item.sender._id}`} className='text-blue-500'>Nhắn tin</Link>
                </li>
              ))
            ) : (
              <div className="px-4 py-2">Không có bạn bè nào</div>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
import React, { useState, useEffect } from 'react'
import friend from '../service/friend'
import { Link } from 'react-router-dom'
import AvatarOnline from './AvatarOnline'
import AvatarOffline from './AvatarOffline'
import socket from '../service/webSocket/socket'

export default function SideHome() {
  const [myFriend, setMyFriend] = useState([]) // Initialize as array
  const [loading, setLoading] = useState(true)
  const [onlineUsers, setOnlineUsers] = useState([]) // Lưu danh sách người dùng đang online

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

  // Theo dõi trạng thái online/offline của người dùng
  useEffect(() => {
    // Xử lý khi có người dùng mới kết nối
    socket.on('connect', () => {
      // Khi kết nối thành công, yêu cầu danh sách người dùng đang online
      console.log('Connected to socket server:', socket.id)
    })

    // Lắng nghe khi có người kết nối mới
    const handleUserConnected = (userId) => {
      setOnlineUsers(prev => {
        if (!prev.includes(userId)) {
          return [...prev, userId]
        }
        return prev
      })
    }

    // Lắng nghe khi có người ngắt kết nối
    const handleUserDisconnected = ({ userId }) => {
      setOnlineUsers(prev => prev.filter(id => id !== userId))
    }

    // Đăng ký các event listener
    socket.on('userConnected', handleUserConnected)
    socket.on('userDisconnected', handleUserDisconnected)

    // Cleanup khi component bị unmount
    return () => {
      socket.off('connect')
      socket.off('userConnected')
      socket.off('userDisconnected')
    }
  }, [])

  // Kiểm tra xem người dùng có đang online không
  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId)
  }

  return (
    <div className='fixed right-0 bg-white h-screen w-64 lg:w-72 xl:w-80 shadow-sm overflow-y-auto'>
      <div className='sticky top-0 py-2 px-4 bg-white z-10 border-b border-gray-100'>
        <span className='text-lg sm:text-xl font-medium'>Bạn bè</span>
      </div>
      <div>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <ul className="py-2">
            {Array.isArray(myFriend) && myFriend.length > 0 ? (
              myFriend.map((item, index) => {
                const userId = item.sender?._id || item.receiver?._id
                const avatar = item.sender?.avatar || item.receiver?.avatar
                const isOnline = isUserOnline(userId)
                const userName = item.sender
                  ? `${item.sender.lastName} ${item.sender.firstName}`
                  : `${item.receiver?.lastName} ${item.receiver?.firstName}`

                return (
                  <li key={index} className='flex items-center justify-between p-2 hover:bg-gray-100 transition-colors duration-200'>
                    <Link to={`/user/${userId}`} className='flex items-center gap-2 sm:gap-3 max-w-[70%]'>
                      {isOnline ? (
                        <AvatarOnline avt={avatar} />
                      ) : (
                        <AvatarOffline avt={avatar} />
                      )}
                      <span className="truncate text-sm sm:text-base" title={userName}>
                        {userName}
                      </span>
                    </Link>
                    <Link
                      to={`/messenger/inbox/?iduser=${userId}`}
                      className='text-blue-500 hover:text-blue-600 text-xs sm:text-sm transition-colors duration-200 px-2 py-1 rounded-md hover:bg-blue-50'
                    >
                      Nhắn tin
                    </Link>
                  </li>
                )
              })
            ) : (
              <div className="px-4 py-6 text-center text-gray-500">Không có bạn bè nào</div>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
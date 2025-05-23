// filepath: e:\IT\doan4\frontend\src\components\SideHome.jsx
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

  // Fetch friend data
  useEffect(() => {
    const fetchdata = async () => {
      setLoading(true)
      try {
        const response = await friend.getListMyFriend();
        if (response && response.data) {
          setMyFriend(response.data)
        }
      } catch (error) {
        console.error(\
Error
fetching
friends:\, error)
      } finally {
        setLoading(false)
      }
    }
    fetchdata()
  }, [])

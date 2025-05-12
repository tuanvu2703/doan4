import React from 'react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAllRequestMyGroup, acceptJoinGroup } from '../../service/publicGroup'
import { toast } from 'react-toastify'
import NotificationCss from '../../module/cssNotification/NotificationCss'
export default function ReviewMember() {
  const { groupid } = useParams()
  const [allRequestMyGroup, setAllRequestMyGroup] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAllRequestMyGroup(groupid)
        setAllRequestMyGroup(response)
      }
      catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [groupid])

  //handle accept request
  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await acceptJoinGroup(requestId)
      if (response) {
        toast.success(response?.message ? response.message : 'Đã duyệt yêu cầu thành công!', NotificationCss.Success);
      }
    } catch (error) {
      console.error('Error accepting request:', error)
    }
  }

  return (
    <div className="review-member-container p-4">
      <h2 className="text-xl font-bold mb-4">Danh sách yêu cầu vào nhóm</h2>



      {allRequestMyGroup.requests && allRequestMyGroup.requests.length > 0 ? (
        <div className="requests-list">
          {allRequestMyGroup.requests.map((request, index) => (
            <div
              key={index}
              className="request-item flex items-center justify-between bg-white p-3 rounded-lg shadow-sm mb-3 border border-gray-200"
            >
              <div className="flex items-center">
                <img
                  src={request.sender.avatar || "https://th.bing.com/th/id/OIP.PKlD9uuBX0m4S8cViqXZHAHaHa?rs=1&pid=ImgDetMain"}
                  alt={`${request.sender.firstName} ${request.sender.lastName}`}
                  className="w-10 h-10 rounded-full mr-3 border-[1px]"
                />
                <div>
                  <p className="font-medium">{request.sender.firstName} {request.sender.lastName}</p>
                </div>
              </div>

              <div className="action-buttons">
                <button onClick={(e) => { handleAcceptRequest(request._id) }} className="bg-green-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-green-600">
                  Duyệt
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Chưa có yêu cầu xin vào nhóm!.</p>
      )}
    </div>
  )
}

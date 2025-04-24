import React from 'react'
import { useState, useEffect } from 'react'
import { handleReport, getALlReport } from '../../service/admin';
import Loading from '../../components/Loading';
import ModalReportPost from './ModalReportPost';
import ModalReportUser from './ModalReportUser';
export default function TableReport({ query }) {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getALlReport();
        if (response) {
          setReport(response.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  if (loading) {
    return (
      <Loading />
    )
  }
  const filteredReport = query.trim() === ""
    ? report.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : report
      .filter(report => {
        return report.reason.toLowerCase().includes(query.toLowerCase()) ||
          new Date(report.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).includes(query) ||
          report.status.toLowerCase().includes(query.toLowerCase()) ||
          report.type.toLowerCase().includes(query.toLowerCase()) ||
          report.reportedId?._id.toLowerCase().includes(query.toLowerCase()) ||
          report.sender.email.toLowerCase().includes(query.toLowerCase());
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleApproval = async (reportId) => {
    try {
      const response = await handleReport(reportId, 'approve');
      if (response) {
        setReport(prevReport => prevReport.map(report =>
          report._id === reportId ? { ...report, status: 'resolved' } : report
        ));
      }
    } catch (error) {
      console.error("Error active user:", error);
    }
  }

  const handleRejected = async (reportId) => {
    try {
      const response = await handleReport(reportId, 'reject');
      if (response) {
        setReport(prevReport => prevReport.map(report =>
          report._id === reportId ? { ...report, status: 'rejected' } : report
        ));
      }
    } catch (error) {
      console.error("Error active user:", error);
    }
  }
  console.log(filteredReport)
  return (
    <tbody>
      {filteredReport.length === 0 ? (
        <tr>
          <td colSpan="5" className="text-center py-4">
            <p>Unable to find report: <i>"{query}"</i></p>
          </td>
        </tr>
      ) : (
        filteredReport.map((rp, index) => (
          <tr key={rp._id}>
            <td>
              {index + 1}
            </td>
            <td>
              {rp.type}
            </td>
            <td>
              {rp?.reportedId ? (
                <button
                  className='hover:underline'
                  onClick={() => document.getElementById(`my_modal_report_post_${rp.reportedId._id}`).showModal()}
                >
                  {rp.reportedId._id}
                </button>
              ) : (
                <span>Not available</span>
              )}
            </td>
            <td>
              {rp?.reason}
            </td>
            <td>
              {rp?.sender ? (
                <button
                  className='hover:underline'
                  onClick={() => document.getElementById(`my_modal_report_user_${rp.sender._id}`).showModal()}
                >
                  {rp.sender.email}
                </button>
              ) : (
                <span>Not available</span>
              )}
            </td>
            <td>
              {new Date(rp.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </td>
            <td>
              {rp.status}
            </td>
            <th>
              {rp.status === 'resolved' | rp.status === 'rejected' ? (
                <div></div>
              ) : (
                <div className='flex gap-3'>
                  <button className="btn btn-success btn-xs" onClick={(e) => handleApproval(rp._id)}>Approval</button>
                  <button className="btn btn-error btn-xs" onClick={(e) => handleRejected(rp._id)}>Rejected</button>
                </div>
              )}
            </th>
            {rp?.reportedId && <ModalReportPost postId={rp.reportedId._id} />}
            {rp?.sender && <ModalReportUser userId={rp.sender._id} />}
          </tr>
        ))
      )}
    </tbody>
  )
}

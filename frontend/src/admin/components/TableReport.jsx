import React from 'react'
import { useState, useEffect } from 'react'
import { getALlReport } from '../../service/admin';
import Loading from '../../components/Loading';
import ModalReportPost from './ModalReportPost';
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
  const filteredReport = query.trim() === "" ? report : report.filter(report => {
    return report.reason.toLowerCase().includes(query.toLowerCase()) ||
      new Date(report.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).includes(query) ||
      report.status.toLowerCase().includes(query.toLowerCase()) ||
      report.type.toLowerCase().includes(query.toLowerCase());
  });
  return (
    <tbody>
      {filteredReport.length === 0 ? (
        <tr>
          <td colSpan="5" className="text-center py-4">
            <p>Unable to find report: <i>"{query}"</i></p>
          </td>
        </tr>
      ) : (
        filteredReport.map((rp) => (
          <tr key={rp._id}>
            <th>
              <label>
                <input type="checkbox" className="checkbox border-white" />
              </label>
            </th>
            <td>
              {Number() + 1}
            </td>
            <td>
              {rp.type}
            </td>
            <td>
              <button className='hover:underline' onClick={() => document.getElementById(`my_modal_report_post_${rp.reportedId}`).showModal()}>{rp.reportedId}</button>
            </td>
            <td>
              {rp.reason}
            </td>
            <td>
              {rp.sender}
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
              <div className='flex gap-3'>
                <button className="btn btn-success btn-xs">Approval</button>
                <button className="btn btn-error btn-xs">Rejected</button>
              </div>
            </th>
            <ModalReportPost postId={rp.reportedId} />
          </tr>
        ))
      )}
    </tbody>
  )
}

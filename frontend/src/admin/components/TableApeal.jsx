import React from 'react'
import { useState, useEffect } from 'react'
import { handleApeal, getAllPeal } from '../../service/admin';
import Loading from '../../components/Loading';
import ModalReportPost from './ModalReportPost';
import ModalReportUser from './ModalReportUser';

export default function TableApeal({ query }) {
    const [appeals, setAppeals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await getAllPeal();
                if (response) {
                    setAppeals(response.data);
                }
            } catch (error) {
                console.error("Error fetching appeals:", error);
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

    const filteredAppeals = query.trim() === ""
        ? appeals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : appeals
            .filter(appeal => {
                return appeal.reason.toLowerCase().includes(query.toLowerCase()) ||
                    new Date(appeal.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }).includes(query) ||
                    appeal.status.toLowerCase().includes(query.toLowerCase()) ||
                    appeal.reportId.type.toLowerCase().includes(query.toLowerCase()) ||
                    (appeal.appellant?.lastName && appeal.appellant.lastName.toLowerCase().includes(query.toLowerCase()));
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const handleApproveAppeal = async (appealId) => {
        try {
            const response = await handleApeal(appealId, "approve");
            if (response) {
                setAppeals(prevAppeals => prevAppeals.map(appeal =>
                    appeal._id === appealId ? { ...appeal, status: 'resolved', implementation: 'approve' } : appeal
                ));
            }
        } catch (error) {
            console.error("Error approving appeal:", error);
        }
    }

    const handleRejectAppeal = async (appealId) => {
        try {
            const response = await handleApeal(appealId, "reject");
            if (response) {
                setAppeals(prevAppeals => prevAppeals.map(appeal =>
                    appeal._id === appealId ? { ...appeal, status: 'rejected', implementation: 'reject' } : appeal
                ));
            }
        } catch (error) {
            console.error("Error approving appeal:", error);
        }
    }

    // const handleRejectAppeal = async (appealId) => {
    //     try {
    //         const response = await handleApeal(appealId, 'reject');
    //         if (response) {
    //             setAppeals(prevAppeals => prevAppeals.map(appeal =>
    //                 appeal._id === appealId ? { ...appeal, status: 'rejected', implementation: 'completed' } : appeal
    //             ));
    //         }
    //     } catch (error) {
    //         console.error("Error rejecting appeal:", error);
    //     }
    // }

    return (
        <tbody>
            {filteredAppeals.length === 0 ? (
                <tr>
                    <td colSpan="9" className="text-center py-4">
                        <p>Unable to find appeal: <i>"{query}"</i></p>
                    </td>
                </tr>
            ) : (
                filteredAppeals.map((appeal, index) => (
                    <tr key={appeal._id}>
                        <td>
                            {index + 1}
                        </td>
                        <td>
                            {appeal.reportId.type}
                        </td>
                        <td>
                            {appeal.reportId.reportedId && (
                                <button
                                    className='hover:underline'
                                    onClick={() => document.getElementById(`my_modal_report_post_${appeal.reportId.reportedId}`).showModal()}
                                >
                                    {appeal.reportId.reportedId}
                                </button>
                            )}
                        </td>
                        <td>
                            {appeal.reason}
                        </td>
                        <td>
                            {appeal.appellant && (
                                <button
                                    className='hover:underline'
                                    onClick={() => document.getElementById(`my_modal_report_user_${appeal.appellant._id}`).showModal()}
                                >
                                    {appeal.appellant.lastName} {appeal.appellant.firstName}
                                </button>
                            )}
                        </td>
                        <td>
                            {new Date(appeal.createdAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            })}
                        </td>
                        <td>
                            {appeal.status}
                        </td>
                        <td>
                            {appeal.implementation}
                        </td>
                        <th>
                            {appeal.status !== 'pending' ? (
                                <div></div>
                            ) : (
                                <div className='flex gap-3'>
                                    <button className="btn btn-success btn-xs" onClick={() => { handleApproveAppeal(appeal._id) }} >Approve</button>
                                    <button className="btn btn-error btn-xs" onClick={() => { handleRejectAppeal(appeal._id) }} >Reject</button>
                                </div>
                            )}
                        </th>
                        {appeal.reportId.reportedId && <ModalReportPost postId={appeal.reportId.reportedId} />}
                        {appeal.appellant && <ModalReportUser userId={appeal.appellant._id} />}
                    </tr>
                ))
            )}
        </tbody>
    )
}

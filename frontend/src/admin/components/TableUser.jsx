import React, { useState, useEffect } from "react";
import { getAllUser } from "../../service/admin";
import Loading from "../../components/Loading";
import Skeleton from "../../components/Skeleton";

export default function TableUser({ query }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await getAllUser();
                if (response) {
                    setUsers(response.data);
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
    const filteredUsers = query.trim() === "" ? users : users.filter(user => {
        const fullName = `${user.lastName || ''} ${user.firstName || ''}`.toLowerCase();
        const phone = user.numberPhone || '';
        return fullName.includes(query.toLowerCase()) ||
            phone.includes(query) ||
            (user.email && user.email.toLowerCase().includes(query.toLowerCase()));
    });

    return (
        <tbody>
            {filteredUsers.length === 0 ? (
                <tr>
                    <td colSpan="5" className="text-center py-4">
                        <p>Unable to find user: <i>"{query}"</i></p>
                    </td>
                </tr>
            ) : (
                filteredUsers.map((user) => (
                    <tr key={user._id}>
                        <th>
                            <label>
                                <input type="checkbox" className="checkbox border-white" />
                            </label>
                        </th>
                        <td>
                            <div className="flex items-center gap-3">
                                <div className="avatar">
                                    <div className="mask mask-squircle h-12 w-12">
                                        <img
                                            src={user.avatar || "https://th.bing.com/th/id/OIP.PKlD9uuBX0m4S8cViqXZHAHaHa?rs=1&pid=ImgDetMain"}
                                            alt="User Avatar"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="font-bold">{user.lastName} {user.firstName}</div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span className="badge badge-ghost badge-sm">{user.numberPhone}</span>
                        </td>
                        <td>{user.email}</td>
                        <th>
                            <button className="btn btn-error btn-xs">Unactive</button>
                        </th>
                    </tr>
                ))
            )}
        </tbody>
    );
}
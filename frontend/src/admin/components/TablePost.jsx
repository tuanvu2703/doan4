import React from 'react'
import { useState, useEffect } from 'react';
import { getAllPost } from '../../service/admin';
import Loading from '../../components/Loading'
import FilePreview from '../../components/fileViewer';
import FileViewer from '../../components/fileViewer';
import { UserProvider } from '../../service/UserContext';
export default function TablePost({ query }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await getAllPost();
                if (response) {
                    setPosts(response.data);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    console.log(posts)

    if (loading) {
        return (
            <Loading />
        )

    }
    const filteredPosts = query.trim() === "" ? posts : posts.filter(post => {
        return post.content.toLowerCase().includes(query.toLowerCase());
    });

    return (
        <tbody>
            {filteredPosts.length === 0 ? (
                <tr>
                    <td colSpan="5" className="text-center py-4">
                        <p>Unable to find post: <i>"{query}"</i></p>
                    </td>
                </tr>
            ) : (
                filteredPosts.map((post) => (
                    <tr key={post._id}>
                        <th>
                            <label>
                                <input type="checkbox" className="checkbox border-white" />
                            </label>
                        </th>
                        <td>
                            {post.img.length > 0 ? (
                                <UserProvider>
                                    <FileViewer file={post.img} mh={100} />
                                </UserProvider>
                            ) : (
                                <span>No image/Video</span>
                            )}
                        </td>
                        <td>
                            {post.content.length > 0 ? (
                                <p>{post.content}</p>
                            ) : (
                                <span>No content</span>
                            )}
                        </td>
                        <td>
                            {new Date(post.createdAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            })}
                        </td>
                        <th>
                            <button className="btn btn-error btn-xs">Hidden</button>
                        </th>
                    </tr>
                ))
            )}
        </tbody>
    );
}
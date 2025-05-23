import React from 'react'
import { useState, useEffect } from 'react';
import { getAllPost, unactivePost } from '../../service/admin';
import Loading from '../../components/Loading'
import FilePreview from '../../components/fileViewer';
import FileViewer from '../../components/fileViewer';
import { UserProvider } from '../../service/UserContext';
import { use } from 'react';
export default function TablePost({ query }) {
    const [listWordBlock] = useState(['racism', 'fuck', 'óc chó', 'suicide', 'overdose', 'drug', 'cocaine', 'weed', 'nigger', 'porn', 'xxx', 'nude', 'pussy', 'dick', 'racist'])
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
        return post.content && post.content.toLowerCase().includes(query.toLowerCase());
    });

    const sortedPosts = filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const isBlockedContent = (content) => {
        return listWordBlock.some(word => content && content.toLowerCase().includes(word));
    };
    const handleUnactivePost = async (postId, currentState) => {
        try {
            const response = await unactivePost(postId);
            if (response) {
                setPosts((prevPosts) => prevPosts.map((post) => {
                    if (post._id === postId) {
                        return { ...post, isActive: !currentState };
                    }
                    return post;
                }));
            }
        }
        catch (error) {
            console.error("Error unactive post:", error);
        }
    }

    return (
        <tbody>
            {sortedPosts.length === 0 ? (
                <tr>
                    <td colSpan="5" className="text-center py-4">
                        <p>Unable to find post: <i>"{query}"</i></p>
                    </td>
                </tr>
            ) : (
                sortedPosts.map((post) => (
                    <tr key={post._id} className={isBlockedContent(post.content) ? 'bg-red-600' : ''}>
                        {/* <th>
                            <label>
                                <input type="checkbox" className="checkbox border-white" />
                            </label>
                        </th> */}
                        <td>
                            {post.img.length > 0 ? (
                                <UserProvider>
                                    <div className='w-44 h-44 overflow-hidden flex items-center justify-center bg-gray-100 rounded-lg'>
                                        <div className='w-full h-full flex items-center justify-center'>
                                            <FileViewer file={post.img} className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                </UserProvider>
                            ) : (
                                <div className='bg-gray-600 w-44 h-44 flex justify-center items-center rounded-lg'>
                                    <span>No image/Video</span>
                                </div>
                            )}
                        </td>
                        <td>
                            {post.content && post.content.length > 0 ? (
                                <p className='break-words max-w-xl'>{post.content}</p>
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
                        <td>{post.isActive ? "true" : "false"}</td>
                        <th>
                            <button
                                onClick={(e) => { handleUnactivePost(post._id, post.isActive) }}
                                className={`btn btn-xs ${post.isActive ? 'btn-error' : 'btn-success'}`}>
                                {post.isActive ? "unactive" : "active"}
                            </button>
                        </th>
                    </tr>
                ))
            )}
        </tbody>
    );
}
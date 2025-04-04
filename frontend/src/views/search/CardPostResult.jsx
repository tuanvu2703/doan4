import React from 'react'
import { useState, useEffect } from 'react';
import { getSearchResult } from '../../service/SearchService';
import { getAllPosts, getHomeFeed } from '../../service/PostService'; // Import the service to get all posts
import AVTUser from '../post/AVTUser';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading';
import { debounce } from 'lodash';
import FilePreview from '../../components/fileViewer';

export default function CardPostResult({ query }) {
    const [currentIndexes, setCurrentIndexes] = useState({});
    const [albums, setAlbums] = useState([]);
    const [allPosts, setAllPosts] = useState([]); // State to store all posts
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAllPosts() {
            setLoading(true);
            try {
                const response = await getHomeFeed(); // Fetch all posts
                const sortedPosts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setAllPosts(sortedPosts);
                setAlbums(sortedPosts); // Initially display all posts
            } catch (error) {
                console.error(error);
                setAllPosts([]);
                setAlbums([]);
            } finally {
                setLoading(false);
            }
        }

        fetchAllPosts();
    }, []);

    useEffect(() => {
        const debouncedFetchData = debounce(async () => {
            if (query === '') {
                setAlbums(allPosts); // Display all posts if no query
                return;
            }
            setLoading(true);
            try {
                const response = await getSearchResult(query);
                const sortedPosts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setAlbums(sortedPosts);
            } catch (error) {
                console.error(error);
                setAlbums([]);
            } finally {
                setLoading(false);
            }
        }, 500); // 300ms debounce delay

        debouncedFetchData();

        return () => {
            debouncedFetchData.cancel();
        };
    }, [query, allPosts]);

    if (loading) {
        return <p className='text-center mt-5'><Loading /></p>;
    }

    if (albums.length === 0) {
        return <p className='mt-5'>không tìm thấy dữ liệu, Vui lòng nhập nội dung bài viết</p>;
    }

    //carousel
    const handlePrev = (post) => {
        setCurrentIndexes((prevIndexes) => ({
            ...prevIndexes,
            [post._id]: (prevIndexes[post._id] > 0 ? prevIndexes[post._id] : post.img.length) - 1
        }));
    };

    const handleNext = (post) => {
        setCurrentIndexes((prevIndexes) => ({
            ...prevIndexes,
            [post._id]: (prevIndexes[post._id] + 1) % post.img.length
        }));
    };
    console.log(albums)
    return (
        <ul className='mt-5 grid gap-1'>
            {albums.map(album => (
                <li key={album._id}>
                    <Link to={`/post/${album._id}`} className="card card-side bg-base-100 shadow-xl border-[1px]">
                        <div className="card-body">
                            <div className='grid gap-3'>
                                <div>
                                    <div className='grid justify-center'>
                                        {album.author && <AVTUser user={album.author} />}
                                    </div>
                                    {album.author && (
                                        <h2 className="card-title justify-center">{album.author.lastName} {album.author.firstName}</h2>
                                    )}
                                </div>
                                <p className='text-center'>{album.content}</p>
                            </div>
                            {album.img.length > 0 && (
                                <div className='flex justify-center'>
                                    <FilePreview file={album.img} />
                                </div>
                            )}
                            {album.gif && (
                                <div className='flex justify-center'>
                                    <img src={album.gif} alt="GIF" className="w-full h-auto" />
                                </div>
                            )}
                        </div>
                    </Link>
                </li>
            ))}
        </ul>
    )
}

import React, { useState, useEffect } from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/16/solid';
import { useParams } from 'react-router-dom';
import LeftMessenger from "../components/LeftMessenger";
import clsx from 'clsx'
import GetApiIcons from '../../../module/icons/GetApiIcons';
import imgUser from '../../img/user.png'
import user from '../../../service/user';
import { useLocation } from 'react-router-dom';
import messenger from '../../../service/messenger';
import { useUser } from '../../../service/UserContext';
const Messenger = () => {
    const { userContext, setUserContext } = useUser();
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const location = useLocation();
    const [textareaHeight, setTextareaHeight] = useState(0);
    const [transfer, setTransfer] = useState(true)
    const [chanecontainer, setChanecontainer] = useState(windowSize.width > 767)
    const [icons, setIcons] = useState([]);
    const [iduser, setIdUser] = useState(null);
    const [userIdState, setUserIdState] = useState(null);
    const [userdata, setUserdata] = useState({});
    const [loading, setLoading] = useState(true); // Loading state
    const [message, setMessage] = useState('');
    const [messengerdata, setMessengerdata] = useState([]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const userId = queryParams.get('iduser');
        if (userId) {
            setIdUser(userId);
        }
    }, [location.search]);


    useEffect(() => {
        if (!iduser) return;
        const fetchdata = async () => {
            try {
                const res = await user.getProfileUser(iduser);
                if (res.success) {
                    setUserdata(res.data)
                    // console.log(res.data)
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(true); // Stop loading
            }
        };
        fetchdata();
    }, [iduser]);
    useEffect(() => {
        if (!iduser) return;
        const fetchdata = async () => {
            try {
                const res = await messenger.getListMessengerByUser(iduser);
                if (res.success) {
                    setMessengerdata(res.data)
                    console.log(res.data)
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                // setLoading(false); // Stop loading
            }
        };
        fetchdata();
    }, [iduser]);
    // useEffect(() => {
    //     // Hàm để gọi API và cập nhật dữ liệu
    //     const fetchEmojis = async () => {
    //         const data = await GetApiIcons();
    //         setIcons(data);
    //     };

    //     fetchEmojis();
    // }, []); // useEffect với mảng rỗng để gọi API chỉ một lần khi component mount
    function chanetransfer() {
        if (chanecontainer == false) {
            setTransfer(!transfer);
        }
    }
    function backtransfer() {
        setTransfer(true)
    }
    useEffect(() => {
        // Hàm cập nhật kích thước màn hình
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
            setChanecontainer(window.innerWidth > 767);
        };

        // Thêm event listener khi cửa sổ thay đổi kích thước
        window.addEventListener("resize", handleResize);
        // Cleanup event listener khi component bị unmount
        // return () => {
        //     window.removeEventListener("resize", handleResize);
        // };
    }, []);
    const handDetailUser = async (id) => {
        window.location.href = `/user/${id}`;
    };
    const handSendMessenger = async (iduser, mess) => {
        // console.log(mess)
        try {

            const rs = await messenger.sendMess(iduser, mess)
            if (rs.success) {
                console.log(rs)
            } else {
                alert(rs.data.message);
            }
        } catch (error) {
            console.error(error);
        }
    };
    const handleInputChange = (e) => {
        const textarea = e.target;
        const currentValue = textarea.value;

        setMessage(currentValue);
        textarea.style.height = 'auto'; // Reset height to auto
        textarea.style.height = `${textarea.scrollHeight}px`; // Set height to scrollHeight for auto-expanding
        setTextareaHeight(textarea.scrollHeight);
    };
    console.log(messengerdata)
    return (
        <div className=''>
            {
                <div className="h-screen flex flex-row bg-gray-100 text-black" style={{ marginTop: '-68px', paddingTop: '68px' }}>
                    {transfer && (
                        <div className={` ${chanecontainer ? 'w-1/4' : 'w-full'}  h-full`}>
                            <LeftMessenger bt_chanetransfer={chanetransfer} />
                        </div>
                    )}
                    {(chanecontainer || transfer == false) && (
                        <div className={`${transfer ? 'w-3/4' : 'w-full'}  h-full `} >
                            <div className='flex flex-col h-full' >
                                <div className=' p-2 flex flex-row items-center h-14'>

                                </div>
                                <div className=" p-2 flex flex-row items-center border-b border-gray-200 h-14 fixed w-full  bg-white shadow-sm">
                                    {(transfer == false) &&
                                        <div className='pt-2 px-2'>
                                            <button onClick={backtransfer}>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                                    <path fillRule="evenodd" d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6ZM5.78 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 0 0 0 1.06l3 3a.75.75 0 0 0 1.06-1.06l-1.72-1.72H15a.75.75 0 0 0 0-1.5H4.06l1.72-1.72a.75.75 0 0 0 0-1.06Z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    }
                                    <button onClick={() => handDetailUser(userdata?._id)}>
                                        <img
                                            className={`w-10 h-10 rounded-full mr-2`}
                                            src={
                                                userdata?.avatar
                                                    ? userdata.avatar
                                                    : imgUser
                                            }
                                            alt="User Avatar"
                                        />
                                    </button>
                                    <h3 className=" font-semibold">
                                        {userdata
                                            ? `${userdata.firstName || ''} ${userdata.lastName || ''}`.trim()
                                            : "No Name"}
                                    </h3>
                                </div>
                                <div className="overflow-y-scroll h-full p-4 pt-2 flex flex-col"
                                    style={{
                                        overflowY: 'scroll',
                                        // scrollbarWidth: 'none', // Firefox
                                        // msOverflowStyle: 'none' // Internet Explorer and Edge
                                    }}
                                >
                                    {
                                        messengerdata ?
                                            messengerdata.map((mess, index) => (
                                                <div key={index} className={`
                                                ${mess.receiver == userContext._id ? '  bg-blue-100 my-1 ml-24' : ' bg-white mr-24'}
                                                 rounded-lg shadow-sm p-2  border border-blue-500 `}>
                                                    <p className="text-black">
                                                        {mess.content}
                                                    </p>
                                                </div>
                                            )) : ''
                                    }
                                    {/* \userContext
                                    bg-white my-2
                                    bg-blue-100 */}
                                    {/* <div className=' rounded-lg shadow-sm p-2 mr-24 border border-blue-500 '>
                                        <p className="text-secondary">Hi there!</p>
                                    </div>
                                    <div className=' rounded-lg shadow-sm p-2 ml-24 border border-blue-500'>
                                        <p className="text-secondary">Hi there!</p>
                                    </div> */}
                                    {/* <div className='bg-white rounded-lg shadow-sm p-2 border border-blue-500 my-2' >
                                        <h1>Danh sách Emoji</h1>
                                        <ul>
                                            {icons.map((icon) => (
                                                <li key={icon.slug}>
                                                    {icon.character} - {icon.unicodeName}
                                                </li>
                                            ))}
                                        </ul>
                                    </div> */}
                                </div>
                                <div className={`w-full flex mb-1 pt-1 px-1 border-t border-gray-200`}> {/* ${textareaHeight > 56 ? 'flex-col' : 'flex-row'} */}
                                    <div className={` flex items-center justify-center`}>
                                        <button className='h-8 w-8'>
                                            😄
                                        </button>
                                    </div>

                                    <div className='px-1 w-full flex justify-center'>
                                        <textarea
                                            className={clsx(
                                                'rounded-lg border border-gray-400 p-2 w-full resize-none pl-2 text-wrap bg-none text-sm text-black bg-white my-1',
                                                'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
                                            )}
                                            rows={1}
                                            style={{ height: textareaHeight > 56 ? `${textareaHeight}px` : 'auto', maxHeight: '4rem', minHeight: '40px' }} // Sử dụng textareaHeight
                                            placeholder='nhập @, tin nhắn'
                                            onInput={handleInputChange}
                                        />
                                    </div>

                                    <div
                                        onClick={() => { handSendMessenger(iduser, message) }}
                                        className={` flex items-center justify-center`}>
                                        <button className=''>
                                            <PaperAirplaneIcon className='h-8 w-8 fill-sky-500' />
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}
                </div >
            }
        </div>
    );
}

export default Messenger;
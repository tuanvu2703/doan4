import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/16/solid';
import { useLocation } from 'react-router-dom';
import LeftMessenger from '../components/LeftMessenger';
import clsx from 'clsx';
import imgUser from '../../img/user.png';
import user from '../../../service/user';
import messenger from '../../../service/messenger';
import { useUser } from '../../../service/UserContext';

const Messenger = () => {
  const { userContext } = useUser();
  const location = useLocation();

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [textareaHeight, setTextareaHeight] = useState(40);
  const [transfer, setTransfer] = useState(true);
  const [chanecontainer, setChanecontainer] = useState(windowSize.width > 767);
  const [iduser, setIdUser] = useState(null);
  const [userdata, setUserdata] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messengerdata, setMessengerdata] = useState([]);

  // Get iduser from query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const userId = queryParams.get('iduser');
    setIdUser(userId);
  }, [location.search]);

  // Fetch user data
  useEffect(() => {
    if (!iduser) return;

    const fetchUserData = async () => {
      try {
        const res = await user.getProfileUser(iduser);
        if (res.success) {
          setUserdata(res.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [iduser]);

  // Fetch messenger data
  useEffect(() => {
    if (!iduser) return;

    const fetchMessengerData = async () => {
      try {
        const res = await messenger.getListMessengerByUser(iduser);
        if (res.success) {
          setMessengerdata(res.data);
        }
      } catch (error) {
        console.error('Error fetching messenger data:', error);
      }
    };

    fetchMessengerData();
  }, [iduser]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setChanecontainer(window.innerWidth > 767);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleInputChange = useCallback((e) => {
    const textarea = e.target;
    const currentValue = textarea.value;

    setMessage(currentValue);
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    setTextareaHeight(textarea.scrollHeight);
  }, []);

  const handleSendMessenger = useCallback(async () => {
    try {
      const res = await messenger.sendMess(iduser, message);
      if (res.success) {
        setMessengerdata((prev) => [...prev, res.data]); // Update messages list
        setMessage('');
        setTextareaHeight(40);
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [iduser, message]);

  const renderMessages = useMemo(() => {
    return messengerdata.map((mess, index) => (
      <div
        key={index}
        className={clsx(
          'rounded-lg shadow-sm p-2 border',
          mess.receiver === userContext._id
            ? 'bg-blue-100 my-1 ml-24 border-blue-500'
            : 'bg-white mr-24 border-gray-300'
        )}
      >
        <p className="text-black">{mess.content}</p>
      </div>
    ));
  }, [messengerdata, userContext]);

  return (
    <div className="h-screen flex flex-row bg-gray-100 text-black" style={{ marginTop: '-68px', paddingTop: '68px' }}>
      {transfer && (
        <div className={chanecontainer ? 'w-1/4 h-full' : 'w-full h-full'}>
          <LeftMessenger bt_chanetransfer={() => setTransfer(!transfer)} />
        </div>
      )}
      {(chanecontainer || !transfer) && (
        <div className={transfer ? 'w-3/4 h-full' : 'w-full h-full'}>
          <div className="flex flex-col h-full">
            <div className="p-2 flex items-center border-b h-14 bg-white shadow-sm">
              {!transfer && (
                <button onClick={() => setTransfer(true)} className="pt-2 px-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path
                      fillRule="evenodd"
                      d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6ZM5.78 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 0 0 0 1.06l3 3a.75.75 0 0 0 1.06-1.06l-1.72-1.72H15a.75.75 0 0 0 0-1.5H4.06l1.72-1.72a.75.75 0 0 0 0-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
              <button onClick={() => window.location.href = `/user/${userdata?._id}`}>
                <img
                  className="w-10 h-10 rounded-full mr-2"
                  src={userdata?.avatar || imgUser}
                  alt="User Avatar"
                />
              </button>
              <h3 className="font-semibold">{`${userdata?.firstName || ''} ${userdata?.lastName || ''}`.trim()}</h3>
            </div>
            <div className="overflow-y-scroll h-full p-4 pt-2 flex flex-col">
              {renderMessages}
            </div>
            <div className="w-full flex mb-1 pt-1 px-1 border-t border-gray-200">
              <textarea
                className={clsx(
                  'rounded-lg border p-2 w-full resize-none text-sm',
                  'focus:outline-none'
                )}
                rows={1}
                style={{ height: `${textareaHeight}px`, maxHeight: '4rem', minHeight: '40px' }}
                placeholder="Nhập @, tin nhắn"
                value={message}
                onInput={handleInputChange}
              />
              <button onClick={handleSendMessenger} className="ml-2">
                <PaperAirplaneIcon className="h-8 w-8 fill-sky-500" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messenger;

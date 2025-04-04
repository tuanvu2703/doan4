import React, { createContext, useState, useContext } from 'react';

const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const [callState, setCallState] = useState({
    isOpen: false,
    targetUserIds: null,
    status: 'idle',
  });
  

  const startCall = (targetId) => {
    setCallState({
      isOpen: true,
      targetUserIds: targetId,
      status: 'calling'
    });
  };

  const acceptIncomingCall = (callerId, group) => {
    setCallState({
      isOpen: true,
      targetUserIds: group ? group.join(',') : callerId,
      status: 'in-call'
    });
  };

  const endCall = () => {
    setCallState({
      isOpen: false,
      targetUserIds: null,
      status: 'idle'
    });
  };
  

  return (
    <CallContext.Provider value={{ callState, startCall, acceptIncomingCall, endCall }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
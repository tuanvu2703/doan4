import React, { createContext, useState, useContext } from 'react';

const CallContext = createContext();

export const CallProvider = ({ children }) => {

  const [callState, setCallState] = useState({
    isOpen: false,
    targetUserIds: null,
    status: 'idle',
  });


  const startCall = (targetId, sta) => {
    setCallState({
      isOpen: true,
      targetUserIds: targetId,
      status: sta
    });
  };

  const acceptIncomingCall = (callerId, group) => {
    setCallState({
      isOpen: true,
      targetUserIds: group ? group.join(',') : callerId,
      status: 'in-call' // Status is set to 'in-call' for the receiver
    });

    // The caller's status will be updated through socket events in the Call component
  };

  const endCall = () => {
    setCallState({
      isOpen: false,
      targetUserIds: null,
      status: 'idle'
    });
  };

  // Add a function to update just the call status
  const updateCallStatus = (newStatus) => {
    setCallState(prevState => ({
      ...prevState,
      status: newStatus
    }));
  };

  return (
    <CallContext.Provider value={{ callState, startCall, acceptIncomingCall, endCall, updateCallStatus }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
import React, { createContext, useContext, useState } from 'react';
// Create a context for user data
import ModuleZomImgVideo from '../components/moduleZomImgVideo';
const UserContext = createContext();

// Custom hook to access user context
export const useUser = () => {
    return useContext(UserContext); // Use the context and return the value
};

// UserProvider component to wrap around your app and provide the context
export const UserProvider = ({ children }) => {
    const [userContext, setUserContext] = useState({}); // State for the user object
    const [showZom, setShowZom] = useState({
        file: null,   // Set 'file' to null initially
        show: false   // 'show' is initially set to false
    });

    return (
        <UserContext.Provider value={{ userContext, setUserContext, setShowZom, showZom }}>
            {children}
            <ModuleZomImgVideo />
        </UserContext.Provider>
    );
};

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from "../components/Loading";

const Fixconnectsocket = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Reload the page first
       
        // After reload, navigate to the root page '/'
        const timer = setTimeout(() => {
            navigate('/');
            window.location.reload();
             // Navigate to the root page '/'
        }, 1000);

        // Cleanup the timeout if the component is unmounted
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <Loading />
    );
}

export default Fixconnectsocket;

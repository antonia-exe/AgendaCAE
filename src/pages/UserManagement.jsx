import React, { useEffect } from 'react';
import Header from '../components/Header/header';
import ButtonOptions from '../components/ButtonOptions/buttonOptions';
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleUnload = () => {
            localStorage.removeItem("auth");
        };

        window.addEventListener("beforeunload", handleUnload);

        return () => {
            window.removeEventListener("beforeunload", handleUnload);
        };
    }, []);
    return (
        <div>
            <Header />
            <ButtonOptions />
        </div>
    );
};

export default UserManagement;
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './header.css';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const noLoginButton = ['/acesso'];
    const showLoginButton = !noLoginButton.includes(location.pathname);

    const handleLoginClick = () => {
        navigate('/login');
    }

    return (
        <header className="header">
            <div className="header-rectangle">
                {showLoginButton && (
                    <button 
                    className='login-button'
                    onClick={handleLoginClick}
                    >LOGIN</button>
                )}
            
            </div>
            <h1 className="header-title">AGENDA CAE</h1>
            <div className="header-line"></div>
        </header>
    );
};

export default Header;
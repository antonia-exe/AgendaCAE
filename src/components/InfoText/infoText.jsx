import React from 'react';
import './infoText.css';

const InfoText = ({ children }) => {
    return (
        <p className="info-text">
            {children}
        </p>
    );
};

export default InfoText;


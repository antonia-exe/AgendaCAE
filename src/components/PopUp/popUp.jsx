import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import './popUp.css';

const PopUp = ({ title, message, onConfirm }) => {
    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <div className="popup-icon-circle">
                    <FaExclamationTriangle className="popup-icon" />
                </div>

                <h2>{title}</h2>
                <p>{message}</p>

                <button onClick={onConfirm}>ENTENDI</button>
            </div>
        </div>
    );
};

export default PopUp;
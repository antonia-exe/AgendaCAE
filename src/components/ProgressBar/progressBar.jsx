import React from 'react';
import './progressBar.css';

const ProgressBar = ({ progress }) => {
    return (
        <div className="progress-bar">
            <div className="progress-line" style={{ width: `${progress}%` }}></div>
        </div>
    );
};

export default ProgressBar;
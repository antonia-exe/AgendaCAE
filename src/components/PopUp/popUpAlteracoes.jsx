import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import './popUp.css';

const PopUpAlteracoes = ({ onConfirm, onCancel }) => {
    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <div className="popup-icon-circle">
                    <FaExclamationTriangle className="popup-icon" />
                </div>

                <p>Tem certeza que deseja fazer essas alterações? Essa ação não poderá ser desfeita!</p>

                <div className="popup-buttons-container-alter">
                    <button className="popup-button-confirm" onClick={onConfirm}>Alterar</button>
                    <button className="popup-button-cancel" onClick={onCancel}>Cancelar</button>
                </div>
            </div>
        </div>
    );
};

export default PopUpAlteracoes;
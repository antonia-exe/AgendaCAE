import React, { useState, useEffect } from 'react';
import PopUp from '../PopUp/popUp';
import './loc.css';

const Loc = ({ setShowLoc, onLocationSelect }) => {
    const [showPopUp, setShowPopUp] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [activeButton, setActiveButton] = useState(null);

    // Controla a classe no body quando o popup abre/fecha
    useEffect(() => {
        if (showPopUp) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }

        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [showPopUp]);

    const handleButtonClick = (unit) => {
        setSelectedUnit(unit);
        setActiveButton(unit);
        setShowPopUp(true);
    };

    const handleConfirm = () => {
        setShowPopUp(false);
        onLocationSelect(selectedUnit);
    };

    return (
        <div className="loc-container">
            <h1 className="loc-title">Unidade de atendimento</h1>
            <div className="loc-buttons">
                <button
                    onClick={() => handleButtonClick('Mamanguape')}
                    className={activeButton === 'Mamanguape' ? 'active' : ''}
                >
                    Mamanguape
                </button>
                <button
                    onClick={() => handleButtonClick('RioTinto')}
                    className={activeButton === 'RioTinto' ? 'active' : ''}
                >
                    Rio Tinto
                </button>
            </div>

            {showPopUp && (
                <PopUp
                    message="O atendimento poderá ser agendado para qualquer uma das unidades, independentemente do curso em que você esteja matriculado(a)."
                    onConfirm={handleConfirm}
                />
            )}
        </div>
    );
};

export default Loc;
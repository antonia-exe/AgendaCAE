import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as Icon } from '../../assets/icon-clock.svg';
import './infoOff.css';

const InfoOff = () => {
    const navigate = useNavigate();

    const handleWaitListClick = ()  => {
        navigate('/lista-espera');
    }
    return (
        <div className="info-off-container">
            {/* Parte dos textos */}
            <div className="info-off-texts">
                <div className="info-off-rectangle">
                    <p className="info-off-rectangle-text">FORMULÁRIO FECHADO</p>
                </div>

                <h1 className="info-off-title">Agendamento aberto somente às segundas-feiras.</h1>
                <p className="info-off-text">
                O formulário está fechado, mas é possível preencher um formulário para inclusão na lista de espera da semana.
                </p>

                {/* Botão da lista de espera */}
                <div className="info-off-list">
                    <button onClick={handleWaitListClick}>Lista de espera</button>
                </div>
            </div>

            {/* Ícone SVG */}
            <div className="info-off-icon">
                <Icon /> {/* Renderiza o ícone SVG */}
            </div>
        </div>
    );
};

export default InfoOff;
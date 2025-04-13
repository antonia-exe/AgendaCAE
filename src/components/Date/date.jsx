import React, { useState, useEffect } from 'react';
import './date.css';

const Date = ({ day, times, isFirst, selectedDay, selectedTime, onTimeSelect, unidade }) => {
    const [horariosIndisponiveis, setHorariosIndisponiveis] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (day && unidade) {
            setLoading(true);
            const fetchHorariosIndisponiveis = async () => {
                try {
                    const response = await fetch(
                        `http://localhost:5000/horarios-indisponiveis?dia=${encodeURIComponent(day)}&unidade=${encodeURIComponent(unidade)}`
                    );
                    const data = await response.json();
                    
                    if (data.success) {
                        setHorariosIndisponiveis(data.horariosIndisponiveis || []);
                    }
                } catch (error) {
                    console.error('Erro ao buscar horários indisponíveis:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchHorariosIndisponiveis();
        }
    }, [day, unidade]);

    if (loading) {
        return <div className="date">Carregando horários...</div>;
    }

    return (
        <div className="date">
            {isFirst && <h3 className="date-tittle">Selecione o dia e o horário</h3>}

            <p className="date-day">{day}</p>
            <div className="date-buttons">
                {times.map((time, index) => {
                    const isIndisponivel = horariosIndisponiveis.includes(time);
                    return (
                        <button
                            key={index}
                            className={`date-button ${
                                selectedDay === day && selectedTime === time ? 'active' : ''
                            } ${isIndisponivel ? 'ocupado' : ''}`}
                            onClick={() => !isIndisponivel && onTimeSelect(day, time)}
                            disabled={isIndisponivel}
                            title={isIndisponivel ? "Horário indisponível" : ""}
                        >
                            {time}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Date;
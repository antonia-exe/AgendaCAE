import React, { useState, useEffect } from 'react';
import Date from '../Date/date';
import Forms from '../Forms/forms';
import Loc from '../Loc/loc';
import './modality.css';

const Modality = ({ setProgress }) => {
    const [selectedModality, setSelectedModality] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [showLoc, setShowLoc] = useState(false);
    const [configData, setConfigData] = useState({});

    const fetchData = async () => {
        try {
            const response = await fetch('http://localhost:5000/obter-configuracao');
            const data = await response.json();
            setConfigData(data);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let completedSteps = 0;
        const totalSteps = 4; 
        
        if (selectedModality) completedSteps++;
        if (selectedModality === 'online' || selectedLocation) completedSteps++;
        if (selectedDay) completedSteps++;
        if (selectedTime) completedSteps++;
  
        setProgress((completedSteps / totalSteps) * 100);
    }, [selectedModality, selectedLocation, selectedDay, selectedTime, setProgress]);

    const handleModalityClick = (modality) => {
        setSelectedModality(modality);
        setSelectedDay(null);
        setSelectedTime(null);
        setSelectedLocation(null);
        setShowLoc(modality === 'presencial');
    };

    const handleTimeSelect = (day, time) => {
        setSelectedDay(day);
        setSelectedTime(time);
    };

    const handleLocationSelect = (location) => {
        setSelectedLocation(location);
    };

    const formatData = (data) => {
        if (!data) return [];
        return Object.entries(data).map(([dia, horarios]) => ({
            day: dia,
            times: Array.isArray(horarios) ? 
                horarios.map(h => typeof h === 'object' ? h.horario : h) : 
                [],
        }));
    };

    const getUnidadeParaAPI = () => {
        if (selectedModality === 'online') return 'online';
        if (selectedLocation === 'Mamanguape') return 'Mamanguape';
        if (selectedLocation === 'RioTinto') return 'RioTinto';
        return null;
    };

    const unidadeParaAPI = getUnidadeParaAPI();

    return (
        <div className="modality">
            <p className="modality-text">Deseja ser atendido em qual modalidade?</p>

            <div className="modality-buttons">
                <button
                    className={`modality-button ${selectedModality === 'online' ? 'active' : ''}`}
                    onClick={() => handleModalityClick('online')}
                >
                    Online
                </button>
                <button
                    className={`modality-button ${selectedModality === 'presencial' ? 'active' : ''}`}
                    onClick={() => handleModalityClick('presencial')}
                >
                    Presencial
                </button>
            </div>

            {selectedModality === 'online' && (
                <div className="dates-container">
                    {formatData(configData.online || {}).map((item, itemIndex) => (
                        <Date
                            key={itemIndex}
                            day={item.day}
                            times={item.times}
                            isFirst={itemIndex === 0}
                            selectedDay={selectedDay}
                            selectedTime={selectedTime}
                            onTimeSelect={handleTimeSelect}
                            unidade={unidadeParaAPI}
                        />
                    ))}
                </div>
            )}

            {showLoc && (
                <Loc
                    setShowLoc={setShowLoc}
                    onLocationSelect={handleLocationSelect}
                />
            )}

            {selectedModality === 'presencial' && selectedLocation && (
                <div className="dates-container">
                    {formatData(configData[selectedLocation] || {}).map((item, itemIndex) => (
                        <Date
                            key={itemIndex}
                            day={item.day}
                            times={item.times}
                            isFirst={itemIndex === 0}
                            selectedDay={selectedDay}
                            selectedTime={selectedTime}
                            onTimeSelect={handleTimeSelect}
                            unidade={unidadeParaAPI}
                        />
                    ))}
                </div>
            )}

            {(selectedModality && selectedDay && selectedTime) && (
                <Forms
                    modality={selectedModality}
                    day={selectedDay}
                    time={selectedTime}
                    location={selectedLocation}
                />
            )}
        </div>
    );
};

export default Modality;
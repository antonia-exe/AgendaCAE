import React, { useState } from 'react';
import './buttonOptions.css';

import UsersMME from '../UsersMME/usersMME';
import UsersRT from '../UsersRT/usersRT';
import UsersON from '../UsersON/usersON';
import Settings from '../Settings/settings';

const ButtonOptions = () => {
    const [selectedComponent, setSelectedComponent] = useState('UsersMME');

    const renderComponent = () => {
        switch (selectedComponent) {
            case 'UsersMME':
                return <UsersMME />
            case 'UsersRT':
                return <UsersRT />;
            case 'UsersON':
                return <UsersON />;
            case 'Settings':
                return <Settings />;
            default:
                return null;
        }
    };

    return (
        <div className="options-container">

            <div className="options-buttons">
                <button
                    className={`option-button ${selectedComponent === 'UsersMME' ? 'active' : ''}`}
                    onClick={() => setSelectedComponent('UsersMME')}
                >
                    Mamanguape
                </button>

                <button
                    className={`option-button ${selectedComponent === 'UsersRT' ? 'active' : ''}`}
                    onClick={() => setSelectedComponent('UsersRT')}
                >
                    Rio Tinto
                </button>

                <button
                    className={`option-button ${selectedComponent === 'UsersON' ? 'active' : ''}`}
                    onClick={() => setSelectedComponent('UsersON')}
                >
                    Online
                </button>

                <button
                    className={`option-button ${selectedComponent === 'Settings' ? 'active' : ''}`}
                    onClick={() => setSelectedComponent('Settings')}
                >
                    Configurações
                </button>
            </div>

            <div className="component-container">
                {renderComponent()}
            </div>
        </div>
    );
};

export default ButtonOptions;
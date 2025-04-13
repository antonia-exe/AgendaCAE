import React from 'react';
import './downloadExcel.css';
import axios from 'axios';

const DownloadExcel = () => {
    const API_BASE_URL = 'http://localhost:5000';

    const downloadFile = async (type) => {
        try {
            let endpoint = '';
            let filename = '';
            
            switch(type) {
                case 'weekly':
                    endpoint = `${API_BASE_URL}/api/download/weekly`;
                    filename = 'usuarios_semana.xlsx';
                    break;
                case 'monthly':
                    endpoint = `${API_BASE_URL}/api/download/monthly`;
                    filename = 'usuarios_mes.xlsx';
                    break;
                case 'all':
                    endpoint = `${API_BASE_URL}/api/download/all`;
                    filename = 'todos_usuarios.xlsx';
                    break;
                default:
                    return;
            }
            
            const response = await axios.get(endpoint, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Erro ao baixar arquivo:', error);
            alert('Erro ao baixar o arquivo. Tente novamente.');
        }
    };

    return (
        <div className="grid-container">
            <div className="grid-item bg-gray">
                <div className="content">
                    <h2>Usuários da semana</h2>
                    <p>Arquivo Excel com informações de todos os usuários da semana</p>
                </div>
                <button 
                    className="center-button"
                    onClick={() => downloadFile('weekly')}
                >
                    Baixar arquivo
                </button>
            </div>

            <div className="grid-item bg-white">
                <div className="content">
                    <h2>Usuários do mês</h2>
                    <p>Arquivo Excel com informações de todos os usuários do mês</p>
                </div>
                <button 
                    className="center-button"
                    onClick={() => downloadFile('monthly')}
                >
                    Baixar arquivo
                </button>
            </div>

            <div className="grid-item bg-gray">
                <div className="content">
                    <h2>Todos os usuários</h2>
                    <p>Arquivo Excel com informações de todos os usuários</p>
                </div>
                <button 
                    className="center-button"
                    onClick={() => downloadFile('all')}
                >
                    Baixar arquivo
                </button>
            </div>
        </div>
    );
};

export default DownloadExcel;
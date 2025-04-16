import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import UserForms from './pages/UserForms';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';
import Offline from './pages/Offline';
import ProtectedRoute from './components/ProtectedRoute/protectedRoute';
import UserFormsList from './pages/UserFormsLista';

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const verificarDisponibilidade = async () => {
    const savedState = localStorage.getItem("toggleState");
    if (savedState === "false") {
      console.log("Botão desativado - não verificando disponibilidade");
      return; 
    }

    try {
      const response = await axios.get('http://localhost:5000/api/verificar-disponibilidade', {
        params: {
          dataTeste: '2025-04-21T09:00:00' // Para testes
        }
      });

      console.log('Dados recebidos:', response.data);

      if (response.data.disponivel && location.pathname === '/off') {
        navigate('/');
      } else if (!response.data.disponivel && location.pathname === '/') {
        navigate('/off', { state: response.data });
      }
    } catch (error) {
      console.error("Erro:", error);
      navigate('/off', { state: { motivo: 'erro', message: error.message } });
    }
  };

  useEffect(() => {
    const savedState = localStorage.getItem("toggleState");
    if (savedState === "false" && location.pathname === '/') {
      navigate('/off');
    } else {
      verificarDisponibilidade();
      const interval = setInterval(verificarDisponibilidade, 30000);
      return () => clearInterval(interval);
    }
  }, [navigate, location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<UserForms />} />
      <Route path="/login" element={<Login />} />
      <Route path="/acesso" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
      <Route path="/off" element={<Offline />} />
      <Route path="/lista-espera" element={<UserFormsList />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
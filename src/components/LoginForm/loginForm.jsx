import React, { useState } from "react";
import "./loginForm.css"; // Importe o CSS
import { useNavigate } from "react-router-dom"; // Importa o useNavigate

const LoginForm = () => {
    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    const [mensagem, setMensagem] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); // Evita o recarregamento da página

        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usuario, senha }),
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem("auth", "true")
                navigate("/acesso");
            } else {
                setMensagem(data.message);
            }
        } catch (error) {
            setMensagem("Erro ao tentar fazer login.");
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                {/* Título */}
                <h1 className="login-title">Olá, seja bem-vindo!</h1>

                {/* Mensagem */}
                <p className="login-message">Por favor, insira suas credenciais para acessar a agenda.</p>

                {/* Formulário de Login */}
                <form onSubmit={handleLogin}>
                    {/* Campo de Usuário */}
                    <div className="login-input-group">
                        <label htmlFor="usuario" className="login-label">
                            Usuário
                        </label>
                        <input
                            type="text"
                            id="usuario"
                            className="login-input"
                            placeholder="Digite seu usuário"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            required
                        />
                    </div>

                    {/* Campo de Senha */}
                    <div className="login-input-group">
                        <label htmlFor="senha" className="login-label">
                            Senha
                        </label>
                        <input
                            type="password"
                            id="senha"
                            className="login-input"
                            placeholder="Digite sua senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            required
                        />
                    </div>

                    {/* Botão de Entrar */}
                    <button type="submit" className="login-button-forms">
                        Entrar
                    </button>
                </form>

                {/* Exibe a mensagem de sucesso ou erro */}
                {mensagem && <p className="login-message">{mensagem}</p>}
            </div>
        </div>
    );
};

export default LoginForm;
import React, { useState, useEffect } from 'react';
import './forms.css';

const FormsLista = ({ modality, day, time, location }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [number, setNumber] = useState('');
    const [matriculaExists, setMatriculaExists] = useState(false);
    const [isCheckingMatricula, setIsCheckingMatricula] = useState(false);

    const courses = [
        'Administração',
        'Antropologia',
        'Ciências Contábeis',
        'Ciência da Computação',
        'Design',
        'Ecologia',
        'Letras - Português',
        'Matemática',
        'Pedagogia',
        'Secretariado Executivo Bilíngue',
        'Sistemas de Informação'
    ];

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (number.trim().length > 0) {
                checkMatriculaExists(number);
            } else {
                setMatriculaExists(false);
            }
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [number]);

    const formatPhone = (value) => {
        const onlyNumbers = value.replace(/\D/g, '');
        
        if (onlyNumbers.length <= 2) {
            return `(${onlyNumbers}`;
        }
        if (onlyNumbers.length <= 6) {
            return `(${onlyNumbers.slice(0, 2)}) ${onlyNumbers.slice(2)}`;
        }
        if (onlyNumbers.length <= 10) {
            return `(${onlyNumbers.slice(0, 2)}) ${onlyNumbers.slice(2, 6)}-${onlyNumbers.slice(6)}`;
        }
        return `(${onlyNumbers.slice(0, 2)}) ${onlyNumbers.slice(2, 7)}-${onlyNumbers.slice(7, 11)}`;
    };

    const handlePhoneChange = (e) => {
        const formattedPhone = formatPhone(e.target.value);
        setPhone(formattedPhone);
    };

    const isPhoneValid = () => {
        const onlyNumbers = phone.replace(/\D/g, '');
        return onlyNumbers.length === 11;
    };

    const checkMatriculaExists = async (matricula) => {
        setIsCheckingMatricula(true);
        try {
            const response = await fetch(`http://localhost:5000/verificar-matricula-lista?matricula=${matricula}`);
            const result = await response.json();
            
            if (response.ok) {
                setMatriculaExists(result.exists);
            } else {
                console.error('Erro ao verificar matrícula:', result.message);
            }
        } catch (error) {
            console.error('Erro ao verificar matrícula:', error);
        } finally {
            setIsCheckingMatricula(false);
        }
    };

    const isFormValid = () => {
        return (
            name.trim() !== '' &&
            email.trim() !== '' &&
            isPhoneValid() &&
            selectedCourse.trim() !== '' &&
            number.trim() !== '' &&
            !matriculaExists
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!isFormValid()) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }
    
        const alunoData = {
            name,
            email,
            telefone: phone,
            curso: selectedCourse,
            matricula: number,
            modality,
            day,
            time,
            location,
            status: 'pendente'
        };
    
        try {
            const response = await fetch('http://localhost:5000/salvar-lista-espera', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(alunoData),
            });
    
            const result = await response.json();
    
            if (response.ok) {
                console.log('Cadastrado na lista de espera:', result.data);
                alert('Você foi cadastrado na lista de espera com sucesso!');
                setName('');
                setEmail('');
                setPhone('');
                setSelectedCourse('');
                setNumber('');
                setMatriculaExists(false);
            } else {
                console.error('Erro ao cadastrar na lista:', result.message);
                alert('Erro ao cadastrar na lista de espera. Por favor, tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            alert('Erro ao enviar formulário. Por favor, tente novamente.');
        }
    };

    return (
        <div className="forms-container">
            
            <form onSubmit={handleSubmit}>
                <div className="form-group large">
                    <label>Nome completo</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Digite seu nome completo"
                        required
                    />
                </div>

                <div className="form-group large">
                    <label>E-mail</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Digite seu e-mail"
                        required
                    />
                </div>

                <div className="form-group small">
                    <label>Telefone</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="(00) 00000-0000"
                        required
                        maxLength={15}
                    />
                    {phone && !isPhoneValid() && (
                        <p className="phone-error">Digite um telefone válido com DDD + 9 dígitos</p>
                    )}
                </div>

                <div className="form-group small">
                    <label>Qual é o seu curso?</label>
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        required
                        style={{ color: selectedCourse ? '#000' : '#7D7D7D' }}
                    >
                        <option value="" disabled style={{ color: '#7D7D7D' }}>Selecione o seu curso</option>
                        {courses.map((course, index) => (
                            <option key={index} value={course} style={{ color: '#000' }}>
                                {course}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group small">
                    <label>Número de Matrícula:</label>
                    <input
                        type="number"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        placeholder="Digite seu número de matrícula"
                        required
                    />
                    {isCheckingMatricula && <p className="checking-matricula">Verificando matrícula...</p>}
                    {matriculaExists && (
                        <p className="matricula-exists">Matrícula já cadastrada na lista de espera</p>
                    )}
                </div>

                <button className="submit-button" type="submit" disabled={!isFormValid()}>
                    ENTRAR NA LISTA DE ESPERA
                </button>
            </form>
        </div>
    );
};

export default FormsLista;
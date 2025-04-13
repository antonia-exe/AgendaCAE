import React, { useState } from 'react';
import './forms.css';

const Forms = ({ modality, day, time, location, dataTeste }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [number, setNumber] = useState('');

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

    const isFormValid = () => {
        return (
            name.trim() !== '' &&
            email.trim() !== '' &&
            phone.trim() !== '' &&
            selectedCourse.trim() !== '' &&
            number.trim() !== ''
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!isFormValid()) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
    
        const alunoData = {
            name,
            email,
            telefone: phone,
            curso: selectedCourse,
            matricula: number,
            modality, // Certifique-se de que está sendo enviado
            day, // Certifique-se de que está sendo enviado
            time, // Certifique-se de que está sendo enviado
            location, // Certifique-se de que está sendo enviado
            dataTeste: dataTeste || null
        };
    
        try {
            const response = await fetch('http://localhost:5000/salvar-aluno', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(alunoData),
            });
    
            const result = await response.json();
    
            if (response.ok) {
                console.log('Aluno cadastrado com sucesso:', result.data);
                alert('Cadastro realizado com sucesso!');
                setName('');
                setEmail('');
                setPhone('');
                setSelectedCourse('');
                setNumber('');
            } else {
                console.error('Erro ao cadastrar aluno:', result.message);
                alert('Erro ao cadastrar aluno. Por favor, tente novamente.');
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
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Digite seu número de telefone"
                        required
                    />
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
                </div>

                <button className="submit-button" type="submit" disabled={!isFormValid()}>CONFIRMAR</button>
            </form>
        </div>
    );
};

export default Forms;
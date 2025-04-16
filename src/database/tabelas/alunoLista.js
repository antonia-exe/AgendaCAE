const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const AlunoLista = sequelize.define('AlunoLista', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telefone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    curso: {
        type: DataTypes.ENUM(
            'Administração',
            'Antropologia',
            'Ciências Contábeis',
            'Design',
            'Ecologia',
            'Licenciatura em Ciência da Computação',
            'Matemática',
            'Pedagogia',
            'Secretariado Executivo Bilíngue',
            'Sistemas de Informação'
        ),
        allowNull: false
    },
    matricula: {
        type: DataTypes.INTEGER,
        unique: true,
        primaryKey: true,
        allowNull: false
    },
    modalidade: {
        type: DataTypes.ENUM('online', 'presencial'), // Modalidade de atendimento
        allowNull: true
    },
    dia: {
        type: DataTypes.STRING, // Dia selecionado pelo usuário
        allowNull: false
    },
    horario: {
        type: DataTypes.STRING, // Horário selecionado pelo usuário
        allowNull: false
    },
    unidade: {
        type: DataTypes.STRING, // Unidade selecionada (se presencial)
        allowNull: true // Pode ser nulo se a modalidade for online
    },
    periodo_semanal: {
        type: DataTypes.VIRTUAL,
        get() {
            const data = this.getDataValue('createdAt');
            const segunda = new Date(data);
            segunda.setDate(data.getDate() - (data.getDay() + 6) % 7);
            segunda.setHours(9, 0, 0, 0);
            return segunda;
        }
    }

}, {
    tableName: 'AlunosLista', // Define o nome da tabela explicitamente
    timestamps: true // Adiciona os campos `createdAt` e `updatedAt` automaticamente
});

module.exports = AlunoLista; // Exporta o modelo Aluno
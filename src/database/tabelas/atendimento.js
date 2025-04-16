const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Atendimento = sequelize.define('Atendimento', {
    data: {
        type: DataTypes.DATE,
        allowNull: false
    },
    modalidade: {
        type: DataTypes.ENUM('presencial', 'online'),
        allowNull: false
    },
    unidade: {
        type: DataTypes.ENUM('rio tinto', 'mamanguape'),
        allowNull: false
    },
    aluno_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Alunos',
            key: 'matricula'
        }
    }
});

module.exports = Atendimento;
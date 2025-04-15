const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Psicologo = sequelize.define('Psicologo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    usuario: {
        type: DataTypes.STRING, 
        allowNull: false,
        defaultValue: 'admin' 
    },
    senha: {
        type: DataTypes.STRING(8), // Alterado de CHAR(8) para STRING(8)
        allowNull: false,
        defaultValue: 'psicologiaccaeIV' 
    }
}, {
    freezeTableName: true, // Mantém o nome da tabela igual ao definido
    timestamps: false // Desabilita createdAt e updatedAt
});

module.exports = Psicologo;
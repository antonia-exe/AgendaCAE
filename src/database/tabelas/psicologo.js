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
        type: DataTypes.STRING(8), 
        allowNull: false,
        defaultValue: 'psicologiaccaeIV' 
    }
}, {
    freezeTableName: true, 
    timestamps: false 
});

module.exports = Psicologo;
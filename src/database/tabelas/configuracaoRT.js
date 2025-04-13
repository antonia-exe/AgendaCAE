const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const configuracaoRT = sequelize.define("configuracaoRT", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  diaSemana: {
    type: DataTypes.ENUM(
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira"
    ),
    allowNull: false,
  },
  horario: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  bloqueado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  }
}, { freezeTableName: true });

module.exports = configuracaoRT;
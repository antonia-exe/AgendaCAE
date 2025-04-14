require('dotenv').config();
const { Sequelize } = require('sequelize');

// Configuração para Supabase usando Connection Pooler (IPv4)
const sequelize = new Sequelize({
  database: 'postgres',
  username: 'postgres.axkkykkyopkbwggjjzkq', // Note o prefixo do pooler
  password: process.env.DB_PASSWORD,
  host: 'aws-0-sa-east-1.pooler.supabase.com',
  port: 6543, // Porta do Pooler
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    connectTimeout: 10000 // Timeout de 10 segundos
  },
  logging: console.log, // Mostra logs SQL no console
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;
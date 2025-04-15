const { Sequelize } = require('sequelize');
const dns = require('dns');

// Força IPv4 para todas as conexões DNS
dns.setDefaultResultOrder('ipv4first');

const sequelize = new Sequelize(
  'postgresql://postgres.axkkykkyopkbwggjjzkq:Teste%40BancoDeDados@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
  {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
      connectTimeout: 10000
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: console.log // Apenas para desenvolvimento
  }
);

// Teste de conexão
sequelize.authenticate()
  .then(() => console.log('✅ Conexão com Supabase estabelecida via Pooler'))
  .catch(err => console.error('❌ Erro de conexão:', err));

module.exports = sequelize;
const { Sequelize } = require('sequelize');
const dns = require('dns');

// Configuração de DNS para priorizar IPv4 (recomendado para Supabase)
dns.setDefaultResultOrder('ipv4first');

// 1. Conexão usando Connection Pooler (recomendado - IPv4)
const testPoolerConnection = async () => {
  const sequelizePooler = new Sequelize(
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
      logging: console.log
    }
  );

  try {
    await sequelizePooler.authenticate();
    console.log('✅ Conexão com POOLER (IPv4) estabelecida com sucesso!');
    
    const [result] = await sequelizePooler.query('SELECT NOW() as current_time');
    console.log('⏱️ Hora atual no banco:', result[0].current_time);
    
    await sequelizePooler.close();
  } catch (error) {
    console.error('❌ Erro na conexão com POOLER:', error);
  }
};

// 2. Conexão direta (para comparação)
const testDirectConnection = async () => {
  const sequelizeDirect = new Sequelize(
    'postgresql://postgres:Teste%40BancoDeDados@db.axkkykkyopkbwggjjzkq.supabase.co:5432/postgres',
    {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        },
        connectTimeout: 15000
      },
      logging: console.log
    }
  );

  try {
    await sequelizeDirect.authenticate();
    console.log('\n✅ Conexão DIRETA estabelecida com sucesso!');
    
    const [result] = await sequelizeDirect.query('SELECT NOW() as current_time');
    console.log('⏱️ Hora atual no banco:', result[0].current_time);
  } catch (error) {
    console.error('\n❌ Erro na conexão DIRETA:', {
      message: error.message,
      code: error.parent?.code,
      address: error.parent?.address,
      port: error.parent?.port
    });
  } finally {
    await sequelizeDirect.close();
  }
};

// Executa ambos os testes
(async () => {
  console.log('=== TESTANDO CONEXÃO COM SUPABASE ===');
  await testPoolerConnection();
  await testDirectConnection();
})();
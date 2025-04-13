// src/database/database.js
const { Sequelize } = require('sequelize');

// Configuração do banco de dados
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'C:/Users/antonia/agenda-caes/src/database/database.sqlite' // Caminho do banco de dados
});

// Função para testar a conexão com o banco de dados
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
    }
}

// Testar a conexão se o arquivo for executado diretamente
if (require.main === module) {
    testConnection();
}

// Exportar a instância do Sequelize para ser usada em outros arquivos
module.exports = sequelize;
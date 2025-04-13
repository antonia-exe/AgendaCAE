const sequelize = require('./database');
const Aluno = require('./tabelas/aluno');
const Psicologo = require('./tabelas/psicologo');
const Atendimento = require('./tabelas/atendimento');
const configuracaoMME = require('./tabelas/configuracaoMME');
const configuracaoRT = require('./tabelas/configuracaoRT');
const configuracaoON = require('./tabelas/configuracaoON');

async function syncDatabase() {
    try {
        await sequelize.sync({ force: true });
        console.log('Tabelas criadas com sucesso.');
    } catch (error) {
        console.error('Erro ao sincronizar o banco de dados:', error);
    } finally {
        await sequelize.close();
        console.log('Conexão fechada.');
    }
}

syncDatabase();
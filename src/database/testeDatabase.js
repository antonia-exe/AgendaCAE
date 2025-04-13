// Importe a configuração do Sequelize
const sequelize = require('./database'); // Caminho correto para o arquivo onde está a configuração do Sequelize
const configuracaoMME = require('./tabelas/configuracaoMME');
const configuracaoRT = require('./tabelas/configuracaoRT');
const configuracaoON = require('./tabelas/configuracaoON');

async function testeDatabase() {
    try {
        // Conectar ao banco de dados
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso.');

        // Sincronizar as tabelas
        await sequelize.sync({ force: true }); // Atenção: 'force: true' vai apagar as tabelas existentes! Remova se não for para apagar.
        console.log('Tabelas sincronizadas com sucesso.');

        // Inserir dados nas tabelas
        const dadosMME = [
            { diaSemana: 'segunda', horario: '08:00' },
            { diaSemana: 'terça', horario: '09:00' },
            { diaSemana: 'quarta', horario: '10:00' },
        ];

        const dadosRT = [
            { diaSemana: 'quinta', horario: '14:00' },
            { diaSemana: 'sexta', horario: '16:00' },
        ];

        const dadosON = [
            { diaSemana: 'segunda', horario: '11:00' },
            { diaSemana: 'terça', horario: '12:00' },
        ];

        // Inserir os dados nas tabelas
        await configuracaoMME.bulkCreate(dadosMME);
        await configuracaoRT.bulkCreate(dadosRT);
        await configuracaoON.bulkCreate(dadosON);

        console.log('Dados inseridos com sucesso!');

        // Consultar e exibir os dados inseridos
        const dadosSalvosMME = await configuracaoMME.findAll();
        const dadosSalvosRT = await configuracaoRT.findAll();
        const dadosSalvosON = await configuracaoON.findAll();

        console.log('Dados salvos na tabela configuracaoMME:', dadosSalvosMME.map(d => d.toJSON()));
        console.log('Dados salvos na tabela configuracaoRT:', dadosSalvosRT.map(d => d.toJSON()));
        console.log('Dados salvos na tabela configuracaoON:', dadosSalvosON.map(d => d.toJSON()));

    } catch (error) {
        console.error('Erro ao testar o banco de dados:', error);
    } finally {
        // Fechar a conexão com o banco de dados
        await sequelize.close();
        console.log('Conexão fechada.');
    }
}

testeDatabase();
process.env.TZ_DB = 'America/Sao_Paulo'

const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
const sequelize = require('../../src/database/database');

const Psicologo = require('../../src/database/tabelas/psicologo');
const configuracaoMME = require('../../src/database/tabelas/configuracaoMME');
const configuracaoRT = require('../../src/database/tabelas/configuracaoRT');
const configuracaoON = require('../../src/database/tabelas/configuracaoON');
const Aluno = require('../../src/database/tabelas/aluno');
const AlunoLista = require('../../src/database/tabelas/alunoLista')

const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const schedule = require('node-schedule');
const axios = require('axios');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000; // Usa a porta do Vercel em produção

let dataTeste = "2025-04-07T09:00:00";

process.env.TZ = 'America/Sao_Paulo';

// Sincronização do banco de dados
(async () => {
    try {
        // Certifique-se de que as tabelas existem e são sincronizadas com o banco de dados
        await sequelize.sync(); // Isso irá garantir que as tabelas sejam criadas (caso contrário, cria-as)
        //console.log("Banco de dados sincronizado com sucesso.");

        // Verifica se já existe um usuário antes de criar
        const existePsicologo = await Psicologo.findOne({ where: { usuario: 'admin' } });
        if (!existePsicologo) {
            await Psicologo.create({
                usuario: 'admin1',
                senha: 'admin1'
            });
            //console.log("Usuário padrão criado!");
        }

    } catch (error) {
        console.error("Erro ao configurar o banco de dados:", error);
    }
})();

app.use(cors()); 
app.use(express.json());
app.use(bodyParser.json());
app.use((req, res, next) => {
    req.dataTeste = dataTeste; // Disponibiliza dataTeste em todas as rotas
    next();
  });

  function getCurrentDate(req) {
    // 1. Pega a data de teste (global ou query) ou data atual
    const dateInput = req?.dataTeste || req?.query?.dataTeste;
    const date = dateInput ? new Date(dateInput) : new Date();
    
    // 2. Ajusta para o fuso de SP (UTC-3) sem alterar o horário
    const offsetSP = -180; // -3 horas em minutos
    const adjustedDate = new Date(date.getTime() + (offsetSP - date.getTimezoneOffset()) * 60000);
    
    return adjustedDate;
  }

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'emailtccteste@gmail.com', 
      pass: 'fyerblpkbahmslfn',
    }
  });

function getSaoPauloDate(dateString = null) {
    // 1. Cria a data base
    const date = dateString ? new Date(dateString) : new Date();
    
    // 2. Formata para o fuso de SP
    return new Date(date.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
}

const getDateFromDayOfWeek = (dayOfWeek) => {
    const daysMap = {
        'segunda-feira': 1,
        'terça-feira': 2,
        'quarta-feira': 3,
        'quinta-feira': 4,
        'sexta-feira': 5
    };
    
    // Encontra a segunda-feira mais recente
    const today = new Date();
    const currentDay = today.getDay(); // 0=Domingo, 1=Segunda, etc.
    const lastMonday = new Date(today);
    
    // Se hoje não é segunda, volta para a última segunda
    if (currentDay !== 1) {
        lastMonday.setDate(today.getDate() - ((currentDay + 6) % 7));
    }
    
    // Zera as horas para evitar problemas com horário
    lastMonday.setHours(0, 0, 0, 0);
    
    const targetDay = daysMap[dayOfWeek.toLowerCase()];
    
    // Calcula a data do dia da semana desejado
    const resultDate = new Date(lastMonday);
    resultDate.setDate(lastMonday.getDate() + (targetDay - 1));
    
    return resultDate.toISOString().split('T')[0];
};

async function limparDadosSemanais() {
    const agora = new Date();
    const domingoPassado = new Date(agora);
    domingoPassado.setDate(agora.getDate() - 7);
    
    try {
        await Aluno.destroy({
            where: {
                createdAt: {
                    [Op.lt]: domingoPassado
                }
            }
        });
        console.log(`[${new Date().toISOString()}] Dados semanais antigos foram limpos`);
    } catch (error) {
        console.error('Erro ao limpar dados semanais:', error);
    }
}

// Limpeza de dados semanais
schedule.scheduleJob('59 23 * * 0', limparDadosSemanais);

// Rota para login
app.post('/login', async (req, res) => {
    const { usuario, senha } = req.body;

    try {
        // Busca o psicólogo no banco de dados
        const psicologo = await Psicologo.findOne({ where: { usuario, senha } });

        if (psicologo) {
            res.status(200).json({ success: true, message: 'Login realizado com sucesso!' });
        } else {
            res.status(401).json({ success: false, message: 'Usuário ou senha incorretos.' });
        }
    } catch (error) {
        console.error('Erro no servidor:', error);
        res.status(500).json({ success: false, message: 'Erro ao tentar fazer login.' });
    }
});

// Função auxiliar para formatar o nome do dia
const formatarDia = (dia) => {
    const mapDias = {
        "segunda": "Segunda-feira",
        "terça": "Terça-feira",
        "quarta": "Quarta-feira",
        "quinta": "Quinta-feira",
        "sexta": "Sexta-feira"
    };
    return mapDias[dia.toLowerCase()] || dia; // Retorna o dia formatado ou o original se não for encontrado
};

// Rota para salvar a configuração
app.post("/salvar-configuracao", async (req, res) => {
    try {
        const { mme, rt, online } = req.body;

        // Função para salvar os horários em uma tabela específica
        const salvarHorarios = async (tabela, dados) => {
            if (!dados) return; // Se não houver dados para essa modalidade, não faz nada

            await tabela.destroy({ where: {} }); // Limpa apenas a tabela da modalidade atual

            // Itera sobre os dias e horários e insere no banco de dados
            for (const dia in dados) {
                for (const horario of dados[dia]) {
                    await tabela.create({
                        diaSemana: formatarDia(dia), // Formata o nome do dia
                        horario,
                    });
                }
            }
        };

        // Salva os horários apenas para as modalidades que foram enviadas no corpo da requisição
        if (mme) await salvarHorarios(configuracaoMME, mme);
        if (rt) await salvarHorarios(configuracaoRT, rt);
        if (online) await salvarHorarios(configuracaoON, online);

        // Responde com sucesso
        return res.json({ success: true, message: "Configuração salva com sucesso!" });
    } catch (error) {
        console.error("Erro ao salvar configuração:", error);
        // Responde com erro
        return res.status(500).json({ success: false, message: "Erro ao salvar configuração" });
    }
});

// Rota para obter configuração
app.get("/obter-configuracao", async (req, res) => {
    try {
        // Função para buscar os horários de uma tabela específica e associá-los a uma unidade
        const obterHorarios = async (tabela, unidade) => {
            try {
                const horarios = await tabela.findAll();
                //console.log('Horários obtidos:', horarios);  // Verifique os dados aqui

                const horariosFormatados = horarios.reduce((acc, horario) => {
                    const diaSemana = formatarDia(horario.diaSemana); // Formata o nome do dia
                    if (!acc[diaSemana]) acc[diaSemana] = [];
                    acc[diaSemana].push({
                        horario: horario.horario,
                        bloqueado: horario.bloqueado
                    });
                    return acc;
                }, {});

                //console.log('Horários formatados:', horariosFormatados);  // Verifique os dados formatados
                return { [unidade]: horariosFormatados }; // Retorna os dados com o nome da unidade
            } catch (error) {
                console.error("Erro ao obter horários:", error);  // Adicionando log de erro
                throw error; // Repassando erro para o catch do endpoint
            }
        };

        // Buscar os dados das 3 tabelas
        const mamanguape = await obterHorarios(configuracaoMME, "Mamanguape");
        const rioTinto = await obterHorarios(configuracaoRT, "RioTinto");
        const online = await obterHorarios(configuracaoON, "online");

        // Combina os dados
        const data = { ...mamanguape, ...rioTinto, ...online };
        //console.log('Dados combinados:', data);  // Verifique os dados combinados

        // Responder com os dados formatados
        res.json(data);
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        res.status(500).json({ success: false, message: "Erro ao buscar configuração" });
    }
});

// Rota para verificar se a matrícula já existe
app.get('/verificar-matricula', async (req, res) => {
    try {
        const { matricula } = req.query;
        
        // Substitua isso pela sua lógica de consulta ao banco de dados
        const aluno = await Aluno.findOne({ where: { matricula } });
        
        res.json({ exists: !!aluno });
    } catch (error) {
        console.error('Erro ao verificar matrícula:', error);
        res.status(500).json({ message: 'Erro ao verificar matrícula' });
    }
});

app.post('/salvar-aluno', async (req, res) => {
    console.log('Dados recebidos:', req.body);

    // PRODUÇÃO:
    //const { name, email, telefone, curso, matricula, modality, day, time, location, dataTeste } = req.body;

    //TESTES:
    const dataTeste = '2025-04-07T09:00:00';
    const { name, email, telefone, curso, matricula, modality, day, time, location } = req.body;

    if (!name || !email || !telefone || !curso || !matricula || !modality || !day || !time) {
        console.error('Campos obrigatórios não fornecidos:', { name, email, telefone, curso, matricula, modality, day, time });
        return res.status(400).json({ success: false, message: 'Campos obrigatórios não fornecidos.' });
    }

    try {
        // Determina a data de criação
        let dataCriacao;
        
        if (dataTeste) {
            // Se dataTeste foi fornecida, tenta converter para Date
            const testDate = new Date(dataTeste);
            dataCriacao = isNaN(testDate.getTime()) ? new Date() : testDate;
        } else {
            // Se não foi fornecida, usa a data atual
            dataCriacao = new Date();
        }

        const aluno = await Aluno.create({
            name,
            email,
            telefone,
            curso,
            matricula,
            modalidade: modality,
            dia: day,
            horario: time, 
            unidade: location,
            createdAt: dataCriacao // Usa a data determinada acima
        });

        console.log('Aluno cadastrado com sucesso:', aluno); 
        res.status(201).json({ success: true, message: 'Aluno cadastrado com sucesso!', data: aluno });
    } catch (error) {
        console.error('Erro ao salvar aluno:', error);
        res.status(500).json({ success: false, message: 'Erro ao salvar aluno no banco de dados.' });
    }
});

app.get('/verificar-matricula-lista', async (req, res) => {
    try {
        const { matricula } = req.query;
        const aluno = await AlunoLista.findOne({ where: { matricula } });
        res.json({ exists: !!aluno });
    } catch (error) {
        console.error('Erro ao verificar matrícula:', error);
        res.status(500).json({ message: 'Erro ao verificar matrícula' });
    }
});
// Rota para salvar na lista de espera
app.post('/salvar-lista-espera', async (req, res) => {
    const dataTeste = '2025-04-07T09:00:00';
    const { name, email, telefone, curso, matricula, modality, day, time, location } = req.body;

    if (!name || !email || !telefone || !curso || !matricula || !modality || !day || !time) {
        console.error('Campos obrigatórios não fornecidos:', { name, email, telefone, curso, matricula, modality, day, time });
        return res.status(400).json({ success: false, message: 'Campos obrigatórios não fornecidos.' });
    }

    try {
        // Determina a data de criação
        let dataCriacao;
        
        if (dataTeste) {
            // Se dataTeste foi fornecida, tenta converter para Date
            const testDate = new Date(dataTeste);
            dataCriacao = isNaN(testDate.getTime()) ? new Date() : testDate;
        } else {
            // Se não foi fornecida, usa a data atual
            dataCriacao = new Date();
        }

        const aluno = await AlunoLista.create({
            name,
            email,
            telefone,
            curso,
            matricula,
            modalidade: modality,
            dia: day,
            horario: time, 
            unidade: location,
            createdAt: dataCriacao // Usa a data determinada acima
        });

        console.log('Aluno cadastrado com sucesso:', aluno); 
        res.status(201).json({ success: true, message: 'Aluno cadastrado com sucesso!', data: aluno });
    } catch (error) {
        console.error('Erro ao salvar aluno:', error);
        res.status(500).json({ success: false, message: 'Erro ao salvar aluno no banco de dados.' });
    }
});
// Rota para buscar todos os alunos
app.get('/alunos', async (req, res) => {
    try {
        const alunos = await Aluno.findAll({
            attributes: ['name', 'email', 'telefone', 'matricula', 'curso', 'createdAt', 'dia', 'horario', 'unidade'], // Seleciona os campos desejados
            order: [['createdAt', 'ASC']] // Ordena por data de cadastro
        });

        // Formata a data de cadastro para "dia/mês"
        const alunosFormatados = alunos.map(aluno => ({
            ...aluno.dataValues,
            diaCadastro: new Date(aluno.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        }));

        res.status(200).json(alunosFormatados);
    } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar alunos.' });
    }
});

app.get('/alunos-lista-espera', async (req, res) => {
    try {
        const {dia, horario, modalidade, unidade } = req.query;
        
        const whereClause = {};
        if (dia) whereClause.dia = dia;
        if (horario) whereClause.horario = horario;
        if (modalidade) whereClause.modalidade = modalidade;
        if (unidade) whereClause.unidade = unidade;

        console.log('Consultando AlunoLista com filtros:', whereClause);

        const alunos = await AlunoLista.findAll({
            attributes: [
                'name', 
                'email', 
                'telefone', 
                'matricula', 
                'curso', 
                'createdAt', 
                'dia', 
                'horario', 
                'unidade',
                'modalidade',
            ]
        });

        console.log(`Encontrados ${alunos.length} registros`);

        const alunosFormatados = alunos.map(aluno => ({
            ...aluno.dataValues,
            diaCadastro: new Date(aluno.createdAt).toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit',
                year: 'numeric'
            }),
            
        }));

        res.status(200).json(alunosFormatados);

    } catch (error) {
        console.error('Erro detalhado:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        res.status(500).json({ 
            success: false,
            message: 'Erro ao buscar alunos da lista de espera',
            error: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                stack: error.stack
            } : undefined
        });
    }
});

// Rota para filtrar alunos por unidade
app.get('/alunos-unidade', async (req, res) => {
    try {
        const { unidade } = req.query;

        if (!unidade) {
            return res.status(400).json({ 
                success: false, 
                message: 'Parâmetro "unidade" é obrigatório' 
            });
        }

        const whereClause = {};
        
        if (unidade === 'online') {
            whereClause.unidade = null;
            whereClause.modalidade = 'online';
        } else {
            whereClause.unidade = unidade;
            whereClause.modalidade = 'presencial';
        }

        const alunos = await Aluno.findAll({
            attributes: ['name', 'email', 'telefone', 'matricula', 'curso', 'horario', 'createdAt', 'dia'],
            where: whereClause,
            order: [['dia', 'ASC'], ['horario', 'ASC']]
        });

        const alunosPorData = {};

        const diasParaDeslocamento = {
            'Segunda-feira': 0,
            'Terça-feira': 1,
            'Quarta-feira': 2,
            'Quinta-feira': 3,
            'Sexta-feira': 4
        };

        for (const aluno of alunos) {
            // Usa a data de criação (createdAt) como referência
            const dataReferencia = aluno.createdAt ? new Date(aluno.createdAt) : new Date();
            dataReferencia.setHours(0, 0, 0, 0); // Normaliza a hora
            
            const deslocamento = diasParaDeslocamento[aluno.dia] ?? 0;
            
            // Calcula a data real do agendamento
            const dataAgendamento = new Date(dataReferencia);
            dataAgendamento.setDate(dataReferencia.getDate() + deslocamento);
            
            // Formatação da data
            const dataFormatada = dataAgendamento.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                timeZone: 'America/Sao_Paulo'
            })

            if (!alunosPorData[dataFormatada]) {
                alunosPorData[dataFormatada] = [];
            }
            
            alunosPorData[dataFormatada].push({
                ...aluno.dataValues,
                diaCadastro: dataReferencia.toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit',
                    timeZone: 'America/Sao_Paulo'
                }),
                diaSemana: aluno.dia,
                // Adiciona a data completa para referência (opcional)
                dataAgendamentoCompleta: dataAgendamento.toISOString()
            });
        }

        res.status(200).json(alunosPorData);

    } catch (error) {
        console.error('Erro ao buscar alunos por unidade:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar alunos por unidade',
            error: error.message 
        });
    }
});

// Rota para obter horários ocupados por dia e unidade
app.get('/horarios-ocupados', async (req, res) => {
    try {
        const { dia, unidade } = req.query;
        
        if (!dia || !unidade) {
            return res.status(400).json({ 
                success: false, 
                message: 'Parâmetros "dia" e "unidade" são obrigatórios' 
            });
        }

        // Define as condições de filtro
        const whereClause = {
            dia: dia
        };
        
        if (unidade === 'online') {
            whereClause.unidade = null;
            whereClause.modalidade = 'online';
        } else {
            whereClause.unidade = unidade;
            whereClause.modalidade = 'presencial';
        }

        const alunos = await Aluno.findAll({
            attributes: ['horario'],
            where: whereClause
        });

        // Extrai apenas os horários ocupados
        const horariosOcupados = alunos.map(aluno => aluno.horario);

        res.status(200).json({ 
            success: true, 
            horariosOcupados 
        });

    } catch (error) {
        console.error('Erro ao buscar horários ocupados:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar horários ocupados' 
        });
    }
});

app.get('/horarios-indisponiveis', async (req, res) => {
    try {
        const { dia, unidade } = req.query;
        
        if (!dia || !unidade) {
            return res.status(400).json({ 
                success: false, 
                message: 'Parâmetros "dia" e "unidade" são obrigatórios' 
            });
        }

        // Determina qual tabela usar
        const tabelaConfig = unidade === 'RioTinto' ? configuracaoRT : 
                           unidade === 'Mamanguape' ? configuracaoMME : 
                           configuracaoON;

        // 1. Busca horários ocupados por alunos
        const alunos = await Aluno.findAll({
            attributes: ['horario'],
            where: {
                dia: dia,
                ...(unidade === 'online' ? {
                    unidade: null,
                    modalidade: 'online'
                } : {
                    unidade: unidade,
                    modalidade: 'presencial'
                })
            }
        });

        // 2. Busca horários bloqueados na tabela de configuração
        const bloqueados = await tabelaConfig.findAll({
            attributes: ['horario'],
            where: { 
                diaSemana: dia,
                bloqueado: true
            }
        });

        // Combina ambos os resultados
        const horariosIndisponiveis = [
            ...alunos.map(a => a.horario),
            ...bloqueados.map(b => b.horario)
        ];

        res.status(200).json({ 
            success: true, 
            horariosIndisponiveis: [...new Set(horariosIndisponiveis)] // Remove duplicatas
        });

    } catch (error) {
        console.error('Erro ao buscar horários indisponíveis:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar horários indisponíveis',
            error: error.message
        });
    }
});

app.post('/toggle-bloqueio-horario', async (req, res) => {
    try {
        const { horario, dia, unidade, data } = req.body;
        
        // Determina qual tabela usar baseado na unidade
        const tabelaConfig = unidade === 'RioTinto' ? configuracaoRT : 
                           unidade === 'Mamanguape' ? configuracaoMME : 
                           configuracaoON;

        // Verifica se o horário já existe
        const horarioExistente = await tabelaConfig.findOne({
            where: {
                diaSemana: dia,
                horario: horario
            }
        });

        if (horarioExistente) {
            // Alterna o status de bloqueio
            await tabelaConfig.update(
                { bloqueado: !horarioExistente.bloqueado },
                { where: { id: horarioExistente.id } }
            );
        } else {
            // Cria novo registro com bloqueio ativado
            await tabelaConfig.create({
                diaSemana: dia,
                horario: horario,
                bloqueado: true
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Status de bloqueio atualizado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao alternar bloqueio:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao alternar bloqueio',
            error: error.message
        });
    }
});

app.get('/api/download/weekly', async (req, res) => {
    try {
        const agora = new Date();
        const segundaFeira = new Date(agora);
        
        // Encontrar a última segunda-feira às 9h
        segundaFeira.setDate(agora.getDate() - (agora.getDay() + 6) % 7);
        segundaFeira.setHours(9, 0, 0, 0);
        
        const alunos = await Aluno.findAll({
            where: {
                createdAt: {
                    [Op.gte]: segundaFeira
                }
            }
        });
        
        const formatarData = (data) => {
            const dia = String(data.getDate()).padStart(2, '0');
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const ano = data.getFullYear();
            return `${dia}-${mes}-${ano}`;
        }

        const nomePlanilha = `Usuários da Semana ${formatarData(segundaFeira)} a ${formatarData(agora)}`;
        
        const workbook = await generateExcel(alunos, nomePlanilha);
        await sendExcel(res, workbook, `usuarios_semana_${segundaFeira.toISOString().split('T')[0]}.xlsx`);
   
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao gerar relatório semanal');
    }
});

// Rota para baixar alunos do mês
app.get('/api/download/monthly', async (req, res) => {
    try {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        const alunos = await Aluno.findAll({
            where: {
                createdAt: {
                    [Op.gte]: oneMonthAgo
                }
            }
        });
        
        const workbook = await generateExcel(alunos, 'Usuários do Mês');
        await sendExcel(res, workbook, 'usuarios_mes.xlsx');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao gerar relatório mensal');
    }
});

// Rota para baixar todos os alunos
app.get('/api/download/all', async (req, res) => {
    try {
        const alunos = await Aluno.findAll();
        const workbook = await generateExcel(alunos, 'Todos os Usuários');
        await sendExcel(res, workbook, 'todos_usuarios.xlsx');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao gerar relatório completo');
    }
});

// Função auxiliar para gerar o Excel
async function generateExcel(alunos, title) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(title);
    
    // Cabeçalhos
    worksheet.columns = [
        { header: 'Nome', key: 'name', width: 30 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Telefone', key: 'telefone', width: 20 },
        { header: 'Curso', key: 'curso', width: 30 },
        { header: 'Matrícula', key: 'matricula', width: 15 },
        { header: 'Modalidade', key: 'modalidade', width: 15 },
        { header: 'Dia', key: 'dia', width: 15 },
        { header: 'Horário', key: 'horario', width: 15 },
        { header: 'Unidade', key: 'unidade', width: 20 },
        { header: 'Data Cadastro', key: 'createdAt', width: 20 }
    ];
    
    // Adicionar dados
    alunos.forEach(aluno => {
        worksheet.addRow({
            name: aluno.name,
            email: aluno.email,
            telefone: aluno.telefone,
            curso: aluno.curso,
            matricula: aluno.matricula,
            modalidade: aluno.modalidade,
            dia: aluno.dia,
            horario: aluno.horario,
            unidade: aluno.unidade,
            createdAt: aluno.createdAt.toLocaleString()
        });
    });
    
    return workbook;
}

// Função auxiliar para enviar o Excel
async function sendExcel(res, workbook, filename) {
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        `attachment; filename=${filename}`
    );
    
    await workbook.xlsx.write(res);
    res.end();
}

app.use('/api/cadastro', async (req, res, next) => {
    try {
        const agora = new Date();
        const diaSemana = agora.getDay(); // 0=Domingo, 1=Segunda...
        const hora = agora.getHours();
        const minutos = agora.getMinutes();

        // Verifica se é segunda-feira entre 9h e 23h59
        const isSegundaValida = diaSemana === 1 && hora >= 9 && (hora < 23 || (hora === 23 && minutos <= 59));

        if (!isSegundaValida) {
            return res.status(403).json({
                redirect: '/off',
                motivo: 'fora_do_periodo',
                message: 'Cadastro permitido apenas na segunda-feira das 9h às 23h59'
            });
        }

        const configuracao = await getConfiguracaoCompleta();
        const horariosOcupados = await getHorariosOcupadosSemana();
        const disponibilidade = calcularDisponibilidade(configuracao, horariosOcupados);

        if (disponibilidade.totalVagasDisponiveis <= 0) {
            return res.status(403).json({
                redirect: '/off',
                motivo: 'vagas_esgotadas',
                message: 'Todas as vagas disponíveis já foram preenchidas'
            });
        }

        next();
    } catch (error) {
        console.error('Erro no middleware de cadastro:', error);
        res.status(500).json({ 
            error: 'Erro interno ao verificar disponibilidade',
            redirect: '/off'
        });
    }
});

function calcularDisponibilidade(config, ocupados) {
    const diasDaSemana = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"];
    const unidades = {
        mme: "Mamanguape",
        rt: "RioTinto",
        online: "online"
    };

    let totalVagasDisponiveis = 0;
    const detalhesDisponibilidade = {};

    // Para cada modalidade (mme, rt, online)
    Object.entries(config).forEach(([modalidade, horariosConfig]) => {
        const nomeUnidade = unidades[modalidade];
        detalhesDisponibilidade[nomeUnidade] = {};

        // Para cada dia da semana
        diasDaSemana.forEach(dia => {
            // Filtra horários configurados para este dia (não bloqueados)
            const horariosConfigDia = horariosConfig.filter(h => 
                h.diaSemana === dia && 
                h.bloqueado === false
            ).map(h => h.horario);

            // Filtra horários ocupados para esta unidade/dia
            const horariosOcupadosDia = ocupados.filter(o => 
                o.dia === dia && 
                (modalidade === 'online' ? 
                    o.modalidade === 'online' : 
                    o.unidade === nomeUnidade)
            ).map(o => o.horario);

            // Remove horários ocupados dos configurados
            const horariosDisponiveis = horariosConfigDia.filter(
                h => !horariosOcupadosDia.includes(h)
            );

            detalhesDisponibilidade[nomeUnidade][dia] = {
                vagasDisponiveis: horariosDisponiveis.length,
                horariosDisponiveis: horariosDisponiveis,
                totalVagasDia: horariosConfigDia.length,
                vagasOcupadasDia: horariosOcupadosDia.length
            };

            totalVagasDisponiveis += horariosDisponiveis.length;
        });
    });

    return {
        totalVagasDisponiveis,
        detalhesDisponibilidade,
        todasVagasPreenchidas: totalVagasDisponiveis === 0 && 
            Object.values(config).some(c => c.length > 0) // Verifica se há alguma configuração
    };
}

app.get('/api/verificar-disponibilidade', async (req, res) => {
    try {
        const agora = getSaoPauloDate(req.dataTeste || req.query.dataTeste);
        
        console.log(`[Verificação] Data SP: ${agora.toLocaleString('pt-BR')}`);
        console.log(`ISO String: ${agora.toISOString()}`);

        const diaSemana = agora.getDay();
        const hora = agora.getHours();
        const minutos = agora.getMinutes();

        const isSegundaValida = (
            diaSemana === 1 && 
            ((hora > 9) || (hora === 9 && minutos >= 0)) && 
            ((hora < 23) || (hora === 23 && minutos <= 59))
        );

        if (!isSegundaValida) {
            const response = { 
                disponivel: false,
                motivo: 'fora_do_periodo',
                message: 'Cadastro permitido apenas na segunda-feira das 9h às 23h59',
                proximaDisponibilidade: getProximaDisponibilidade(),
                dataUsada: agora.toISOString('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                    hour12: false
                }) ,
                //dataUTC: agora.toISOString()
            };
            //console.log('Fora do período:', response);
            return res.json(response);
        }

        const configuracao = await getConfiguracaoCompleta();
        const horariosOcupados = await getHorariosOcupadosSemana();
        const disponibilidade = calcularDisponibilidade(configuracao, horariosOcupados);

        if (disponibilidade.totalVagasDisponiveis <= 0) {
            const response = {
                disponivel: false,
                motivo: 'vagas_esgotadas',
                message: 'Todas as vagas disponíveis já foram preenchidas',
                proximaDisponibilidade: getProximaDisponibilidade(),
                dataUsada: agora.toISOString() // Adicionado para debug
            };
            console.log('Vagas esgotadas:', response);
            return res.json(response);
        }

        const response = {
            disponivel: true,
            motivo: null,
            message: 'Cadastro disponível',
            dataUsada: agora.toISOString(), // Adicionado para debug
            ...disponibilidade
        };
        console.log('Disponível:', response);
        res.json(response);

    } catch (error) {
        console.error('Erro na verificação:', {
            error: error.message,
            stack: error.stack,
            dataRequisicao: req.dataTeste || 'N/A'
        });
        res.status(500).json({
            disponivel: false,
            motivo: 'erro_servidor',
            message: 'Erro ao verificar disponibilidade',
            detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Função auxiliar para calcular quando será a próxima disponibilidade
function getProximaDisponibilidade() {
    const agora = new Date();
    const diaSemana = agora.getDay();
    const hora = agora.getHours();
    
    // Se já for segunda mas antes das 9h
    if (diaSemana === 1 && hora < 9) {
        return {
            dia: 'hoje',
            horario: 'a partir das 9h'
        };
    }
    
    // Calcula quantos dias faltam para a próxima segunda
    const diasParaProximaSegunda = diaSemana === 0 ? 1 : (8 - diaSemana) % 7;
    const proximaSegunda = new Date(agora);
    proximaSegunda.setDate(agora.getDate() + diasParaProximaSegunda);
    proximaSegunda.setHours(9, 0, 0, 0);
    
    return {
        dia: diasParaProximaSegunda === 1 ? 'amanhã' : `dia ${proximaSegunda.getDate()}`,
        horario: 'das 9h às 23h59'
    };
}

// Funções auxiliares
async function getConfiguracaoCompleta() {
    const [mme, rt, online] = await Promise.all([
        configuracaoMME.findAll(),
        configuracaoRT.findAll(),
        configuracaoON.findAll()
    ]);
    
    return { mme, rt, online };
}

function getInicioSemanaAtual() {
    const agora = new Date();
    const inicioSemana = new Date(agora);
    
    const diasParaSubtrair = agora.getDay() === 0 ? 6 : agora.getDay() - 1;
    inicioSemana.setDate(agora.getDate() - diasParaSubtrair);
    
    // Zera horas, minutos, segundos e milissegundos
    inicioSemana.setHours(0, 0, 0, 0);
    
    return inicioSemana;
}

async function getHorariosOcupadosSemana() {
    const inicioSemana = getInicioSemanaAtual();
    
    const horariosOcupados = await Aluno.findAll({
        where: {
            createdAt: {
                [Op.gte]: inicioSemana
            }
        },
        attributes: ['dia', 'horario', 'unidade', 'modalidade']
    });
    
    return horariosOcupados;
}

app.post('/enviar-email', async (req, res) => {
    try {
        const { email, subject, html } = req.body;
        
        if (!email || !subject || !html) {
            return res.status(400).json({ 
                success: false,
                message: 'Dados incompletos para envio de e-mail'
            });
        }

        const mailOptions = {
            from: 'Agenda Teste <emailtccteste@gmail.com>',
            to: email,
            subject: subject,
            html: html,
            headers: { 
                'X-Mailer': 'NodeMailer',
            }
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('E-mail enviado:', info.messageId, 'para:', email);

        res.status(200).json({ 
            success: true,
            messageId: info.messageId 
        });
    } catch (error) {
        console.error('Erro ao enviar e-mail:', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        res.status(500).json({ 
            success: false,
            message: 'Erro ao enviar e-mail',
            error: error.message 
        });
    }
});

const unidadesNotificadas = {
    lotadas : new Set(),
    remanescentes: new Set()
};

async function verificarVagasEEnviarEmail() {
    try {
        const agora = getSaoPauloDate(dataTeste);
        const diaSemana = agora.getDay();
        const inicioSemana = getInicioSemanaAtual();
        const chaveSemana = inicioSemana.toISOString().split('T')[0];

        const configuracao = await getConfiguracaoCompleta();
        const horariosOcupados = await getHorariosOcupadosSemana();
        const { detalhesDisponibilidade } = calcularDisponibilidade(configuracao, horariosOcupados);

        for (const [unidade, dias] of Object.entries(detalhesDisponibilidade || {})) {
            const chaveUnidade = `${unidade}-${chaveSemana}`;
            
            const alunos = await Aluno.findAll({
                where: {
                    unidade: unidade === 'online' ? null : unidade,
                    createdAt: { [Op.gte]: inicioSemana }
                },
                order: [['dia', 'ASC'], ['horario', 'ASC']]
            });

            if (alunos.length === 0) continue;

            const totalVagas = Object.values(dias).reduce((sum, dia) => sum + dia.totalVagasDia, 0);
            const vagasOcupadas = Object.values(dias).reduce((sum, dia) => sum + dia.vagasOcupadasDia, 0);
            const lotado = (totalVagas > 0 && vagasOcupadas >= totalVagas);

            // Verificação para lotação imediata (qualquer dia da semana)
            if (lotado && !unidadesNotificadas.lotadas.has(chaveUnidade)) {
                await enviarEmailUnidade(unidade, alunos, dias, true);
                unidadesNotificadas.lotadas.add(chaveUnidade);
            }
            
            // Verificação para vagas remanescentes (apenas terça-feira em diante)
            if (diaSemana >= 2 && !lotado && !unidadesNotificadas.remanescentes.has(chaveUnidade)) {
                await enviarEmailUnidade(unidade, alunos, dias, false);
                unidadesNotificadas.remanescentes.add(chaveUnidade);
            }
        }
    } catch (error) {
        console.error('Erro na verificação:', error);
    }
}

async function enviarEmailUnidade(unidade, alunos, dias, todasVagasPreenchidas) {
    // Calcula estatísticas
    const totalVagas = Object.values(dias).reduce((sum, dia) => sum + dia.totalVagasDia, 0);
    const vagasOcupadas = Object.values(dias).reduce((sum, dia) => sum + dia.vagasOcupadasDia, 0);

    // Template para vagas LOTADAS
    if (todasVagasPreenchidas) {
        const assunto = `[INFOS] Vagas Lotadas - ${unidade}`;
        
        let emailContent = `
            <p>Todas as vagas para os atendimentos foram preenchidas! Abaixo segue a lista de alunos cadastrados para a semana e suas respectivas informações:</p>
            <table border="1" cellpadding="5" cellspacing="0" style="width:100%">
                <thead>
                    <tr>
                        <th>Dia</th>
                        <th>Horário</th>
                        <th>Nome</th>
                        <th>Matrícula</th>
                        <th>Curso</th>
                        <th>Contato</th>
                    </tr>
                </thead>
                <tbody>
        `;

        alunos.forEach(aluno => {
            emailContent += `
                <tr>
                    <td>${aluno.dia}</td>
                    <td>${aluno.horario}</td>
                    <td>${aluno.name}</td>
                    <td>${aluno.matricula}</td>
                    <td>${aluno.curso}</td>
                    <td>${aluno.email}</td>
                </tr>
            `;
        });

        emailContent += `
                </tbody>
            </table>
            <p><strong>Total de agendamentos:</strong> ${vagasOcupadas}/${totalVagas}</p>
            <p><em>E-mail enviado automaticamente pelo sistema</em></p>
        `;

        await transporter.sendMail({
            from: 'Sistema de Agendamento <emailtccteste@gmail.com>',
            to: 'emailtccteste@gmail.com',
            subject: assunto,
            html: emailContent
        });
    } 
    // Template para vagas REMANESCENTES
    else {
        const assunto = `[INFOS] Vagas Preenchidas - ${unidade}`;
        
        let emailContent = `
            <p>Alguns horários de atendimento ainda estão disponíveis nesta semana. Abaixo segue a lista de alunos cadastrados com suas respectivas informações e os horários que permanecem livres:</p>
            
            <h4>Alunos Agendados</h4>
            <table border="1" cellpadding="5" cellspacing="0" style="width:100%">
                <thead>
                    <tr>
                        <th>Dia</th>
                        <th>Horário</th>
                        <th>Nome</th>
                        <th>Matrícula</th>
                        <th>Curso</th>
                        <th>Contato</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Lista de alunos agendados
        alunos.forEach(aluno => {
            emailContent += `
                <tr>
                    <td>${aluno.dia}</td>
                    <td>${aluno.horario}</td>
                    <td>${aluno.name}</td>
                    <td>${aluno.matricula}</td>
                    <td>${aluno.curso}</td>
                    <td>${aluno.email}</td>
                </tr>
            `;
        });

        emailContent += `
                </tbody>
            </table>
            
            <h4>Horários Disponíveis</h4>
            <table border="1" cellpadding="5" cellspacing="0" style="width:100%">
                <thead>
                    <tr>
                        <th>Dia</th>
                        <th>Horário</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Lista de horários disponíveis
        for (const [dia, info] of Object.entries(dias)) {
            info.horariosDisponiveis.forEach(horario => {
                emailContent += `
                    <tr>
                        <td>${dia}</td>
                        <td>${horario}</td>
                        <td>Disponível</td>
                    </tr>
                `;
            });
        }

        emailContent += `
                </tbody>
            </table>
            <p><strong>Vagas disponíveis:</strong> ${totalVagas - vagasOcupadas}</p>
            <p><em>E-mail enviado automaticamente pelo sistema</em></p>
        `;

        await transporter.sendMail({
            from: 'Sistema de Agendamento <emailtccteste@gmail.com>',
            to: 'emailtccteste@gmail.com',
            subject: assunto,
            html: emailContent
        });
    }
}

async function ListaDeEsperaEmail() {
    try {
        console.log('Iniciando envio do e-mail da lista de espera...');
        
        // 1. Obter todos os alunos da lista de espera
        const alunos = await AlunoLista.findAll({
            order: [
                ['dia', 'ASC'],
                ['horario', 'ASC']
            ]
        });

        console.log(`Total de alunos encontrados: ${alunos.length}`);

        // 2. Se não houver alunos, não envia e-mail
        if (alunos.length === 0) {
            console.log('Nenhum aluno na lista de espera. E-mail não enviado.');
            return { success: false, message: 'Nenhum aluno na lista de espera' };
        }

        // 3. Criar o conteúdo HTML do e-mail
        const emailContent = `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; }
                    h1 { color:rgb(0, 0, 0); }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th { background-color: #008584; color: white; padding: 10px; text-align: left; }
                    td { padding: 8px; border-bottom: 1px solid #ddd; }
                    tr:nth-child(even) { background-color: #f2f2f2; }
                    .footer { margin-top: 20px; font-size: 0.9em; color: #7f8c8d; }
                </style>
            </head>
            <body>
                <h1>📋 Lista de Espera - Atendimento Psicológico</h1>
                <p>Segue a lista atualizada de alunos aguardando atendimento:</p>
                
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Dia</th>
                            <th>Horário</th>
                            <th>Unidade</th>
                            <th>Contato</th>
                            <th>Matrícula</th>
                            <th>Curso</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${alunos.map(aluno => `
                            <tr>
                                <td>${aluno.name}</td>
                                <td>${aluno.dia}</td>
                                <td>${aluno.horario}</td>
                                <td>${aluno.unidade || 'Online'}</td>
                                <td>
                                    ${aluno.email}<br>
                                    ${aluno.telefone}
                                </td>
                                <td>${aluno.matricula}</td>
                                <td>${aluno.curso}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    <p>Total de alunos na lista de espera: <strong>${alunos.length}</strong></p>
                    <p>Este e-mail é enviado automaticamente toda terça-feira às 00:00.</p>
                </div>
            </body>
            </html>
        `;

        // 4. Configurar o e-mail
        const mailOptions = {
            from: 'Sistema de Agendamento <emailtccteste@gmail.com>',
            to: 'emailtccteste@gmail.com',
            subject: `Lista de Espera - ${new Date().toLocaleDateString('pt-BR')}`,
            html: emailContent
        };

        // 5. Enviar o e-mail
        const info = await transporter.sendMail(mailOptions);
        console.log(`E-mail enviado com sucesso: ${info.messageId}`);
        
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('Erro ao enviar e-mail da lista de espera:', {
            message: error.message,
            stack: error.stack
        });
        return { success: false, error: error.message };
    }
}

const formsAberto = schedule.scheduleJob('*/2 * * * *', async () => {
    const agora = getSaoPauloDate(dataTeste);
    console.log(`[Job] Verificando em: ${agora.toLocaleString('pt-BR')}`);
    
    await verificarVagasEEnviarEmail();
    await ListaDeEsperaEmail()
});

app.get('/enviar-lista-espera', async (req, res) => {
    try {
        await ListaDeEsperaEmail();
        res.json({ success: true, message: 'E-mail da lista de espera enviado' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const formsFechado = schedule.scheduleJob('0 0-2 * * 2', async () => {
    const agora = getSaoPauloDate();
    if (agora.getDay() >= 2) { 
        console.log(`Verificando pós-fechamento em: ${agora.toLocaleString('pt-BR')}`);
        await verificarVagasEEnviarEmail();
    }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor pronto na porta ${PORT}`);
}).on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.log('Servidor não iniciado localmente - Modo desenvolvimento Vercel');
  } else {
    console.error('Erro no servidor:', err);
  }
});
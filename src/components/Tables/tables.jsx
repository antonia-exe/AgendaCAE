import * as React from 'react';
import { useEffect, useState } from 'react';
import './tables.css';
import getEmailTemplate from '../SendEmail/sendEmail';

import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { FaCheck, FaLock, FaLockOpen } from 'react-icons/fa';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#6CA5A9',
    padding: '12px',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    padding: '12px',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.bloqueado': {
    backgroundColor: '#BABABA',
    '&:hover': {
      backgroundColor: '#A0A0A0',
    }
  }
}));

export default function CustomizedTables({ unidade }) {
  const [agendamentosPorData, setAgendamentosPorData] = useState({});
  const [configHorarios, setConfigHorarios] = useState({});
  const [loadingEmails, setLoadingEmails] = useState({});

  const enviarEmail = async (aluno, dataAgendamento) => {
    if (loadingEmails[aluno.email]) return;
    
    try {
      setLoadingEmails(prev => ({ ...prev, [aluno.email]: true }));
      
      const emailContent = getEmailTemplate({
        nome: aluno.name,
        curso: aluno.curso,
        horario: aluno.horario,
        data: dataAgendamento
      });

      const response = await fetch('http://localhost:5000/enviar-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: aluno.email,
          subject: emailContent.subject,
          html: emailContent.html
        }),
      });

      if (!response.ok) throw new Error(response.statusText || 'Erro ao enviar e-mail');
      
      alert(`E-mail enviado para ${aluno.email}`);
    } catch (error) {
      console.error('Erro no envio:', error);
      alert(`Falha ao enviar e-mail: ${error.message}`);
    } finally {
      setLoadingEmails(prev => ({ ...prev, [aluno.email]: false }));
    }
  };

  const fetchDados = async (unidade) => {
    try {
      const [alunosRes, configRes] = await Promise.all([
        fetch(`http://localhost:5000/alunos-unidade?unidade=${unidade}`),
        fetch('http://localhost:5000/obter-configuracao')
      ]);
      
      const alunosData = await alunosRes.json();
      const configData = await configRes.json();
      
      setConfigHorarios(configData);
      setAgendamentosPorData(alunosData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const toggleBloqueioHorario = async (horario, dia, dataFormatada) => {
    try {
      const response = await fetch('http://localhost:5000/toggle-bloqueio-horario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          horario,
          dia,
          unidade,
          data: dataFormatada
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchDados(unidade);
      } else {
        console.error('Erro ao alternar bloqueio:', data.message);
      }
    } catch (error) {
      console.error('Erro ao alternar bloqueio:', error);
    }
  };

  const isHorarioBloqueado = (horario, dia) => {
    const configKey = unidade === 'online' ? 'online' : unidade;
    const horariosDia = configHorarios[configKey]?.[dia] || [];
    
    const horarioObj = Array.isArray(horariosDia) 
      ? horariosDia.find(h => h.horario === horario)
      : null;
    
    return horarioObj ? horarioObj.bloqueado === true : false;
  };

  useEffect(() => {
    if (unidade) {
      fetchDados(unidade);
    }
  }, [unidade]);

  const gerarEstruturaCompleta = () => {
    const resultado = {};
    const configKey = unidade === 'online' ? 'online' : unidade;
    const horariosPorDia = configHorarios[configKey] || {};
  
    // Se não houver agendamentos, cria uma estrutura vazia para a data atual
    const datasExistentes = Object.keys(agendamentosPorData);
    const dataPadrao = datasExistentes.length > 0 ? datasExistentes[0] : formatarDataAtual();
  
    // Processa cada dia da semana configurado
    Object.entries(horariosPorDia).forEach(([dia, horarios]) => {
      // Encontra a data correspondente ou usa a padrão
      const dataFormatada = datasExistentes.find(data => 
        agendamentosPorData[data].some(item => item.dia === dia)
      ) || dataPadrao;
  
      if (!resultado[dataFormatada]) {
        resultado[dataFormatada] = [];
      }
  
      // Adiciona todos os horários configurados para o dia
      if (Array.isArray(horarios)) {
        horarios.forEach(horarioObj => {
          const horario = horarioObj.horario;
          
          // Verifica se já existe um aluno neste horário
          const alunoExistente = agendamentosPorData[dataFormatada]?.find(
            item => item.horario === horario && item.dia === dia
          );
  
          if (alunoExistente) {
            resultado[dataFormatada].push(alunoExistente);
          } else {
            resultado[dataFormatada].push({
              horario,
              dia,
              vazio: true,
              dataFormatada,
              bloqueado: horarioObj.bloqueado === true
            });
          }
        });
      }
    });
  
    // Ordena os horários
    Object.keys(resultado).forEach(data => {
      resultado[data].sort((a, b) => a.horario.localeCompare(b.horario));
    });
  
    return resultado;
  };

  const formatarDataAtual = () => {
    const hoje = new Date();
    return hoje.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      timeZone: 'America/Sao_Paulo'
    })
  };

  const estruturaCompleta = gerarEstruturaCompleta();
  const datas = Object.keys(estruturaCompleta).sort();

  return (
    <div className="table-container">
      {datas.length > 0 ? (
        datas.map((data) => (
          <Box key={data} sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ 
              mb: 2,
              textAlign: 'left',
              fontWeight: 'bold',
              color: '#000',
              fontFamily: 'var(--font-family)'
            }}>
              Agenda para o dia {data}
            </Typography>
            
            <TableContainer component={Paper} sx={{ maxWidth: 1300, margin: '0 auto', width: '100%' }}>
              <Table sx={{ width: '100%' }} aria-label="customized table">
                <TableHead>
                  <TableRow className='tables-title'>
                    <StyledTableCell>HORÁRIO</StyledTableCell>
                    <StyledTableCell>NOME</StyledTableCell>
                    <StyledTableCell>EMAIL</StyledTableCell>
                    <StyledTableCell>TELEFONE</StyledTableCell>
                    <StyledTableCell>MATRÍCULA</StyledTableCell>
                    <StyledTableCell>CURSO</StyledTableCell>
                    <StyledTableCell>CADASTRO</StyledTableCell>
                    <StyledTableCell>AÇÕES</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {estruturaCompleta[data].map((row, index) => (
                    <StyledTableRow 
                      key={`${data}-${row.horario}-${index}`} 
                      className={`tables-body ${row.bloqueado ? 'bloqueado' : ''}`}
                    >
                      <StyledTableCell>{row.horario}</StyledTableCell>
                      <StyledTableCell>{row.vazio ? '-' : row.name}</StyledTableCell>
                      <StyledTableCell>{row.vazio ? '-' : row.email}</StyledTableCell>
                      <StyledTableCell>{row.vazio ? '-' : row.telefone}</StyledTableCell>
                      <StyledTableCell>{row.vazio ? '-' : row.matricula}</StyledTableCell>
                      <StyledTableCell>{row.vazio ? '-' : row.curso}</StyledTableCell>
                      <StyledTableCell>
                        {row.vazio ? '-' : (
                          new Date(row.createdAt).toLocaleDateString('pt-BR', { 
                            day: '2-digit', 
                            month: 'long',
                            timeZone: 'America/Sao_Paulo'
                          })
                        )}
                      </StyledTableCell>
                      <StyledTableCell>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button 
                            className='button-tables edit' 
                            variant="text" 
                            size="small"
                            disabled={row.vazio}
                            onClick={() => enviarEmail(row, data)}
                          >
                            <FaCheck style={{ fontSize: '18px' }} />
                          </Button>
                          
                          <Button 
                            className='button-tables lock' 
                            variant="contained" 
                            size="small"
                            disabled={!row.vazio}
                            onClick={() => toggleBloqueioHorario(row.horario, row.dia, data)}
                          >
                            {row.bloqueado ? (
                              <FaLockOpen style={{ fontSize: '18px' }} />
                            ) : (
                              <FaLock style={{ fontSize: '18px' }} />
                            )}
                          </Button>
                        </div>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))
      ) : (
        <Typography variant="h6" className='typography-custom'>
          {unidade ? 'Nenhum agendamento encontrado' : 'Selecione uma unidade'}
        </Typography>
      )}
    </div>
  );
}
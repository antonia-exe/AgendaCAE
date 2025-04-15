import React from "react";

const getEmailTemplate = (aluno) => {
  // DEBUG - Mostra TODOS os campos recebidos
  console.log('DADOS COMPLETOS DO ALUNO RECEBIDOS:', aluno);

  const nome = aluno.nome;
  const unidade = aluno.unidade;
  const dia = aluno.data;
  const horario = aluno.horario; 

  const unidadeNormalizada = unidade 
    ? unidade.toString()
              .toLowerCase()
              .trim()
              .replace(/\s+/g, '')
              .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    : null;


  const unidadesPresenciais = ["mamanguape", "riotinto"];
  const isPresencial = unidadeNormalizada 
    ? unidadesPresenciais.some(u => unidadeNormalizada.includes(u))
    : false;


  return {
    subject: "[AGENDA CAES] - Confirmação de Agendamento",
    html: `
        <h2>Confirmação de Agendamento</h2>
        <p>Prezado(a) ${nome},</p>
        <p>Seu agendamento foi confirmado com sucesso:</p>
        
        <p><strong>📅 Data:</strong> ${dia}</p>
        <p><strong>⏰ Horário:</strong> ${horario}</p>
        <p><strong>📌 Modalidade:</strong> ${isPresencial ? 'Presencial' : 'Online'}</p>
            
        ${isPresencial 
            ? `<p><strong>🏢 Unidade:</strong> ${unidade}</p>`
            : `<p style="margin-top: 8px; font-size: 0.9em; color: #555;">
                🔗 Link do Google Meet será enviado 30 minutos antes
               </p>`
        }
        
        <p>Caso precise alterar, entre em contato com antecedência.</p>
        
        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 0.9em; color: #666;">
          <p>Atenciosamente,</p>
          <p><strong>Agenda CAES</strong></p>
        </div>
    `
  };
};

export default getEmailTemplate;
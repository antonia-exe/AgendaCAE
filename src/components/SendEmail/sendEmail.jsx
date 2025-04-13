import React from "react";

const getEmailTemplate = (alunoData) => {
  // Normaliza a unidade para comparação (case insensitive e sem espaços)
  const unidadeNormalizada = alunoData.unidade 
    ? alunoData.unidade.toLowerCase().trim() 
    : null;
  
  const isPresencial = ["Mamanguape", "RioTinto"].includes(unidadeNormalizada);

  return {
    subject: "[AGENDA CAES] - Confirmação de Agendamento",
    html: `
        <!-- Cabeçalho -->
          <h2>Confirmação de Agendamento</h2>
        
        <!-- Conteúdo -->
          <p>Prezado(a) ${alunoData.nome || 'aluno'},</p>
          <p>Seu agendamento foi confirmado com sucesso, segue as informações: </p>
          
          <!-- Detalhes do Agendamento -->
            <p><strong>📅 Data:</strong> ${alunoData.data}</p>
            <p><strong>⏰ Horário:</strong> ${alunoData.horario}</p>
            <p><strong>📌 Modalidade:</strong> ${isPresencial ? 'Presencial' : 'Online'}</p>
            
            ${isPresencial
              ? `<p><strong>🏢 Unidade:</strong> ${
                  alunoData.unidade.charAt(0).toUpperCase() + 
                  alunoData.unidade.slice(1).toLowerCase()
                }</p>`
              : `<p style="margin-top: 8px; font-size: 0.9em; color: #555;">
                  🔗 Você receberá o link da videoconferência (Google Meet) 
                  até 30 minutos antes do horário agendado.
                 </p>`
            }
          </div>
          
          <p>Caso precise reagendar ou cancelar, por favor entre em contato com antecedência.</p>
        </div>
        
        <!-- Rodapé -->
        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 0.9em; color: #666;">
          <p>Atenciosamente,</p>
          <p><strong>Serviço de Psicologia da Coordenação de Assistência Estudantil - Agenda CAES</strong></p>
        </div>
      </div>
    `
  };
};

export default getEmailTemplate;
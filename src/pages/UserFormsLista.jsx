import React, { useState } from 'react';
import Header from '../components/Header/header';
import ProgressBar from '../components/ProgressBar/progressBar';
import InfoText from '../components/InfoText/infoText';
import Modality from '../components/Modality/modality';

const UserFormsList = () => {
    const [progress, setProgress] = useState(0);

    return (
        <div>
            <Header />
            <InfoText>  
            O Plantão Psicológico trata-se de um serviço de acolhimento psicológico individual, com duração de 50 minutos, destinado a demandas pontuais ou de caráter emergencial relacionadas ao sofrimento psíquico e às dificuldades enfrentadas no cotidiano. <strong>A solicitação para o atendimento deve ser realizado através do formulário abaixo</strong>, respeitando a disponibilidade de vagas. Os horários de atendimento são atualizados e divulgados semanalmente por este canal.
            <p> </p>
            <p>Surgindo uma vaga, uma das psicólogas entrará em
contato para efetivar o agendamento. <strong>Caso o contato não seja estabelecido, será
necessário realizar novo agendamento na semana seguinte.</strong></p>
            </InfoText>
            <ProgressBar  progress={progress} />
            <Modality
                setProgress={setProgress}
            />
        </div>
    );
};

export default UserFormsList;
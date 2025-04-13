import React, { useState } from 'react';
import Header from '../components/Header/header';
import ProgressBar from '../components/ProgressBar/progressBar';
import InfoText from '../components/InfoText/infoText';
import Modality from '../components/Modality/modality';

const UserForms = () => {
    const [progress, setProgress] = useState(0);

    return (
        <div>
            <Header />
            <InfoText>  
            O Plantão Psicológico trata-se de um serviço de acolhimento psicológico individual, com duração de 50 minutos, destinado a demandas pontuais ou de caráter emergencial relacionadas ao sofrimento psíquico e às dificuldades enfrentadas no cotidiano. <strong>A solicitação para o atendimento deve ser realizado através do formulário abaixo</strong>, respeitando a disponibilidade de vagas. Os horários de atendimento são atualizados e divulgados semanalmente por este canal.
            </InfoText>
            <ProgressBar  progress={progress} />
            <Modality
                setProgress={setProgress}
            />
        </div>
    );
};

export default UserForms;
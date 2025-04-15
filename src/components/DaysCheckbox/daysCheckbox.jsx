import React, { useState } from "react";
import "./daysCheckbox.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { FaExclamationTriangle } from "react-icons/fa";

const PopUpAlteracoes = ({ onConfirm, onCancel }) => {
    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <div className="popup-icon-circle">
                    <FaExclamationTriangle className="popup-icon" />
                </div>

                <p>Tem certeza que deseja fazer essas alterações? 
                Essa ação não poderá ser desfeita.</p>

                <div className="popup-buttons-container">
                    <button className="popup-button-cancel" onClick={onCancel}>Cancelar</button>
                    <button className="popup-button-confirm" onClick={onConfirm}>Alterar</button>
                </div>
            </div>
        </div>
    );
};

const DaysCheckbox = () => {
  // Estados para controlar se cada dropdown está aberto
  const [isOpenMME, setIsOpenMME] = useState(false);
  const [isOpenRT, setIsOpenRT] = useState(false);
  const [isOpenOnline, setIsOpenOnline] = useState(false);

  // Estado para armazenar os horários selecionados
  const [horariosSelecionados, setHorariosSelecionados] = useState({
    mme: {},
    rt: {},
    online: {},
  });

  // Estado para rastrear se alguma alteração foi feita
  const [alteracaoFeita, setAlteracaoFeita] = useState(false);

  // Estado para controlar o pop-up de confirmação
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  // Dias da semana
  const diasDaSemana = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"];

  // Horários das 8:00 até às 17:00
  const horarios = Array.from({ length: 10 }, (_, i) => {
    const hora = 8 + i;
    return `${hora < 10 ? `0${hora}` : hora}:00`;
  });

  // Função para lidar com a seleção/deseleção de horários
  const handleCheckboxChange = (local, dia, horario) => {
    setHorariosSelecionados((prev) => {
      const novosHorarios = { ...prev, [local]: { ...prev[local] } };

      if (!novosHorarios[local][dia]) {
        novosHorarios[local][dia] = [];
      } else {
        novosHorarios[local][dia] = [...novosHorarios[local][dia]];
      }

      if (novosHorarios[local][dia].includes(horario)) {
        novosHorarios[local][dia] = novosHorarios[local][dia].filter((h) => h !== horario);
      } else {
        novosHorarios[local][dia].push(horario);
      }

      return novosHorarios;
    });

    setAlteracaoFeita(true);
  };

  // Função para salvar a configuração no servidor
  const handleSalvarConfiguracao = async () => {
    try {
        const modalidadesAlteradas = Object.keys(horariosSelecionados).filter(
            (modalidade) => Object.keys(horariosSelecionados[modalidade]).length > 0
        );

        if (modalidadesAlteradas.length === 0) {
            alert("Nenhuma alteração foi feita.");
            return;
        }

        const dadosParaSalvar = {};
        modalidadesAlteradas.forEach((modalidade) => {
            dadosParaSalvar[modalidade] = horariosSelecionados[modalidade];
        });

        console.log("Dados enviados:", dadosParaSalvar);

        const response = await fetch("http://localhost:5000/salvar-configuracao", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosParaSalvar),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Erro na resposta do servidor:", errorData);
            alert("Erro ao salvar configuração: " + errorData);
            return;
        }

        const data = await response.json();
        console.log("Resposta da API:", data);

        if (data.success) {
            alert("Configuração salva com sucesso!");
            setAlteracaoFeita(false);
        } else {
            alert("Erro ao salvar configuração.");
        }
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar configuração.");
    }
  };

  // Função para mostrar o pop-up de confirmação
  const handleConfirmButtonClick = () => {
    setShowConfirmPopup(true);
  };

  // Função para confirmar e salvar as alterações
  const confirmSaveChanges = () => {
    setShowConfirmPopup(false);
    handleSalvarConfiguracao();
  };

  return (
    <div className="days-checkbox-container">
      {/* MAMANGUAPE */}
      <div className="dropdown-container">
        <button className="dropdown-button" onClick={() => setIsOpenMME(!isOpenMME)}>
          Alteração de horários de atendimentos presenciais (Mamanguape)
          {isOpenMME ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {isOpenMME && (
          <div className="dropdown-content">
            {diasDaSemana.map((dia, index) => (
              <div key={index} className="dia-container">
                <h3>{dia}</h3>
                <div className="checkboxes-container">
                  {horarios.map((horario, i) => (
                    <label key={i} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={
                          horariosSelecionados.mme[dia]?.includes(horario) || false
                        }
                        onChange={() => handleCheckboxChange("mme", dia, horario)}
                      />{" "}
                      {horario}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIO TINTO */}
      <div className="dropdown-container">
        <button className="dropdown-button" onClick={() => setIsOpenRT(!isOpenRT)}>
          Alteração de horários de atendimentos presenciais (Rio Tinto)
          {isOpenRT ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {isOpenRT && (
          <div className="dropdown-content">
            {diasDaSemana.map((dia, index) => (
              <div key={index} className="dia-container">
                <h3>{dia}</h3>
                <div className="checkboxes-container">
                  {horarios.map((horario, i) => (
                    <label key={i} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={
                          horariosSelecionados.rt[dia]?.includes(horario) || false
                        }
                        onChange={() => handleCheckboxChange("rt", dia, horario)}
                      />{" "}
                      {horario}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ONLINE */}
      <div className="dropdown-container">
        <button className="dropdown-button" onClick={() => setIsOpenOnline(!isOpenOnline)}>
          Alteração de horários de atendimentos online
          {isOpenOnline ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {isOpenOnline && (
          <div className="dropdown-content">
            {diasDaSemana.map((dia, index) => (
              <div key={index} className="dia-container">
                <h3>{dia}</h3>
                <div className="checkboxes-container">
                  {horarios.map((horario, i) => (
                    <label key={i} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={
                          horariosSelecionados.online[dia]?.includes(horario) || false
                        }
                        onChange={() => handleCheckboxChange("online", dia, horario)}
                      />{" "}
                      {horario}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTÃO DE CONFIRMAR */}
      <div className="button-actions">
        <button 
          className="save-button" 
          disabled={!alteracaoFeita} 
          onClick={handleConfirmButtonClick}
        >
          Confirmar alterações
        </button>
      </div>

      {/* POP-UP DE CONFIRMAÇÃO */}
      {showConfirmPopup && (
        <PopUpAlteracoes
          onConfirm={confirmSaveChanges}
          onCancel={() => setShowConfirmPopup(false)}
        />
      )}
    </div>
  );
};

export default DaysCheckbox;
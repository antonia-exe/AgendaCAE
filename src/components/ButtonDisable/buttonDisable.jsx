import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./buttonDisable.css";

const ButtonDisable = () => {
  const [isActive, setIsActive] = useState(true);
  const navigate = useNavigate(); 

  useEffect(() => {
    const savedState = localStorage.getItem("toggleState");
    if (savedState !== null) {
      setIsActive(savedState === "true"); 
    }
  }, []);

  const toggleButton = () => {
    const newState = !isActive;
    setIsActive(newState);
    localStorage.setItem("toggleState", newState);
  };

  return (
    <div className="container">
      <div className="content">
        <h1>Acesso disponível</h1>
        <p>Disponibilizar o acesso do site aos alunos</p>
      </div>
      <div className="toggle-switch">
        <input
          type="checkbox"
          id="toggle"
          checked={isActive}
          onChange={toggleButton}
        />
        <label htmlFor="toggle" className="toggle-label"></label>
      </div>
    </div>
  );
};

export default ButtonDisable;
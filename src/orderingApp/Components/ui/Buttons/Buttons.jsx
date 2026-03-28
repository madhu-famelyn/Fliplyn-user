
import React from "react";
import "./Buttons.css";

const Button = ({ children, variant = "default", onClick }) => {
  return (
    <button
      className={`btn ${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
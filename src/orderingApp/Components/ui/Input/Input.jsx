import React from "react";
import "./Input.css";

const Input = ({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  name
}) => {
  return (
    <div className="input-wrapper">
      {Icon && <Icon className="input-icon" size={18} />}
      <input
        className="input-field"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
      />
    </div>
  );
};

export default Input;
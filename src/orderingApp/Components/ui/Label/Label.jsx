import React from "react";
import "./Label.css";

const Label = ({ children }) => {
  return <label className="form-label">{children}</label>;
};

export default Label;
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* Jangan ada <Router> di sini - sudah ada di App.js */}
    <App />
  </React.StrictMode>,
);

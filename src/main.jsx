import React from "react";
import ReactDOM from "react-dom/client";
import BordoApp from "../bordo_login.jsx";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found. Please add <div id=\"root\"></div> to index.html.");
}

ReactDOM.createRoot(rootElement).render(<BordoApp />);

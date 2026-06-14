import React, { useState } from "react";
import { C, fonts } from "./styles/theme.js";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import NauticoPro from "./pages/NauticoPro.jsx";
import GestorMarina from "./pages/GestorMarina.jsx";
import Notificacoes from "./pages/Notificacoes.jsx";
import TelasSuporte from "./pages/TelasSuporte.jsx";

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [profile, setProfile] = useState(null);

  // Navegação principal
  const navigate = (s, p) => {
    if (p) setProfile(p);
    setScreen(s);
  };

  // Estilo global
  const globalStyle = {
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
    fontFamily: fonts.body,
  };

  return (
    <div style={globalStyle}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: ${fonts.body}; background: ${C.sand}; }
        input:focus { border-color: ${C.aqua} !important; box-shadow: 0 0 0 3px rgba(23,168,189,0.15); }
        button:active { opacity: 0.85; }
      `}</style>

      {screen === "landing" && <Landing onStart={() => navigate("login")} />}
      {screen === "login" && <Login onLogin={(p) => navigate("home", p)} />}
      {screen === "home" && profile?.id === "gestor" && (
        <GestorMarina onLogout={() => navigate("landing")} />
      )}
      {screen === "home" && profile && profile.id !== "gestor" && (
        <NauticoPro profile={profile} onLogout={() => navigate("landing")} />
      )}
      {screen === "notificacoes" && (
        <Notificacoes onBack={() => navigate("home", profile)} />
      )}
      {screen === "suporte" && (
        <TelasSuporte onBack={() => navigate("landing")} />
      )}
    </div>
  );
}

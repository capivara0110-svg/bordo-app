import React, { useState, useEffect } from "react";
import { C, fonts } from "./styles/theme.js";
import { api } from "./services/api.js";
import { PERFIS_SISTEMA } from "./data/mock.js";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import NauticoPro from "./pages/NauticoPro.jsx";
import GestorMarina from "./pages/GestorMarina.jsx";
import Notificacoes from "./pages/Notificacoes.jsx";
import TelasSuporte from "./pages/TelasSuporte.jsx";

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tenta restaurar sessão ao iniciar
  useEffect(() => {
    const token = localStorage.getItem("bordo_token");
    const savedProfile = localStorage.getItem("bordo_profile");

    if (token && savedProfile) {
      try {
        const p = JSON.parse(savedProfile);
        setProfile(p);
        setScreen("home");
      } catch {
        localStorage.removeItem("bordo_token");
        localStorage.removeItem("bordo_profile");
      }
    }
    setLoading(false);
  }, []);

  const navigate = (s, p) => {
    if (p) {
      setProfile(p);
      localStorage.setItem("bordo_profile", JSON.stringify(p));
    }
    setScreen(s);
  };

  const handleLogin = (userData) => {
    // Salva token
    localStorage.setItem("bordo_token", userData.token);

    // Mapeia o perfil do backend para o formato do frontend
    const perfilMap = {
      marinheiro: "marinheiro",
      marinharia: "marinharia",
      tecnico: "tecnico",
      gestor: "gestor",
    };

    const perfilId = perfilMap[userData.user.perfil] || "marinheiro";
    const perfilData = PERFIS_SISTEMA.find((p) => p.id === perfilId) || PERFIS_SISTEMA[0];

    const profileData = {
      ...perfilData,
      user: {
        name: userData.user.nome,
        role: userData.user.cargo || perfilData.user?.role,
        vessel: userData.user.embarcacao || perfilData.user?.vessel,
      },
      userId: userData.user.id,
      email: userData.user.email,
    };

    navigate("home", profileData);
  };

  const handleLogout = () => {
    localStorage.removeItem("bordo_token");
    localStorage.removeItem("bordo_profile");
    setProfile(null);
    setScreen("landing");
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: C.ocean,
        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16
      }}>
        <div style={{ fontFamily: fonts.display, fontSize: 32, fontWeight: 800, color: C.aqua }}>BORDO.</div>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Carregando...</div>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: ${fonts.body}; background: ${C.sand}; }
        input:focus { border-color: ${C.aqua} !important; box-shadow: 0 0 0 3px rgba(23,168,189,0.15); }
        button:active { opacity: 0.85; }
      `}</style>

      {screen === "landing" && <Landing onStart={() => navigate("login")} />}
      {screen === "login" && <Login onLogin={handleLogin} />}
      {screen === "home" && profile?.id === "gestor" && (
        <GestorMarina profile={profile} onLogout={handleLogout} />
      )}
      {screen === "home" && profile && profile.id !== "gestor" && (
        <NauticoPro profile={profile} onLogout={handleLogout} />
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

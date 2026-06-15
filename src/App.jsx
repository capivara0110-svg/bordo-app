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
import MinhaEmpresa from "./pages/MinhaEmpresa.jsx";

function buildProfile(user) {
  const perfilId = ["marinheiro", "marinharia", "tecnico", "gestor"].includes(user.perfil)
    ? user.perfil
    : "marinheiro";
  const perfilData = PERFIS_SISTEMA.find((item) => item.id === perfilId) || PERFIS_SISTEMA[0];

  return {
    ...perfilData,
    user: {
      name: user.nome,
      role: user.cargo || perfilData.user?.role,
      vessel: user.embarcacao || perfilData.user?.vessel,
    },
    userId: user.id,
    email: user.email,
    company: {
      id: user.empresa_id,
      name: user.empresa_nome,
      plan: user.empresa_plano,
    },
    accessRole: user.papel,
  };
}

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("bordo_token");

    async function restoreSession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const user = await api.me();
        const restoredProfile = buildProfile(user);
        setProfile(restoredProfile);
        localStorage.setItem("bordo_profile", JSON.stringify(restoredProfile));
        setScreen("home");
      } catch {
        localStorage.removeItem("bordo_token");
        localStorage.removeItem("bordo_profile");
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  const navigate = (s, p) => {
    if (p) {
      setProfile(p);
      localStorage.setItem("bordo_profile", JSON.stringify(p));
    }
    setScreen(s);
  };

  const handleLogin = (userData) => {
    localStorage.setItem("bordo_token", userData.token);
    navigate("home", buildProfile(userData.user));
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
      {screen === "login" && <Login onLogin={handleLogin} onBack={() => navigate("landing")} />}
      {screen === "home" && profile?.id === "gestor" && (
        <GestorMarina
          profile={profile}
          onLogout={handleLogout}
          onCompany={() => navigate("empresa")}
        />
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
      {screen === "empresa" && profile && (
        <MinhaEmpresa profile={profile} onBack={() => navigate("home")} />
      )}
    </div>
  );
}

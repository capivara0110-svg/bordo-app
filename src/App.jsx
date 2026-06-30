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
import Legal from "./pages/Legal.jsx";

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
        html { background: ${C.ocean}; }
        body { font-family: ${fonts.body}; background: ${C.ocean}; min-height: 100vh; }
        #root { min-height: 100vh; background: ${C.ocean}; }
        input:focus { border-color: ${C.aqua} !important; box-shadow: 0 0 0 3px rgba(23,168,189,0.15); }
        button:active { opacity: 0.85; }
        .bordo-page-body { padding: 16px 16px 140px; }
        .bordo-card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
        .bordo-list-grid > * { min-width: 0; }
        .bordo-desktop-only { display: none; }

        @media (min-width: 900px) {
          body { background: radial-gradient(circle at top left, rgba(23,168,189,0.18), transparent 34%), ${C.ocean}; }
          .bordo-app-screen {
            width: min(1180px, calc(100vw - 48px)) !important;
            max-width: none !important;
            margin: 0 auto !important;
            padding: 24px 24px 40px 120px !important;
          }
          .bordo-no-sidebar {
            padding-left: 24px !important;
          }
          .bordo-header {
            position: static !important;
            border-radius: 24px !important;
            margin-bottom: 18px !important;
            padding: 24px 28px !important;
            background: linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.035)) !important;
            border: 1px solid rgba(255,255,255,0.08) !important;
          }
          .bordo-page-body { padding: 0 !important; }
          .bordo-card-grid { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; gap: 14px !important; }
          .bordo-list-grid {
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)) !important;
            gap: 14px !important;
          }
          .bordo-list-grid > * { margin-bottom: 0 !important; }
          .bordo-bottom-nav {
            top: 24px !important;
            bottom: auto !important;
            left: max(24px, calc((100vw - 1180px) / 2 + 24px)) !important;
            transform: none !important;
            width: 80px !important;
            max-width: none !important;
            height: auto !important;
            border: 1px solid rgba(255,255,255,0.08) !important;
            border-radius: 24px !important;
            flex-direction: column !important;
            gap: 8px !important;
            padding: 14px 8px !important;
            box-shadow: 0 18px 60px rgba(0,0,0,0.18);
          }
          .bordo-bottom-nav button {
            width: 100% !important;
            padding: 10px 6px !important;
            border-radius: 16px !important;
          }
          .bordo-desktop-only { display: block; }
        }

        @media print {
          body { background: #ffffff !important; }
          body * { visibility: hidden !important; }
          .bordo-report-panel, .bordo-report-panel * { visibility: visible !important; }
          .bordo-report-panel {
            position: absolute !important;
            inset: 0 auto auto 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            background: #ffffff !important;
            box-shadow: none !important;
          }
          .bordo-report-actions { display: none !important; }
          .bordo-report-sheet {
            border-radius: 0 !important;
            padding: 24px !important;
            color: #162033 !important;
          }
        }
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
        <MinhaEmpresa
          profile={profile}
          onBack={() => navigate("home")}
          onLegal={(type) => navigate(type === "termos" ? "termos" : "privacidade")}
        />
      )}
      {screen === "privacidade" && (
        <Legal type="privacidade" onBack={() => navigate(profile ? "home" : "landing")} />
      )}
      {screen === "termos" && (
        <Legal type="termos" onBack={() => navigate(profile ? "home" : "landing")} />
      )}
    </div>
  );
}

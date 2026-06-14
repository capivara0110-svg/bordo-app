import React, { useState, useEffect } from "react";
import { C, fonts } from "../styles/theme.js";
import { api } from "../services/api.js";
import Header from "../components/Header.jsx";

export default function Notificacoes({ onBack }) {
  const [notificacoes, setNotificacoes] = useState([]);
  const [filter, setFilter] = useState("todas");

  useEffect(() => {
    api.notificacoes.listar().then(data => setNotificacoes(data)).catch(() => {});
  }, []);

  const handleLer = async (id) => {
    try {
      await api.notificacoes.ler(id);
      setNotificacoes(notificacoes.map(n => n.id === id ? { ...n, lida: 1 } : n));
    } catch (err) { alert(err.message); }
  };

  const filtered = filter === "todas" ? notificacoes : notificacoes.filter(n => n.categoria === filter);

  return (
    <div style={{ minHeight: "100vh", background: C.ocean, maxWidth: 480, margin: "0 auto" }}>
      <Header title="Notificações" sub="Central de alertas" onBack={onBack} />

      <div style={{ display: "flex", gap: 6, padding: "8px 16px", overflowX: "auto", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {["todas", "os", "tripulacao", "estoque", "diario"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? C.aqua + "33" : "rgba(255,255,255,0.06)",
            border: `1px solid ${filter === f ? C.aqua : "transparent"}`,
            borderRadius: 20, padding: "6px 14px",
            fontSize: 12, fontWeight: 700, color: filter === f ? C.aqua : "rgba(255,255,255,0.5)",
            cursor: "pointer", whiteSpace: "nowrap", textTransform: "capitalize"
          }}>
            {f === "todas" ? "Todas" : f === "os" ? "🔧 OS" : f === "tripulacao" ? "👥 Trip." : f === "estoque" ? "📦 Estoque" : "📋 Diário"}
          </button>
        ))}
      </div>

      <div style={{ padding: "8px 16px" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
            Nenhuma notificação
          </div>
        )}
        {filtered.map(n => (
          <div key={n.id} style={{
            background: n.lida ? "transparent" : "rgba(23,168,189,0.06)",
            borderRadius: 14, padding: 14, marginBottom: 8,
            borderLeft: `3px solid ${n.tipo === "urgente" ? C.rust : n.tipo === "alerta" ? C.gold : C.aqua}`,
            opacity: n.lida ? 0.6 : 1
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 16 }}>{n.icone}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{n.titulo}</div>
              </div>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{n.criado_em || "agora"}</span>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5, marginBottom: 10 }}>{n.corpo}</p>
            {!n.lida && (
              <button onClick={() => handleLer(n.id)} style={{
                background: "rgba(23,168,189,0.1)", border: "none", borderRadius: 8,
                padding: "6px 14px", color: C.aqua, fontSize: 11, fontWeight: 700, cursor: "pointer"
              }}>
                {n.acao || "Marcar como lida"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

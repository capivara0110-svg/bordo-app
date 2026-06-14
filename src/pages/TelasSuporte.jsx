import React, { useState } from "react";
import { C, fonts } from "../styles/theme.js";
import Header from "../components/Header.jsx";

export default function TelasSuporte({ onBack }) {
  const [tab, setTab] = useState("embarcacoes");

  const sections = [
    {
      id: "embarcacoes",
      icon: "🚤",
      label: "Minhas Embarcações",
      content: (
        <div style={{ padding: "12px 16px" }}>
          {[
            { name: "MV Esperança", type: "Motor", ano: 2020, registro: "BR-1234", docs: "OK" },
            { name: "Lancha Brisa Mar", type: "Lancha", ano: 2022, registro: "BR-5678", docs: "Atenção" },
          ].map(e => (
            <div key={e.name} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 28 }}>🚤</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.white }}>{e.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{e.type} · {e.ano}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                <span>📄 {e.registro}</span>
                <span>📋 {e.docs}</span>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: "galeria",
      icon: "📸",
      label: "Galeria",
      content: (
        <div style={{ padding: "12px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{
                aspectRatio: "1", background: "rgba(255,255,255,0.05)", borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, color: "rgba(255,255,255,0.2)"
              }}>
                🖼️
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "config",
      icon: "⚙️",
      label: "Configurações",
      content: (
        <div style={{ padding: "12px 16px" }}>
          {[
            { icon: "🔔", label: "Notificações", desc: "Gerir alertas do sistema" },
            { icon: "👤", label: "Perfil", desc: "Seus dados pessoais" },
            { icon: "🔒", label: "Privacidade", desc: "Controles de segurança" },
            { icon: "🌙", label: "Aparência", desc: "Tema escuro / claro" },
            { icon: "📤", label: "Exportar dados", desc: "Baixar relatórios" },
          ].map(s => (
            <div key={s.label} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)"
            }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.white }}>{s.label}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{s.desc}</div>
              </div>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 16 }}>›</span>
            </div>
          ))}
        </div>
      )
    },
    {
      id: "horas",
      icon: "⏱️",
      label: "Horas Trabalhadas",
      content: (
        <div style={{ padding: "12px 16px" }}>
          {[
            { date: "12/06", hours: 8, os: "OS-041", desc: "Limpeza Lancha Brisa Mar" },
            { date: "12/06", hours: 4, os: "OS-039", desc: "Revisão MV Esperança" },
            { date: "11/06", hours: 8, os: "OS-037", desc: "Pintura Veleiro Nautilus" },
            { date: "10/06", hours: 6, os: "OS-037", desc: "Pintura Veleiro Nautilus" },
          ].map(h => (
            <div key={h.date + h.os} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 12, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{h.os}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.aqua }}>{h.hours}h</span>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{h.desc}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{h.date}</div>
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.ocean, maxWidth: 480, margin: "0 auto", paddingBottom: 80 }}>
      <Header title="Suporte" sub="Ferramentas auxiliares" onBack={onBack} />

      {/* Abas de navegação */}
      <div style={{ display: "flex", gap: 0, overflowX: "auto", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setTab(s.id)} style={{
            flex: 1, background: "transparent", border: "none",
            padding: "12px 8px", cursor: "pointer", opacity: tab === s.id ? 1 : 0.4,
            borderBottom: tab === s.id ? `2px solid ${C.aqua}` : "2px solid transparent",
            transition: "all 0.2s"
          }}>
            <span style={{ fontSize: 20, display: "block", marginBottom: 4 }}>{s.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: C.white }}>{s.label}</span>
          </button>
        ))}
      </div>

      {sections.find(s => s.id === tab)?.content}
    </div>
  );
}

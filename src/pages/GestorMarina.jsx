import React, { useState, useEffect } from "react";
import { C, fonts } from "../styles/theme.js";
import { api } from "../services/api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import Header from "../components/Header.jsx";

export default function GestorMarina({ profile, onLogout, onCompany }) {
  const [tab, setTab] = useState("dashboard");

  // Dados da API
  const [dashboard, setDashboard] = useState(null);
  const [ordens, setOrdens] = useState([]);
  const [equipe, setEquipe] = useState([]);
  const [bercos, setBercos] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: "dashboard", icon: "📊", label: "Painel" },
    { id: "equipe", icon: "👥", label: "Equipe" },
    { id: "ordens", icon: "🔧", label: "Ordens" },
    { id: "bercos", icon: "⚓", label: "Berços" },
  ];

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [dash, ord, trip, ber] = await Promise.all([
          api.dashboard.dados(),
          api.ordens.listar(),
          api.tripulacao.listar(),
          api.bercos.listar(),
        ]);
        setDashboard(dash);
        setOrdens(ord);
        setEquipe(trip);
        setBercos(ber);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const renderTab = () => {
    if (loading) return <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)" }}>Carregando...</div>;

    switch (tab) {
      case "dashboard":
        if (!dashboard) return null;
        return (
          <div style={{ padding: "16px 16px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { label: "OS Ativas", value: dashboard.os.ativas, icon: "🔧", color: C.gold },
                { label: "Berços Ocupados", value: dashboard.bercos.ocupados + "/" + dashboard.bercos.total, icon: "⚓", color: C.aqua },
                { label: "Equipe", value: dashboard.equipe.total + " membros", icon: "👥", color: C.green },
                { label: "Estoque Baixo", value: dashboard.estoque.baixo + " itens", icon: "📦", color: C.rust },
              ].map(c => (
                <div key={c.label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{c.label}</span>
                    <span style={{ fontSize: 16 }}>{c.icon}</span>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: c.color, fontFamily: fonts.display }}>{c.value}</div>
                </div>
              ))}
            </div>

            {dashboard.notificacoes.naoLidas > 0 && (
              <div style={{ background: "rgba(243,156,18,0.1)", border: "1px solid rgba(243,156,18,0.2)", borderRadius: 12, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.gold, fontWeight: 600 }}>
                🔔 {dashboard.notificacoes.naoLidas} notificação(ns) não lida(s)
              </div>
            )}

            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 10 }}>📋 Últimas Ordens</div>
              {dashboard.ultimasOS.map(os => (
                <div key={os.id} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 12, marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{os.codigo}</span>
                    <StatusBadge status={os.status} />
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{os.embarcacao} · {os.responsavel || "—"}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case "equipe":
        return (
          <div style={{ padding: "12px 16px" }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Tripulação</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.white, fontFamily: fonts.display }}>{equipe.length} membros</div>
            </div>
            {equipe.map(m => (
              <div key={m.id} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 14, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{m.avatar || "👤"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{m.nome}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{m.cargo}</div>
                  </div>
                  <StatusBadge status={m.status || "ok"} />
                </div>
              </div>
            ))}
          </div>
        );

      case "ordens":
        return (
          <div style={{ padding: "12px 16px" }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Ordens</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.white, fontFamily: fonts.display }}>{ordens.length} ordens</div>
            </div>
            {ordens.map(os => (
              <div key={os.id} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 14, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{os.codigo}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{os.embarcacao} · {os.cliente || "—"}</div>
                  </div>
                  <StatusBadge status={os.status} />
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>{os.descricao}</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, background: "rgba(255,255,255,0.08)", borderRadius: 5, padding: "2px 7px", color: "rgba(255,255,255,0.5)" }}>{os.tipo}</span>
                  <span style={{ fontSize: 10, background: "rgba(255,255,255,0.08)", borderRadius: 5, padding: "2px 7px", color: os.prioridade === "urgente" ? C.rust : "rgba(255,255,255,0.5)" }}>{os.prioridade}</span>
                  <span style={{ fontSize: 10, background: "rgba(255,255,255,0.08)", borderRadius: 5, padding: "2px 7px", color: "rgba(255,255,255,0.5)" }}>{os.responsavel || "—"}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case "bercos":
        return (
          <div style={{ padding: "12px 16px" }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Berços</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.white, fontFamily: fonts.display }}>{bercos.length} vagas</div>
            </div>
            {bercos.map(b => (
              <div key={b.id} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 14, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: b.status === "ocupado" ? C.aqua + "33" : b.status === "reservado" ? C.gold + "33" : b.status === "manutencao" ? C.rust + "33" : "rgba(255,255,255,0.06)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 800, color: b.status === "ocupado" ? C.aqua : b.status === "reservado" ? C.gold : b.status === "manutencao" ? C.rust : "rgba(255,255,255,0.3)"
                    }}>
                      {b.numero}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{b.embarcacao}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{b.cliente}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <StatusBadge status={b.status} />
                    {b.status === "ocupado" && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{b.entrada} → {b.saida}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.ocean, paddingBottom: 80, maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <Header title={profile.company?.name || "Minha empresa"} sub="Painel do Gestor" color={C.green} />
      {renderTab()}

      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        maxWidth: 480, width: "100%",
        background: "rgba(10,37,64,0.95)", backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", justifyContent: "space-around", padding: "6px 0",
        paddingBottom: "calc(6px + env(safe-area-inset-bottom, 6px))",
        zIndex: 100
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            background: "transparent", border: "none", cursor: "pointer", padding: "6px 12px",
            opacity: tab === t.id ? 1 : 0.4, transition: "opacity 0.2s"
          }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: C.white, letterSpacing: 0.5 }}>{t.label}</span>
          </button>
        ))}
        <button onClick={onCompany} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          background: "transparent", border: "none", cursor: "pointer", padding: "6px 12px", opacity: 0.55
        }}>
          <span style={{ fontSize: 20 }}>🏢</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.white }}>Empresa</span>
        </button>
        <button onClick={onLogout} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          background: "transparent", border: "none", cursor: "pointer", padding: "6px 12px", opacity: 0.4
        }}>
          <span style={{ fontSize: 20 }}>🚪</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.white }}>Sair</span>
        </button>
      </div>
    </div>
  );
}

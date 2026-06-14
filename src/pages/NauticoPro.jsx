import React, { useState } from "react";
import { C, fonts, shadow } from "../styles/theme.js";
import { mockDiario, mockChecklist, mockCrew, mockEstoque, mockOrdens, PERFIS_SISTEMA } from "../data/mock.js";
import StatusBadge from "../components/StatusBadge.jsx";

export default function NauticoPro({ profile, onLogout }) {
  const fullProfile = PERFIS_SISTEMA.find(p => p.id === profile.id) || profile;
  const [tab, setTab] = useState(fullProfile.tabs?.[0]?.id || "diario");

  const tabs = fullProfile.tabs || [
    { id: "diario", icon: "📋", label: "Diário" },
    { id: "checklist", icon: "✅", label: "Check-list" },
    { id: "tripulacao", icon: "👥", label: "Tripulação" },
    { id: "estoque", icon: "📦", label: "Estoque" },
  ];

  const UserBar = () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22 }}>{fullProfile.emoji}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{fullProfile.user?.name || "Usuário"}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{fullProfile.user?.role} · {fullProfile.user?.vessel}</div>
        </div>
      </div>
      <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, padding: "6px 12px", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}>Sair</button>
    </div>
  );

  const renderTab = () => {
    switch (tab) {
      case "diario":
        return (
          <div style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Registros</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.white, fontFamily: fonts.display }}>{mockDiario.length} registros</div>
              </div>
              <button style={{ background: C.aqua, border: "none", borderRadius: 10, padding: "10px 16px", color: C.white, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Novo</button>
            </div>
            {mockDiario.map(r => (
              <div key={r.id} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 14, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: r.type === "Saída" ? C.aqua : r.type === "Ocorrência" ? C.rust : C.gold }}>
                    {r.type}
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>·</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{r.date} às {r.time}</span>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5, marginBottom: 8 }}>{r.description}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>por {r.author}</span>
                  <span style={{ fontSize: 11, color: r.signed ? C.green : C.gold, fontWeight: 700 }}>
                    {r.signed ? "✏️ Assinado" : "⏳ Pendente"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );

      case "checklist":
        return (
          <div style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Segurança</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.white, fontFamily: fonts.display }}>Check-list de Saída</div>
              </div>
            </div>
            {["Segurança", "Motor", "Navegação", "Comunicação"].map(cat => {
              const items = mockChecklist.filter(i => i.category === cat);
              const done = items.filter(i => i.done).length;
              return (
                <div key={cat} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>{cat}</span>
                    <span style={{ fontSize: 11, color: C.aqua, fontWeight: 700 }}>{done}/{items.length}</span>
                  </div>
                  {items.map(i => (
                    <div key={i.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 6, border: `2px solid ${i.done ? C.green : "rgba(255,255,255,0.2)"}`,
                        background: i.done ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, color: C.white, cursor: "pointer", flexShrink: 0
                      }}>
                        {i.done ? "✓" : ""}
                      </div>
                      <span style={{ fontSize: 13, color: i.done ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.8)", textDecoration: i.done ? "line-through" : "none" }}>
                        {i.item}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        );

      case "tripulacao":
        return (
          <div style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Tripulação</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.white, fontFamily: fonts.display }}>{mockCrew.length} membros</div>
              </div>
            </div>
            {mockCrew.map(m => (
              <div key={m.name} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 14, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 28 }}>{m.avatar}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{m.role}</div>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                  <span>📄 Habilitação: {m.docs.habilitacao}</span>
                  <span>📜 Certificado: {m.docs.certificado}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case "estoque":
        return (
          <div style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Estoque</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.white, fontFamily: fonts.display }}>{mockEstoque.length} itens</div>
              </div>
            </div>
            {mockEstoque.map(item => {
              const baixo = item.qty < item.min;
              return (
                <div key={item.name} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 14, marginBottom: 8, borderLeft: `3px solid ${baixo ? C.rust : C.green}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{item.category}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: baixo ? C.rust : C.aqua }}>{item.qty}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{item.unit}</div>
                    </div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 4, height: 4, marginTop: 4 }}>
                    <div style={{ width: `${Math.min(100, (item.qty / item.min) * 100)}%`, height: "100%", borderRadius: 4, background: baixo ? C.rust : C.aqua }} />
                  </div>
                </div>
              );
            })}
          </div>
        );

      case "ordens":
        return (
          <div style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Ordens</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.white, fontFamily: fonts.display }}>{mockOrdens.length} ordens</div>
              </div>
              <button style={{ background: C.aqua, border: "none", borderRadius: 10, padding: "10px 16px", color: C.white, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Nova OS</button>
            </div>
            {mockOrdens.map(os => (
              <div key={os.id} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 14, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{os.codigo}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{os.embarcacao} · {os.cliente}</div>
                  </div>
                  <StatusBadge status={os.status} />
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 8, lineHeight: 1.4 }}>{os.descricao}</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, background: "rgba(255,255,255,0.08)", borderRadius: 5, padding: "2px 7px", color: "rgba(255,255,255,0.5)" }}>{os.tipo}</span>
                  <span style={{ fontSize: 10, background: "rgba(255,255,255,0.08)", borderRadius: 5, padding: "2px 7px", color: "rgba(255,255,255,0.5)" }}>{os.prioridade}</span>
                  <span style={{ fontSize: 10, background: "rgba(255,255,255,0.08)", borderRadius: 5, padding: "2px 7px", color: "rgba(255,255,255,0.5)" }}>{os.abertura}</span>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return <div style={{ padding: 20, color: C.white }}>Selecione uma aba</div>;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.ocean, paddingBottom: 80, maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <UserBar />
      {renderTab()}

      {/* Tab bar inferior */}
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
      </div>
    </div>
  );
}

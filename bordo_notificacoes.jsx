import React from "react";
import { useEffect, useState } from "react";

const C = {
  ocean: "#0A2540", wave: "#1B4F72", aqua: "#17A8BD",
  foam: "#E4F4F8", sand: "#F7F3EC", rust: "#C0392B",
  gold: "#F39C12", green: "#27AE60", gray: "#6B7B8D",
  lg: "#D5DDE5", white: "#FFFFFF",
};

const NOTIFS = [
  {
    id: 1, type: "urgente", read: false,
    icon: "🔴", title: "OS Urgente — MV Esperança",
    body: "A OS-2026-039 foi marcada como urgente. Revisão do motor antes de zarpar amanhã.",
    time: "agora", action: "Ver OS", category: "os",
  },
  {
    id: 2, type: "alerta", read: false,
    icon: "⚠️", title: "Habilitação vencendo em 12 dias",
    body: "A habilitação náutica de João Ferreira vence em 25/06/2026. Renove antes de escalar.",
    time: "há 5 min", action: "Ver tripulante", category: "tripulacao",
  },
  {
    id: 3, type: "alerta", read: false,
    icon: "📦", title: "Estoque abaixo do mínimo",
    body: "Óleo Motor 15W-40 está com apenas 12L. Mínimo recomendado: 20L.",
    time: "há 1h", action: "Ver estoque", category: "estoque",
  },
  {
    id: 4, type: "info", read: false,
    icon: "✅", title: "OS-2026-041 concluída",
    body: "Rafael Silva finalizou a limpeza da Lancha Brisa Mar. Aguardando assinatura do cliente.",
    time: "há 2h", action: "Assinar OS", category: "os",
  },
  {
    id: 5, type: "info", read: true,
    icon: "📋", title: "Novo registro no diário",
    body: "Carlos Mendes registrou uma ocorrência no diário de bordo da MV Esperança.",
    time: "há 3h", action: "Ver registro", category: "diario",
  },
  {
    id: 6, type: "info", read: true,
    icon: "🔧", title: "Nova OS atribuída a você",
    body: "Você foi designado para a OS-2026-042: Revisão elétrica do Veleiro Nautilus.",
    time: "há 5h", action: "Ver OS", category: "os",
  },
  {
    id: 7, type: "alerta", read: true,
    icon: "⚠️", title: "Check-list incompleto",
    body: "O check-list de saída da MV Esperança está com 3 itens pendentes.",
    time: "ontem", action: "Ver check-list", category: "checklist",
  },
  {
    id: 8, type: "info", read: true,
    icon: "👥", title: "Ana Costa adicionada à tripulação",
    body: "Ana Costa foi adicionada como Cozinheira de Bordo na MV Esperança.",
    time: "ontem", action: "Ver tripulação", category: "tripulacao",
  },
  {
    id: 9, type: "info", read: true,
    icon: "📄", title: "Relatório gerado",
    body: "O relatório da OS-2026-037 (Veleiro Nautilus) foi gerado e enviado para Ana Rodrigues.",
    time: "2 dias atrás", action: "Ver relatório", category: "os",
  },
];

const FILTERS = [
  { id: "todas", label: "Todas" },
  { id: "os", label: "🔧 OSs" },
  { id: "tripulacao", label: "👥 Tripulação" },
  { id: "estoque", label: "📦 Estoque" },
  { id: "diario", label: "📋 Diário" },
  { id: "checklist", label: "✅ Check-list" },
];

const typeStyle = {
  urgente: { bg: "#fdf0ef", border: C.rust,  dot: C.rust  },
  alerta:  { bg: "#fffbee", border: C.gold,  dot: C.gold  },
  info:    { bg: C.white,   border: C.lg,    dot: C.aqua  },
};

export default function Notificacoes({ profile, state, onSave, onMarkRead, onDismiss, onBack }) {
  const [notifs, setNotifs] = useState(state?.items || []);
  const [filter, setFilter] = useState(state?.filter || "todas");
  const [tab, setTab]       = useState(state?.tab || "todas"); // todas | nao_lidas

  useEffect(() => {
    setNotifs(state?.items || []);
  }, [state?.items]);

  useEffect(() => {
    setFilter(state?.filter || "todas");
    setTab(state?.tab || "todas");
  }, [state?.filter, state?.tab]);

  const unread = notifs.filter((n) => !n.read).length;

  const applyState = (next) => {
    if (typeof onSave === "function") {
      onSave({ ...state, ...next });
    }
  };

  const markAllRead = () => {
    const unreadIds = notifs.filter((n) => !n.read).map((n) => n.id);
    const nextNotifs = notifs.map((n) => ({ ...n, read: true }));
    setNotifs(nextNotifs);
    if (typeof onMarkRead === "function") {
      onMarkRead(unreadIds);
    }
  };

  const markRead = (id) => {
    const nextNotifs = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifs(nextNotifs);
    if (typeof onMarkRead === "function") {
      onMarkRead(id);
    }
  };

  const dismiss = (id) => {
    const nextNotifs = notifs.filter((n) => n.id !== id);
    setNotifs(nextNotifs);
    if (typeof onDismiss === "function") {
      onDismiss(id);
    }
  };

  const visible = notifs
    .filter((n) => filter === "todas" || n.category === filter)
    .filter((n) => tab === "todas" || !n.read);

  return (
    <div style={{ minHeight: "100vh", background: C.sand, fontFamily: "'Inter', sans-serif", maxWidth: 420, margin: "0 auto" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div style={{ background: C.ocean, padding: "20px 20px 0", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.aqua, marginBottom: 2 }}>
              ⚓ BORDO.
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 800, color: C.white }}>
                Notificações
              </div>
              {unread > 0 && (
                <div style={{ background: C.rust, color: C.white, borderRadius: 20, minWidth: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, padding: "0 6px" }}>
                  {unread}
                </div>
              )}
            </div>
          </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {typeof onBack === "function" && (
                <button onClick={onBack} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 14, color: C.white, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "8px 12px" }}>
                  ← Voltar
                </button>
              )}
                  {unread > 0 && (
                <button onClick={markAllRead} style={{ background: "transparent", border: "none", color: C.aqua, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Marcar todas lidas
                </button>
              )}
            </div>
          </div>
        </div>

      {/* Lista */}
      <div style={{ padding: "12px 14px 80px" }}>
        {visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: C.ocean, marginBottom: 6 }}>
              Tudo em dia!
            </div>
            <div style={{ fontSize: 14, color: C.gray }}>Nenhuma notificação pendente.</div>
          </div>
        ) : (
          visible.map((n, idx) => {
            const s = typeStyle[n.type];
            const isNew = !n.read;
            return (
              <div key={n.id}>
                {/* Separador de data */}
                {idx === 0 || visible[idx - 1]?.time !== n.time && ["ontem", "2 dias atrás"].includes(n.time) && (
                  n.time === "ontem" && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, letterSpacing: 1.5, textTransform: "uppercase", padding: "12px 4px 6px" }}>Ontem</div>
                  )
                )}

                <div
                  style={{ background: isNew ? s.bg : C.white, borderRadius: 14, padding: "14px 14px", marginBottom: 8, border: `1.5px solid ${isNew ? s.border : C.lg}`, cursor: "pointer", position: "relative", transition: "all 0.2s" }}
                  onClick={() => markRead(n.id)}
                >
                  {/* Dot não lido */}
                  {isNew && (
                    <div style={{ position: "absolute", top: 14, right: 14, width: 8, height: 8, borderRadius: "50%", background: s.dot }} />
                  )}

                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    {/* Ícone */}
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: isNew ? s.bg : C.foam, border: `1.5px solid ${s.border}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                      {n.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: isNew ? 700 : 600, fontSize: 14, color: C.ocean, lineHeight: 1.3, paddingRight: 16 }}>
                          {n.title}
                        </div>
                      </div>
                      <div style={{ fontSize: 13, color: isNew ? C.ocean : C.gray, lineHeight: 1.5, marginBottom: 10, opacity: isNew ? 0.75 : 0.65 }}>
                        {n.body}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <button style={{ background: isNew ? C.ocean : C.foam, color: isNew ? C.white : C.wave, border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          {n.action} →
                        </button>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 11, color: C.gray }}>{n.time}</span>
                          <button onClick={(e) => { e.stopPropagation(); dismiss(n.id); }} style={{ background: "none", border: "none", color: C.lg, fontSize: 16, cursor: "pointer", lineHeight: 1, padding: "0 2px" }}>×</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Configurações no bottom */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 420, background: C.ocean, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
          {unread > 0 ? `${unread} não lida${unread > 1 ? "s" : ""}` : "Tudo lido ✓"}
        </span>
        <button style={{ background: "transparent", border: "none", color: C.aqua, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          ⚙️ Configurar alertas
        </button>
      </div>
    </div>
  );
}

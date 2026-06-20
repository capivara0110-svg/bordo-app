import React from "react";
import { useEffect, useState } from "react";

const C = {
  ocean: "#0A2540", wave: "#1B4F72", aqua: "#17A8BD",
  aquaLt: "#5ECFDE", foam: "#E4F4F8", sand: "#F7F3EC",
  rust: "#C0392B", gold: "#F39C12", green: "#27AE60",
  gray: "#6B7B8D", lg: "#D5DDE5", white: "#FFFFFF",
};

const TABS = [
  { id: "dashboard", icon: "📊", label: "Painel" },
  { id: "equipe",    icon: "👥", label: "Equipe" },
  { id: "ordens",    icon: "🔧", label: "Ordens" },
  { id: "bercos",    icon: "⚓", label: "Berços" },
  { id: "relatorio", icon: "📄", label: "Relatórios" },
];

const equipe = [
  { name: "Rafael Silva",   role: "Marinharia",    status: "ativo",    os: 2, avatar: "🧹" },
  { name: "Carlos Mendes",  role: "Capitão",        status: "em_viagem", os: 0, avatar: "🧑‍✈️" },
  { name: "João Ferreira",  role: "Contramestre",   status: "ativo",    os: 1, avatar: "⚓" },
  { name: "Ana Costa",      role: "Mec. Naval",     status: "folga",    os: 0, avatar: "🔧" },
  { name: "Lucas Pinto",    role: "Marinharia",     status: "ativo",    os: 3, avatar: "🧹" },
  { name: "Fernanda Rocha", role: "Administrativa", status: "ativo",    os: 0, avatar: "📋" },
];

const ordens = [
  { id: "OS-041", embarcacao: "Lancha Brisa Mar",   tipo: "Limpeza",    status: "concluida",    resp: "Rafael Silva",  prioridade: "normal",  data: "13/06" },
  { id: "OS-042", embarcacao: "Veleiro Nautilus",   tipo: "Manutenção", status: "em_andamento", resp: "Ana Costa",     prioridade: "normal",  data: "13/06" },
  { id: "OS-043", embarcacao: "MV Esperança",       tipo: "Revisão",    status: "aguardando",   resp: "—",             prioridade: "urgente", data: "14/06" },
  { id: "OS-044", embarcacao: "Escuna Mar Aberto",  tipo: "Pintura",    status: "aguardando",   resp: "Lucas Pinto",   prioridade: "normal",  data: "15/06" },
  { id: "OS-045", embarcacao: "Lancha Aurora",      tipo: "Limpeza",    status: "em_andamento", resp: "Lucas Pinto",   prioridade: "normal",  data: "13/06" },
];

const bercos = [
  { num: "01", embarcacao: "MV Esperança",      cliente: "Marina SP",       status: "ocupado",   entrada: "10/06", saida: "16/06" },
  { num: "02", embarcacao: "Lancha Brisa Mar",  cliente: "Pedro Albuquerque", status: "ocupado", entrada: "12/06", saida: "14/06" },
  { num: "03", embarcacao: "—",                 cliente: "—",               status: "livre",     entrada: "—",     saida: "—"     },
  { num: "04", embarcacao: "Veleiro Nautilus",  cliente: "Ana Rodrigues",   status: "ocupado",   entrada: "11/06", saida: "20/06" },
  { num: "05", embarcacao: "—",                 cliente: "—",               status: "livre",     entrada: "—",     saida: "—"     },
  { num: "06", embarcacao: "Escuna Mar Aberto", cliente: "Clube Náutico",   status: "reservado", entrada: "15/06", saida: "22/06" },
  { num: "07", embarcacao: "Lancha Aurora",     cliente: "Roberto Dias",    status: "ocupado",   entrada: "13/06", saida: "15/06" },
  { num: "08", embarcacao: "—",                 cliente: "—",               status: "manutencao", entrada: "—",    saida: "—"     },
];

function StatCard({ icon, label, value, sub, color, alert }) {
  return (
    <div style={{ background: C.white, borderRadius: 14, padding: "16px 16px", boxShadow: "0 2px 8px rgba(10,37,64,0.07)", borderTop: `3px solid ${color}`, position: "relative", flex: 1, minWidth: 130 }}>
      {alert && <div style={{ position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: "50%", background: C.rust }} />}
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 800, color: C.ocean, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.ocean, marginTop: 3 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    concluida:    { bg: "#d4edda", color: "#155724", label: "Concluída" },
    em_andamento: { bg: "#fff3cd", color: "#856404", label: "Em andamento" },
    aguardando:   { bg: C.foam,    color: C.wave,    label: "Aguardando" },
    ativo:        { bg: "#d4edda", color: "#155724", label: "Ativo" },
    em_viagem:    { bg: C.foam,    color: C.wave,    label: "Em viagem" },
    folga:        { bg: "#f0f0f0", color: C.gray,    label: "Folga" },
    ocupado:      { bg: "#fff3cd", color: "#856404", label: "Ocupado" },
    livre:        { bg: "#d4edda", color: "#155724", label: "Livre" },
    reservado:    { bg: C.foam,    color: C.wave,    label: "Reservado" },
    manutencao:   { bg: "#f8d7da", color: "#721c24", label: "Manutenção" },
  };
  const s = map[status] || map.aguardando;
  return <span style={{ background: s.bg, color: s.color, borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700 }}>{s.label}</span>;
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard() {
  const receita = [18400, 22100, 19800, 25600, 23900, 28400];
  const meses   = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
  const maxVal  = Math.max(...receita);

  return (
    <div style={{ padding: "16px 16px 80px" }}>

      {/* Alert urgente */}
      <div style={{ background: "#fdf0ef", border: `1.5px solid ${C.rust}`, borderRadius: 12, padding: "12px 14px", marginBottom: 14, display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 20 }}>🔴</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: C.rust }}>OS Urgente pendente</div>
          <div style={{ fontSize: 12, color: C.ocean, marginTop: 2 }}>OS-043 · MV Esperança · Revisão do motor · Previsão: amanhã</div>
        </div>
        <button style={{ background: C.rust, color: C.white, border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Ver</button>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <StatCard icon="🔧" label="OSs hoje"       value="5"  sub="2 em andamento"  color={C.aqua}  alert={false} />
        <StatCard icon="👥" label="Equipe ativa"   value="4"  sub="1 em viagem"     color={C.green} alert={false} />
        <StatCard icon="⚓" label="Berços livres"  value="2"  sub="de 8 no total"   color={C.gold}  alert={false} />
        <StatCard icon="⚠️" label="Alertas"        value="3"  sub="docs e estoque"  color={C.rust}  alert={true}  />
      </div>

      {/* Gráfico de receita */}
      <div style={{ background: C.white, borderRadius: 14, padding: "18px 16px", marginBottom: 14, boxShadow: "0 2px 8px rgba(10,37,64,0.07)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: C.ocean }}>Receita 2026</div>
            <div style={{ fontSize: 12, color: C.gray }}>Serviços faturados</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 18, color: C.green }}>R$ 28.400</div>
            <div style={{ fontSize: 11, color: C.green }}>↑ 18% vs mai</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
          {receita.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: "100%", background: i === receita.length - 1 ? C.aqua : C.foam, borderRadius: "4px 4px 0 0", height: `${(v / maxVal) * 70}px`, transition: "height 0.4s", border: i === receita.length - 1 ? `none` : `1px solid ${C.lg}` }} />
              <div style={{ fontSize: 10, color: i === receita.length - 1 ? C.aqua : C.gray, fontWeight: i === receita.length - 1 ? 700 : 400 }}>{meses[i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* OSs recentes */}
      <div style={{ background: C.white, borderRadius: 14, padding: "16px", boxShadow: "0 2px 8px rgba(10,37,64,0.07)", marginBottom: 14 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: C.ocean, marginBottom: 12 }}>Ordens recentes</div>
        {ordens.slice(0, 3).map(o => (
          <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.lg}` }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.ocean }}>{o.embarcacao}</div>
              <div style={{ fontSize: 11, color: C.gray }}>{o.id} · {o.tipo} · {o.resp}</div>
            </div>
            <StatusBadge status={o.status} />
          </div>
        ))}
      </div>

      {/* Berços resumo */}
      <div style={{ background: C.white, borderRadius: 14, padding: "16px", boxShadow: "0 2px 8px rgba(10,37,64,0.07)" }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: C.ocean, marginBottom: 12 }}>Ocupação dos berços</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {bercos.map(b => (
            <div key={b.num} style={{ width: 48, height: 48, borderRadius: 10, background: b.status === "livre" ? "#d4edda" : b.status === "reservado" ? C.foam : b.status === "manutencao" ? "#f8d7da" : "#fff3cd", border: `1.5px solid ${b.status === "livre" ? C.green : b.status === "reservado" ? C.aqua : b.status === "manutencao" ? C.rust : C.gold}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.ocean }}>B{b.num}</div>
              <div style={{ fontSize: 9, color: C.gray, textAlign: "center", lineHeight: 1.2 }}>
                {b.status === "livre" ? "Livre" : b.status === "reservado" ? "Res." : b.status === "manutencao" ? "Mnt." : "Ocup."}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
          {[["#d4edda", C.green, "Livre"], ["#fff3cd", C.gold, "Ocupado"], [C.foam, C.aqua, "Reservado"], ["#f8d7da", C.rust, "Manutenção"]].map(([bg, border, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: bg, border: `1.5px solid ${border}` }} />
              <span style={{ fontSize: 11, color: C.gray }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── EQUIPE ───────────────────────────────────────────────────────────────────
function Equipe() {
  return (
    <div style={{ padding: "16px 16px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: C.ocean }}>{equipe.length} membros</div>
        <button style={{ background: C.aqua, color: C.white, border: "none", borderRadius: 8, padding: "7px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>+ Adicionar</button>
      </div>

      {/* Resumo */}
      <div style={{ background: C.foam, borderRadius: 12, padding: 12, marginBottom: 14, display: "flex" }}>
        {[
          { label: "Ativos",    count: equipe.filter(e => e.status === "ativo").length,    color: C.green },
          { label: "Em viagem", count: equipe.filter(e => e.status === "em_viagem").length, color: C.aqua  },
          { label: "Folga",     count: equipe.filter(e => e.status === "folga").length,     color: C.gray  },
        ].map((s, i) => (
          <div key={s.label} style={{ flex: 1, textAlign: "center", borderRight: i < 2 ? `1px solid ${C.lg}` : "none" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "'Space Grotesk', sans-serif" }}>{s.count}</div>
            <div style={{ fontSize: 11, color: C.gray }}>{s.label}</div>
          </div>
        ))}
      </div>

      {equipe.map((m, i) => (
        <div key={i} style={{ background: C.white, borderRadius: 14, padding: "14px 16px", marginBottom: 10, boxShadow: "0 2px 8px rgba(10,37,64,0.07)", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: C.foam, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, border: `1.5px solid ${C.lg}` }}>
            {m.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: C.ocean }}>{m.name}</div>
            <div style={{ fontSize: 12, color: C.gray }}>{m.role}</div>
            {m.os > 0 && <div style={{ fontSize: 11, color: C.aqua, fontWeight: 600, marginTop: 2 }}>{m.os} OS{m.os > 1 ? "s" : ""} hoje</div>}
          </div>
          <StatusBadge status={m.status} />
        </div>
      ))}
    </div>
  );
}

// ── ORDENS ───────────────────────────────────────────────────────────────────
function Ordens() {
  const tipoColor = { Limpeza: C.aqua, Manutenção: C.gold, Revisão: C.rust, Pintura: "#8e44ad" };
  return (
    <div style={{ padding: "16px 16px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: C.ocean }}>{ordens.length} ordens</div>
        <button style={{ background: C.aqua, color: C.white, border: "none", borderRadius: 8, padding: "7px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>+ Nova OS</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Aguardando",   n: ordens.filter(o => o.status === "aguardando").length,   color: C.aqua  },
          { label: "Andamento",    n: ordens.filter(o => o.status === "em_andamento").length,  color: C.gold  },
          { label: "Concluídas",   n: ordens.filter(o => o.status === "concluida").length,     color: C.green },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: C.white, borderRadius: 10, padding: "10px 8px", textAlign: "center", boxShadow: "0 1px 4px rgba(10,37,64,0.07)", borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 800, color: s.color }}>{s.n}</div>
            <div style={{ fontSize: 11, color: C.gray }}>{s.label}</div>
          </div>
        ))}
      </div>

      {ordens.map(o => (
        <div key={o.id} style={{ background: C.white, borderRadius: 14, padding: "14px 16px", marginBottom: 10, boxShadow: "0 2px 8px rgba(10,37,64,0.07)", borderLeft: `4px solid ${tipoColor[o.tipo] || C.aqua}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: C.gray, fontWeight: 600 }}>{o.id}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: C.ocean }}>{o.embarcacao}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <StatusBadge status={o.status} />
              {o.prioridade === "urgente" && <span style={{ background: C.rust, color: C.white, borderRadius: 5, padding: "1px 7px", fontSize: 9, fontWeight: 800, letterSpacing: 0.5 }}>🔴 URGENTE</span>}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
            <span style={{ background: tipoColor[o.tipo] ? `${tipoColor[o.tipo]}22` : C.foam, color: tipoColor[o.tipo] || C.wave, borderRadius: 6, padding: "2px 8px", fontWeight: 700 }}>{o.tipo}</span>
            <span style={{ color: C.gray }}>{o.resp} · {o.data}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── BERÇOS ───────────────────────────────────────────────────────────────────
function Bercos() {
  const statusColor = {
    ocupado: { bg: "#fff3cd", border: C.gold, label: "Ocupado" },
    livre: { bg: "#d4edda", border: C.green, label: "Livre" },
    reservado: { bg: C.foam, border: C.aqua, label: "Reservado" },
    manutencao: { bg: "#f8d7da", border: C.rust, label: "Manutenção" },
  };

  return (
    <div style={{ padding: "16px 16px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: C.ocean }}>8 berços</div>
        <button style={{ background: C.aqua, color: C.white, border: "none", borderRadius: 8, padding: "7px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>+ Reservar</button>
      </div>

      {/* Mapa visual */}
      <div style={{ background: C.ocean, borderRadius: 14, padding: 16, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.aqua, marginBottom: 12 }}>🗺 Mapa da Marina</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {bercos.map(b => {
            const s = statusColor[b.status];
            return (
              <div key={b.num} style={{ background: s.bg, border: `2px solid ${s.border}`, borderRadius: 10, padding: "10px 6px", textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: C.ocean }}>B{b.num}</div>
                <div style={{ fontSize: 8, color: C.gray, marginTop: 2, lineHeight: 1.3 }}>
                  {b.status === "livre" ? "Livre" : b.embarcacao.split(" ").slice(-1)[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {bercos.map((b, i) => {
        const s = statusColor[b.status];
        return (
          <div key={i} style={{ background: C.white, borderRadius: 14, padding: "14px 16px", marginBottom: 10, boxShadow: "0 2px 8px rgba(10,37,64,0.07)", borderLeft: `4px solid ${s.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: b.status !== "livre" ? 8 : 0 }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 16, color: C.ocean }}>Berço {b.num}</div>
              <StatusBadge status={b.status} />
            </div>
            {b.status !== "livre" && (
              <div style={{ background: C.sand, borderRadius: 8, padding: "8px 10px", fontSize: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ color: C.gray }}>Embarcação</span>
                  <span style={{ fontWeight: 600, color: C.ocean }}>{b.embarcacao}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ color: C.gray }}>Cliente</span>
                  <span style={{ fontWeight: 600, color: C.ocean }}>{b.cliente}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: C.gray }}>Período</span>
                  <span style={{ fontWeight: 600, color: C.ocean }}>{b.entrada} → {b.saida}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── RELATÓRIOS ───────────────────────────────────────────────────────────────
function Relatorios() {
  const relats = [
    { icon: "📊", title: "Resumo mensal — Junho 2026", sub: "OSs, receita, equipe e berços", tag: "Automático", color: C.aqua },
    { icon: "🔧", title: "Ordens de serviço — Junho", sub: "15 OSs · 12 concluídas · 3 pendentes", tag: "Pronto", color: C.green },
    { icon: "👥", title: "Documentos da equipe", sub: "2 vencimentos nos próximos 30 dias", tag: "Alerta", color: C.rust },
    { icon: "📦", title: "Controle de estoque", sub: "3 itens abaixo do mínimo", tag: "Alerta", color: C.gold },
    { icon: "⚓", title: "Ocupação de berços — Junho", sub: "Média 72% de ocupação", tag: "Pronto", color: C.wave },
    { icon: "💰", title: "Faturamento por serviço", sub: "Limpeza 48% · Manutenção 35% · Outros 17%", tag: "Pronto", color: C.green },
  ];

  return (
    <div style={{ padding: "16px 16px 80px" }}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: C.ocean, marginBottom: 6 }}>Relatórios</div>
      <div style={{ fontSize: 13, color: C.gray, marginBottom: 14 }}>Exportar em PDF ou compartilhar por link</div>

      {relats.map((r, i) => (
        <div key={i} style={{ background: C.white, borderRadius: 14, padding: "14px 16px", marginBottom: 10, boxShadow: "0 2px 8px rgba(10,37,64,0.07)", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${r.color}18`, border: `1.5px solid ${r.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
            {r.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: C.ocean }}>{r.title}</div>
            <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>{r.sub}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <span style={{ background: `${r.color}18`, color: r.color, borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{r.tag}</span>
            <button style={{ background: C.ocean, color: C.white, border: "none", borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>↓ PDF</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── ROOT ─────────────────────────────────────────────────────────────────────
export default function GestorMarina({ profile, state, onSave, onBack }) {
  const [activeTab, setActiveTab] = useState(state?.activeTab || "dashboard");

  useEffect(() => {
    if (state?.activeTab) {
      setActiveTab(state.activeTab);
    }
  }, [state?.activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (typeof onSave === "function") {
      onSave({ activeTab: tab });
    }
  };

  const renderTab = () => {
    if (activeTab === "dashboard") return <Dashboard />;
    if (activeTab === "equipe")    return <Equipe />;
    if (activeTab === "ordens")    return <Ordens />;
    if (activeTab === "bercos")    return <Bercos />;
    if (activeTab === "relatorio") return <Relatorios />;
  };

  return (
    <div style={{ minHeight: "100vh", background: C.sand, fontFamily: "'Inter', sans-serif", maxWidth: 420, margin: "0 auto" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Inter:wght@400;500;600;700&display=swap'); * { box-sizing: border-box; }`}</style>

      {/* Header */}
      <div style={{ background: C.ocean, padding: "20px 20px 0", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.aqua, marginBottom: 2 }}>⚓ BORDO.</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 800, color: C.white }}>{profile?.label || "Marina São Paulo"}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{profile?.desc || "Painel do Gestor · Junho 2026"}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {typeof onBack === "function" && (
              <button onClick={onBack} style={{ border: "1px solid rgba(255,255,255,0.25)", borderRadius: 14, background: "rgba(255,255,255,0.1)", color: C.white, padding: "8px 14px", cursor: "pointer" }}>
                ← Voltar
              </button>
            )}
            <div style={{ textAlign: "right" }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: C.aqua, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginLeft: "auto" }}>👔</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Gestor</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", overflowX: "auto" }}>
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)} style={{ flex: "0 0 auto", padding: "9px 14px", background: "transparent", border: "none", borderBottom: activeTab === tab.id ? `3px solid ${C.aqua}` : "3px solid transparent", color: activeTab === tab.id ? C.aqua : "rgba(255,255,255,0.4)", fontWeight: activeTab === tab.id ? 700 : 400, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {renderTab()}

      {/* Bottom bar */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 420, background: C.ocean, padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green }} />
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Online</span>
        </div>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>13/06/2026 · 09:42</span>
      </div>
    </div>
  );
}

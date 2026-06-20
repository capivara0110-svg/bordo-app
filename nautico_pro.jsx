import { useState } from "react";

const COLORS = {
  ocean: "#0A2540",
  wave: "#1B4F72",
  aqua: "#17A8BD",
  foam: "#E8F4F8",
  sand: "#F5F0E8",
  rust: "#C0392B",
  gold: "#F39C12",
  white: "#FFFFFF",
  gray: "#6B7B8D",
  lightGray: "#D5DDE5",
  green: "#27ae60",
};

const mockUser = { name: "Rafael Silva", role: "Marinheiro de Máquinas", vessel: "MV Esperança" };

const mockCrewData = [
  { name: "Rafael Silva", role: "Marinheiro de Máquinas", docs: { habilitacao: "2025-08-10", certificado: "2026-01-15" }, status: "ok" },
  { name: "Carlos Mendes", role: "Capitão", docs: { habilitacao: "2024-12-01", certificado: "2025-11-20" }, status: "vencido" },
  { name: "João Ferreira", role: "Contramestre", docs: { habilitacao: "2026-03-20", certificado: "2026-06-01" }, status: "ok" },
  { name: "Ana Costa", role: "Cozinheira de Bordo", docs: { habilitacao: "2025-07-05", certificado: "2026-02-10" }, status: "alerta" },
];

const mockLogs = [
  { id: 1, date: "12/06/2026", time: "08:00", type: "Saída", description: "Zarpe do Porto de Santos. Condições do mar: bom. 4 tripulantes.", author: "Carlos Mendes", signed: true },
  { id: 2, date: "12/06/2026", time: "14:30", type: "Ocorrência", description: "Falha no gerador secundário. Acionado técnico de bordo.", author: "Rafael Silva", signed: true },
  { id: 3, date: "13/06/2026", time: "07:15", type: "Manutenção", description: "Troca de óleo motor principal. 20L óleo 15W-40.", author: "Rafael Silva", signed: false },
];

const mockChecklist = [
  { id: 1, category: "Segurança", item: "Coletes salva-vidas verificados", done: true },
  { id: 2, category: "Segurança", item: "Sinalizadores dentro da validade", done: true },
  { id: 3, category: "Segurança", item: "Extintor de incêndio verificado", done: false },
  { id: 4, category: "Motor", item: "Nível de óleo verificado", done: true },
  { id: 5, category: "Motor", item: "Sistema de refrigeração OK", done: true },
  { id: 6, category: "Motor", item: "Correia do alternador inspecionada", done: false },
  { id: 7, category: "Navegação", item: "Cartas náuticas atualizadas", done: true },
  { id: 8, category: "Navegação", item: "GPS e rádio VHF testados", done: true },
  { id: 9, category: "Comunicação", item: "Rádio de emergência (EPirb) ativo", done: false },
];

const mockStock = [
  { name: "Óleo Motor 15W-40", unit: "L", qty: 12, min: 20, category: "Motor" },
  { name: "Filtro de combustível", unit: "un", qty: 3, min: 2, category: "Motor" },
  { name: "Combustível diesel", unit: "L", qty: 850, min: 300, category: "Combustível" },
  { name: "Extintores reserva", unit: "un", qty: 1, min: 2, category: "Segurança" },
  { name: "Kit primeiros socorros", unit: "un", qty: 2, min: 1, category: "Segurança" },
  { name: "Água potável", unit: "L", qty: 200, min: 100, category: "Suprimentos" },
  { name: "Alimentos (rações)", unit: "dias", qty: 5, min: 3, category: "Suprimentos" },
];

const mockOrdens = [
  {
    id: 1,
    codigo: "OS-2026-041",
    embarcacao: "Lancha Brisa Mar",
    cliente: "Pedro Albuquerque",
    tipo: "Limpeza",
    prioridade: "normal",
    status: "em_andamento",
    descricao: "Limpeza completa do casco, convés e cabine interna.",
    areas: ["Casco", "Convés", "Cabine"],
    responsavel: "Rafael Silva",
    abertura: "13/06/2026",
    previsao: "13/06/2026",
    itens: [
      { tarefa: "Lavar casco com produto anti-incrustante", done: true },
      { tarefa: "Limpar e polir convés", done: true },
      { tarefa: "Aspirar e limpar cabine interna", done: false },
      { tarefa: "Lavar compartimento do motor", done: false },
    ],
    fotos: 2,
    observacao: "",
  },
  {
    id: 2,
    codigo: "OS-2026-039",
    embarcacao: "MV Esperança",
    cliente: "Marina São Paulo",
    tipo: "Manutenção",
    prioridade: "urgente",
    status: "aguardando",
    descricao: "Revisão do motor principal e troca de filtros.",
    areas: ["Praça de Máquinas"],
    responsavel: "Carlos Mendes",
    abertura: "12/06/2026",
    previsao: "14/06/2026",
    itens: [
      { tarefa: "Trocar filtro de óleo", done: false },
      { tarefa: "Trocar filtro de combustível", done: false },
      { tarefa: "Verificar correias e mangueiras", done: false },
      { tarefa: "Testar sistema elétrico", done: false },
    ],
    fotos: 0,
    observacao: "",
  },
  {
    id: 3,
    codigo: "OS-2026-037",
    embarcacao: "Veleiro Nautilus",
    cliente: "Ana Rodrigues",
    tipo: "Pintura",
    prioridade: "normal",
    status: "concluida",
    descricao: "Pintura antifouling do casco.",
    areas: ["Casco"],
    responsavel: "Rafael Silva",
    abertura: "10/06/2026",
    previsao: "12/06/2026",
    itens: [
      { tarefa: "Lixar superfície do casco", done: true },
      { tarefa: "Aplicar primeira demão antifouling", done: true },
      { tarefa: "Aplicar segunda demão antifouling", done: true },
      { tarefa: "Inspeção final e fotos", done: true },
    ],
    fotos: 6,
    observacao: "Serviço concluído com aprovação do cliente.",
  },
];

const tabs = [
  { id: "ordens", label: "Ordens de Serviço", icon: "🔧" },
  { id: "diario", label: "Diário de Bordo", icon: "📋" },
  { id: "tripulacao", label: "Tripulação", icon: "👥" },
  { id: "checklist", label: "Check-list", icon: "✅" },
  { id: "estoque", label: "Estoque", icon: "📦" },
];

function Badge({ status }) {
  const map = {
    ok: { bg: "#d4edda", color: "#155724", label: "OK" },
    alerta: { bg: "#fff3cd", color: "#856404", label: "Atenção" },
    vencido: { bg: "#f8d7da", color: "#721c24", label: "Vencido" },
  };
  const s = map[status] || map.ok;
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
      {s.label}
    </span>
  );
}

function StatusOS({ status }) {
  const map = {
    aguardando: { bg: "#E8F4F8", color: COLORS.wave, label: "Aguardando", icon: "⏳" },
    em_andamento: { bg: "#fff3cd", color: "#856404", label: "Em andamento", icon: "🔨" },
    concluida: { bg: "#d4edda", color: "#155724", label: "Concluída", icon: "✔" },
  };
  const s = map[status] || map.aguardando;
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 6, padding: "3px 9px", fontSize: 11, fontWeight: 700 }}>
      {s.icon} {s.label}
    </span>
  );
}

function PrioridadeBadge({ prioridade }) {
  return prioridade === "urgente"
    ? <span style={{ background: COLORS.rust, color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>🔴 URGENTE</span>
    : null;
}

function StockBar({ qty, min }) {
  const pct = Math.min((qty / (min * 2)) * 100, 100);
  const color = qty < min ? COLORS.rust : qty < min * 1.3 ? COLORS.gold : COLORS.aqua;
  return (
    <div style={{ background: COLORS.lightGray, borderRadius: 4, height: 6, width: "100%", marginTop: 4 }}>
      <div style={{ width: `${pct}%`, background: color, borderRadius: 4, height: "100%", transition: "width 0.4s" }} />
    </div>
  );
}

// ─── ORDENS DE SERVIÇO ───────────────────────────────────────────────────────
function OrdensServico() {
  const [ordens, setOrdens] = useState(mockOrdens);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("todas");
  const [novaOS, setNovaOS] = useState({ embarcacao: "", cliente: "", tipo: "Limpeza", prioridade: "normal", descricao: "", areas: [] });

  const tipoColors = { Limpeza: COLORS.aqua, Manutenção: COLORS.gold, Pintura: "#8e44ad", Reparo: COLORS.rust };
  const areaOptions = ["Casco", "Convés", "Cabine", "Praça de Máquinas", "Convés Superior", "Banheiros", "Compartimento do Motor"];

  const filtradas = filterStatus === "todas" ? ordens : ordens.filter(o => o.status === filterStatus);

  const toggleItemOS = (osId, idx) => {
    setOrdens(ordens.map(o => {
      if (o.id !== osId) return o;
      const itens = o.itens.map((it, i) => i === idx ? { ...it, done: !it.done } : it);
      const allDone = itens.every(it => it.done);
      return { ...o, itens, status: allDone ? "concluida" : "em_andamento" };
    }));
    if (selected?.id === osId) {
      const updated = ordens.find(o => o.id === osId);
      const itens = updated.itens.map((it, i) => i === idx ? { ...it, done: !it.done } : it);
      setSelected({ ...updated, itens, status: itens.every(it => it.done) ? "concluida" : "em_andamento" });
    }
  };

  const criarOS = () => {
    if (!novaOS.embarcacao.trim() || !novaOS.descricao.trim()) return;
    const nova = {
      id: Date.now(),
      codigo: `OS-2026-${String(ordens.length + 42).padStart(3, "0")}`,
      embarcacao: novaOS.embarcacao,
      cliente: novaOS.cliente,
      tipo: novaOS.tipo,
      prioridade: novaOS.prioridade,
      status: "aguardando",
      descricao: novaOS.descricao,
      areas: novaOS.areas,
      responsavel: mockUser.name,
      abertura: new Date().toLocaleDateString("pt-BR"),
      previsao: new Date().toLocaleDateString("pt-BR"),
      itens: [{ tarefa: "Avaliar serviço no local", done: false }],
      fotos: 0,
      observacao: "",
    };
    setOrdens([nova, ...ordens]);
    setNovaOS({ embarcacao: "", cliente: "", tipo: "Limpeza", prioridade: "normal", descricao: "", areas: [] });
    setShowForm(false);
  };

  const toggleArea = (area) => {
    setNovaOS(n => ({
      ...n,
      areas: n.areas.includes(area) ? n.areas.filter(a => a !== area) : [...n.areas, area]
    }));
  };

  // DETALHE DA OS
  if (selected) {
    const os = ordens.find(o => o.id === selected.id) || selected;
    const done = os.itens.filter(i => i.done).length;
    const pct = Math.round((done / os.itens.length) * 100);
    return (
      <div>
        <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: COLORS.aqua, fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 12, padding: 0 }}>
          ← Voltar às ordens
        </button>

        <div style={{ background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 2px 8px rgba(10,37,64,0.09)", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 12, color: COLORS.gray, fontWeight: 600 }}>{os.codigo}</div>
              <div style={{ fontWeight: 800, fontSize: 17, color: COLORS.ocean }}>{os.embarcacao}</div>
              <div style={{ fontSize: 13, color: COLORS.gray }}>Cliente: {os.cliente || "—"}</div>
            </div>
            <StatusOS status={os.status} />
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{ background: tipoColors[os.tipo] || COLORS.aqua, color: "#fff", borderRadius: 6, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>{os.tipo}</span>
            <PrioridadeBadge prioridade={os.prioridade} />
            {os.areas.map(a => <span key={a} style={{ background: COLORS.foam, color: COLORS.wave, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{a}</span>)}
          </div>

          <div style={{ fontSize: 14, color: COLORS.ocean, lineHeight: 1.5, marginBottom: 10 }}>{os.descricao}</div>

          <div style={{ display: "flex", gap: 16, fontSize: 12, color: COLORS.gray }}>
            <span>📅 Abertura: {os.abertura}</span>
            <span>🗓 Previsão: {os.previsao}</span>
          </div>
        </div>

        {/* Progresso */}
        <div style={{ background: COLORS.ocean, borderRadius: 12, padding: 14, marginBottom: 12, color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontWeight: 700 }}>Progresso das tarefas</span>
            <span style={{ fontWeight: 800, color: pct === 100 ? "#2ecc71" : COLORS.gold }}>{pct}%</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 6, height: 8 }}>
            <div style={{ width: `${pct}%`, background: pct === 100 ? "#2ecc71" : COLORS.aqua, borderRadius: 6, height: "100%", transition: "width 0.4s" }} />
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{done} de {os.itens.length} tarefas concluídas</div>
        </div>

        {/* Tarefas */}
        <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.ocean, marginBottom: 8 }}>Tarefas</div>
        {os.itens.map((item, idx) => (
          <div key={idx} onClick={() => toggleItemOS(os.id, idx)} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 10, padding: "12px 14px", marginBottom: 6, cursor: "pointer", boxShadow: "0 1px 3px rgba(10,37,64,0.07)", opacity: item.done ? 0.7 : 1 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${item.done ? COLORS.green : COLORS.lightGray}`, background: item.done ? COLORS.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
              {item.done && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{ fontSize: 14, color: item.done ? COLORS.gray : COLORS.ocean, textDecoration: item.done ? "line-through" : "none" }}>{item.tarefa}</span>
          </div>
        ))}

        {/* Fotos e Assinatura */}
        <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
          <button style={{ flex: 1, background: COLORS.foam, color: COLORS.wave, border: `1.5px solid ${COLORS.aqua}`, borderRadius: 10, padding: "11px 0", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            📸 Fotos ({os.fotos})
          </button>
          <button style={{ flex: 1, background: pct === 100 ? COLORS.green : COLORS.lightGray, color: pct === 100 ? "#fff" : COLORS.gray, border: "none", borderRadius: 10, padding: "11px 0", fontWeight: 700, fontSize: 13, cursor: pct === 100 ? "pointer" : "default", transition: "all 0.3s" }}>
            {pct === 100 ? "✔ Assinar OS" : "Finalizar tarefas"}
          </button>
        </div>
      </div>
    );
  }

  // LISTA DE OS
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: COLORS.ocean }}>Ordens de Serviço</div>
          <div style={{ fontSize: 13, color: COLORS.gray }}>{ordens.length} ordens · {ordens.filter(o => o.status === "em_andamento").length} em andamento</div>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: COLORS.aqua, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          + Nova OS
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto" }}>
        {[["todas", "Todas"], ["aguardando", "Aguardando"], ["em_andamento", "Em andamento"], ["concluida", "Concluídas"]].map(([val, label]) => (
          <button key={val} onClick={() => setFilterStatus(val)} style={{ flexShrink: 0, padding: "5px 12px", borderRadius: 20, border: "none", background: filterStatus === val ? COLORS.ocean : COLORS.foam, color: filterStatus === val ? "#fff" : COLORS.gray, fontWeight: filterStatus === val ? 700 : 400, fontSize: 12, cursor: "pointer" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Resumo rápido */}
      <div style={{ background: COLORS.foam, borderRadius: 10, padding: 12, marginBottom: 14, display: "flex", gap: 0 }}>
        {[
          { label: "Aguardando", count: ordens.filter(o => o.status === "aguardando").length, color: COLORS.wave },
          { label: "Em andamento", count: ordens.filter(o => o.status === "em_andamento").length, color: COLORS.gold },
          { label: "Concluídas", count: ordens.filter(o => o.status === "concluida").length, color: COLORS.green },
        ].map((s, i) => (
          <div key={s.label} style={{ flex: 1, textAlign: "center", borderRight: i < 2 ? `1px solid ${COLORS.lightGray}` : "none" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 11, color: COLORS.gray }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Formulário nova OS */}
      {showForm && (
        <div style={{ background: COLORS.foam, borderRadius: 12, padding: 16, marginBottom: 16, border: `1.5px solid ${COLORS.aqua}` }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.ocean, marginBottom: 12 }}>Nova Ordem de Serviço</div>

          <input value={novaOS.embarcacao} onChange={e => setNovaOS({ ...novaOS, embarcacao: e.target.value })} placeholder="Nome da embarcação *" style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: `1px solid ${COLORS.lightGray}`, marginBottom: 8, fontSize: 14, color: COLORS.ocean, boxSizing: "border-box" }} />
          <input value={novaOS.cliente} onChange={e => setNovaOS({ ...novaOS, cliente: e.target.value })} placeholder="Nome do cliente" style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: `1px solid ${COLORS.lightGray}`, marginBottom: 8, fontSize: 14, color: COLORS.ocean, boxSizing: "border-box" }} />

          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <select value={novaOS.tipo} onChange={e => setNovaOS({ ...novaOS, tipo: e.target.value })} style={{ flex: 1, padding: "9px 10px", borderRadius: 8, border: `1px solid ${COLORS.lightGray}`, fontSize: 14, color: COLORS.ocean }}>
              {["Limpeza", "Manutenção", "Pintura", "Reparo"].map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={novaOS.prioridade} onChange={e => setNovaOS({ ...novaOS, prioridade: e.target.value })} style={{ flex: 1, padding: "9px 10px", borderRadius: 8, border: `1px solid ${COLORS.lightGray}`, fontSize: 14, color: COLORS.ocean }}>
              <option value="normal">Normal</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: COLORS.gray, marginBottom: 6, fontWeight: 600 }}>Áreas de trabalho</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {areaOptions.map(area => (
                <button key={area} onClick={() => toggleArea(area)} style={{ padding: "4px 10px", borderRadius: 20, border: "none", background: novaOS.areas.includes(area) ? COLORS.aqua : COLORS.lightGray, color: novaOS.areas.includes(area) ? "#fff" : COLORS.gray, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  {area}
                </button>
              ))}
            </div>
          </div>

          <textarea value={novaOS.descricao} onChange={e => setNovaOS({ ...novaOS, descricao: e.target.value })} placeholder="Descrição do serviço *" rows={3} style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: `1px solid ${COLORS.lightGray}`, fontSize: 14, resize: "none", color: COLORS.ocean, boxSizing: "border-box", marginBottom: 10 }} />

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={criarOS} style={{ flex: 1, background: COLORS.ocean, color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 700, cursor: "pointer" }}>Abrir OS</button>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, background: COLORS.lightGray, color: COLORS.ocean, border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Cards */}
      {filtradas.map(os => {
        const done = os.itens.filter(i => i.done).length;
        const pct = Math.round((done / os.itens.length) * 100);
        return (
          <div key={os.id} onClick={() => setSelected(os)} style={{ background: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, boxShadow: "0 1px 4px rgba(10,37,64,0.08)", cursor: "pointer", borderLeft: `4px solid ${tipoColors[os.tipo] || COLORS.aqua}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 11, color: COLORS.gray, fontWeight: 600 }}>{os.codigo}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.ocean }}>{os.embarcacao}</div>
                {os.cliente && <div style={{ fontSize: 12, color: COLORS.gray }}>{os.cliente}</div>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <StatusOS status={os.status} />
                <PrioridadeBadge prioridade={os.prioridade} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ background: tipoColors[os.tipo] || COLORS.aqua, color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{os.tipo}</span>
              {os.areas.slice(0, 2).map(a => <span key={a} style={{ background: COLORS.foam, color: COLORS.wave, borderRadius: 6, padding: "2px 8px", fontSize: 11 }}>{a}</span>)}
              {os.areas.length > 2 && <span style={{ background: COLORS.foam, color: COLORS.gray, borderRadius: 6, padding: "2px 8px", fontSize: 11 }}>+{os.areas.length - 2}</span>}
            </div>

            <div style={{ background: COLORS.lightGray, borderRadius: 4, height: 5, marginBottom: 6 }}>
              <div style={{ width: `${pct}%`, background: pct === 100 ? COLORS.green : COLORS.aqua, borderRadius: 4, height: "100%", transition: "width 0.4s" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.gray }}>
              <span>{done}/{os.itens.length} tarefas · {pct}%</span>
              <span>📸 {os.fotos} foto{os.fotos !== 1 ? "s" : ""} · 📅 {os.previsao}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── DIÁRIO DE BORDO ─────────────────────────────────────────────────────────
function DiarioBordo() {
  const [logs, setLogs] = useState(mockLogs);
  const [showForm, setShowForm] = useState(false);
  const [newLog, setNewLog] = useState({ type: "Ocorrência", description: "" });
  const typeColors = { Saída: COLORS.aqua, Ocorrência: COLORS.rust, Manutenção: COLORS.gold, Chegada: COLORS.green };

  const addLog = () => {
    if (!newLog.description.trim()) return;
    const now = new Date();
    setLogs([{ id: Date.now(), date: now.toLocaleDateString("pt-BR"), time: now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), type: newLog.type, description: newLog.description, author: mockUser.name, signed: false }, ...logs]);
    setNewLog({ type: "Ocorrência", description: "" });
    setShowForm(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: COLORS.ocean }}>Diário de Bordo</div>
          <div style={{ fontSize: 13, color: COLORS.gray }}>{mockUser.vessel}</div>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: COLORS.aqua, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Registrar</button>
      </div>

      {showForm && (
        <div style={{ background: COLORS.foam, borderRadius: 12, padding: 16, marginBottom: 16, border: `1.5px solid ${COLORS.aqua}` }}>
          <div style={{ fontWeight: 600, marginBottom: 10, color: COLORS.ocean }}>Novo Registro</div>
          <select value={newLog.type} onChange={e => setNewLog({ ...newLog, type: e.target.value })} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${COLORS.lightGray}`, marginBottom: 10, fontSize: 14, color: COLORS.ocean }}>
            {["Saída", "Chegada", "Ocorrência", "Manutenção"].map(t => <option key={t}>{t}</option>)}
          </select>
          <textarea value={newLog.description} onChange={e => setNewLog({ ...newLog, description: e.target.value })} placeholder="Descreva o evento ou ocorrência..." rows={3} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${COLORS.lightGray}`, fontSize: 14, resize: "none", color: COLORS.ocean, boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={addLog} style={{ flex: 1, background: COLORS.ocean, color: "#fff", border: "none", borderRadius: 8, padding: "9px 0", fontWeight: 700, cursor: "pointer" }}>Salvar</button>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, background: COLORS.lightGray, color: COLORS.ocean, border: "none", borderRadius: 8, padding: "9px 0", fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
          </div>
        </div>
      )}

      {logs.map(log => (
        <div key={log.id} style={{ background: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, boxShadow: "0 1px 4px rgba(10,37,64,0.08)", borderLeft: `4px solid ${typeColors[log.type] || COLORS.aqua}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ background: typeColors[log.type] || COLORS.aqua, color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{log.type}</span>
            <span style={{ fontSize: 11, color: COLORS.gray }}>{log.date} • {log.time}</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 14, color: COLORS.ocean, lineHeight: 1.5 }}>{log.description}</div>
          <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: COLORS.gray }}>por {log.author}</span>
            <span style={{ fontSize: 11, color: log.signed ? COLORS.green : COLORS.gold, fontWeight: 600 }}>{log.signed ? "✔ Assinado" : "⏳ Pendente"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── TRIPULAÇÃO ───────────────────────────────────────────────────────────────
function Tripulacao() {
  const today = new Date();
  const getDaysLeft = (dateStr) => Math.ceil((new Date(dateStr) - today) / (1000 * 60 * 60 * 24));

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 18, color: COLORS.ocean, marginBottom: 4 }}>Tripulação</div>
      <div style={{ fontSize: 13, color: COLORS.gray, marginBottom: 16 }}>{mockUser.vessel} • {mockCrewData.length} membros</div>

      <div style={{ background: COLORS.foam, borderRadius: 10, padding: 12, marginBottom: 16, display: "flex" }}>
        {[{ label: "OK", count: mockCrewData.filter(c => c.status === "ok").length, color: COLORS.green },
          { label: "Atenção", count: mockCrewData.filter(c => c.status === "alerta").length, color: COLORS.gold },
          { label: "Vencido", count: mockCrewData.filter(c => c.status === "vencido").length, color: COLORS.rust }].map((s, i) => (
          <div key={s.label} style={{ flex: 1, textAlign: "center", borderRight: i < 2 ? `1px solid ${COLORS.lightGray}` : "none" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 11, color: COLORS.gray }}>{s.label}</div>
          </div>
        ))}
      </div>

      {mockCrewData.map((crew, i) => {
        const days = getDaysLeft(crew.docs.habilitacao);
        return (
          <div key={i} style={{ background: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, boxShadow: "0 1px 4px rgba(10,37,64,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.ocean }}>{crew.name}</div>
                <div style={{ fontSize: 12, color: COLORS.gray }}>{crew.role}</div>
              </div>
              <Badge status={crew.status} />
            </div>
            <div style={{ marginTop: 10, background: COLORS.foam, borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: COLORS.gray }}>🪪 Habilitação Náutica</span>
                <span style={{ color: days < 60 ? COLORS.rust : COLORS.ocean, fontWeight: 600 }}>
                  {new Date(crew.docs.habilitacao).toLocaleDateString("pt-BR")}
                  {days < 60 && <span style={{ color: COLORS.rust }}> ({days}d)</span>}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 4 }}>
                <span style={{ color: COLORS.gray }}>📄 Certificado</span>
                <span style={{ color: COLORS.ocean, fontWeight: 600 }}>{new Date(crew.docs.certificado).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── CHECKLIST ────────────────────────────────────────────────────────────────
function Checklist() {
  const [items, setItems] = useState(mockChecklist);
  const categories = [...new Set(items.map(i => i.category))];
  const done = items.filter(i => i.done).length;
  const pct = Math.round((done / items.length) * 100);
  const toggle = (id) => setItems(items.map(i => i.id === id ? { ...i, done: !i.done } : i));

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 18, color: COLORS.ocean, marginBottom: 4 }}>Check-list de Saída</div>
      <div style={{ fontSize: 13, color: COLORS.gray, marginBottom: 12 }}>Verificação obrigatória antes de zarpar</div>

      <div style={{ background: COLORS.ocean, borderRadius: 12, padding: 16, marginBottom: 16, color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontWeight: 700 }}>{done}/{items.length} itens verificados</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: pct === 100 ? "#2ecc71" : COLORS.gold }}>{pct}%</span>
        </div>
        <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 6, height: 8 }}>
          <div style={{ width: `${pct}%`, background: pct === 100 ? "#2ecc71" : COLORS.aqua, borderRadius: 6, height: "100%", transition: "width 0.4s" }} />
        </div>
        {pct === 100 && <div style={{ marginTop: 8, fontSize: 13, color: "#2ecc71", fontWeight: 600 }}>✔ Embarcação pronta para zarpar!</div>}
      </div>

      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.gray, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{cat}</div>
          {items.filter(i => i.category === cat).map(item => (
            <div key={item.id} onClick={() => toggle(item.id)} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 10, padding: "12px 14px", marginBottom: 6, cursor: "pointer", boxShadow: "0 1px 3px rgba(10,37,64,0.07)", opacity: item.done ? 0.75 : 1 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${item.done ? COLORS.aqua : COLORS.lightGray}`, background: item.done ? COLORS.aqua : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                {item.done && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontSize: 14, color: item.done ? COLORS.gray : COLORS.ocean, textDecoration: item.done ? "line-through" : "none" }}>{item.item}</span>
            </div>
          ))}
        </div>
      ))}

      <button style={{ width: "100%", background: pct === 100 ? COLORS.green : COLORS.lightGray, color: pct === 100 ? "#fff" : COLORS.gray, border: "none", borderRadius: 10, padding: "13px 0", fontWeight: 700, fontSize: 15, cursor: pct === 100 ? "pointer" : "default", marginTop: 4, transition: "all 0.3s" }}>
        {pct === 100 ? "Assinar e Registrar no Diário" : `Faltam ${items.length - done} itens`}
      </button>
    </div>
  );
}

// ─── ESTOQUE ─────────────────────────────────────────────────────────────────
function Estoque() {
  const [stock, setStock] = useState(mockStock);
  const categories = [...new Set(stock.map(i => i.category))];
  const alerts = stock.filter(i => i.qty < i.min).length;

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 18, color: COLORS.ocean, marginBottom: 4 }}>Estoque de Bordo</div>
      <div style={{ fontSize: 13, color: COLORS.gray, marginBottom: 12 }}>{mockUser.vessel}</div>

      {alerts > 0 && (
        <div style={{ background: "#fdf3cd", border: `1.5px solid ${COLORS.gold}`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span style={{ fontSize: 13, color: "#856404", fontWeight: 600 }}>{alerts} item(ns) abaixo do mínimo recomendado</span>
        </div>
      )}

      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.gray, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{cat}</div>
          {stock.filter(i => i.category === cat).map((item, idx) => {
            const low = item.qty < item.min;
            const warn = item.qty < item.min * 1.3;
            return (
              <div key={idx} style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", marginBottom: 6, boxShadow: "0 1px 3px rgba(10,37,64,0.07)", borderLeft: `4px solid ${low ? COLORS.rust : warn ? COLORS.gold : COLORS.aqua}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.ocean }}>{item.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button onClick={() => setStock(stock.map(s => s.name === item.name ? { ...s, qty: Math.max(0, s.qty - 1) } : s))} style={{ background: COLORS.lightGray, border: "none", borderRadius: 6, width: 26, height: 26, cursor: "pointer", fontWeight: 700, color: COLORS.ocean }}>-</button>
                    <span style={{ fontWeight: 800, fontSize: 15, color: low ? COLORS.rust : COLORS.ocean, minWidth: 32, textAlign: "center" }}>{item.qty}</span>
                    <button onClick={() => setStock(stock.map(s => s.name === item.name ? { ...s, qty: s.qty + 1 } : s))} style={{ background: COLORS.aqua, border: "none", borderRadius: 6, width: 26, height: 26, cursor: "pointer", fontWeight: 700, color: "#fff" }}>+</button>
                    <span style={{ fontSize: 11, color: COLORS.gray, marginLeft: 2 }}>{item.unit}</span>
                  </div>
                </div>
                <StockBar qty={item.qty} min={item.min} />
                <div style={{ fontSize: 11, color: COLORS.gray, marginTop: 3 }}>Mínimo recomendado: {item.min} {item.unit}</div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function NauticoPro() {
  const [activeTab, setActiveTab] = useState("ordens");

  const renderTab = () => {
    if (activeTab === "ordens") return <OrdensServico />;
    if (activeTab === "diario") return <DiarioBordo />;
    if (activeTab === "tripulacao") return <Tripulacao />;
    if (activeTab === "checklist") return <Checklist />;
    if (activeTab === "estoque") return <Estoque />;
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.sand, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ background: COLORS.ocean, padding: "16px 20px 12px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: COLORS.aqua, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>⚓ Náutico Pro</div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginTop: 1 }}>{mockUser.name}</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{mockUser.role} · {mockUser.vessel}</div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: COLORS.aqua, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚓</div>
        </div>
      </div>

      <div style={{ background: COLORS.wave, display: "flex", overflowX: "auto", padding: "0 8px" }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: "0 0 auto", padding: "10px 14px", background: "transparent", border: "none", borderBottom: activeTab === tab.id ? `3px solid ${COLORS.aqua}` : "3px solid transparent", color: activeTab === tab.id ? COLORS.aqua : "rgba(255,255,255,0.6)", fontWeight: activeTab === tab.id ? 700 : 400, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "16px 16px 80px" }}>{renderTab()}</div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: COLORS.ocean, padding: "10px 20px", display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2ecc71", animation: "pulse 2s infinite" }} />
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Online · Última sync: agora mesmo</span>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

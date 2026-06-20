import { useState } from "react";

const C = {
  ocean: "#0A2540", wave: "#1B4F72", aqua: "#17A8BD",
  foam: "#E4F4F8", sand: "#F7F3EC", rust: "#C0392B",
  gold: "#F39C12", green: "#27AE60", gray: "#6B7B8D",
  lg: "#D5DDE5", white: "#FFFFFF",
};

// ── DADOS MOCK ───────────────────────────────────────────────────────────────
const mockHoras = [
  { id: 1, data: "13/06/2026", entrada: "07:30", saida: "12:00", duracao: "4h30", embarcacao: "Lancha Brisa Mar", os: "OS-041", tipo: "Limpeza" },
  { id: 2, data: "13/06/2026", entrada: "13:30", saida: "16:45", duracao: "3h15", embarcacao: "Veleiro Nautilus", os: "OS-042", tipo: "Manutenção" },
  { id: 3, data: "12/06/2026", entrada: "08:00", saida: "17:30", duracao: "9h30", embarcacao: "MV Esperança",    os: "OS-039", tipo: "Revisão" },
  { id: 4, data: "11/06/2026", entrada: "07:00", saida: "13:00", duracao: "6h00", embarcacao: "Lancha Aurora",   os: "OS-038", tipo: "Limpeza" },
];

const mockFotos = [
  { id: 1, os: "OS-041", tipo: "Antes",  area: "Casco",   hora: "08:15", cor: "#1B4F72" },
  { id: 2, os: "OS-041", tipo: "Depois", area: "Casco",   hora: "10:30", cor: "#17A8BD" },
  { id: 3, os: "OS-041", tipo: "Depois", area: "Convés",  hora: "11:00", cor: "#0A2540" },
  { id: 4, os: "OS-041", tipo: "Depois", area: "Cabine",  hora: "11:45", cor: "#27AE60" },
  { id: 5, os: "OS-042", tipo: "Antes",  area: "Motor",   hora: "13:40", cor: "#C0392B" },
  { id: 6, os: "OS-042", tipo: "Depois", area: "Motor",   hora: "15:20", cor: "#F39C12" },
];

const mockEmbarcacoes = [
  { id: 1, nome: "MV Esperança",      tipo: "Rebocador", registro: "SP-034521-B", cor: C.aqua,  status: "ativo" },
  { id: 2, nome: "Lancha Brisa Mar",  tipo: "Lancha",    registro: "SP-019832-A", cor: C.gold,  status: "atracada" },
  { id: 3, nome: "Veleiro Nautilus",  tipo: "Veleiro",   registro: "RJ-008741-C", cor: "#8e44ad", status: "em_servico" },
];

// ── COMPONENTES COMUNS ───────────────────────────────────────────────────────
function Header({ title, sub, onBack }) {
  return (
    <div style={{ background: C.ocean, padding: "20px 20px 16px", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontSize: 18, cursor: "pointer", flexShrink: 0 }}>←</button>
        )}
        <div>
          <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>⚓ BORDO.</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 800, color: C.white }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

// ── TELA 1: CONFIGURAÇÕES ────────────────────────────────────────────────────
function Configuracoes({ onNav }) {
  const [notifDocs, setNotifDocs]   = useState(true);
  const [notifOS, setNotifOS]       = useState(true);
  const [notifEst, setNotifEst]     = useState(false);
  const [modoOffline, setOffline]   = useState(true);
  const [temaEscuro, setTema]       = useState(false);

  const Toggle = ({ on, set }) => (
    <div onClick={() => set(!on)} style={{ width: 44, height: 26, borderRadius: 13, background: on ? C.aqua : C.lg, position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
      <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.white, position: "absolute", top: 3, left: on ? 21 : 3, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
    </div>
  );

  const Row = ({ icon, label, sub, children }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: `1px solid ${C.lg}` }}>
      <span style={{ fontSize: 20, width: 28, textAlign: "center", flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.ocean }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: C.gray, marginTop: 1 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );

  const Section = ({ title }) => (
    <div style={{ padding: "16px 16px 8px", fontSize: 11, fontWeight: 700, color: C.gray, letterSpacing: 2, textTransform: "uppercase" }}>{title}</div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.sand, fontFamily: "'Inter', sans-serif", maxWidth: 420, margin: "0 auto" }}>
      <Header title="Configurações" />

      {/* Perfil */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ background: C.white, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(10,37,64,0.07)", marginBottom: 12 }}>
          <div style={{ background: C.ocean, padding: "20px 16px", display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: C.aqua, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>🧑‍✈️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: C.white }}>Carlos Mendes</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Capitão · MV Esperança</div>
              <div style={{ fontSize: 11, color: C.aqua, marginTop: 2 }}>carlos@marinasaopaulo.com.br</div>
            </div>
            <button style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: "6px 10px", color: C.white, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Editar</button>
          </div>
        </div>

        {/* Notificações */}
        <div style={{ background: C.white, borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(10,37,64,0.07)", marginBottom: 12 }}>
          <Section title="Notificações" />
          <Row icon="📄" label="Documentos vencendo" sub="Alerta 30 dias antes"><Toggle on={notifDocs} set={setNotifDocs} /></Row>
          <Row icon="🔧" label="Novas ordens de serviço" sub="Quando uma OS for atribuída"><Toggle on={notifOS} set={setNotifOS} /></Row>
          <Row icon="📦" label="Estoque abaixo do mínimo" sub="Alerta quando crítico"><Toggle on={notifEst} set={setNotifEst} /></Row>
        </div>

        {/* App */}
        <div style={{ background: C.white, borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(10,37,64,0.07)", marginBottom: 12 }}>
          <Section title="App" />
          <Row icon="📶" label="Modo offline" sub="Salva dados sem internet"><Toggle on={modoOffline} set={setOffline} /></Row>
          <Row icon="🌙" label="Tema escuro" sub="Melhor visibilidade no mar"><Toggle on={temaEscuro} set={setTema} /></Row>
          <Row icon="⚓" label="Minhas embarcações" sub="3 cadastradas">
            <button onClick={() => onNav("embarcacoes")} style={{ background: C.foam, border: "none", borderRadius: 8, padding: "5px 10px", color: C.wave, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Ver →</button>
          </Row>
          <Row icon="🔐" label="Trocar senha" sub="">
            <span style={{ color: C.lg, fontSize: 18 }}>›</span>
          </Row>
        </div>

        {/* Plano */}
        <div style={{ background: C.ocean, borderRadius: 14, padding: "16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Plano atual</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 800, color: C.white }}>Profissional</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Renova em 01/07/2026 · R$49/mês</div>
          </div>
          <button style={{ background: C.aqua, color: C.white, border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Gerenciar</button>
        </div>

        {/* Sair */}
        <div style={{ background: C.white, borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(10,37,64,0.07)", marginBottom: 32 }}>
          <Row icon="🚪" label="Sair da conta" sub="">
            <span style={{ color: C.rust, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Sair</span>
          </Row>
          <Row icon="🗑️" label="Excluir conta" sub="">
            <span style={{ color: C.rust, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Excluir</span>
          </Row>
        </div>

        <div style={{ textAlign: "center", fontSize: 11, color: C.lg, paddingBottom: 32 }}>
          BORDO. v1.0.0 · Gestão Náutica · bordo.app
        </div>
      </div>
    </div>
  );
}

// ── TELA 2: HORAS TRABALHADAS ─────────────────────────────────────────────────
function HorasTrabalhadas() {
  const [batendo, setBatendo] = useState(false);
  const [inicio, setInicio]   = useState(null);
  const [elapsed, setElapsed] = useState("00:00:00");

  const totalHoje = mockHoras.filter(h => h.data === "13/06/2026")
    .reduce((acc, h) => {
      const [hh, mm] = h.duracao.replace("h", ":").replace("", "").split(":").map(Number);
      return acc + hh * 60 + (mm || 0);
    }, 0);
  const totalSemana = 23 * 60 + 15;

  const baterPonto = () => {
    if (!batendo) {
      setBatendo(true);
      setInicio(new Date());
    } else {
      setBatendo(false);
      setInicio(null);
      setElapsed("00:00:00");
    }
  };

  const tipoColor = { Limpeza: C.aqua, Manutenção: C.gold, Revisão: C.wave, Reparo: C.rust };

  return (
    <div style={{ minHeight: "100vh", background: C.sand, fontFamily: "'Inter', sans-serif", maxWidth: 420, margin: "0 auto" }}>
      <Header title="Horas Trabalhadas" sub="Rafael Silva · Junho 2026" />

      <div style={{ padding: "16px 16px 80px" }}>
        {/* Ponto atual */}
        <div style={{ background: C.ocean, borderRadius: 16, padding: "24px", marginBottom: 14, textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: batendo ? C.green : "rgba(255,255,255,0.35)", marginBottom: 12 }}>
            {batendo ? "● Em andamento" : "● Parado"}
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 42, fontWeight: 800, color: C.white, letterSpacing: 2, marginBottom: 4 }}>
            {batendo ? elapsed : "00:00:00"}
          </div>
          {batendo && inicio && (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
              Iniciado às {inicio.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
          {!batendo && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>Clique para iniciar</div>}
          <button onClick={baterPonto} style={{ background: batendo ? C.rust : C.aqua, color: C.white, border: "none", borderRadius: 40, padding: "14px 40px", fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}>
            {batendo ? "⏹ Parar" : "▶ Bater ponto"}
          </button>
        </div>

        {/* Resumo */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          {[
            { label: "Hoje",    value: `${Math.floor(totalHoje / 60)}h${String(totalHoje % 60).padStart(2, "0")}`,    color: C.aqua  },
            { label: "Semana",  value: `${Math.floor(totalSemana / 60)}h${String(totalSemana % 60).padStart(2, "0")}`, color: C.green },
            { label: "Mês",     value: "87h20",  color: C.wave  },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: C.white, borderRadius: 12, padding: "14px 10px", textAlign: "center", boxShadow: "0 2px 6px rgba(10,37,64,0.07)", borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Histórico */}
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: C.ocean, marginBottom: 10 }}>Histórico recente</div>
        {mockHoras.map((h, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 14, padding: "14px 16px", marginBottom: 8, boxShadow: "0 1px 4px rgba(10,37,64,0.07)", borderLeft: `4px solid ${tipoColor[h.tipo] || C.aqua}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: C.ocean }}>{h.embarcacao}</div>
                <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>{h.os} · {h.tipo}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 16, color: C.ocean }}>{h.duracao}</div>
                <div style={{ fontSize: 11, color: C.gray }}>{h.entrada} → {h.saida}</div>
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: C.gray }}>📅 {h.data}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TELA 3: GALERIA DE FOTOS ─────────────────────────────────────────────────
function GaleriaFotos() {
  const [filter, setFilter] = useState("todas");
  const [selected, setSelected] = useState(null);

  const osOptions = [...new Set(mockFotos.map(f => f.os))];
  const visible   = filter === "todas" ? mockFotos : mockFotos.filter(f => f.os === filter);

  return (
    <div style={{ minHeight: "100vh", background: C.sand, fontFamily: "'Inter', sans-serif", maxWidth: 420, margin: "0 auto" }}>
      <Header title="Galeria de Fotos" sub={`${mockFotos.length} fotos registradas`} />

      {/* Filtros */}
      <div style={{ background: C.wave, padding: "8px 12px", display: "flex", gap: 6, overflowX: "auto" }}>
        <button onClick={() => setFilter("todas")} style={{ flexShrink: 0, padding: "5px 14px", borderRadius: 20, border: "none", background: filter === "todas" ? C.white : "rgba(255,255,255,0.1)", color: filter === "todas" ? C.ocean : "rgba(255,255,255,0.65)", fontWeight: filter === "todas" ? 700 : 500, fontSize: 12, cursor: "pointer" }}>
          Todas
        </button>
        {osOptions.map(os => (
          <button key={os} onClick={() => setFilter(os)} style={{ flexShrink: 0, padding: "5px 14px", borderRadius: 20, border: "none", background: filter === os ? C.white : "rgba(255,255,255,0.1)", color: filter === os ? C.ocean : "rgba(255,255,255,0.65)", fontWeight: filter === os ? 700 : 500, fontSize: 12, cursor: "pointer" }}>
            {os}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(10,37,64,0.95)", zIndex: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ width: "100%", maxWidth: 380, aspectRatio: "4/3", borderRadius: 16, background: `linear-gradient(135deg, ${selected.cor}, ${C.ocean})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60, marginBottom: 20 }}>
            📸
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: C.white, marginBottom: 4 }}>{selected.area} — {selected.tipo}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{selected.os} · {selected.hora}</div>
          </div>
          <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
            <button style={{ background: C.aqua, color: C.white, border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>↓ Baixar</button>
            <button style={{ background: "rgba(255,255,255,0.1)", color: C.white, border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>📤 Compartilhar</button>
          </div>
          <div style={{ marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Toque para fechar</div>
        </div>
      )}

      <div style={{ padding: "14px 14px 80px" }}>
        {/* Botão adicionar */}
        <button style={{ width: "100%", background: C.ocean, color: C.white, border: `2px dashed ${C.aqua}`, borderRadius: 14, padding: "14px 0", fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          📷 Tirar ou adicionar foto
        </button>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {visible.map(f => (
            <div key={f.id} onClick={() => setSelected(f)} style={{ borderRadius: 12, overflow: "hidden", cursor: "pointer", position: "relative", aspectRatio: "4/3", background: `linear-gradient(135deg, ${f.cor}, ${C.ocean})`, boxShadow: "0 2px 8px rgba(10,37,64,0.12)" }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, opacity: 0.5 }}>📸</div>
              <div style={{ position: "absolute", top: 8, left: 8 }}>
                <span style={{ background: f.tipo === "Antes" ? C.rust : C.green, color: C.white, borderRadius: 6, padding: "2px 7px", fontSize: 10, fontWeight: 800 }}>{f.tipo}</span>
              </div>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(10,37,64,0.75)", padding: "6px 10px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.white }}>{f.area}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>{f.os} · {f.hora}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── TELA 4: EMBARCAÇÕES ───────────────────────────────────────────────────────
function Embarcacoes({ onBack }) {
  const [embs, setEmbs]     = useState(mockEmbarcacoes);
  const [showForm, setForm] = useState(false);
  const [nova, setNova]     = useState({ nome: "", tipo: "Lancha", registro: "" });
  const statusMap = {
    ativo:       { label: "Ativo",        bg: "#d4edda", color: "#155724" },
    atracada:    { label: "Atracada",     bg: "#fff3cd", color: "#856404" },
    em_servico:  { label: "Em serviço",   bg: C.foam,    color: C.wave    },
  };

  const adicionar = () => {
    if (!nova.nome.trim()) return;
    setEmbs([...embs, { id: Date.now(), ...nova, cor: C.aqua, status: "ativo" }]);
    setNova({ nome: "", tipo: "Lancha", registro: "" });
    setForm(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.sand, fontFamily: "'Inter', sans-serif", maxWidth: 420, margin: "0 auto" }}>
      <Header title="Embarcações" sub={`${embs.length} cadastradas`} onBack={onBack} />

      <div style={{ padding: "14px 14px 80px" }}>
        <button onClick={() => setForm(!showForm)} style={{ width: "100%", background: C.aqua, color: C.white, border: "none", borderRadius: 12, padding: "13px 0", fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 14 }}>
          + Adicionar embarcação
        </button>

        {showForm && (
          <div style={{ background: C.foam, borderRadius: 14, padding: 16, marginBottom: 14, border: `1.5px solid ${C.aqua}` }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: C.ocean, marginBottom: 12 }}>Nova embarcação</div>
            <input value={nova.nome} onChange={e => setNova({ ...nova, nome: e.target.value })} placeholder="Nome da embarcação *" style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: `1.5px solid ${C.lg}`, fontSize: 14, color: C.ocean, marginBottom: 10, outline: "none" }} />
            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
              {["Lancha", "Veleiro", "Escuna", "Rebocador", "Balsa", "Outro"].map(t => (
                <button key={t} onClick={() => setNova({ ...nova, tipo: t })} style={{ padding: "5px 12px", borderRadius: 20, border: "none", background: nova.tipo === t ? C.aqua : C.lg, color: nova.tipo === t ? C.white : C.gray, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{t}</button>
              ))}
            </div>
            <input value={nova.registro} onChange={e => setNova({ ...nova, registro: e.target.value })} placeholder="Nº de registro (opcional)" style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: `1.5px solid ${C.lg}`, fontSize: 14, color: C.ocean, marginBottom: 12, outline: "none" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={adicionar} style={{ flex: 1, background: C.ocean, color: C.white, border: "none", borderRadius: 10, padding: "10px 0", fontWeight: 700, cursor: "pointer" }}>Salvar</button>
              <button onClick={() => setForm(false)} style={{ flex: 1, background: C.lg, color: C.ocean, border: "none", borderRadius: 10, padding: "10px 0", fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
            </div>
          </div>
        )}

        {embs.map(e => {
          const s = statusMap[e.status] || statusMap.ativo;
          return (
            <div key={e.id} style={{ background: C.white, borderRadius: 14, padding: "16px", marginBottom: 10, boxShadow: "0 2px 8px rgba(10,37,64,0.07)", borderLeft: `4px solid ${e.cor}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: C.ocean }}>{e.nome}</div>
                  <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>{e.tipo} {e.registro ? `· ${e.registro}` : ""}</div>
                </div>
                <span style={{ background: s.bg, color: s.color, borderRadius: 6, padding: "3px 9px", fontSize: 11, fontWeight: 700 }}>{s.label}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ flex: 1, background: C.foam, color: C.wave, border: "none", borderRadius: 8, padding: "8px 0", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>📋 Ver diário</button>
                <button style={{ flex: 1, background: C.foam, color: C.wave, border: "none", borderRadius: 8, padding: "8px 0", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>✅ Check-list</button>
                <button style={{ background: C.foam, color: C.gray, border: "none", borderRadius: 8, padding: "8px 10px", fontSize: 12, cursor: "pointer" }}>✏️</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ROOT — Navegação entre telas ─────────────────────────────────────────────
export default function TelasSuporte() {
  const [screen, setScreen] = useState("menu");

  const SCREENS = [
    { id: "configuracoes", icon: "⚙️", label: "Configurações",       desc: "Perfil, notificações e plano" },
    { id: "horas",         icon: "⏱️", label: "Horas Trabalhadas",   desc: "Ponto e histórico de horas" },
    { id: "galeria",       icon: "📸", label: "Galeria de Fotos",    desc: "Fotos das ordens de serviço" },
    { id: "embarcacoes",   icon: "⛵", label: "Embarcações",         desc: "Cadastro e gestão" },
  ];

  if (screen === "configuracoes") return <Configuracoes onNav={setScreen} />;
  if (screen === "horas")         return <HorasTrabalhadas />;
  if (screen === "galeria")       return <GaleriaFotos />;
  if (screen === "embarcacoes")   return <Embarcacoes onBack={() => setScreen("menu")} />;

  return (
    <div style={{ minHeight: "100vh", background: C.sand, fontFamily: "'Inter', sans-serif", maxWidth: 420, margin: "0 auto" }}>
      <Header title="Telas de Suporte" sub="Escolha uma tela para visualizar" />
      <div style={{ padding: "16px" }}>
        <div style={{ background: C.foam, borderRadius: 12, padding: "12px 16px", marginBottom: 16, border: `1px solid ${C.aqua}` }}>
          <div style={{ fontSize: 12, color: C.wave, fontWeight: 600 }}>Este arquivo contém 4 telas que completam o sistema BORDO.</div>
        </div>
        {SCREENS.map(s => (
          <button key={s.id} onClick={() => setScreen(s.id)} style={{ width: "100%", background: C.white, border: `1.5px solid ${C.lg}`, borderRadius: 14, padding: "16px", textAlign: "left", cursor: "pointer", marginBottom: 10, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 6px rgba(10,37,64,0.07)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: C.foam, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: C.ocean }}>{s.label}</div>
              <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>{s.desc}</div>
            </div>
            <div style={{ marginLeft: "auto", color: C.lg, fontSize: 20 }}>›</div>
          </button>
        ))}
      </div>
    </div>
  );
}

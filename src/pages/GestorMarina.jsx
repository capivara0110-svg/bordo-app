import React, { useState, useEffect } from "react";
import { C, fonts } from "../styles/theme.js";
import { api } from "../services/api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import Header from "../components/Header.jsx";

const emptyOrder = {
  embarcacao: "",
  cliente: "",
  tipo: "Servico",
  prioridade: "normal",
  status: "aguardando",
  descricao: "",
  responsavel: "",
  previsao: "",
  observacao: "",
  tarefas: "",
};

const statusOptions = [
  ["todos", "Todos"],
  ["aguardando", "Aguardando"],
  ["em_andamento", "Em andamento"],
  ["concluida", "Concluida"],
  ["cancelada", "Cancelada"],
];

const priorityOptions = [
  ["baixa", "Baixa"],
  ["media", "Media"],
  ["normal", "Normal"],
  ["alta", "Alta"],
  ["urgente", "Urgente"],
];

export default function GestorMarina({ profile, onLogout, onCompany }) {
  const [tab, setTab] = useState("dashboard");

  // Dados da API
  const [dashboard, setDashboard] = useState(null);
  const [ordens, setOrdens] = useState([]);
  const [equipe, setEquipe] = useState([]);
  const [bercos, setBercos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderForm, setOrderForm] = useState(emptyOrder);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [orderFilter, setOrderFilter] = useState("todos");
  const [orderSearch, setOrderSearch] = useState("");
  const [newTask, setNewTask] = useState({});

  const tabs = [
    { id: "dashboard", icon: "📊", label: "Painel" },
    { id: "equipe", icon: "👥", label: "Equipe" },
    { id: "ordens", icon: "🔧", label: "Ordens" },
    { id: "bercos", icon: "⚓", label: "Berços" },
  ];

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
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
        setError(err.message || "Nao foi possivel carregar o painel");
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredOrders = ordens.filter((os) => {
    const matchesStatus = orderFilter === "todos" || os.status === orderFilter;
    const text = `${os.codigo} ${os.embarcacao} ${os.cliente} ${os.responsavel} ${os.descricao}`.toLowerCase();
    return matchesStatus && text.includes(orderSearch.trim().toLowerCase());
  });

  const updateOrderForm = (field, value) => {
    setOrderForm((current) => ({ ...current, [field]: value }));
    setOrderMessage("");
  };

  const startNewOrder = () => {
    setOrderForm(emptyOrder);
    setEditingOrderId(null);
    setShowOrderForm(true);
    setOrderMessage("");
  };

  const startEditOrder = (order) => {
    setOrderForm({
      embarcacao: order.embarcacao || "",
      cliente: order.cliente || "",
      tipo: order.tipo || "Servico",
      prioridade: order.prioridade || "normal",
      status: order.status || "aguardando",
      descricao: order.descricao || "",
      responsavel: order.responsavel || "",
      previsao: order.previsao || "",
      observacao: order.observacao || "",
      tarefas: "",
    });
    setEditingOrderId(order.id);
    setShowOrderForm(true);
    setTab("ordens");
    setOrderMessage("");
  };

  const closeOrderForm = () => {
    setShowOrderForm(false);
    setEditingOrderId(null);
    setOrderForm(emptyOrder);
  };

  const saveOrder = async (event) => {
    event.preventDefault();
    setSavingOrder(true);
    setOrderMessage("");
    try {
      const saved = editingOrderId
        ? await api.ordens.editar(editingOrderId, orderForm)
        : await api.ordens.criar(orderForm);
      setOrdens((current) => {
        const exists = current.some((item) => item.id === saved.id);
        return exists
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...current];
      });
      setOrderMessage(editingOrderId ? "OS atualizada com sucesso." : "OS criada com sucesso.");
      closeOrderForm();
    } catch (err) {
      setOrderMessage(err.message || "Nao foi possivel salvar a OS");
    } finally {
      setSavingOrder(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const updated = await api.ordens.atualizarStatus(orderId, status);
      setOrdens((current) => current.map((item) => (item.id === orderId ? updated : item)));
    } catch (err) {
      setOrderMessage(err.message || "Nao foi possivel alterar o status");
    }
  };

  const addOrderTask = async (orderId) => {
    const tarefa = String(newTask[orderId] || "").trim();
    if (!tarefa) return;
    try {
      const updated = await api.ordens.criarTarefa(orderId, tarefa);
      setOrdens((current) => current.map((item) => (item.id === orderId ? updated : item)));
      setNewTask((current) => ({ ...current, [orderId]: "" }));
    } catch (err) {
      setOrderMessage(err.message || "Nao foi possivel adicionar a tarefa");
    }
  };

  const toggleOrderTask = async (orderId, taskId) => {
    try {
      const updated = await api.ordens.toggleTarefa(orderId, taskId);
      setOrdens((current) => current.map((item) => (item.id === orderId ? updated : item)));
    } catch (err) {
      setOrderMessage(err.message || "Nao foi possivel atualizar a tarefa");
    }
  };

  const renderTab = () => {
    if (loading) return <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)" }}>Carregando...</div>;
    if (error) return <StateMessage title="Nao foi possivel carregar o painel" body={error} />;

    switch (tab) {
      case "dashboard":
        if (!dashboard) return <StateMessage title="Painel vazio" body="Ainda nao existem dados suficientes para montar o dashboard." />;
        return (
          <div className="bordo-page-body">
            <div className="bordo-card-grid">
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

            <div className="bordo-list-grid">
              {dashboard.ultimasOS.length === 0 && <StateMessage title="Nenhuma ordem recente" body="Quando uma OS for criada, ela aparece aqui." compact />}
              {dashboard.ultimasOS.length > 0 && (
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
              )}
            </div>
          </div>
        );

      case "equipe":
        return (
          <div className="bordo-page-body">
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Tripulação</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.white, fontFamily: fonts.display }}>{equipe.length} membros</div>
            </div>
            <div className="bordo-list-grid">
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
          </div>
        );

      case "ordens":
        return (
          <div className="bordo-page-body">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Ordens</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.white, fontFamily: fonts.display }}>{filteredOrders.length} de {ordens.length} ordens</div>
              </div>
              <button type="button" onClick={startNewOrder} style={primarySmallButton}>+ Nova OS</button>
            </div>

            {orderMessage && <InlineMessage tone={orderMessage.includes("sucesso") ? "success" : "error"}>{orderMessage}</InlineMessage>}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 14 }}>
              <input
                placeholder="Buscar por codigo, barco, cliente..."
                value={orderSearch}
                onChange={(event) => setOrderSearch(event.target.value)}
                style={inputStyle}
              />
              <select value={orderFilter} onChange={(event) => setOrderFilter(event.target.value)} style={inputStyle}>
                {statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>

            {showOrderForm && (
              <form onSubmit={saveOrder} style={{ ...panelStyle, display: "grid", gap: 12, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: fonts.display, color: C.white, fontWeight: 800 }}>
                      {editingOrderId ? "Editar ordem de servico" : "Nova ordem de servico"}
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.42)", fontSize: 12, marginTop: 3 }}>
                      Registre embarcacao, cliente, responsavel e tarefas.
                    </div>
                  </div>
                  <button type="button" onClick={closeOrderForm} style={ghostButton}>Cancelar</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                  <Field label="Embarcacao">
                    <input required value={orderForm.embarcacao} onChange={(event) => updateOrderForm("embarcacao", event.target.value)} style={inputStyle} />
                  </Field>
                  <Field label="Cliente">
                    <input value={orderForm.cliente} onChange={(event) => updateOrderForm("cliente", event.target.value)} style={inputStyle} />
                  </Field>
                  <Field label="Tipo">
                    <input value={orderForm.tipo} onChange={(event) => updateOrderForm("tipo", event.target.value)} style={inputStyle} />
                  </Field>
                  <Field label="Responsavel">
                    <input value={orderForm.responsavel} onChange={(event) => updateOrderForm("responsavel", event.target.value)} style={inputStyle} />
                  </Field>
                  <Field label="Previsao">
                    <input value={orderForm.previsao} onChange={(event) => updateOrderForm("previsao", event.target.value)} style={inputStyle} placeholder="Ex.: 28/06/2026" />
                  </Field>
                  <Field label="Prioridade">
                    <select value={orderForm.prioridade} onChange={(event) => updateOrderForm("prioridade", event.target.value)} style={inputStyle}>
                      {priorityOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </Field>
                  {editingOrderId && (
                    <Field label="Status">
                      <select value={orderForm.status} onChange={(event) => updateOrderForm("status", event.target.value)} style={inputStyle}>
                        {statusOptions.filter(([value]) => value !== "todos").map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </Field>
                  )}
                </div>
                <Field label="Descricao do servico">
                  <textarea value={orderForm.descricao} onChange={(event) => updateOrderForm("descricao", event.target.value)} style={{ ...inputStyle, minHeight: 86, resize: "vertical" }} />
                </Field>
                {!editingOrderId && (
                  <Field label="Tarefas iniciais, uma por linha">
                    <textarea value={orderForm.tarefas} onChange={(event) => updateOrderForm("tarefas", event.target.value)} style={{ ...inputStyle, minHeight: 86, resize: "vertical" }} />
                  </Field>
                )}
                <button type="submit" disabled={savingOrder} style={primarySmallButton}>
                  {savingOrder ? "Salvando..." : editingOrderId ? "Salvar OS" : "Criar OS"}
                </button>
              </form>
            )}

            <div className="bordo-list-grid">
            {filteredOrders.length === 0 && <StateMessage title="Nenhuma OS encontrada" body="Crie uma nova ordem ou ajuste os filtros." compact />}
            {filteredOrders.map(os => (
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, marginTop: 12, alignItems: "center" }}>
                  <select value={os.status} onChange={(event) => updateOrderStatus(os.id, event.target.value)} style={inputStyle}>
                    {statusOptions.filter(([value]) => value !== "todos").map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  <button type="button" onClick={() => startEditOrder(os)} style={ghostButton}>Editar</button>
                </div>
                <div style={{ marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
                    <span>Tarefas</span>
                    <span>{(os.itens || []).filter((item) => Number(item.done)).length}/{(os.itens || []).length}</span>
                  </div>
                  {(os.itens || []).map((item) => (
                    <button key={item.id} type="button" onClick={() => toggleOrderTask(os.id, item.id)} style={{
                      display: "flex", alignItems: "center", gap: 8, width: "100%",
                      background: "transparent", border: "none", padding: "6px 0", textAlign: "left", cursor: "pointer",
                      color: Number(item.done) ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.76)",
                      textDecoration: Number(item.done) ? "line-through" : "none",
                    }}>
                      <span style={{
                        width: 18, height: 18, borderRadius: 6, flexShrink: 0,
                        border: `2px solid ${Number(item.done) ? C.green : "rgba(255,255,255,0.20)"}`,
                        background: Number(item.done) ? C.green : "transparent",
                        color: C.white, fontSize: 10, display: "grid", placeItems: "center",
                      }}>{Number(item.done) ? "✓" : ""}</span>
                      <span style={{ fontSize: 12 }}>{item.tarefa}</span>
                    </button>
                  ))}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, marginTop: 8 }}>
                    <input
                      placeholder="Nova tarefa..."
                      value={newTask[os.id] || ""}
                      onChange={(event) => setNewTask((current) => ({ ...current, [os.id]: event.target.value }))}
                      style={inputStyle}
                    />
                    <button type="button" onClick={() => addOrderTask(os.id)} style={ghostButton}>Adicionar</button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        );

      case "bercos":
        return (
          <div className="bordo-page-body">
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Berços</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.white, fontFamily: fonts.display }}>{bercos.length} vagas</div>
            </div>
            <div className="bordo-list-grid">
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
          </div>
        );
    }
  };

  return (
    <div className="bordo-app-screen" style={{ minHeight: "100vh", background: C.ocean, paddingBottom: 80, maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <Header title={profile.company?.name || "Minha empresa"} sub="Painel do Gestor" color={C.green} />
      <div className="bordo-desktop-only" style={{ color: "rgba(255,255,255,0.44)", fontSize: 14, margin: "-8px 0 20px" }}>
        Visao geral da operacao, equipe, ordens de servico e ocupacao da marina.
      </div>
      {renderTab()}

      <div className="bordo-bottom-nav" style={{
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

function StateMessage({ title, body, compact = false }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: compact ? 16 : 28,
      color: C.white,
      margin: compact ? 0 : 16,
    }}>
      <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: compact ? 16 : 20 }}>{title}</div>
      <div style={{ color: "rgba(255,255,255,0.45)", marginTop: 6, fontSize: 13, lineHeight: 1.5 }}>{body}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 6, color: "rgba(255,255,255,0.62)", fontSize: 11, fontWeight: 700 }}>
      {label}
      {children}
    </label>
  );
}

function InlineMessage({ tone, children }) {
  const success = tone === "success";
  return (
    <div role={success ? "status" : "alert"} style={{
      padding: "10px 12px",
      borderRadius: 10,
      marginBottom: 12,
      background: success ? "rgba(39,174,96,0.14)" : "rgba(192,57,43,0.16)",
      color: success ? "#8fe0ae" : "#ffaaa2",
      fontSize: 12,
    }}>
      {children}
    </div>
  );
}

const panelStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 16,
};

const inputStyle = {
  width: "100%",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.08)",
  color: C.white,
  borderRadius: 10,
  padding: "10px 11px",
  outline: "none",
  fontFamily: fonts.body,
};

const primarySmallButton = {
  border: "none",
  borderRadius: 10,
  background: C.aqua,
  color: C.white,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
};

const ghostButton = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  background: "rgba(255,255,255,0.05)",
  color: "rgba(255,255,255,0.72)",
  padding: "9px 12px",
  fontWeight: 700,
  cursor: "pointer",
};

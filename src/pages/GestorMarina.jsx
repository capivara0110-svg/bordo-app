import React, { useState, useEffect } from "react";
import { C, fonts } from "../styles/theme.js";
import { api } from "../services/api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import Header from "../components/Header.jsx";

const emptyOrder = {
  cliente_id: "",
  embarcacao_id: "",
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

const emptyClient = {
  nome: "",
  documento: "",
  telefone: "",
  email: "",
  observacao: "",
};

const emptyBoat = {
  cliente_id: "",
  nome: "",
  tipo: "",
  marca: "",
  modelo: "",
  tamanho: "",
  registro: "",
  observacao: "",
};

const emptyTeamMember = {
  nome: "",
  funcao: "Marinharia",
  cargo: "Marinharia",
  telefone: "",
  disponibilidade: "disponivel",
  habilitacao: "",
  certificado: "",
  observacao: "",
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

const functionOptions = [
  "Limpeza",
  "Marinharia",
  "Marinheiro",
  "Mecanico",
  "Eletrica",
  "Fibra",
  "Pintura",
  "Polimento",
  "Coordenacao",
];

const availabilityOptions = [
  ["disponivel", "Disponivel"],
  ["ocupado", "Ocupado"],
  ["folga", "Folga"],
  ["indisponivel", "Indisponivel"],
];

const photoCategories = [
  ["geral", "Geral"],
  ["antes", "Antes"],
  ["durante", "Durante"],
  ["depois", "Depois"],
  ["documento", "Documento"],
];

function dateKey(value) {
  return String(value || "").slice(0, 10);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function GestorMarina({ profile, onLogout, onCompany }) {
  const [tab, setTab] = useState("dashboard");

  // Dados da API
  const [dashboard, setDashboard] = useState(null);
  const [ordens, setOrdens] = useState([]);
  const [equipe, setEquipe] = useState([]);
  const [bercos, setBercos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [embarcacoes, setEmbarcacoes] = useState([]);
  const [agenda, setAgenda] = useState([]);
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
  const [clientForm, setClientForm] = useState(emptyClient);
  const [boatForm, setBoatForm] = useState(emptyBoat);
  const [teamForm, setTeamForm] = useState(emptyTeamMember);
  const [editingClientId, setEditingClientId] = useState(null);
  const [editingBoatId, setEditingBoatId] = useState(null);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [clientMessage, setClientMessage] = useState("");
  const [boatMessage, setBoatMessage] = useState("");
  const [teamMessage, setTeamMessage] = useState("");
  const [agendaResponsavel, setAgendaResponsavel] = useState("todos");
  const [clientHistory, setClientHistory] = useState(null);
  const [boatHistory, setBoatHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState("");
  const [photoPanel, setPhotoPanel] = useState(null);
  const [photoForm, setPhotoForm] = useState({ url: "", legenda: "", categoria: "geral" });
  const [photoMessage, setPhotoMessage] = useState("");
  const [photoSaving, setPhotoSaving] = useState(false);

  const tabs = [
    { id: "dashboard", icon: "📊", label: "Painel" },
    { id: "clientes", icon: "🧾", label: "Clientes" },
    { id: "embarcacoes", icon: "🛥️", label: "Barcos" },
    { id: "agenda", icon: "📅", label: "Agenda" },
    { id: "equipe", icon: "👥", label: "Equipe" },
    { id: "ordens", icon: "🔧", label: "Ordens" },
    { id: "bercos", icon: "⚓", label: "Berços" },
  ];

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [dash, ord, trip, ber, cli, emb, agd] = await Promise.all([
          api.dashboard.dados(),
          api.ordens.listar(),
          api.tripulacao.listar(),
          api.bercos.listar(),
          api.clientes.listar(),
          api.embarcacoes.listar(),
          api.agenda.listar(),
        ]);
        setDashboard(dash);
        setOrdens(ord);
        setEquipe(trip);
        setBercos(ber);
        setClientes(cli);
        setEmbarcacoes(emb);
        setAgenda(agd);
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

  const refreshAgenda = async () => {
    setAgenda(await api.agenda.listar());
  };

  const openPhotoPanel = async (tipo, item) => {
    setPhotoMessage("");
    setPhotoForm({ url: "", legenda: "", categoria: "geral" });
    try {
      const fotos = tipo === "ordem"
        ? await api.ordens.fotos(item.id)
        : await api.embarcacoes.fotos(item.id);
      setPhotoPanel({ tipo, item, fotos });
    } catch (err) {
      setPhotoMessage(err.message || "Nao foi possivel carregar as fotos");
    }
  };

  const closePhotoPanel = () => {
    setPhotoPanel(null);
    setPhotoForm({ url: "", legenda: "", categoria: "geral" });
    setPhotoMessage("");
  };

  const updatePhotoFile = (file) => {
    setPhotoMessage("");
    if (!file) {
      setPhotoForm((current) => ({ ...current, url: "" }));
      return;
    }
    if (!file.type.startsWith("image/")) {
      setPhotoMessage("Selecione uma imagem valida.");
      return;
    }
    if (file.size > 520000) {
      setPhotoMessage("Use uma foto menor por enquanto. Limite aproximado: 500 KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoForm((current) => ({ ...current, url: String(reader.result || "") }));
    reader.onerror = () => setPhotoMessage("Nao foi possivel ler a foto.");
    reader.readAsDataURL(file);
  };

  const savePhoto = async (event) => {
    event.preventDefault();
    if (!photoPanel) return;
    if (!photoForm.url) {
      setPhotoMessage("Selecione uma foto antes de salvar.");
      return;
    }
    setPhotoSaving(true);
    setPhotoMessage("");
    try {
      const saved = photoPanel.tipo === "ordem"
        ? await api.ordens.adicionarFoto(photoPanel.item.id, photoForm)
        : await api.embarcacoes.adicionarFoto(photoPanel.item.id, photoForm);
      setPhotoPanel((current) => ({ ...current, fotos: [saved, ...current.fotos] }));
      setPhotoForm({ url: "", legenda: "", categoria: "geral" });
      setPhotoMessage("Foto salva com sucesso.");
      if (photoPanel.tipo === "ordem") {
        setOrdens((current) => current.map((os) => (
          os.id === photoPanel.item.id ? { ...os, fotos: Number(os.fotos || 0) + 1 } : os
        )));
      }
    } catch (err) {
      setPhotoMessage(err.message || "Nao foi possivel salvar a foto");
    } finally {
      setPhotoSaving(false);
    }
  };

  const updateOrderForm = (field, value) => {
    setOrderForm((current) => ({ ...current, [field]: value }));
    setOrderMessage("");
  };

  const selectOrderClient = (id) => {
    const cliente = clientes.find((item) => String(item.id) === String(id));
    setOrderForm((current) => ({
      ...current,
      cliente_id: id,
      cliente: cliente?.nome || current.cliente,
    }));
    setOrderMessage("");
  };

  const selectOrderBoat = (id) => {
    const embarcacao = embarcacoes.find((item) => String(item.id) === String(id));
    const cliente = embarcacao?.cliente_id
      ? clientes.find((item) => String(item.id) === String(embarcacao.cliente_id))
      : null;
    setOrderForm((current) => ({
      ...current,
      embarcacao_id: id,
      embarcacao: embarcacao?.nome || current.embarcacao,
      cliente_id: cliente?.id || current.cliente_id,
      cliente: cliente?.nome || embarcacao?.cliente_nome || current.cliente,
    }));
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
      cliente_id: order.cliente_id || "",
      embarcacao_id: order.embarcacao_id || "",
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
      await refreshAgenda();
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
      await refreshAgenda();
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

  const updateClientForm = (field, value) => {
    setClientForm((current) => ({ ...current, [field]: value }));
    setClientMessage("");
  };

  const editClient = (cliente) => {
    setClientForm({
      nome: cliente.nome || "",
      documento: cliente.documento || "",
      telefone: cliente.telefone || "",
      email: cliente.email || "",
      observacao: cliente.observacao || "",
    });
    setEditingClientId(cliente.id);
    setClientMessage("");
  };

  const clearClientForm = () => {
    setClientForm(emptyClient);
    setEditingClientId(null);
  };

  const saveClient = async (event) => {
    event.preventDefault();
    setClientMessage("");
    try {
      const saved = editingClientId
        ? await api.clientes.editar(editingClientId, clientForm)
        : await api.clientes.criar(clientForm);
      setClientes((current) => {
        const exists = current.some((item) => item.id === saved.id);
        const next = exists
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [...current, saved];
        return next.sort((a, b) => a.nome.localeCompare(b.nome));
      });
      setClientMessage(editingClientId ? "Cliente atualizado com sucesso." : "Cliente cadastrado com sucesso.");
      clearClientForm();
    } catch (err) {
      setClientMessage(err.message || "Nao foi possivel salvar o cliente");
    }
  };

  const openClientHistory = async (cliente) => {
    setHistoryLoading(`cliente-${cliente.id}`);
    setClientMessage("");
    try {
      setClientHistory(await api.clientes.historico(cliente.id));
    } catch (err) {
      setClientMessage(err.message || "Nao foi possivel carregar o historico");
    } finally {
      setHistoryLoading("");
    }
  };

  const updateBoatForm = (field, value) => {
    setBoatForm((current) => ({ ...current, [field]: value }));
    setBoatMessage("");
  };

  const editBoat = (embarcacao) => {
    setBoatForm({
      cliente_id: embarcacao.cliente_id || "",
      nome: embarcacao.nome || "",
      tipo: embarcacao.tipo || "",
      marca: embarcacao.marca || "",
      modelo: embarcacao.modelo || "",
      tamanho: embarcacao.tamanho || "",
      registro: embarcacao.registro || "",
      observacao: embarcacao.observacao || "",
    });
    setEditingBoatId(embarcacao.id);
    setBoatMessage("");
  };

  const clearBoatForm = () => {
    setBoatForm(emptyBoat);
    setEditingBoatId(null);
  };

  const saveBoat = async (event) => {
    event.preventDefault();
    setBoatMessage("");
    try {
      const saved = editingBoatId
        ? await api.embarcacoes.editar(editingBoatId, boatForm)
        : await api.embarcacoes.criar(boatForm);
      setEmbarcacoes((current) => {
        const exists = current.some((item) => item.id === saved.id);
        const next = exists
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [...current, saved];
        return next.sort((a, b) => a.nome.localeCompare(b.nome));
      });
      setBoatMessage(editingBoatId ? "Embarcacao atualizada com sucesso." : "Embarcacao cadastrada com sucesso.");
      clearBoatForm();
    } catch (err) {
      setBoatMessage(err.message || "Nao foi possivel salvar a embarcacao");
    }
  };

  const openBoatHistory = async (embarcacao) => {
    setHistoryLoading(`embarcacao-${embarcacao.id}`);
    setBoatMessage("");
    try {
      setBoatHistory(await api.embarcacoes.historico(embarcacao.id));
    } catch (err) {
      setBoatMessage(err.message || "Nao foi possivel carregar o historico");
    } finally {
      setHistoryLoading("");
    }
  };

  const updateTeamForm = (field, value) => {
    setTeamForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "funcao" ? { cargo: value } : {}),
    }));
    setTeamMessage("");
  };

  const clearTeamForm = () => {
    setTeamForm(emptyTeamMember);
    setEditingTeamId(null);
  };

  const editTeamMember = (member) => {
    setTeamForm({
      nome: member.nome || "",
      funcao: member.funcao || member.cargo || "Marinharia",
      cargo: member.cargo || member.funcao || "Marinharia",
      telefone: member.telefone || "",
      disponibilidade: member.disponibilidade || "disponivel",
      habilitacao: member.habilitacao || "",
      certificado: member.certificado || "",
      observacao: member.observacao || "",
    });
    setEditingTeamId(member.id);
    setTeamMessage("");
  };

  const saveTeamMember = async (event) => {
    event.preventDefault();
    setTeamMessage("");
    try {
      const saved = editingTeamId
        ? await api.tripulacao.editar(editingTeamId, teamForm)
        : await api.tripulacao.criar(teamForm);
      setEquipe((current) => {
        const exists = current.some((item) => item.id === saved.id);
        const next = exists
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [...current, saved];
        return next.sort((a, b) => a.nome.localeCompare(b.nome));
      });
      setTeamMessage(editingTeamId ? "Prestador atualizado com sucesso." : "Prestador cadastrado com sucesso.");
      clearTeamForm();
    } catch (err) {
      setTeamMessage(err.message || "Nao foi possivel salvar o prestador");
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

      case "agenda": {
        const hoje = todayKey();
        const agendaFiltrada = agendaResponsavel === "todos"
          ? agenda
          : agenda.filter((os) => os.responsavel === agendaResponsavel);
        const atrasadas = agendaFiltrada.filter((os) => dateKey(os.previsao) < hoje && os.status !== "concluida");
        const hojeAgenda = agendaFiltrada.filter((os) => dateKey(os.previsao) === hoje && os.status !== "concluida");
        const proximas = agendaFiltrada.filter((os) => dateKey(os.previsao) > hoje && os.status !== "concluida");
        const concluidas = agendaFiltrada.filter((os) => os.status === "concluida");

        return (
          <div className="bordo-page-body">
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Agenda</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.white, fontFamily: fonts.display }}>{agendaFiltrada.length} servicos com previsao</div>
              <div style={{ color: "rgba(255,255,255,0.42)", fontSize: 12, marginTop: 4 }}>
                Planejamento da oficina/marina baseado na previsao da OS.
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <Field label="Filtrar por responsavel">
                <select value={agendaResponsavel} onChange={(event) => setAgendaResponsavel(event.target.value)} style={inputStyle}>
                  <option value="todos">Todos os responsaveis</option>
                  {equipe.map((member) => <option key={member.id} value={member.nome}>{member.nome} - {member.funcao || member.cargo}</option>)}
                </select>
              </Field>
            </div>

            <div className="bordo-card-grid">
              {[
                { label: "Atrasadas", value: atrasadas.length, color: C.rust },
                { label: "Hoje", value: hojeAgenda.length, color: C.gold },
                { label: "Proximas", value: proximas.length, color: C.aqua },
                { label: "Concluidas", value: concluidas.length, color: C.green },
              ].map((item) => (
                <div key={item.label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.42)", fontWeight: 700 }}>{item.label}</div>
                  <div style={{ fontSize: 24, color: item.color, fontWeight: 900, fontFamily: fonts.display }}>{item.value}</div>
                </div>
              ))}
            </div>

            <AgendaSection title="Atrasadas" items={atrasadas} empty="Nenhum servico atrasado." />
            <AgendaSection title="Hoje" items={hojeAgenda} empty="Nada previsto para hoje." />
            <AgendaSection title="Proximas" items={proximas} empty="Nenhum servico futuro com previsao." />
            <AgendaSection title="Concluidas" items={concluidas} empty="Nenhum servico previsto foi concluido ainda." muted />
          </div>
        );
      }

      case "clientes":
        return (
          <div className="bordo-page-body">
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Clientes</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.white, fontFamily: fonts.display }}>{clientes.length} clientes cadastrados</div>
            </div>

            {clientMessage && <InlineMessage tone={clientMessage.includes("sucesso") ? "success" : "error"}>{clientMessage}</InlineMessage>}

            <form onSubmit={saveClient} style={{ ...panelStyle, display: "grid", gap: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: fonts.display, color: C.white, fontWeight: 800 }}>
                    {editingClientId ? "Editar cliente" : "Novo cliente"}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.42)", fontSize: 12, marginTop: 3 }}>
                    Base comercial para OS, embarcacoes e historico.
                  </div>
                </div>
                {editingClientId && <button type="button" onClick={clearClientForm} style={ghostButton}>Cancelar</button>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                <Field label="Nome">
                  <input required value={clientForm.nome} onChange={(event) => updateClientForm("nome", event.target.value)} style={inputStyle} />
                </Field>
                <Field label="Telefone">
                  <input value={clientForm.telefone} onChange={(event) => updateClientForm("telefone", event.target.value)} style={inputStyle} />
                </Field>
                <Field label="Email">
                  <input type="email" value={clientForm.email} onChange={(event) => updateClientForm("email", event.target.value)} style={inputStyle} />
                </Field>
                <Field label="Documento">
                  <input value={clientForm.documento} onChange={(event) => updateClientForm("documento", event.target.value)} style={inputStyle} />
                </Field>
              </div>
              <Field label="Observacao">
                <textarea value={clientForm.observacao} onChange={(event) => updateClientForm("observacao", event.target.value)} style={{ ...inputStyle, minHeight: 72, resize: "vertical" }} />
              </Field>
              <button type="submit" style={primarySmallButton}>{editingClientId ? "Salvar cliente" : "Cadastrar cliente"}</button>
            </form>

            {clientHistory && (
              <HistoryPanel
                title={`Historico de ${clientHistory.cliente.nome}`}
                subtitle={`${clientHistory.embarcacoes.length} embarcacao(oes) vinculada(s)`}
                ordens={clientHistory.ordens}
                onClose={() => setClientHistory(null)}
              />
            )}

            <div className="bordo-list-grid">
              {clientes.length === 0 && <StateMessage title="Nenhum cliente cadastrado" body="Cadastre o primeiro cliente para acelerar a abertura de OS." compact />}
              {clientes.map((cliente) => (
                <div key={cliente.id} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 14, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{cliente.nome}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{cliente.telefone || "Sem telefone"} · {cliente.email || "sem email"}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button type="button" onClick={() => openClientHistory(cliente)} style={ghostButton}>
                        {historyLoading === `cliente-${cliente.id}` ? "Abrindo..." : "Historico"}
                      </button>
                      <button type="button" onClick={() => editClient(cliente)} style={ghostButton}>Editar</button>
                    </div>
                  </div>
                  {cliente.observacao && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: "10px 0 0" }}>{cliente.observacao}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      case "embarcacoes":
        return (
          <div className="bordo-page-body">
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Embarcacoes</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.white, fontFamily: fonts.display }}>{embarcacoes.length} barcos cadastrados</div>
            </div>

            {boatMessage && <InlineMessage tone={boatMessage.includes("sucesso") ? "success" : "error"}>{boatMessage}</InlineMessage>}

            <form onSubmit={saveBoat} style={{ ...panelStyle, display: "grid", gap: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: fonts.display, color: C.white, fontWeight: 800 }}>
                    {editingBoatId ? "Editar embarcacao" : "Nova embarcacao"}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.42)", fontSize: 12, marginTop: 3 }}>
                    Vincule o barco ao cliente para abrir OS com poucos cliques.
                  </div>
                </div>
                {editingBoatId && <button type="button" onClick={clearBoatForm} style={ghostButton}>Cancelar</button>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                <Field label="Nome da embarcacao">
                  <input required value={boatForm.nome} onChange={(event) => updateBoatForm("nome", event.target.value)} style={inputStyle} />
                </Field>
                <Field label="Cliente">
                  <select value={boatForm.cliente_id} onChange={(event) => updateBoatForm("cliente_id", event.target.value)} style={inputStyle}>
                    <option value="">Sem cliente vinculado</option>
                    {clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>)}
                  </select>
                </Field>
                <Field label="Tipo">
                  <input value={boatForm.tipo} onChange={(event) => updateBoatForm("tipo", event.target.value)} style={inputStyle} placeholder="Lancha, veleiro..." />
                </Field>
                <Field label="Tamanho">
                  <input value={boatForm.tamanho} onChange={(event) => updateBoatForm("tamanho", event.target.value)} style={inputStyle} placeholder="32 pes" />
                </Field>
                <Field label="Marca">
                  <input value={boatForm.marca} onChange={(event) => updateBoatForm("marca", event.target.value)} style={inputStyle} />
                </Field>
                <Field label="Modelo">
                  <input value={boatForm.modelo} onChange={(event) => updateBoatForm("modelo", event.target.value)} style={inputStyle} />
                </Field>
                <Field label="Registro">
                  <input value={boatForm.registro} onChange={(event) => updateBoatForm("registro", event.target.value)} style={inputStyle} />
                </Field>
              </div>
              <Field label="Observacao">
                <textarea value={boatForm.observacao} onChange={(event) => updateBoatForm("observacao", event.target.value)} style={{ ...inputStyle, minHeight: 72, resize: "vertical" }} />
              </Field>
              <button type="submit" style={primarySmallButton}>{editingBoatId ? "Salvar embarcacao" : "Cadastrar embarcacao"}</button>
            </form>

            {photoPanel?.tipo === "embarcacao" && (
              <PhotoPanel
                panel={photoPanel}
                form={photoForm}
                message={photoMessage}
                saving={photoSaving}
                onClose={closePhotoPanel}
                onSubmit={savePhoto}
                onFile={updatePhotoFile}
                onChange={(field, value) => setPhotoForm((current) => ({ ...current, [field]: value }))}
              />
            )}

            {boatHistory && (
              <HistoryPanel
                title={`Historico de ${boatHistory.embarcacao.nome}`}
                subtitle={boatHistory.embarcacao.cliente_nome || "Sem cliente vinculado"}
                ordens={boatHistory.ordens}
                onClose={() => setBoatHistory(null)}
              />
            )}

            <div className="bordo-list-grid">
              {embarcacoes.length === 0 && <StateMessage title="Nenhuma embarcacao cadastrada" body="Cadastre barcos para a OS puxar cliente e dados automaticamente." compact />}
              {embarcacoes.map((embarcacao) => (
                <div key={embarcacao.id} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 14, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{embarcacao.nome}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{embarcacao.cliente_nome || "Sem cliente"} · {embarcacao.tipo || "tipo livre"}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button type="button" onClick={() => openPhotoPanel("embarcacao", embarcacao)} style={ghostButton}>Fotos</button>
                      <button type="button" onClick={() => openBoatHistory(embarcacao)} style={ghostButton}>
                        {historyLoading === `embarcacao-${embarcacao.id}` ? "Abrindo..." : "Historico"}
                      </button>
                      <button type="button" onClick={() => editBoat(embarcacao)} style={ghostButton}>Editar</button>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                    {[embarcacao.tamanho, embarcacao.marca, embarcacao.modelo, embarcacao.registro].filter(Boolean).map((item) => (
                      <span key={item} style={{ fontSize: 10, background: "rgba(255,255,255,0.08)", borderRadius: 5, padding: "2px 7px", color: "rgba(255,255,255,0.5)" }}>{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "equipe":
        return (
          <div className="bordo-page-body">
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Equipe operacional</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.white, fontFamily: fonts.display }}>{equipe.length} prestadores</div>
              <div style={{ color: "rgba(255,255,255,0.42)", fontSize: 12, marginTop: 4 }}>
                Cadastre limpeza, marinharia, marinheiro, mecanica, eletrica e outros responsaveis por OS.
              </div>
            </div>

            {teamMessage && <InlineMessage tone={teamMessage.includes("sucesso") ? "success" : "error"}>{teamMessage}</InlineMessage>}

            <form onSubmit={saveTeamMember} style={{ ...panelStyle, display: "grid", gap: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: fonts.display, color: C.white, fontWeight: 800 }}>
                    {editingTeamId ? "Editar prestador" : "Novo prestador"}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.42)", fontSize: 12, marginTop: 3 }}>
                    Função e disponibilidade ajudam a organizar agenda e OS.
                  </div>
                </div>
                {editingTeamId && <button type="button" onClick={clearTeamForm} style={ghostButton}>Cancelar</button>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                <Field label="Nome">
                  <input required value={teamForm.nome} onChange={(event) => updateTeamForm("nome", event.target.value)} style={inputStyle} />
                </Field>
                <Field label="Funcao">
                  <select value={teamForm.funcao} onChange={(event) => updateTeamForm("funcao", event.target.value)} style={inputStyle}>
                    {functionOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </Field>
                <Field label="Disponibilidade">
                  <select value={teamForm.disponibilidade} onChange={(event) => updateTeamForm("disponibilidade", event.target.value)} style={inputStyle}>
                    {availabilityOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </Field>
                <Field label="Telefone">
                  <input value={teamForm.telefone} onChange={(event) => updateTeamForm("telefone", event.target.value)} style={inputStyle} />
                </Field>
                <Field label="Habilitacao">
                  <input value={teamForm.habilitacao} onChange={(event) => updateTeamForm("habilitacao", event.target.value)} style={inputStyle} />
                </Field>
                <Field label="Certificado">
                  <input value={teamForm.certificado} onChange={(event) => updateTeamForm("certificado", event.target.value)} style={inputStyle} />
                </Field>
              </div>
              <Field label="Observacao">
                <textarea value={teamForm.observacao} onChange={(event) => updateTeamForm("observacao", event.target.value)} style={{ ...inputStyle, minHeight: 72, resize: "vertical" }} />
              </Field>
              <button type="submit" style={primarySmallButton}>{editingTeamId ? "Salvar prestador" : "Cadastrar prestador"}</button>
            </form>

            <div className="bordo-list-grid">
            {equipe.length === 0 && <StateMessage title="Nenhum prestador cadastrado" body="Cadastre a equipe para organizar agenda e responsaveis por OS." compact />}
            {equipe.map(m => (
              <div key={m.id} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 14, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{m.avatar || "👤"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{m.nome}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{m.funcao || m.cargo} · {m.telefone || "sem telefone"}</div>
                    {m.observacao && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.36)", marginTop: 4 }}>{m.observacao}</div>}
                  </div>
                  <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
                    <StatusBadge status={m.status || m.disponibilidade || "ok"} />
                    <button type="button" onClick={() => editTeamMember(m)} style={ghostButton}>Editar</button>
                  </div>
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

            {photoPanel?.tipo === "ordem" && (
              <PhotoPanel
                panel={photoPanel}
                form={photoForm}
                message={photoMessage}
                saving={photoSaving}
                onClose={closePhotoPanel}
                onSubmit={savePhoto}
                onFile={updatePhotoFile}
                onChange={(field, value) => setPhotoForm((current) => ({ ...current, [field]: value }))}
              />
            )}

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
                  <Field label="Barco cadastrado">
                    <select value={orderForm.embarcacao_id} onChange={(event) => selectOrderBoat(event.target.value)} style={inputStyle}>
                      <option value="">Digitar manualmente</option>
                      {embarcacoes.map((embarcacao) => (
                        <option key={embarcacao.id} value={embarcacao.id}>
                          {embarcacao.nome}{embarcacao.cliente_nome ? ` - ${embarcacao.cliente_nome}` : ""}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Cliente cadastrado">
                    <select value={orderForm.cliente_id} onChange={(event) => selectOrderClient(event.target.value)} style={inputStyle}>
                      <option value="">Digitar manualmente</option>
                      {clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>)}
                    </select>
                  </Field>
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
                    <input list="responsaveis-equipe" value={orderForm.responsavel} onChange={(event) => updateOrderForm("responsavel", event.target.value)} style={inputStyle} />
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
                <datalist id="responsaveis-equipe">
                  {equipe.map((member) => <option key={member.id} value={member.nome}>{member.funcao || member.cargo}</option>)}
                </datalist>
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, marginTop: 12, alignItems: "center" }}>
                  <select value={os.status} onChange={(event) => updateOrderStatus(os.id, event.target.value)} style={inputStyle}>
                    {statusOptions.filter(([value]) => value !== "todos").map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  <button type="button" onClick={() => openPhotoPanel("ordem", os)} style={ghostButton}>Fotos ({Number(os.fotos || 0)})</button>
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

function HistoryPanel({ title, subtitle, ordens, onClose }) {
  return (
    <section style={{ ...panelStyle, display: "grid", gap: 12, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: fonts.display, color: C.white, fontWeight: 800 }}>{title}</div>
          <div style={{ color: "rgba(255,255,255,0.42)", fontSize: 12, marginTop: 3 }}>
            {subtitle} · {ordens.length} ordem(ns) de servico
          </div>
        </div>
        <button type="button" onClick={onClose} style={ghostButton}>Fechar</button>
      </div>

      {ordens.length === 0 && (
        <StateMessage title="Sem historico ainda" body="Quando uma OS for aberta para este cadastro, ela aparece aqui." compact />
      )}

      {ordens.map((os) => (
        <div key={os.id} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.white }}>{os.codigo}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.42)" }}>
                {os.embarcacao} · {os.cliente || "Cliente nao informado"}
              </div>
            </div>
            <StatusBadge status={os.status} />
          </div>
          {os.descricao && <p style={{ color: "rgba(255,255,255,0.62)", fontSize: 12, margin: "8px 0" }}>{os.descricao}</p>}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={tagStyle}>{os.tipo || "Servico"}</span>
            <span style={tagStyle}>{os.prioridade || "normal"}</span>
            <span style={tagStyle}>{os.responsavel || "Sem responsavel"}</span>
            <span style={tagStyle}>{os.criado_em ? String(os.criado_em).slice(0, 10) : "Sem data"}</span>
          </div>
        </div>
      ))}
    </section>
  );
}

function AgendaSection({ title, items, empty, muted = false }) {
  return (
    <section style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ color: muted ? "rgba(255,255,255,0.42)" : C.white, fontWeight: 800, fontFamily: fonts.display }}>{title}</div>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{items.length} OS</span>
      </div>
      {items.length === 0 && <StateMessage title={empty} body="A agenda muda conforme a previsao das ordens de servico." compact />}
      <div className="bordo-list-grid">
        {items.map((os) => <AgendaCard key={os.id} os={os} muted={muted} />)}
      </div>
    </section>
  );
}

function AgendaCard({ os, muted }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 14, marginBottom: 10, opacity: muted ? 0.7 : 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 14, color: C.white, fontWeight: 800 }}>{os.codigo}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{dateKey(os.previsao)} · {os.embarcacao}</div>
        </div>
        <StatusBadge status={os.status} />
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.62)", marginBottom: 8 }}>
        {os.cliente || "Cliente nao informado"} · {os.responsavel || "Sem responsavel"}
      </div>
      {os.descricao && <p style={{ color: "rgba(255,255,255,0.58)", fontSize: 12, marginBottom: 8 }}>{os.descricao}</p>}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <span style={tagStyle}>{os.tipo || "Servico"}</span>
        <span style={tagStyle}>{os.prioridade || "normal"}</span>
      </div>
    </div>
  );
}

function PhotoPanel({ panel, form, message, saving, onClose, onSubmit, onFile, onChange }) {
  const title = panel.tipo === "ordem"
    ? `Fotos da ${panel.item.codigo}`
    : `Fotos de ${panel.item.nome}`;

  return (
    <section style={{ ...panelStyle, display: "grid", gap: 12, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: fonts.display, color: C.white, fontWeight: 800 }}>{title}</div>
          <div style={{ color: "rgba(255,255,255,0.42)", fontSize: 12, marginTop: 3 }}>
            {panel.fotos.length} foto(s) cadastrada(s)
          </div>
        </div>
        <button type="button" onClick={onClose} style={ghostButton}>Fechar</button>
      </div>

      {message && <InlineMessage tone={message.includes("sucesso") ? "success" : "error"}>{message}</InlineMessage>}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          <Field label="Foto">
            <input type="file" accept="image/*" onChange={(event) => onFile(event.target.files?.[0])} style={inputStyle} />
          </Field>
          <Field label="Categoria">
            <select value={form.categoria} onChange={(event) => onChange("categoria", event.target.value)} style={inputStyle}>
              {photoCategories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Legenda">
          <input value={form.legenda} onChange={(event) => onChange("legenda", event.target.value)} style={inputStyle} placeholder="Ex.: antes do polimento" />
        </Field>
        {form.url && (
          <img src={form.url} alt="Preview da foto" style={{ width: 140, height: 100, objectFit: "cover", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)" }} />
        )}
        <button type="submit" disabled={saving} style={primarySmallButton}>{saving ? "Salvando..." : "Salvar foto"}</button>
      </form>

      {panel.fotos.length === 0 && <StateMessage title="Nenhuma foto ainda" body="Anexe fotos para registrar antes, durante, depois ou documentos." compact />}
      {panel.fotos.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
          {panel.fotos.map((foto) => (
            <div key={foto.id} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 8 }}>
              <img src={foto.url} alt={foto.legenda || "Foto"} style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 10 }} />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                <span style={tagStyle}>{foto.categoria || "geral"}</span>
              </div>
              {foto.legenda && <div style={{ color: "rgba(255,255,255,0.58)", fontSize: 11, marginTop: 6 }}>{foto.legenda}</div>}
            </div>
          ))}
        </div>
      )}
    </section>
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

const tagStyle = {
  fontSize: 10,
  background: "rgba(255,255,255,0.08)",
  borderRadius: 5,
  padding: "2px 7px",
  color: "rgba(255,255,255,0.5)",
};

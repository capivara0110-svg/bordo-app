import React, { useState, useEffect } from "react";
import { C, fonts } from "../styles/theme.js";
import { api } from "../services/api.js";
import { PERFIS_SISTEMA } from "../data/mock.js";
import StatusBadge from "../components/StatusBadge.jsx";

export default function NauticoPro({ profile, onLogout }) {
  const fullProfile = PERFIS_SISTEMA.find(p => p.id === profile.id) || profile;
  const [tab, setTab] = useState(fullProfile.tabs?.[0]?.id || "diario");

  // Estados dos dados
  const [diario, setDiario] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [tripulacao, setTripulacao] = useState([]);
  const [estoque, setEstoque] = useState([]);
  const [ordens, setOrdens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal de criar
  const [showModal, setShowModal] = useState(null); // "diario" | "checklist" | null
  const [formData, setFormData] = useState({});

  const tabs = fullProfile.tabs || [
    { id: "diario", icon: "📋", label: "Diário" },
    { id: "checklist", icon: "✅", label: "Check-list" },
    { id: "tripulacao", icon: "👥", label: "Tripulação" },
    { id: "estoque", icon: "📦", label: "Estoque" },
  ];

  // Carrega dados ao abrir
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [d, cl, t, e, o] = await Promise.all([
          api.diario.listar(),
          api.checklist.listar(),
          api.tripulacao.listar(),
          api.estoque.listar(),
          api.ordens.listar(),
        ]);
        setDiario(d);
        setChecklist(cl);
        setTripulacao(t);
        setEstoque(e);
        setOrdens(o);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // ─── AÇÕES ─────────────────────────────────────────────
  const criarDiario = async () => {
    if (!formData.tipo || !formData.descricao) return;
    try {
      const novo = await api.diario.criar(formData.tipo, formData.descricao, fullProfile.user?.name);
      setDiario([novo, ...diario]);
      setShowModal(null);
      setFormData({});
    } catch (err) { alert(err.message); }
  };

  const assinarDiario = async (id) => {
    try {
      await api.diario.assinar(id);
      setDiario(diario.map(d => d.id === id ? { ...d, assinado: 1 } : d));
    } catch (err) { alert(err.message); }
  };

  const toggleChecklist = async (id) => {
    try {
      await api.checklist.toggle(id);
      setChecklist(checklist.map(c => c.id === id ? { ...c, feito: c.feito ? 0 : 1 } : c));
    } catch (err) { alert(err.message); }
  };

  const criarChecklist = async () => {
    if (!formData.categoria || !formData.item) return;
    try {
      const novo = await api.checklist.criar(formData.categoria, formData.item);
      setChecklist([...checklist, novo]);
      setShowModal(null);
      setFormData({});
    } catch (err) { alert(err.message); }
  };

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

  // ─── MODAL ──────────────────────────────────────────────
  const Modal = ({ children }) => (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }} onClick={() => setShowModal(null)}>
      <div style={{
        background: C.ocean, borderRadius: 20, padding: 24, maxWidth: 380,
        width: "100%", border: "1px solid rgba(255,255,255,0.1)"
      }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );

  const renderTab = () => {
    if (loading) return <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)" }}>Carregando...</div>;

    switch (tab) {
      case "diario":
        return (
          <div style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Registros</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.white, fontFamily: fonts.display }}>{diario.length} registros</div>
              </div>
              <button onClick={() => setShowModal("diario")} style={{ background: C.aqua, border: "none", borderRadius: 10, padding: "10px 16px", color: C.white, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Novo</button>
            </div>
            {diario.length === 0 && <div style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", padding: 40 }}>Nenhum registro ainda</div>}
            {diario.map(r => (
              <div key={r.id} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 14, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: r.tipo === "Saída" ? C.aqua : r.tipo === "Ocorrência" ? C.rust : C.gold }}>{r.tipo}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>·</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{r.data} às {r.hora}</span>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5, marginBottom: 8 }}>{r.descricao}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>por {r.autor}</span>
                  {r.assinado ? (
                    <span style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>✏️ Assinado</span>
                  ) : (
                    <button onClick={() => assinarDiario(r.id)} style={{ fontSize: 11, color: C.gold, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>⏳ Assinar</button>
                  )}
                </div>
              </div>
            ))}
            {showModal === "diario" && (
              <Modal>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.white, marginBottom: 16 }}>📋 Novo Registro</div>
                <select value={formData.tipo || ""} onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                  style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: C.white, fontSize: 14, marginBottom: 12 }}>
                  <option value="">Tipo</option>
                  <option value="Saída">Saída</option>
                  <option value="Chegada">Chegada</option>
                  <option value="Ocorrência">Ocorrência</option>
                  <option value="Manutenção">Manutenção</option>
                </select>
                <textarea placeholder="Descrição..." value={formData.descricao || ""} onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: C.white, fontSize: 14, minHeight: 80, marginBottom: 16, fontFamily: fonts.body }} />
                <button onClick={criarDiario} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: C.aqua, color: C.white, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Salvar</button>
              </Modal>
            )}
          </div>
        );

      case "checklist":
        return (
          <div style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Segurança</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.white, fontFamily: fonts.display }}>Check-list</div>
              </div>
              <button onClick={() => setShowModal("checklist")} style={{ background: C.aqua, border: "none", borderRadius: 10, padding: "10px 16px", color: C.white, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Item</button>
            </div>
            {["Segurança", "Motor", "Navegação", "Comunicação"].map(cat => {
              const items = checklist.filter(i => i.categoria === cat);
              const done = items.filter(i => i.feito).length;
              if (items.length === 0) return null;
              return (
                <div key={cat} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>{cat}</span>
                    <span style={{ fontSize: 11, color: C.aqua, fontWeight: 700 }}>{done}/{items.length}</span>
                  </div>
                  {items.map(i => (
                    <div key={i.id} onClick={() => toggleChecklist(i.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", cursor: "pointer" }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 6, border: `2px solid ${i.feito ? C.green : "rgba(255,255,255,0.2)"}`,
                        background: i.feito ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, color: C.white, flexShrink: 0
                      }}>
                        {i.feito ? "✓" : ""}
                      </div>
                      <span style={{ fontSize: 13, color: i.feito ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.8)", textDecoration: i.feito ? "line-through" : "none" }}>
                        {i.item}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
            {showModal === "checklist" && (
              <Modal>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.white, marginBottom: 16 }}>✅ Novo Item</div>
                <select value={formData.categoria || ""} onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                  style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: C.white, fontSize: 14, marginBottom: 12 }}>
                  <option value="">Categoria</option>
                  <option value="Segurança">Segurança</option>
                  <option value="Motor">Motor</option>
                  <option value="Navegação">Navegação</option>
                  <option value="Comunicação">Comunicação</option>
                </select>
                <input placeholder="Item..." value={formData.item || ""} onChange={e => setFormData({ ...formData, item: e.target.value })}
                  style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: C.white, fontSize: 14, marginBottom: 16 }} />
                <button onClick={criarChecklist} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: C.aqua, color: C.white, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Adicionar</button>
              </Modal>
            )}
          </div>
        );

      case "tripulacao":
        return (
          <div style={{ padding: "12px 16px" }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Tripulação</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.white, fontFamily: fonts.display }}>{tripulacao.length} membros</div>
            </div>
            {tripulacao.map(m => (
              <div key={m.id} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 14, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 28 }}>{m.avatar || "👤"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{m.nome}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{m.cargo}</div>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                  <span>📄 Hab.: {m.habilitacao || "—"}</span>
                  <span>📜 Cert.: {m.certificado || "—"}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case "estoque":
        return (
          <div style={{ padding: "12px 16px" }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Estoque</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.white, fontFamily: fonts.display }}>{estoque.length} itens</div>
            </div>
            {estoque.map(item => {
              const baixo = item.quantidade < item.minimo;
              return (
                <div key={item.id} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 14, marginBottom: 8, borderLeft: `3px solid ${baixo ? C.rust : C.green}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{item.nome}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{item.categoria}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: baixo ? C.rust : C.aqua }}>{item.quantidade}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{item.unidade}</div>
                    </div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 4, height: 4, marginTop: 4 }}>
                    <div style={{ width: `${Math.min(100, (item.quantidade / item.minimo) * 100)}%`, height: "100%", borderRadius: 4, background: baixo ? C.rust : C.aqua }} />
                  </div>
                </div>
              );
            })}
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
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{os.embarcacao} · {os.cliente || "Sem cliente"}</div>
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

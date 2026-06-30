import React, { useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import { api } from "../services/api.js";
import { C, fonts } from "../styles/theme.js";

const emptyMember = {
  nome: "",
  email: "",
  senha: "",
  cargo: "",
  perfil: "marinheiro",
  papel: "membro",
};

const roleLabels = {
  proprietario: "Proprietario",
  gestor: "Gestor",
  tecnico: "Tecnico",
  membro: "Membro",
};

const profileLabels = {
  gestor: "Gestao",
  tecnico: "Manutencao",
  marinharia: "Marinharia",
  marinheiro: "Tripulacao",
};

const metricLabels = {
  usuarios: "Usuarios",
  ordensMes: "OS no mes",
  diarioMes: "Diario no mes",
};

const billingStatusLabels = {
  trialing: "Teste",
  pending: "Pendente",
  active: "Ativa",
  past_due: "Inadimplente",
  unpaid: "Nao paga",
  canceled: "Cancelada",
  blocked: "Bloqueada",
};

export default function MinhaEmpresa({ profile, onBack, onLegal }) {
  const [company, setCompany] = useState(null);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(emptyMember);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [checkout, setCheckout] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);

  const canManage = ["proprietario", "gestor"].includes(profile?.accessRole);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const companyData = await api.empresa.dados();
      setCompany(companyData);
      if (canManage) {
        const [membersData, subscriptionData] = await Promise.all([
          api.empresa.membros(),
          api.assinaturas.admin(),
        ]);
        setMembers(membersData);
        setSubscriptions(subscriptionData);
      }
    } catch (requestError) {
      setError(requestError.message || "Nao foi possivel carregar a empresa");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setMessage("");
  };

  const createMember = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await api.empresa.criarMembro(form);
      setForm(emptyMember);
      setShowForm(false);
      setMessage("Colaborador criado com sucesso.");
      setMembers(await api.empresa.membros());
    } catch (requestError) {
      setError(requestError.message || "Nao foi possivel criar o colaborador");
    } finally {
      setSaving(false);
    }
  };

  const changeRole = async (memberId, role) => {
    setError("");
    setMessage("");
    try {
      await api.empresa.alterarPapel(memberId, role);
      setMembers((current) => current.map((member) => (
        member.id === memberId ? { ...member, papel: role } : member
      )));
      setMessage("Permissao atualizada.");
    } catch (requestError) {
      setError(requestError.message || "Nao foi possivel alterar a permissao");
    }
  };

  const createCheckout = async (plano) => {
    setError("");
    setMessage("");
    try {
      const data = await api.assinaturas.checkout({ plano, provider: "mercadopago" });
      setCheckout(data);
      setMessage("Checkout Mercado Pago criado com seguranca para o BORDO.");
    } catch (requestError) {
      setError(requestError.message || "Nao foi possivel criar checkout");
    }
  };

  const updateSubscription = async (empresaId, dados) => {
    setError("");
    setMessage("");
    try {
      const updated = await api.assinaturas.atualizarAdmin(empresaId, dados);
      setSubscriptions((current) => current.map((item) => item.id === empresaId ? updated : item));
      if (company?.id === empresaId) setCompany((current) => ({ ...current, ...updated }));
      setMessage("Assinatura atualizada sem perda de dados.");
    } catch (requestError) {
      setError(requestError.message || "Nao foi possivel atualizar assinatura");
    }
  };

  return (
    <main className="bordo-app-screen bordo-no-sidebar" style={{ minHeight: "100vh", background: C.ocean, maxWidth: 720, margin: "0 auto", paddingBottom: 32 }}>
      <Header title="Minha Empresa" sub="Equipe, plano e permissoes" onBack={onBack} color={C.green} />

      <div className="bordo-page-body" style={{ padding: "8px 16px 24px" }}>
        {loading && <StateMessage>Carregando empresa...</StateMessage>}
        {error && <Alert tone="error">{error}</Alert>}
        {message && <Alert tone="success">{message}</Alert>}

        {!loading && company && (
          <>
            <section style={cardStyle}>
              <div>
                <div style={eyebrowStyle}>Organizacao</div>
                <h1 style={{ fontFamily: fonts.display, color: C.white, fontSize: 22, marginTop: 3 }}>
                  {company.nome}
                </h1>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 4 }}>
                  {company.slug}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ ...eyebrowStyle, color: C.gold }}>Plano atual</div>
                <div style={{ color: C.white, fontWeight: 800, textTransform: "capitalize", marginTop: 5 }}>
                  {company.assinatura?.nome || company.plano}
                </div>
                <div style={{
                  color: company.assinatura?.ativo ? C.green : "#ffaaa2",
                  fontSize: 11,
                  marginTop: 4,
                }}>
                  {company.assinatura?.ativo ? trialText(company.assinatura) : "Plano inativo"}
                </div>
              </div>
            </section>

            {company.assinatura && (
              <section style={{ ...cardStyle, alignItems: "stretch", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", marginTop: 12 }}>
                {Object.entries(metricLabels).map(([key, label]) => (
                  <PlanMetric
                    key={key}
                    label={label}
                    used={company.assinatura.uso[key]}
                    limit={company.assinatura.limites[key]}
                  />
                ))}
              </section>
            )}

            <section style={{ ...cardStyle, alignItems: "stretch", display: "grid", gap: 12, marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div>
                  <div style={eyebrowStyle}>Comercial</div>
                  <h2 style={{ fontFamily: fonts.display, color: C.white, fontSize: 18, marginTop: 3 }}>
                    Assinatura e cobranca
                  </h2>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 4 }}>
                    Status: {billingStatusLabels[company.assinatura?.billing_status] || company.assinatura?.billing_status || "Teste"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button type="button" onClick={() => createCheckout("profissional")} style={smallPrimaryButton}>Checkout Pro</button>
                  <button type="button" onClick={() => createCheckout("empresa")} style={ghostButton}>Checkout Empresa</button>
                </div>
              </div>
              {checkout && (
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 12 }}>
                  <div style={{ color: C.white, fontSize: 12, fontWeight: 800 }}>Link de checkout preparado</div>
                  <input readOnly value={checkout.checkout_url} style={{ ...inputStyle, width: "100%", marginTop: 8 }} />
                  <button type="button" onClick={() => { window.location.href = checkout.checkout_url; }} style={{ ...smallPrimaryButton, marginTop: 8 }}>Abrir Mercado Pago</button>
                </div>
              )}
            </section>

            {canManage && (
              <section style={{ marginTop: 20 }}>
                <div style={eyebrowStyle}>Painel interno</div>
                <h2 style={{ fontFamily: fonts.display, color: C.white, fontSize: 19, marginTop: 3, marginBottom: 12 }}>
                  Assinaturas
                </h2>
                {subscriptions.map((subscription) => (
                  <article key={subscription.id} style={{ ...cardStyle, marginBottom: 10 }}>
                    <div>
                      <div style={{ color: C.white, fontSize: 14, fontWeight: 800 }}>{subscription.nome}</div>
                      <div style={{ color: "rgba(255,255,255,0.42)", fontSize: 11, marginTop: 3 }}>
                        {subscription.slug} · {subscription.plano} · {billingStatusLabels[subscription.billing_status] || subscription.billing_status}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button type="button" onClick={() => updateSubscription(subscription.id, { plano: "profissional", billing_status: "active", ativo: 1 })} style={ghostButton}>Ativar</button>
                      <button type="button" onClick={() => updateSubscription(subscription.id, { billing_status: "past_due", ativo: 1 })} style={ghostButton}>Inadimplente</button>
                      <button type="button" onClick={() => updateSubscription(subscription.id, { billing_status: "blocked", ativo: 1 })} style={ghostButton}>Bloquear</button>
                    </div>
                  </article>
                ))}
              </section>
            )}

            <section style={{ ...cardStyle, marginTop: 20 }}>
              <div>
                <div style={eyebrowStyle}>Legal</div>
                <div style={{ color: C.white, fontWeight: 800, marginTop: 4 }}>Termos, privacidade e LGPD</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" onClick={() => onLegal?.("privacidade")} style={ghostButton}>Privacidade</button>
                <button type="button" onClick={() => onLegal?.("termos")} style={ghostButton}>Termos</button>
              </div>
            </section>

            <section style={{ marginTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 12 }}>
                <div>
                  <div style={eyebrowStyle}>Acessos</div>
                  <h2 style={{ fontFamily: fonts.display, color: C.white, fontSize: 19, marginTop: 3 }}>
                    {canManage ? `${members.length} colaboradores` : "Sua permissao"}
                  </h2>
                </div>
                {canManage && (
                  <button type="button" onClick={() => setShowForm((value) => !value)} style={smallPrimaryButton}>
                    {showForm ? "Cancelar" : "+ Colaborador"}
                  </button>
                )}
              </div>

              {showForm && (
                <form onSubmit={createMember} style={{ ...cardStyle, display: "grid", gap: 12, marginBottom: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                    <Field label="Nome">
                      <input value={form.nome} onChange={(event) => updateForm("nome", event.target.value)} required style={inputStyle} />
                    </Field>
                    <Field label="E-mail">
                      <input type="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} required style={inputStyle} />
                    </Field>
                    <Field label="Senha temporaria">
                      <input type="password" minLength={8} value={form.senha} onChange={(event) => updateForm("senha", event.target.value)} required style={inputStyle} />
                    </Field>
                    <Field label="Cargo">
                      <input value={form.cargo} onChange={(event) => updateForm("cargo", event.target.value)} style={inputStyle} />
                    </Field>
                    <Field label="Area de trabalho">
                      <select value={form.perfil} onChange={(event) => updateForm("perfil", event.target.value)} style={inputStyle}>
                        {Object.entries(profileLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </Field>
                    <Field label="Permissao">
                      <select value={form.papel} onChange={(event) => updateForm("papel", event.target.value)} style={inputStyle}>
                        <option value="membro">Membro</option>
                        <option value="tecnico">Tecnico</option>
                        <option value="gestor">Gestor</option>
                      </select>
                    </Field>
                  </div>
                  <button type="submit" disabled={saving} style={smallPrimaryButton}>
                    {saving ? "Criando..." : "Criar acesso"}
                  </button>
                </form>
              )}

              {canManage ? members.map((member) => (
                <article key={member.id} style={{ ...cardStyle, marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
                    <div style={avatarStyle}>{member.avatar || member.nome.slice(0, 2).toUpperCase()}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: C.white, fontSize: 14, fontWeight: 700 }}>{member.nome}</div>
                      <div style={{ color: "rgba(255,255,255,0.42)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {member.email} · {member.cargo || profileLabels[member.perfil]}
                      </div>
                    </div>
                  </div>
                  {member.papel === "proprietario" || member.id === profile.userId ? (
                    <span style={roleBadge}>{roleLabels[member.papel]}</span>
                  ) : (
                    <select
                      aria-label={`Permissao de ${member.nome}`}
                      value={member.papel}
                      onChange={(event) => changeRole(member.id, event.target.value)}
                      style={{ ...inputStyle, width: "auto", minWidth: 110 }}
                    >
                      <option value="membro">Membro</option>
                      <option value="tecnico">Tecnico</option>
                      <option value="gestor">Gestor</option>
                    </select>
                  )}
                </article>
              )) : (
                <section style={cardStyle}>
                  <div style={avatarStyle}>{profile.user?.name?.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <div style={{ color: C.white, fontWeight: 700 }}>{profile.user?.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
                      {roleLabels[profile.accessRole] || profile.accessRole}
                    </div>
                  </div>
                </section>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 6, color: "rgba(255,255,255,0.65)", fontSize: 11, fontWeight: 700 }}>
      {label}
      {children}
    </label>
  );
}

function Alert({ tone, children }) {
  const success = tone === "success";
  return (
    <div role={success ? "status" : "alert"} style={{
      padding: "11px 13px",
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

function StateMessage({ children }) {
  return <div style={{ padding: 40, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>{children}</div>;
}

function PlanMetric({ label, used, limit }) {
  const unlimited = limit === null || limit === undefined;
  const percent = unlimited ? 8 : Math.min((used / Math.max(limit, 1)) * 100, 100);
  const isFull = !unlimited && used >= limit;

  return (
    <div>
      <div style={{ ...eyebrowStyle, color: isFull ? "#ffaaa2" : C.aqua }}>{label}</div>
      <div style={{ color: C.white, fontSize: 18, fontWeight: 800, marginTop: 5 }}>
        {used}<span style={{ color: "rgba(255,255,255,0.38)", fontSize: 12 }}>/{unlimited ? "ilimitado" : limit}</span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.08)", marginTop: 9, overflow: "hidden" }}>
        <div style={{
          width: `${percent}%`,
          height: "100%",
          borderRadius: 999,
          background: isFull ? "#ffaaa2" : C.aqua,
        }} />
      </div>
    </div>
  );
}

function trialText(assinatura) {
  if (assinatura.plano !== "trial") return "Conta ativa";
  if (!assinatura.trial_termina_em) return "Teste ativo";

  const diff = new Date(assinatura.trial_termina_em).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days <= 0) return "Teste expirado";
  return `${days} dias de teste`;
}

const cardStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
  padding: 16,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 14,
};

const eyebrowStyle = {
  color: C.aqua,
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 1.8,
  textTransform: "uppercase",
};

const inputStyle = {
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.08)",
  color: C.white,
  borderRadius: 10,
  padding: "10px 11px",
  outline: "none",
};

const smallPrimaryButton = {
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
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
};

const avatarStyle = {
  width: 40,
  height: 40,
  borderRadius: 12,
  background: "rgba(23,168,189,0.18)",
  color: C.aqua,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  flexShrink: 0,
};

const roleBadge = {
  color: C.aqua,
  background: "rgba(23,168,189,0.14)",
  borderRadius: 999,
  padding: "6px 9px",
  fontSize: 10,
  fontWeight: 800,
};

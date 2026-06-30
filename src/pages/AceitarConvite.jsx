import React, { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { C, fonts } from "../styles/theme.js";

export default function AceitarConvite({ token, onAccepted, onBack }) {
  const [invite, setInvite] = useState(null);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", confirmar: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInvite() {
      setLoading(true);
      setError("");
      try {
        const data = await api.empresa.convitePublico(token);
        setInvite(data);
        setForm((current) => ({
          ...current,
          nome: data.nome || "",
          email: data.email || "",
        }));
      } catch (requestError) {
        setError(requestError.message || "Convite invalido ou expirado");
      } finally {
        setLoading(false);
      }
    }

    if (token) loadInvite();
  }, [token]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const acceptInvite = async (event) => {
    event.preventDefault();
    if (form.senha !== form.confirmar) {
      setError("As senhas nao conferem");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const data = await api.empresa.aceitarConvite(token, {
        nome: form.nome,
        email: form.email,
        senha: form.senha,
      });
      window.history.replaceState(null, "", "/");
      onAccepted(data);
    } catch (requestError) {
      setError(requestError.message || "Nao foi possivel aceitar o convite");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: C.ocean,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 18,
    }}>
      <section style={{
        width: "100%",
        maxWidth: 460,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24,
        padding: 24,
        boxShadow: "0 20px 70px rgba(0,0,0,0.20)",
      }}>
        <div style={{ color: C.green, fontSize: 13, fontWeight: 900, letterSpacing: 4 }}>
          BORDO.
        </div>
        <h1 style={{ fontFamily: fonts.display, color: C.white, fontSize: 28, marginTop: 10 }}>
          Convite de colaborador
        </h1>
        <p style={{ color: "rgba(255,255,255,0.54)", fontSize: 14, lineHeight: 1.5, marginTop: 8 }}>
          Crie sua senha para entrar na operacao e registrar os servicos do dia.
        </p>

        {loading && <StateMessage>Carregando convite...</StateMessage>}
        {error && <Alert>{error}</Alert>}

        {!loading && invite && !error && (
          <form onSubmit={acceptInvite} style={{ display: "grid", gap: 12, marginTop: 20 }}>
            <div style={{
              background: "rgba(23,168,189,0.12)",
              border: "1px solid rgba(23,168,189,0.18)",
              borderRadius: 16,
              padding: 14,
            }}>
              <div style={{ color: C.aqua, fontSize: 10, fontWeight: 900, letterSpacing: 1.6, textTransform: "uppercase" }}>
                Empresa
              </div>
              <div style={{ color: C.white, fontWeight: 900, marginTop: 4 }}>
                {invite.empresa_nome}
              </div>
              <div style={{ color: "rgba(255,255,255,0.52)", fontSize: 12, marginTop: 4 }}>
                {profileLabel(invite.perfil)} - {roleLabel(invite.papel)}
              </div>
            </div>

            <Field label="Nome">
              <input
                value={form.nome}
                onChange={(event) => updateForm("nome", event.target.value)}
                required
                style={inputStyle}
              />
            </Field>
            <Field label="E-mail">
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
                required
                disabled={Boolean(invite.email)}
                style={{ ...inputStyle, opacity: invite.email ? 0.72 : 1 }}
              />
            </Field>
            <Field label="Senha">
              <input
                type="password"
                minLength={8}
                value={form.senha}
                onChange={(event) => updateForm("senha", event.target.value)}
                required
                style={inputStyle}
              />
            </Field>
            <Field label="Confirmar senha">
              <input
                type="password"
                minLength={8}
                value={form.confirmar}
                onChange={(event) => updateForm("confirmar", event.target.value)}
                required
                style={inputStyle}
              />
            </Field>
            <button type="submit" disabled={saving} style={primaryButton}>
              {saving ? "Entrando..." : "Aceitar convite"}
            </button>
          </form>
        )}

        <button type="button" onClick={onBack} style={ghostButton}>
          Voltar para inicio
        </button>
      </section>
    </main>
  );
}

function profileLabel(value) {
  const labels = {
    gestor: "Gestao",
    tecnico: "Manutencao",
    marinharia: "Marinharia",
    marinheiro: "Tripulacao",
  };
  return labels[value] || "Colaborador";
}

function roleLabel(value) {
  const labels = {
    gestor: "Gestor",
    tecnico: "Tecnico",
    membro: "Membro",
  };
  return labels[value] || "Membro";
}

function Field({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 6, color: "rgba(255,255,255,0.68)", fontSize: 12, fontWeight: 800 }}>
      {label}
      {children}
    </label>
  );
}

function Alert({ children }) {
  return (
    <div role="alert" style={{
      padding: "12px 13px",
      borderRadius: 12,
      marginTop: 16,
      background: "rgba(192,57,43,0.16)",
      color: "#ffaaa2",
      fontSize: 13,
    }}>
      {children}
    </div>
  );
}

function StateMessage({ children }) {
  return (
    <div style={{ padding: "28px 0 12px", color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
      {children}
    </div>
  );
}

const inputStyle = {
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.08)",
  color: C.white,
  borderRadius: 12,
  padding: "12px 13px",
  outline: "none",
  width: "100%",
};

const primaryButton = {
  border: "none",
  borderRadius: 12,
  background: C.aqua,
  color: C.white,
  padding: "13px 16px",
  fontWeight: 900,
  cursor: "pointer",
  marginTop: 4,
};

const ghostButton = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  background: "rgba(255,255,255,0.04)",
  color: "rgba(255,255,255,0.68)",
  padding: "11px 14px",
  fontWeight: 800,
  cursor: "pointer",
  marginTop: 14,
  width: "100%",
};

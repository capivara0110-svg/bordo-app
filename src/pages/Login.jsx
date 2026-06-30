import React, { useState } from "react";
import { C, fonts } from "../styles/theme.js";
import { api } from "../services/api.js";

const inputStyle = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: 12,
  border: "1.5px solid #E0E6EB",
  fontSize: 14,
  outline: "none",
  fontFamily: fonts.body,
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: C.ocean,
  display: "block",
  marginBottom: 6,
};

export default function Login({ onLogin, onBack }) {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState("email");
  const [form, setForm] = useState({
    nome: "",
    empresa: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErro("");
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setStep("email");
    setErro("");
    setForm({ nome: "", empresa: "", email: "", senha: "", confirmarSenha: "" });
  };

  const handleLogin = async () => {
    setCarregando(true);
    setErro("");
    try {
      const data = await api.login(form.email.trim(), form.senha);
      onLogin(data);
    } catch (error) {
      setErro(error.message || "Nao foi possivel entrar");
    } finally {
      setCarregando(false);
    }
  };

  const handleRegister = async () => {
    if (!form.nome.trim() || !form.empresa.trim() || !form.email.includes("@")) {
      setErro("Preencha nome, empresa e email");
      return;
    }
    if (form.senha.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres");
      return;
    }
    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas nao conferem");
      return;
    }

    setCarregando(true);
    setErro("");
    try {
      const data = await api.registro(
        form.nome.trim(),
        form.empresa.trim(),
        form.email.trim(),
        form.senha,
      );
      onLogin(data);
    } catch (error) {
      setErro(error.message || "Nao foi possivel criar a empresa");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: C.ocean,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <section style={{
        background: C.white,
        borderRadius: 24,
        padding: "34px 28px",
        maxWidth: 430,
        width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <header style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: fonts.display, fontSize: 28, fontWeight: 800, color: C.ocean }}>
            BORDO<span style={{ color: C.aqua }}>.</span>
          </div>
          <div style={{ fontSize: 13, color: C.gray, marginTop: 4 }}>
            {mode === "login" ? "Acesse sua operacao" : "Crie sua empresa no BORDO"}
          </div>
        </header>

        <div role="tablist" aria-label="Acesso ao BORDO" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          background: C.foam,
          borderRadius: 12,
          padding: 4,
          marginBottom: 22,
        }}>
          {[
            { id: "login", label: "Entrar" },
            { id: "cadastro", label: "Criar empresa" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={mode === item.id}
              onClick={() => switchMode(item.id)}
              style={{
                border: "none",
                borderRadius: 9,
                padding: "10px 8px",
                background: mode === item.id ? C.white : "transparent",
                color: mode === item.id ? C.ocean : C.gray,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: mode === item.id ? "0 2px 8px rgba(10,37,64,0.08)" : "none",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {erro && (
          <div role="alert" style={{
            background: "#f8d7da",
            color: "#721c24",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 13,
            marginBottom: 16,
            textAlign: "center",
          }}>
            {erro}
          </div>
        )}

        {mode === "login" && step === "email" && (
          <form onSubmit={(event) => { event.preventDefault(); setStep("senha"); }}>
            <label htmlFor="login-email" style={labelStyle}>E-mail profissional</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              style={{ ...inputStyle, marginBottom: 16 }}
            />
            <button
              type="submit"
              disabled={!form.email.includes("@")}
              style={primaryButton(form.email.includes("@"))}
            >
              Continuar
            </button>
          </form>
        )}

        {mode === "login" && step === "senha" && (
          <form onSubmit={(event) => { event.preventDefault(); handleLogin(); }}>
            <div style={{ fontSize: 13, color: C.gray, marginBottom: 14, textAlign: "center" }}>
              Entrando como <strong style={{ color: C.ocean }}>{form.email}</strong>
            </div>
            <label htmlFor="login-senha" style={labelStyle}>Senha</label>
            <input
              id="login-senha"
              type="password"
              autoComplete="current-password"
              placeholder="Sua senha"
              value={form.senha}
              onChange={(event) => updateField("senha", event.target.value)}
              autoFocus
              style={{ ...inputStyle, marginBottom: 16 }}
            />
            <button type="submit" disabled={!form.senha || carregando} style={primaryButton(Boolean(form.senha))}>
              {carregando ? "Entrando..." : "Entrar"}
            </button>
            <button type="button" onClick={() => setStep("email")} style={secondaryButton}>
              Voltar
            </button>
          </form>
        )}

        {mode === "cadastro" && (
          <form onSubmit={(event) => { event.preventDefault(); handleRegister(); }} style={{ display: "grid", gap: 13 }}>
            <div>
              <label htmlFor="register-name" style={labelStyle}>Seu nome</label>
              <input id="register-name" value={form.nome} onChange={(event) => updateField("nome", event.target.value)} autoComplete="name" style={inputStyle} />
            </div>
            <div>
              <label htmlFor="register-company" style={labelStyle}>Nome da empresa ou marina</label>
              <input id="register-company" value={form.empresa} onChange={(event) => updateField("empresa", event.target.value)} autoComplete="organization" style={inputStyle} />
            </div>
            <div>
              <label htmlFor="register-email" style={labelStyle}>E-mail profissional</label>
              <input id="register-email" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} autoComplete="email" style={inputStyle} />
            </div>
            <div>
              <label htmlFor="register-password" style={labelStyle}>Senha</label>
              <input id="register-password" type="password" value={form.senha} onChange={(event) => updateField("senha", event.target.value)} autoComplete="new-password" style={inputStyle} />
            </div>
            <div>
              <label htmlFor="register-confirm" style={labelStyle}>Confirmar senha</label>
              <input id="register-confirm" type="password" value={form.confirmarSenha} onChange={(event) => updateField("confirmarSenha", event.target.value)} autoComplete="new-password" style={inputStyle} />
            </div>
            <button type="submit" disabled={carregando} style={primaryButton(!carregando)}>
              {carregando ? "Criando empresa..." : "Comecar periodo de teste"}
            </button>
            <p style={{ fontSize: 11, lineHeight: 1.5, color: C.gray, textAlign: "center" }}>
              Ao continuar, sua conta sera criada como proprietario da empresa.
            </p>
            <button type="button" onClick={() => switchMode("login")} style={{ ...secondaryButton, marginTop: 0, color: C.ocean, fontWeight: 700 }}>
              Ja tenho conta, fazer login
            </button>
          </form>
        )}

        {onBack && (
          <button type="button" onClick={onBack} style={{ ...secondaryButton, marginTop: 14 }}>
            Voltar para o site
          </button>
        )}
      </section>
    </main>
  );
}

function primaryButton(enabled) {
  return {
    width: "100%",
    padding: "14px 0",
    borderRadius: 12,
    border: "none",
    background: enabled ? C.aqua : "#d5dde5",
    color: enabled ? C.white : C.gray,
    fontSize: 15,
    fontWeight: 700,
    fontFamily: fonts.display,
    cursor: enabled ? "pointer" : "not-allowed",
  };
}

const secondaryButton = {
  width: "100%",
  padding: "10px 0",
  marginTop: 8,
  background: "transparent",
  border: "none",
  color: C.gray,
  fontSize: 13,
  cursor: "pointer",
};

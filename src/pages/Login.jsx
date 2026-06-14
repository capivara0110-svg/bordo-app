import React, { useState } from "react";
import { C, fonts } from "../styles/theme.js";
import { api } from "../services/api.js";
import { PERFIS_SISTEMA } from "../data/mock.js";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [step, setStep] = useState("inicio");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleContinuar = () => {
    if (!email.includes("@")) return;
    // Verifica se é um email de teste rápido
    if (email === "admin@bordo.app" || email === "carlos@bordo.app" ||
        email === "rafael@bordo.app" || email === "ana@bordo.app") {
      setStep("senha");
      setSenha("");
      setErro("");
    } else {
      setStep("senha");
      setSenha("");
      setErro("");
    }
  };

  const handleLogin = async () => {
    setCarregando(true);
    setErro("");

    try {
      const data = await api.login(email, senha);
      onLogin(data);
    } catch (err) {
      setErro(err.message || "Erro ao fazer login");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.ocean, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: C.white, borderRadius: 24, padding: "40px 32px", maxWidth: 420, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: fonts.display, fontSize: 28, fontWeight: 800, color: C.ocean }}>BORDO<span style={{ color: C.aqua }}>.</span></div>
          <div style={{ fontSize: 13, color: C.gray, marginTop: 4 }}>
            {step === "inicio" ? "Acesse sua conta" : "Digite sua senha"}
          </div>
        </div>

        {erro && (
          <div style={{
            background: "#f8d7da", color: "#721c24", borderRadius: 10, padding: "10px 14px",
            fontSize: 13, marginBottom: 16, textAlign: "center"
          }}>
            {erro}
          </div>
        )}

        {step === "inicio" && (
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.ocean, display: "block", marginBottom: 6 }}>
              E-mail profissional
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErro(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleContinuar()}
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12,
                border: "1.5px solid #E0E6EB", fontSize: 15, outline: "none",
                marginBottom: 8, fontFamily: fonts.body
              }}
            />
            <div style={{ fontSize: 11, color: C.gray, marginBottom: 16 }}>
              Teste: carlos@bordo.app, rafael@bordo.app, ana@bordo.app, admin@bordo.app
            </div>
            <button
              onClick={handleContinuar}
              disabled={!email.includes("@")}
              style={{
                width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
                background: email.includes("@") ? C.aqua : "#d5dde5",
                color: email.includes("@") ? C.white : C.gray,
                fontSize: 15, fontWeight: 700, fontFamily: fonts.display,
                cursor: email.includes("@") ? "pointer" : "not-allowed"
              }}>
              Continuar →
            </button>
          </div>
        )}

        {step === "senha" && (
          <div>
            <div style={{ fontSize: 13, color: C.gray, marginBottom: 16, textAlign: "center" }}>
              Login: <strong style={{ color: C.ocean }}>{email}</strong>
            </div>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.ocean, display: "block", marginBottom: 6 }}>
              Senha
            </label>
            <input
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoFocus
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12,
                border: "1.5px solid #E0E6EB", fontSize: 15, outline: "none",
                marginBottom: 16, fontFamily: fonts.body
              }}
            />
            <div style={{ fontSize: 11, color: C.gray, marginBottom: 16, textAlign: "center" }}>
              Senha de teste: <strong>123456</strong>
            </div>
            <button
              onClick={handleLogin}
              disabled={!senha || carregando}
              style={{
                width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
                background: senha ? C.aqua : "#d5dde5",
                color: senha ? C.white : C.gray,
                fontSize: 15, fontWeight: 700, fontFamily: fonts.display,
                cursor: senha ? "pointer" : "not-allowed"
              }}>
              {carregando ? "Entrando..." : "Entrar →"}
            </button>
            <button
              onClick={() => { setStep("inicio"); setErro(""); }}
              style={{
                width: "100%", padding: "10px 0", marginTop: 8,
                background: "transparent", border: "none",
                color: C.gray, fontSize: 13, cursor: "pointer"
              }}>
              ← Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

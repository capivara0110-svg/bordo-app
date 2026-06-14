import React, { useState } from "react";
import { C, fonts } from "../styles/theme.js";
import { PERFIS_SISTEMA } from "../data/mock.js";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("inicio"); // inicio | perfis | senha

  return (
    <div style={{ minHeight: "100vh", background: C.ocean, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: C.white, borderRadius: 24, padding: "40px 32px", maxWidth: 420, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: fonts.display, fontSize: 28, fontWeight: 800, color: C.ocean }}>BORDO<span style={{ color: C.aqua }}>.</span></div>
          <div style={{ fontSize: 13, color: C.gray, marginTop: 4 }}>
            {step === "inicio" ? "Acesse sua conta" : step === "perfis" ? "Escolha seu perfil" : "Digite sua senha"}
          </div>
        </div>

        {step === "inicio" && (
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.ocean, display: "block", marginBottom: 6 }}>E-mail profissional</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "1.5px solid #E0E6EB", fontSize: 15, outline: "none", marginBottom: 20, fontFamily: fonts.body }}
            />
            <button
              onClick={() => setStep("perfis")}
              disabled={!email.includes("@")}
              style={{
                width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
                background: email.includes("@") ? C.aqua : "#d5dde5",
                color: email.includes("@") ? C.white : C.gray,
                fontSize: 15, fontWeight: 700, fontFamily: fonts.display, cursor: email.includes("@") ? "pointer" : "not-allowed"
              }}>
              Continuar →
            </button>
          </div>
        )}

        {step === "perfis" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PERFIS_SISTEMA.map(p => (
              <button key={p.id} onClick={() => { onLogin(p); }}
                style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                  borderRadius: 14, border: "1.5px solid #E0E6EB", background: C.white,
                  cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.2s"
                }}
                onMouseOver={e => e.target.style.borderColor = p.color}
                onMouseOut={e => e.target.style.borderColor = "#E0E6EB"}>
                <span style={{ fontSize: 28 }}>{p.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ocean }}>{p.label}</div>
                  <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>{p.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

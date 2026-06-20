import React from "react";
import { useEffect, useState } from "react";

const C = {
  ocean: "#0A2540", wave: "#1B4F72", aqua: "#17A8BD",
  aquaLt: "#5ECFDE", foam: "#E4F4F8", sand: "#F7F3EC",
  rust: "#C0392B", gold: "#F39C12", green: "#27AE60",
  gray: "#6B7B8D", lg: "#D5DDE5", white: "#FFFFFF",
};

function AnchorIcon({ size = 32, color = C.aqua }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <line x1="32" y1="14" x2="32" y2="52" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <line x1="18" y1="52" x2="46" y2="52" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <path d="M18 52 Q10 43 15 34" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M46 52 Q54 43 49 34" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"/>
      <circle cx="32" cy="17" r="4.5" fill="none" stroke={color} strokeWidth="3"/>
      <line x1="22" y1="25" x2="42" y2="25" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

const STEPS = [
  { id: "bemvindo",    title: "Bem-vindo ao BORDO.", progress: 0   },
  { id: "nome",        title: "Como você se chama?", progress: 20  },
  { id: "perfil",      title: "Como você trabalha?", progress: 40  },
  { id: "embarcacao",  title: "Sua embarcação",      progress: 60  },
  { id: "notificacoes",title: "Alertas importantes", progress: 80  },
  { id: "pronto",      title: "Tudo pronto!",        progress: 100 },
];

const PERFIS = [
  { id: "marinheiro", emoji: "🧑‍✈️", label: "Marinheiro / Tripulante", desc: "Diário de bordo, check-list e tripulação" },
  { id: "marinharia", emoji: "🧹",   label: "Equipe de Marinharia",    desc: "Ordens de serviço e limpeza de embarcações" },
  { id: "tecnico",    emoji: "🔧",   label: "Técnico de Manutenção",   desc: "OSs, peças e horas trabalhadas" },
  { id: "gestor",     emoji: "👔",   label: "Gestor / Marina",          desc: "Painel completo de gestão" },
];

const ALERT_OPTIONS = [
  { id: "docs",      emoji: "📄", label: "Documentos vencendo" },
  { id: "os",        emoji: "🔧", label: "Novas ordens de serviço" },
  { id: "estoque",   emoji: "📦", label: "Estoque abaixo do mínimo" },
  { id: "checklist", emoji: "✅", label: "Check-list pendente" },
  { id: "assinatura",emoji: "✍️", label: "Aguardando assinatura" },
];

export default function Onboarding({ profile, state, onSave, onBack }) {
  const [step, setStep]       = useState(state?.step ?? 0);
  const [nome, setNome]       = useState(state?.nome ?? "");
  const [empresa, setEmpresa] = useState(state?.empresa ?? "");
  const [perfil, setPerfil]   = useState(state?.perfil ?? null);
  const [embarcacao, setEmb]  = useState(state?.embarcacao ?? { nome: "", tipo: "", registro: "" });
  const [alertas, setAlertas] = useState(state?.alertas ?? ["docs", "os", "estoque"]);
  const [skipEmb, setSkipEmb] = useState(state?.skipEmb ?? false);

  useEffect(() => {
    if (!state) return;
    setStep(state.step ?? 0);
    setNome(state.nome ?? "");
    setEmpresa(state.empresa ?? "");
    setPerfil(state.perfil ?? null);
    setEmb(state.embarcacao ?? { nome: "", tipo: "", registro: "" });
    setAlertas(state.alertas ?? ["docs", "os", "estoque"]);
    setSkipEmb(state.skipEmb ?? false);
  }, [state]);

  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  const toggleAlerta = (id) =>
    setAlertas((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const syncState = (nextState) => {
    if (typeof onSave === "function") {
      onSave({
        ...state,
        ...nextState,
        nome,
        empresa,
        perfil,
        embarcacao,
        alertas,
        skipEmb,
      });
    }
  };

  const canNext = () => {
    if (current.id === "nome") return nome.trim().length > 1;
    if (current.id === "perfil") return perfil !== null;
    if (current.id === "embarcacao") return skipEmb || embarcacao.nome.trim().length > 1;
    return true;
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      syncState({ step: nextStep, completed: nextStep === STEPS.length - 1 });
      return;
    }
    if (step === STEPS.length - 1 && typeof onBack === "function") {
      syncState({ completed: true });
      onBack();
    }
  };

  const back = () => {
    if (step > 0) {
      const prevStep = step - 1;
      setStep(prevStep);
      syncState({ step: prevStep, completed: false });
    } else if (typeof onBack === "function") {
      onBack();
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.sand, fontFamily: "'Inter', sans-serif", maxWidth: 420, margin: "0 auto", display: "flex", flexDirection: "column" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Inter:wght@400;500;600;700&display=swap'); * { box-sizing: border-box; }`}</style>

      {/* Progress bar */}
      {step > 0 && !isLast && (
        <div style={{ background: C.ocean, padding: "16px 20px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <button onClick={back} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer", padding: 0 }}>← Voltar</button>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>{step} de {STEPS.length - 2}</span>
            <button onClick={() => setStep(STEPS.length - 1)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 12, cursor: "pointer", padding: 0 }}>Pular</button>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 4, height: 4, marginBottom: 0 }}>
            <div style={{ width: `${current.progress}%`, background: C.aqua, borderRadius: 4, height: "100%", transition: "width 0.4s" }} />
          </div>
        </div>
      )}

      {/* ── BEM-VINDO ── */}
      {current.id === "bemvindo" && (
        <div style={{ flex: 1, background: C.ocean, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 400, height: 300, background: "radial-gradient(ellipse, rgba(23,168,189,0.12), transparent 65%)", pointerEvents: "none" }} />
          <div style={{ marginBottom: 24 }}><AnchorIcon size={64} color={C.aqua} /></div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 800, color: C.white, marginBottom: 6 }}>
            BORDO<span style={{ color: C.aqua }}>.</span>
          </div>
          <div style={{ fontSize: 12, letterSpacing: 4, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 32 }}>Gestão Náutica</div>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, maxWidth: 280, marginBottom: 48 }}>
            Vamos configurar sua conta em menos de <strong style={{ color: C.white }}>2 minutos</strong>.
          </div>
          <button onClick={next} style={{ background: C.aqua, color: C.white, border: "none", borderRadius: 14, padding: "16px 48px", fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, cursor: "pointer", width: "100%" }}>
            Começar →
          </button>
          <div style={{ marginTop: 14, fontSize: 13, color: "rgba(255,255,255,0.25)" }}>Já tem conta? Entrar</div>
        </div>
      )}

      {/* ── NOME ── */}
      {current.id === "nome" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ background: C.ocean, padding: "24px 20px 32px" }}>
            <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>⚓ BORDO.</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 800, color: C.white, lineHeight: 1.2 }}>
              Como você<br />se chama?
            </div>
          </div>
          <div style={{ flex: 1, padding: "32px 20px" }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: C.gray, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Seu nome</label>
            <input
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Carlos Mendes"
              autoFocus
              style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${nome.length > 1 ? C.aqua : C.lg}`, fontSize: 16, color: C.ocean, background: C.white, marginBottom: 20, outline: "none" }}
            />
            <label style={{ fontSize: 12, fontWeight: 700, color: C.gray, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Empresa / Marina <span style={{ color: C.lg, fontWeight: 400 }}>(opcional)</span></label>
            <input
              value={empresa}
              onChange={e => setEmpresa(e.target.value)}
              placeholder="Ex: Marina São Paulo"
              style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${C.lg}`, fontSize: 16, color: C.ocean, background: C.white, outline: "none" }}
            />
          </div>
          <div style={{ padding: "0 20px 32px" }}>
            <button onClick={next} disabled={!canNext()} style={{ width: "100%", background: canNext() ? C.ocean : C.lg, color: canNext() ? C.white : C.gray, border: "none", borderRadius: 14, padding: "15px 0", fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, cursor: canNext() ? "pointer" : "default", transition: "all 0.2s" }}>
              Continuar →
            </button>
          </div>
        </div>
      )}

      {/* ── PERFIL ── */}
      {current.id === "perfil" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ background: C.ocean, padding: "24px 20px 32px" }}>
            <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>⚓ BORDO.</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 800, color: C.white, lineHeight: 1.2 }}>
              Como você<br />trabalha{nome ? `, ${nome.split(" ")[0]}` : ""}?
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Isso define o que você vê no app.</div>
          </div>
          <div style={{ flex: 1, padding: "20px 20px 0", display: "flex", flexDirection: "column", gap: 10 }}>
            {PERFIS.map(p => (
              <button key={p.id} onClick={() => setPerfil(p.id)} style={{ background: perfil === p.id ? C.ocean : C.white, border: `2px solid ${perfil === p.id ? C.aqua : C.lg}`, borderRadius: 16, padding: "16px 16px", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "all 0.2s" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: perfil === p.id ? "rgba(23,168,189,0.15)" : C.foam, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                  {p.emoji}
                </div>
                <div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: perfil === p.id ? C.white : C.ocean }}>{p.label}</div>
                  <div style={{ fontSize: 12, color: perfil === p.id ? "rgba(255,255,255,0.55)" : C.gray, marginTop: 2 }}>{p.desc}</div>
                </div>
                {perfil === p.id && <div style={{ marginLeft: "auto", color: C.aqua, fontSize: 20 }}>✓</div>}
              </button>
            ))}
          </div>
          <div style={{ padding: "20px 20px 32px" }}>
            <button onClick={next} disabled={!canNext()} style={{ width: "100%", background: canNext() ? C.aqua : C.lg, color: C.white, border: "none", borderRadius: 14, padding: "15px 0", fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, cursor: canNext() ? "pointer" : "default", transition: "all 0.2s" }}>
              Continuar →
            </button>
          </div>
        </div>
      )}

      {/* ── EMBARCAÇÃO ── */}
      {current.id === "embarcacao" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ background: C.ocean, padding: "24px 20px 32px" }}>
            <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>⚓ BORDO.</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 800, color: C.white, lineHeight: 1.2 }}>
              Sua embarcação
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Você pode adicionar mais depois.</div>
          </div>
          <div style={{ flex: 1, padding: "28px 20px 0" }}>
            {!skipEmb ? (
              <>
                <label style={{ fontSize: 12, fontWeight: 700, color: C.gray, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Nome da embarcação *</label>
                <input value={embarcacao.nome} onChange={e => setEmb({ ...embarcacao, nome: e.target.value })} placeholder="Ex: MV Esperança" style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: `1.5px solid ${embarcacao.nome.length > 0 ? C.aqua : C.lg}`, fontSize: 15, color: C.ocean, background: C.white, marginBottom: 16, outline: "none" }} />

                <label style={{ fontSize: 12, fontWeight: 700, color: C.gray, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Tipo <span style={{ color: C.lg, fontWeight: 400 }}>(opcional)</span></label>
                <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  {["Lancha", "Veleiro", "Escuna", "Rebocador", "Balsa", "Outro"].map(t => (
                    <button key={t} onClick={() => setEmb({ ...embarcacao, tipo: t })} style={{ padding: "7px 14px", borderRadius: 20, border: "none", background: embarcacao.tipo === t ? C.aqua : C.foam, color: embarcacao.tipo === t ? C.white : C.wave, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      {t}
                    </button>
                  ))}
                </div>

                <label style={{ fontSize: 12, fontWeight: 700, color: C.gray, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Nº de registro <span style={{ color: C.lg, fontWeight: 400 }}>(opcional)</span></label>
                <input value={embarcacao.registro} onChange={e => setEmb({ ...embarcacao, registro: e.target.value })} placeholder="Ex: SP-034521-B" style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: `1.5px solid ${C.lg}`, fontSize: 15, color: C.ocean, background: C.white, outline: "none", marginBottom: 16 }} />

                <button onClick={() => setSkipEmb(true)} style={{ background: "none", border: "none", color: C.gray, fontSize: 13, cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                  Pular por agora
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "32px 20px" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⛵</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: C.ocean, marginBottom: 6 }}>Tudo bem!</div>
                <div style={{ fontSize: 14, color: C.gray, marginBottom: 20 }}>Você pode cadastrar sua embarcação depois nas configurações.</div>
                <button onClick={() => setSkipEmb(false)} style={{ background: "none", border: "none", color: C.aqua, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Quero cadastrar agora</button>
              </div>
            )}
          </div>
          <div style={{ padding: "20px 20px 32px" }}>
            <button onClick={next} disabled={!canNext()} style={{ width: "100%", background: canNext() ? C.ocean : C.lg, color: canNext() ? C.white : C.gray, border: "none", borderRadius: 14, padding: "15px 0", fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, cursor: canNext() ? "pointer" : "default", transition: "all 0.2s" }}>
              Continuar →
            </button>
          </div>
        </div>
      )}

      {/* ── NOTIFICAÇÕES ── */}
      {current.id === "notificacoes" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ background: C.ocean, padding: "24px 20px 32px" }}>
            <div style={{ fontSize: 11, color: C.aqua, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>⚓ BORDO.</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 800, color: C.white, lineHeight: 1.2 }}>
              Alertas importantes
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Escolha o que você quer ser avisado.</div>
          </div>
          <div style={{ flex: 1, padding: "24px 20px 0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ALERT_OPTIONS.map(a => {
                const on = alertas.includes(a.id);
                return (
                  <div key={a.id} onClick={() => toggleAlerta(a.id)} style={{ background: on ? C.ocean : C.white, border: `2px solid ${on ? C.aqua : C.lg}`, borderRadius: 14, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "all 0.2s" }}>
                    <span style={{ fontSize: 24 }}>{a.emoji}</span>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, color: on ? C.white : C.ocean, flex: 1 }}>{a.label}</span>
                    <div style={{ width: 24, height: 24, borderRadius: 7, border: `2px solid ${on ? C.aqua : C.lg}`, background: on ? C.aqua : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                      {on ? "✓" : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ padding: "20px 20px 32px" }}>
            <button onClick={next} style={{ width: "100%", background: C.aqua, color: C.white, border: "none", borderRadius: 14, padding: "15px 0", fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
              Concluir configuração →
            </button>
          </div>
        </div>
      )}

      {/* ── PRONTO ── */}
      {current.id === "pronto" && (
        <div style={{ flex: 1, background: C.ocean, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(23,168,189,0.15), transparent 60%)", pointerEvents: "none" }} />

          <div style={{ width: 80, height: 80, borderRadius: 24, background: "rgba(39,174,96,0.15)", border: "2px solid rgba(39,174,96,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, marginBottom: 24 }}>
            ✅
          </div>

          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 30, fontWeight: 800, color: C.white, marginBottom: 8 }}>
            Tudo pronto{nome ? `, ${nome.split(" ")[0]}` : ""}!
          </div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 280, marginBottom: 40 }}>
            Sua conta está configurada. Bem-vindo ao BORDO.
          </div>

          {/* Resumo */}
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px", width: "100%", marginBottom: 36, textAlign: "left" }}>
            {[
              { label: "Nome",        value: nome || "—" },
              { label: "Perfil",      value: PERFIS.find(p => p.id === perfil)?.label || "—" },
              { label: "Embarcação",  value: skipEmb ? "A cadastrar" : embarcacao.nome || "—" },
              { label: "Alertas",     value: `${alertas.length} ativo${alertas.length !== 1 ? "s" : ""}` },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.white }}>{item.value}</span>
              </div>
            ))}
          </div>

          <button onClick={next} style={{ width: "100%", background: C.aqua, color: C.white, border: "none", borderRadius: 14, padding: "16px 0", fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
            Entrar no BORDO. →
          </button>
        </div>
      )}
    </div>
  );
}

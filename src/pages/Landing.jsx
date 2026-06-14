import React from "react";
import { C, fonts } from "../styles/theme.js";

const styles = {
  sec: { padding: "96px 24px", maxWidth: 1080, margin: "0 auto" },
  eyebrow: { fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.aqua, marginBottom: 12 },
  lead: { fontSize: 18, lineHeight: 1.6, color: "rgba(255,255,255,0.55)", maxWidth: 540 },
};

export default function Landing({ onStart }) {
  return (
    <div style={{ background: C.ocean, color: C.white, fontFamily: fonts.body, overflowX: "hidden" }}>
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes waveMove {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pulse {
          0%,100%{opacity:1;transform:scale(1)}
          50%{opacity:0.4;transform:scale(0.8)}
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 48px", background: "rgba(10,37,64,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <a href="#" style={{ fontFamily: fonts.display, fontSize: 22, fontWeight: 800, color: C.white, textDecoration: "none", letterSpacing: -0.5 }}>
          BORDO<span style={{ color: C.aqua }}>.</span>
        </a>
        <div style={{ display: "flex", gap: 32, listStyle: "none" }}>
          <a href="#perfis" style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>Para quem</a>
          <a href="#funcionalidades" style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>Funcionalidades</a>
          <a href="#precos" style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>Planos</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onStart(); }} style={{ background: C.aqua, color: C.white, padding: "9px 22px", borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Começar grátis</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: 700, height: 500, background: "radial-gradient(ellipse, rgba(23,168,189,0.13) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: C.aqua, marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.aqua, animation: "pulse 2s ease-in-out infinite", display: "inline-block" }} />
          Gestão Náutica Brasileira
        </div>

        <h1 style={{ fontFamily: fonts.display, fontSize: "clamp(40px, 8vw, 80px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, marginBottom: 24, maxWidth: 800 }}>
          O app que o<br />
          <em style={{ fontStyle: "normal", color: C.aqua }}>trabalhador náutico</em><br />
          sempre precisou.
        </h1>

        <p style={{ fontSize: "clamp(16px, 2.5vw, 20px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 520, margin: "0 auto 48px" }}>
          Diário de bordo, ordens de serviço, escala de tripulação e controle de estoque — tudo num único lugar. Feito pra quem trabalha no mar, não pra quem assiste da marina.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 72 }}>
          <button onClick={onStart} style={{ background: C.aqua, color: C.white, border: "none", borderRadius: 14, padding: "16px 36px", fontFamily: fonts.display, fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
            onMouseOver={e => { e.target.style.background = C.aquaLt; e.target.style.color = C.ocean; e.target.style.transform = "translateY(-2px)" }}
            onMouseOut={e => { e.target.style.background = C.aqua; e.target.style.color = C.white; e.target.style.transform = "none" }}>
            Começar grátis →
          </button>
          <a href="#funcionalidades" style={{ background: "transparent", color: "rgba(255,255,255,0.65)", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: 14, padding: "16px 36px", fontFamily: fonts.display, fontSize: 16, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "inline-block" }}>Ver como funciona</a>
        </div>

        <div style={{ display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap", position: "relative", zIndex: 2 }}>
          {[{ n: "3+", label: "Perfis de usuário", c: C.white }, { n: "100%", label: "Focado no trabalhador", c: C.aqua }, { n: "0", label: "Equivalentes no Brasil", c: C.white }].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: fonts.display, fontSize: 36, fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Ondas */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 220, overflow: "hidden", pointerEvents: "none" }}>
          {[
            "M0 40 Q180 0 360 40 Q540 80 720 40 Q900 0 1080 40 Q1260 80 1440 40 L1440 80 L0 80Z",
            "M0 50 Q180 10 360 50 Q540 90 720 50 Q900 10 1080 50 Q1260 90 1440 50 L1440 80 L0 80Z",
            "M0 30 Q180 70 360 30 Q540 -10 720 30 Q900 70 1080 30 Q1260 -10 1440 30 L1440 80 L0 80Z"
          ].map((d, i) => (
            <svg key={i} className="wave-path" viewBox="0 0 1440 80" fill="none" style={{
              position: "absolute", width: "200%",
              animation: `waveMove ${[8, 12, 16][i]}s linear infinite`,
              animationDirection: i === 1 ? "reverse" : "normal",
              opacity: [1, 0.4, 0.2][i],
              bottom: [0, 10, 20][i]
            }}>
              <path d={d} fill={`rgba(23,168,189,${[0.07, 0.05, 0.04][i]})`} />
            </svg>
          ))}
        </div>
      </section>

      {/* PERFIS */}
      <section id="perfis" style={styles.sec}>
        <div style={styles.eyebrow}>Para quem é o BORDO.</div>
        <h2 style={{ fontFamily: fonts.display, fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: -1, marginBottom: 16 }}>
          Cada trabalhador<br />tem o seu app.
        </h2>
        <p style={styles.lead}>Três perfis, três experiências. Cada um vê só o que precisa, sem poluição visual.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 56 }}>
          {[
            { emoji: "🧑‍✈️", title: "Marinheiro & Tripulante", desc: "Para capitães, marinheiros de máquinas, contramestres e qualquer membro de tripulação.", items: ["Diário de bordo digital com assinatura", "Check-list de segurança antes de zarpar", "Controle de documentos da tripulação", "Escala e alertas de vencimento", "Gestão de estoque de bordo"] },
            { emoji: "🧹", title: "Equipe de Marinharia", desc: "Para profissionais de limpeza, polimento, conservação e cuidado de embarcações.", items: ["Ordens de serviço com check-list", "Registro de fotos antes/depois", "Relatório automático para o cliente", "Controle de serviços concluídos", "Assinatura digital do cliente"], border: "rgba(142,68,173,0.3)" },
            { emoji: "🔧", title: "Técnico de Manutenção", desc: "Para mecânicos navais, eletricistas de bordo e especialistas em manutenção náutica.", items: ["Ordens de serviço com peças usadas", "Controle de horas trabalhadas", "Histórico por embarcação", "Alertas de peças em falta", "Relatório técnico exportável"], border: "rgba(243,156,18,0.3)" },
          ].map(p => (
            <div key={p.title} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${p.border || "rgba(255,255,255,0.08)"}`, borderRadius: 20, padding: "28px 24px", transition: "border-color 0.25s, transform 0.2s" }}>
              <span style={{ fontSize: 36, marginBottom: 16, display: "block" }}>{p.emoji}</span>
              <h3 style={{ fontFamily: fonts.display, fontSize: 19, fontWeight: 700, marginBottom: 8 }}>{p.title}</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 20 }}>{p.desc}</p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
                {p.items.map(item => (
                  <li key={item} style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.aqua, flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <div style={{ background: C.sand, color: C.ocean, padding: "96px 24px" }} id="funcionalidades">
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ ...styles.eyebrow, color: C.aqua }}>Funcionalidades</div>
          <h2 style={{ fontFamily: fonts.display, fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: -1, marginBottom: 16, color: C.ocean }}>
            Tudo que acontece<br />a bordo, registrado.
          </h2>
          <p style={{ ...styles.lead, color: C.gray, maxWidth: 540 }}>Do diário de bordo às ordens de serviço — cada detalhe documentado, acessível e seguro.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 56 }}>
            {[
              { title: "📋 Diário de Bordo Digital", desc: "Registre saídas, chegadas, ocorrências e manutenções em tempo real. Com assinatura digital do responsável e histórico completo sempre disponível.", chips: ["Assinatura digital", "Exporta PDF", "Funciona offline"], mock: { header: "⚓ BORDO.", title: "Diário de Bordo", rows: [{ dot: C.aqua, label: "Saída — Porto de Santos", badge: "08:00", bc: C.aqua }, { dot: C.rust, label: "Ocorrência — Gerador", badge: "14:30", bc: C.rust }, { dot: C.gold, label: "Manutenção — Óleo motor", badge: "⏳", bc: C.gold }] } },
              { title: "🔧 Ordens de Serviço", desc: "Crie, acompanhe e finalize ordens de serviço com check-list de tarefas, registro de fotos e relatório automático para o cliente — tudo no celular.", chips: ["Check-list de tarefas", "Fotos antes/depois", "Relatório automático"], reverse: true, mock: { header: "🔧 ORDENS DE SERVIÇO", title: "OS-2026-041 · Lancha Brisa Mar", progress: { pct: 50, color: C.gold }, rows: [{ dot: C.green, label: "Lavar casco", badge: "✓" }, { dot: "rgba(255,255,255,0.2)", label: "Limpar cabine interna", badge: "—" }] } },
              { title: "👥 Tripulação & Documentos", desc: "Controle os documentos de cada tripulante — habilitação náutica, certificados e muito mais. Alertas automáticos quando algo está prestes a vencer.", chips: ["Alertas de vencimento", "Histórico por membro", "Exporta relatório"], mock: { header: "👥 TRIPULAÇÃO", title: "MV Esperança · 4 membros", rows: [{ dot: C.green, label: "Carlos Mendes — Capitão", badge: "OK", bc: C.green }, { dot: C.rust, label: "João Ferreira — Contramestre", badge: "Vencido", bc: C.rust }, { dot: C.gold, label: "Ana Costa — Cozinheira", badge: "12 dias", bc: C.gold }] } }
            ].map((f, i) => (
              <div key={f.title} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "center", direction: f.reverse ? "rtl" : "ltr" }}>
                <div style={{ padding: "8px 0", direction: "ltr" }}>
                  <h3 style={{ fontFamily: fonts.display, fontSize: 24, fontWeight: 700, color: C.ocean, marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ fontSize: 15, color: C.gray, lineHeight: 1.65, marginBottom: 16 }}>{f.desc}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {f.chips.map(c => <span key={c} style={{ background: C.foam, color: C.wave, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>{c}</span>)}
                  </div>
                </div>
                <div style={{ background: C.ocean, borderRadius: 20, padding: 20, minHeight: 200, display: "flex", flexDirection: "column", gap: 10, position: "relative", overflow: "hidden", direction: "ltr" }}>
                  <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(23,168,189,0.15), transparent 70%)" }} />
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.aqua, marginBottom: 4 }}>{f.mock.header}</div>
                  <div style={{ fontFamily: fonts.display, fontSize: 16, fontWeight: 700, color: C.white, marginBottom: 12 }}>{f.mock.title}</div>
                  {f.mock.progress && (
                    <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "8px 10px", marginBottom: 6 }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Progresso das tarefas</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 4, height: 5, flex: 1 }}>
                          <div style={{ width: `${f.mock.progress.pct}%`, height: "100%", borderRadius: 4, background: f.mock.progress.color }} />
                        </div>
                        <span style={{ fontSize: 12, color: f.mock.progress.color, fontWeight: 700 }}>{f.mock.progress.pct}%</span>
                      </div>
                    </div>
                  )}
                  {f.mock.rows.map(r => (
                    <div key={r.label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: r.dot, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", flex: 1 }}>{r.label}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5, background: r.bc ? `${r.bc}33` : "rgba(255,255,255,0.1)", color: r.bc || "rgba(255,255,255,0.5)" }}>{r.badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DEPOIMENTOS */}
      <section style={styles.sec}>
        <div style={styles.eyebrow}>Quem usa, aprova</div>
        <h2 style={{ fontFamily: fonts.display, fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: -1, marginBottom: 16 }}>
          A voz de quem<br />está no mar todo dia.
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 56 }}>
          {[
            { quote: '"Antes eu anotava tudo num caderno que molhava, sumia, rasgava. Agora tá tudo no celular e consigo gerar o relatório na hora."', emoji: "🧑‍✈️", name: "Marcos Oliveira", role: "Capitão de Cabotagem · Santos, SP", bg: "rgba(23,168,189,0.15)" },
            { quote: '"A OS com foto antes e depois mudou tudo. O cliente vê o serviço, confia mais, paga na hora. Simples assim."', emoji: "🧹", name: "Fernanda Rocha", role: "Equipe de Marinharia · Angra dos Reis, RJ", bg: "rgba(142,68,173,0.15)" },
            { quote: '"O alerta de peças em falta me salvou numa viagem. Sem o BORDO. eu não teria percebido antes de zarpar."', emoji: "🔧", name: "Ricardo Nunes", role: "Mecânico Naval · Florianópolis, SC", bg: "rgba(243,156,18,0.15)" }
          ].map(t => (
            <div key={t.name} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 24 }}>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: "rgba(255,255,255,0.75)", marginBottom: 20, fontStyle: "italic" }}>{t.quote}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{t.emoji}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.white }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PREÇOS */}
      <section id="precos" style={styles.sec}>
        <div style={styles.eyebrow}>Planos</div>
        <h2 style={{ fontFamily: fonts.display, fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: -1, marginBottom: 16 }}>
          Simples de entender,<br />justo de pagar.
        </h2>
        <p style={styles.lead}>Sem taxa de adesão. Cancele quando quiser. Começa grátis.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginTop: 56, alignItems: "start" }}>
          {[
            { name: "Grátis", price: "0", period: "para sempre", desc: "Para quem quer experimentar antes de decidir.", items: ["1 perfil de usuário", "Diário de bordo (30 registros)", "Check-list de segurança", "3 Ordens de Serviço/mês"], featured: false, btnText: "Começar grátis" },
            { name: "Profissional", price: "49", period: "por usuário / mês", desc: "Para profissionais que trabalham no mar todo dia.", items: ["Tudo do plano Grátis", "Diário de bordo ilimitado", "Ordens de serviço ilimitadas", "Fotos e relatório em PDF", "Controle de tripulação completo", "Funciona offline"], featured: true, btnText: "Assinar agora", badge: "Mais popular" },
            { name: "Marina / Empresa", price: "199", period: "até 10 usuários / mês", desc: "Para marinas, estaleiros e equipes maiores.", items: ["Tudo do Profissional", "Até 10 usuários", "Painel de gestão da marina", "Relatórios consolidados", "Suporte prioritário", "Onboarding com a equipe"], featured: false, btnText: "Falar com vendas" }
          ].map(p => (
            <div key={p.name} style={{
              borderRadius: 20, padding: "28px 24px", position: "relative",
              border: `1.5px solid ${p.featured ? C.aqua : "rgba(255,255,255,0.1)"}`,
              background: p.featured ? C.aqua : "rgba(255,255,255,0.03)",
              transform: p.featured ? "scale(1.03)" : "none"
            }}>
              {p.badge && (
                <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: C.ocean, color: C.aqua, fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", padding: "4px 14px", borderRadius: "0 0 10px 10px" }}>
                  {p.badge}
                </div>
              )}
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: p.featured ? C.white : "rgba(255,255,255,0.5)", marginBottom: 12 }}>{p.name}</div>
              <div style={{ fontFamily: fonts.display, fontSize: 42, fontWeight: 800, color: p.featured ? C.white : C.white, lineHeight: 1, marginBottom: 4 }}>
                {p.price !== "0" && <sup style={{ fontSize: 18, verticalAlign: "top", marginTop: 8, display: "inline-block" }}>R$</sup>}
                {p.price === "0" ? "R$ 0" : p.price}
              </div>
              <div style={{ fontSize: 13, color: p.featured ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)", marginBottom: 20 }}>{p.period}</div>
              <div style={{ fontSize: 14, color: p.featured ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.6)", marginBottom: 20, lineHeight: 1.5 }}>{p.desc}</div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9, marginBottom: 24 }}>
                {p.items.map(item => (
                  <li key={item} style={{ fontSize: 13, color: p.featured ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: p.featured ? C.white : C.aqua, fontWeight: 800 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
              <button onClick={p.featured ? onStart : undefined} style={{
                width: "100%", padding: "13px 0", borderRadius: 12, fontFamily: fonts.display, fontSize: 15, fontWeight: 700, cursor: "pointer",
                background: p.featured ? C.ocean : "transparent",
                color: p.featured ? C.white : "rgba(255,255,255,0.7)",
                border: p.featured ? "none" : "1.5px solid rgba(255,255,255,0.2)"
              }}>
                {p.btnText}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: "100px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(23,168,189,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />
        <h2 style={{ fontFamily: fonts.display, fontSize: "clamp(32px, 6vw, 60px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 16 }}>
          Do cais ao convés.<br /><span style={{ color: C.aqua }}>Tudo a bordo.</span>
        </h2>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.45)", marginBottom: 40, maxWidth: 400, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
          Comece grátis hoje. Sem cartão de crédito, sem burocracia.
        </p>
        <button onClick={onStart} style={{ background: C.aqua, color: C.white, border: "none", borderRadius: 14, padding: "18px 48px", fontFamily: fonts.display, fontSize: 18, fontWeight: 700, cursor: "pointer" }}>
          Criar conta gratuita →
        </button>
        <div style={{ marginTop: 20, fontSize: 13, color: "rgba(255,255,255,0.25)" }}>Disponível para Android e iOS · Funciona offline</div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "48px 48px 32px", display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 800, color: C.white }}>BORDO<span style={{ color: C.aqua }}>.</span></div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 8, maxWidth: 220, lineHeight: 1.5 }}>Gestão náutica feita para quem trabalha no mar, não para quem assiste da marina.</p>
        </div>
        {[
          { title: "Produto", links: ["Funcionalidades", "Planos e preços", "Para marinas", "Baixar o app"] },
          { title: "Empresa", links: ["Sobre nós", "Blog", "Contato", "Suporte"] }
        ].map(col => (
          <div key={col.title}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 12 }}>{col.title}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {col.links.map(l => <a key={l} href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>{l}</a>)}
            </div>
          </div>
        ))}
        <div style={{ width: "100%", fontSize: 12, color: "rgba(255,255,255,0.2)", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24, marginTop: 8, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span>© 2026 BORDO. Todos os direitos reservados.</span>
          <span>Privacidade · Termos de uso</span>
        </div>
      </footer>
    </div>
  );
}

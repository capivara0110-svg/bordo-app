import React from "react";
import { useEffect, useState } from "react";
import Onboarding from "./bordo_onboarding.jsx";
import GestorMarina from "./bordo_gestor.jsx";
import Notificacoes from "./bordo_notificacoes.jsx";

const C = {
  ocean: "#0A2540",
  wave: "#1B4F72",
  aqua: "#17A8BD",
  aquaLt: "#5ECFDE",
  foam: "#E4F4F8",
  sand: "#F7F3EC",
  rust: "#C0392B",
  gold: "#F39C12",
  green: "#27AE60",
  gray: "#6B7B8D",
  lg: "#D5DDE5",
  white: "#FFFFFF",
};

const PROFILES = [
  {
    id: "marinheiro",
    emoji: "🧑‍✈️",
    label: "Marinheiro / Tripulante",
    desc: "Diário de bordo, check-list de saída, escala e documentos da tripulação.",
    color: C.aqua,
    accent: C.foam,
    tabs: [
      { id: "diario", icon: "📘", label: "Diário" },
      { id: "checklist", icon: "✅", label: "Check-list" },
      { id: "tripulacao", icon: "👥", label: "Tripulação" },
      { id: "estoque", icon: "📦", label: "Estoque" },
    ],
    user: { name: "Carlos Mendes", role: "Capitão", vessel: "MV Esperança" },
    home: {
      greeting: "Bom dia, Carlos.",
      sub: "MV Esperança é Porto de Santos",
      cards: [
        { icon: "📝", label: "Diário de Bordo", value: "2 registros hoje", color: C.aqua, alert: false },
        { icon: "✅", label: "Check-list", value: "6/9 concluídos", color: C.gold, alert: true },
        { icon: "👥", label: "Tripulação", value: "1 doc. vencido", color: C.rust, alert: true },
        { icon: "📦", label: "Estoque", value: "Tudo OK", color: C.green, alert: false },
      ],
      alert: { icon: "⚠️", msg: "Habilitação de João Ferreira vence em 12 dias.", color: C.gold },
    },
  },
  {
    id: "marinharia",
    emoji: "🧹",
    label: "Equipe de Marinharia",
    desc: "Ordens de serviço, check-list de limpeza, fotos e relatório para o cliente.",
    color: "#8e44ad",
    accent: "#F5EEF8",
    tabs: [
      { id: "ordens", icon: "🔧", label: "Minhas OS" },
      { id: "checklist", icon: "✅", label: "Check-list" },
      { id: "fotos", icon: "📸", label: "Fotos" },
      { id: "relatorio", icon: "📄", label: "Relatório" },
    ],
    user: { name: "Rafael Silva", role: "Técnico de Marinharia", vessel: "Marina São Paulo" },
    home: {
      greeting: "E aí, Rafael.",
      sub: "Marina São Paulo tem 3 OSs hoje",
      cards: [
        { icon: "⚙️", label: "Em andamento", value: "1 OS aberta", color: C.gold, alert: false },
        { icon: "🕒", label: "Aguardando", value: "2 OSs novas", color: C.aqua, alert: true },
        { icon: "🏁", label: "Concluídas", value: "5 esta semana", color: C.green, alert: false },
        { icon: "📸", label: "Fotos", value: "8 registradas", color: "#8e44ad", alert: false },
      ],
      alert: { icon: "🚨", msg: "OS-2026-039 está marcada como URGENTE. Começar agora.", color: C.rust },
    },
  },
  {
    id: "tecnico",
    emoji: "🔧",
    label: "Técnico de Manutenção",
    desc: "Ordens de serviço, controle de peças e horas trabalhadas por embarcação.",
    color: C.gold,
    accent: "#FEF9EE",
    tabs: [
      { id: "ordens", icon: "🔧", label: "Ordens" },
      { id: "pecas", icon: "📦", label: "Peças" },
      { id: "horas", icon: "⏱️", label: "Horas" },
      { id: "historico", icon: "📜", label: "Histórico" },
    ],
    user: { name: "Ana Costa", role: "Mecânica Naval", vessel: "Estaleiro Litoral" },
    home: {
      greeting: "Boa tarde, Ana.",
      sub: "Estaleiro Litoral é Segunda-feira",
      cards: [
        { icon: "🛠️", label: "OSs do dia", value: "3 ordens", color: C.gold, alert: false },
        { icon: "⚠️", label: "Peças em falta", value: "2 itens", color: C.rust, alert: true },
        { icon: "⏱️", label: "Horas hoje", value: "4h 30min", color: C.aqua, alert: false },
        { icon: "📈", label: "Histórico", value: "12 este mês", color: C.green, alert: false },
      ],
      alert: { icon: "🛢️", msg: "Filtro de óleo em falta. Solicitar reposição antes de amanhã.", color: C.gold },
    },
  },
  {
    id: "gestor",
    emoji: "👔",
    label: "Gestor / Marina",
    desc: "Painel completo de gestão, relatórios e controle de berços.",
    color: C.wave,
    accent: "#E8F1FC",
    tabs: [
      { id: "dashboard", icon: "📊", label: "Painel" },
      { id: "equipe", icon: "👥", label: "Equipe" },
      { id: "ordens", icon: "🔧", label: "Ordens" },
      { id: "bercos", icon: "⚓", label: "Berços" },
      { id: "relatorio", icon: "📄", label: "Relatórios" },
    ],
    user: { name: "Marina Central", role: "Gestor de Marina", vessel: "Base Náutica" },
    home: {
      greeting: "Bom dia, Gestor.",
      sub: "Sua marina está em operação.",
      cards: [
        { icon: "📊", label: "Receita diária", value: "R$ 28.400", color: C.wave, alert: false },
        { icon: "⚓", label: "Berços ocupados", value: "6 de 8", color: C.aqua, alert: false },
        { icon: "🔔", label: "Alertas ativos", value: "3 itens", color: C.rust, alert: true },
        { icon: "👥", label: "Equipe ativa", value: "12 membros", color: C.green, alert: false },
      ],
      alert: { icon: "🚨", msg: "Monitoramento em tempo real ativo.", color: C.aqua },
    },
  },
];

const initialState = {
  screen: "splash",
  loggedIn: false,
  profileId: null,
  user: { id: null, email: "", alias: "", profileType: null },
  lastScreen: "splash",
  onboarding: {
    id: null,
    step: 0,
    nome: "",
    empresa: "",
    perfil: null,
    embarcacao: { nome: "", tipo: "", registro: "" },
    alertas: ["docs", "os", "estoque"],
    skipEmb: false,
    completed: false,
  },
  gestor: { id: null, activeTab: "dashboard" },
  notificacoes: { filter: "todas", tab: "todas", items: null },
};

const API_BASE = (() => {
  if (typeof window === "undefined") return "http://localhost:4000";
  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:4000";
  }
  return window.location.origin;
})();

async function apiJSON(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`${response.status}: ${text}`);
    }
    return response.status === 204 ? null : await response.json();
  } catch (error) {
    console.error("API request failed", path, error);
    return null;
  }
}

async function findUserByEmail(email) {
  const users = await apiJSON(`/api/users?email=${encodeURIComponent(email)}`);
  return Array.isArray(users) && users.length > 0 ? users[0] : null;
}

async function createUserRecord(data) {
  return apiJSON("/api/users", { method: "POST", body: JSON.stringify(data) });
}

async function updateUserRecord(id, data) {
  return apiJSON(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

async function fetchUserDetails(id) {
  return apiJSON(`/api/users/${id}`);
}

async function saveOnboardingRecord(userId, data) {
  const payload = {
    userId,
    step: data.step,
    empresa: data.empresa,
    perfil: data.perfil,
    embarcacaoNome: data.embarcacao?.nome,
    embarcacaoTipo: data.embarcacao?.tipo,
    embarcacaoRegistro: data.embarcacao?.registro,
    alertas: data.alertas,
    skipEmb: data.skipEmb,
    completed: data.completed,
  };
  if (data.id) {
    return apiJSON(`/api/onboarding/${data.id}`, { method: "PUT", body: JSON.stringify(payload) });
  }
  return apiJSON("/api/onboarding", { method: "POST", body: JSON.stringify(payload) });
}

async function saveGestorStateRecord(userId, data) {
  const payload = { userId, activeTab: data.activeTab };
  if (data.id) {
    return apiJSON(`/api/gestor/${data.id}`, { method: "PUT", body: JSON.stringify(payload) });
  }
  return apiJSON("/api/gestor", { method: "POST", body: JSON.stringify(payload) });
}

async function fetchNotifications(userId) {
  return apiJSON(`/api/notifications/user/${userId}`) || [];
}

async function updateNotificationRecord(id, data) {
  return apiJSON(`/api/notifications/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

async function deleteNotificationRecord(id) {
  try {
    const response = await fetch(`${API_BASE}/api/notifications/${id}`, { method: "DELETE" });
    return response.ok;
  } catch (error) {
    console.error("Delete notification failed", id, error);
    return false;
  }
}

const MENU_ITEMS = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "onboarding", icon: "🧭", label: "Onboarding" },
  { id: "gestor", icon: "📊", label: "Gestor" },
  { id: "notificacoes", icon: "🔔", label: "Notificações" },
  { id: "profile", icon: "👤", label: "Perfil" },
];

function AnchorIcon({ size = 32, color = C.aqua }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <line x1="32" y1="14" x2="32" y2="52" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="18" y1="52" x2="46" y2="52" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <path d="M18 52 Q10 43 15 34" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M46 52 Q54 43 49 34" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="32" cy="17" r="4.5" fill="none" stroke={color} strokeWidth="3" />
      <line x1="22" y1="25" x2="42" y2="25" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function ScreenTransition({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`transition-all duration-500 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      {children}
    </div>
  );
}

function SideNav({ current, onNavigate }) {
  return (
    <div className="fixed right-4 top-1/4 z-50 flex flex-col items-center gap-3 rounded-3xl border border-slate-200/80 bg-white/95 p-2 shadow-2xl shadow-slate-900/10 backdrop-blur-xl transition duration-300 ease-out hover:shadow-slate-900/20">
      <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
        <span className="text-2xl">⚓</span>
      </div>
      {MENU_ITEMS.map((item) => {
        const active = current === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`group flex h-14 w-14 flex-col items-center justify-center rounded-3xl transition duration-300 ease-out ${active ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "bg-white text-slate-700 hover:bg-slate-100"}`}
            aria-label={item.label}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.2em] opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:block">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ShellLayout({ current, onNavigate, selectedProfile, children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SideNav current={current} onNavigate={onNavigate} />
      <div className="relative min-h-screen pr-24">
        <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl shadow-sm shadow-slate-900/5">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
                <AnchorIcon size={28} color={C.white} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">BORDO</p>
                <h1 className="text-2xl font-semibold text-slate-900">Central de navegação</h1>
                <p className="mt-1 text-sm text-slate-500">Acesso rápido e fluido para toda sua operação.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {MENU_ITEMS.slice(0, 4).map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`inline-flex items-center gap-2 rounded-3xl border px-4 py-2 text-sm font-semibold transition duration-300 ease-out ${current === item.id ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"}`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
              <div className="rounded-3xl bg-slate-900 px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-lg shadow-slate-900/10">
                {selectedProfile ? selectedProfile.label : "Sem perfil"}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[40px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_28px_80px_-35px_rgba(15,23,42,0.18)] transition duration-500 ease-out">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function ProfileScreen({ profile, user, onSave, onBack }) {
  const [email, setEmail] = useState(user.email || "");
  const [alias, setAlias] = useState(user.alias || profile.user.name || "");

  useEffect(() => {
    setEmail(user.email || "");
    setAlias(user.alias || profile.user.name || "");
  }, [user.email, user.alias, profile.user.name]);

  const handleSave = () => onSave({ email, alias });

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white/95 p-6 shadow-[0_28px_80px_-35px_rgba(15,23,42,0.25)]">
      <div className="flex items-center gap-4 pb-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 text-2xl text-white">{profile.emoji}</div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Perfil</p>
          <h2 className="text-2xl font-semibold text-slate-900">{profile.user.name}</h2>
          <p className="text-sm text-slate-500">{profile.user.role} · {profile.user.vessel}</p>
        </div>
      </div>
      <div className="grid gap-6 pt-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-600">
          E-mail
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            placeholder="seu@email.com"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-600">
          Nome de Exibição
          <input
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            placeholder="Apelido exibido no app"
          />
        </label>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button onClick={handleSave} className="inline-flex items-center justify-center rounded-3xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          Salvar perfil
        </button>
        <button onClick={onBack} className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
          Voltar
        </button>
      </div>
    </div>
  );
}

function SplashScreen({ onNext }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen place-items-center px-4 py-10">
        <div className="w-full max-w-sm rounded-[40px] border border-white/10 bg-slate-900/80 p-8 shadow-[0_32px_120px_-30px_rgba(15,23,42,0.8)] backdrop-blur-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-500 text-4xl shadow-lg shadow-cyan-500/20">⚓</div>
            <h1 className="text-4xl font-semibold tracking-tight">BORDO.</h1>
            <p className="mt-3 text-sm uppercase tracking-[0.36em] text-cyan-300">Gestão Náutica</p>
            <p className="mt-5 text-sm leading-6 text-slate-300">Do cais ao convés. Tudo a bordo.</p>
          </div>
          <button onClick={onNext} className="w-full rounded-3xl bg-cyan-500 px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-400">
            Entrar
          </button>
          <button className="mt-4 w-full rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white transition hover:bg-white/10">
            Criar conta
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ email, password, onEmailChange, onPasswordChange, onSubmit, onBack, error }) {
  const validEmail = email.includes("@") && email.includes(".");
  const canSubmit = validEmail && password.length >= 4;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen place-items-center px-4 py-10">
        <div className="w-full max-w-md rounded-[40px] border border-white/10 bg-slate-900/95 p-8 shadow-[0_32px_120px_-30px_rgba(15,23,42,0.8)] backdrop-blur-xl">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500 text-lg">⚓</div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">BORDO.</p>
              <h2 className="text-2xl font-semibold">Bem-vindo de volta</h2>
              <p className="text-sm text-slate-400">Entre na sua conta para continuar.</p>
            </div>
          </div>
          <div className="space-y-5">
            <label className="block text-sm font-medium text-slate-300">E-mail</label>
            <input
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="seu@email.com"
              className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            />
            <label className="block text-sm font-medium text-slate-300">Senha</label>
            <input
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            />
            {error && <div className="rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-500">{error}</div>}
            <button onClick={onSubmit} disabled={!canSubmit} className={`w-full rounded-3xl px-4 py-3 text-sm font-semibold uppercase transition ${canSubmit ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400" : "bg-slate-700 text-slate-400 cursor-not-allowed"}`}>
              Entrar
            </button>
          </div>
          <div className="mt-8 flex items-center justify-between text-sm text-slate-400">
            <button onClick={onBack} className="hover:text-white">Voltar</button>
            <button className="hover:text-white">Esqueci a senha</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfilePicker({ profiles, onSelect, onBack }) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-md space-y-6">
        <div className="rounded-[40px] bg-white p-8 shadow-[0_32px_120px_-30px_rgba(15,23,42,0.12)]">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">BORDO.</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">Como você trabalha?</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">Cada perfil mostra só o que você precisa.</p>
        </div>
        <div className="space-y-4">
          {profiles.map((profile) => (
            <button key={profile.id} onClick={() => onSelect(profile.id)} className="w-full rounded-[32px] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl" style={{ background: profile.accent, border: `2px solid ${profile.color}` }}>
                  <span className="text-2xl">{profile.emoji}</span>
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-900">{profile.label}</div>
                  <p className="text-sm text-slate-500">{profile.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        <button onClick={onBack} className="w-full rounded-[32px] border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          Voltar ao login
        </button>
      </div>
    </div>
  );
}

function HomeScreen({ profile, onboardingState, notificacoesState, onNavigate, onLogout }) {
  const hasUnread = (notificacoesState.items || []).filter((n) => !n.read).length;
  const onboardingText = onboardingState.completed ? "Configuração concluída" : "Configuração pendente";

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 p-6 shadow-[0_28px_80px_-35px_rgba(15,23,42,0.15)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Olá, {profile.user.name.split(" ")[0]}</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">Bem-vindo ao seu painel</h2>
            <p className="mt-2 text-sm text-slate-500">{profile.home.sub}</p>
          </div>
          <button onClick={onLogout} className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Sair
          </button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Onboarding</p>
          <p className="mt-3 text-xl font-semibold text-slate-900">{onboardingText}</p>
          <p className="mt-2 text-sm text-slate-500">Finalize o setup inicial para aproveitar todas as funcionalidades.</p>
        </div>
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Notificações</p>
          <p className="mt-3 text-xl font-semibold text-slate-900">{hasUnread} não lida{hasUnread === 1 ? "" : "s"}</p>
          <p className="mt-2 text-sm text-slate-500">Acompanhe alertas, ordens urgentes e documentos críticos.</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <button onClick={() => onNavigate("onboarding")} className="rounded-[32px] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-slate-300">
          <div className="text-3xl">🧭</div>
          <p className="mt-4 text-lg font-semibold text-slate-900">Onboarding</p>
          <p className="mt-2 text-sm text-slate-500">Complete as configurações iniciais.</p>
        </button>
        <button onClick={() => onNavigate("gestor")} className="rounded-[32px] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-slate-300">
          <div className="text-3xl">📊</div>
          <p className="mt-4 text-lg font-semibold text-slate-900">Gestor</p>
          <p className="mt-2 text-sm text-slate-500">Painel administrativo e métricas.</p>
        </button>
        <button onClick={() => onNavigate("notificacoes")} className="rounded-[32px] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-slate-300">
          <div className="text-3xl">🔔</div>
          <p className="mt-4 text-lg font-semibold text-slate-900">Notificações</p>
          <p className="mt-2 text-sm text-slate-500">Veja os avisos ativos e recentes.</p>
        </button>
        <button onClick={() => onNavigate("profile")} className="rounded-[32px] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-slate-300">
          <div className="text-3xl">👤</div>
          <p className="mt-4 text-lg font-semibold text-slate-900">Perfil</p>
          <p className="mt-2 text-sm text-slate-500">Ajuste seus dados e preferências.</p>
        </button>
      </div>
    </div>
  );
}

export default function BordoApp() {
  const [appState, setAppState] = useState(() => loadAppState());
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  const isMobileDevice = () =>
    typeof navigator !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  useEffect(() => {
    if (!document.getElementById("tailwindcss-cdn")) {
      const configScript = document.createElement("script");
      configScript.text = "tailwind.config = { theme: { extend: { boxShadow: { soft: '0 25px 60px rgba(15,23,42,0.12)' }, colors: { slate: { 950: '#020617' } } } } };";
      document.head.appendChild(configScript);
      const script = document.createElement("script");
      script.id = "tailwindcss-cdn";
      script.src = "https://cdn.tailwindcss.com";
      script.async = true;
      document.head.appendChild(script);
    }

    if (
      typeof window !== "undefined" &&
      isMobileDevice() &&
      "serviceWorker" in navigator &&
      (window.location.protocol === "https:" || window.location.hostname === "localhost")
    ) {
      navigator.serviceWorker.register("/sw.js").then((registration) => {
        console.log("Service worker registered:", registration.scope);
      }).catch((error) => {
        console.warn("Service worker registration failed:", error);
      });
    }
  }, []);

  useEffect(() => {
    if (!appState.loggedIn && ["home", "pick", "onboarding", "gestor", "notificacoes", "profile"].includes(appState.screen)) {
      setAppState((prev) => ({ ...prev, screen: "login" }));
    }
    if (appState.loggedIn && !appState.profileId && appState.screen === "home") {
      setAppState((prev) => ({ ...prev, screen: "pick" }));
    }
  }, [appState.loggedIn, appState.profileId, appState.screen]);

  const selectedProfile = PROFILES.find((profile) => profile.id === appState.profileId) || null;

  const handleScreenChange = (screen) => {
    setAppState((prev) => ({ ...prev, screen, lastScreen: screen }));
  };

  const handleEmailChange = (email) => {
    setAppState((prev) => ({ ...prev, user: { ...prev.user, email } }));
  };

  const handleLogin = async () => {
    const email = appState.user.email.trim().toLowerCase();
    if (!email || !email.includes("@") || loginPass.length < 4) {
      setLoginError("Use um e-mail válido e senha com ao menos 4 caracteres.");
      return;
    }

    setLoginError("");
    const alias = appState.user.alias || email.split("@")[0];
    let user = await findUserByEmail(email);

    if (!user) {
      user = await createUserRecord({ email, alias, password: loginPass });
      if (!user) {
        setLoginError("Não foi possível criar o usuário no servidor.");
        return;
      }
    }

    const profileId = user.profileType ? user.profileType.toLowerCase() : null;
    const nextScreen = profileId ? "home" : "pick";

    setLoginPass("");
    setAppState((prev) => ({
      ...prev,
      loggedIn: true,
      screen: nextScreen,
      lastScreen: nextScreen,
      profileId,
      user: {
        ...prev.user,
        id: user.id,
        email: user.email,
        alias: user.alias || alias,
        profileType: user.profileType ? user.profileType.toLowerCase() : null,
      },
    }));
  };

  const handleSelectProfile = async (profileId) => {
    if (!appState.user.id) {
      setLoginError("Usuário não autenticado. Faça login novamente.");
      return;
    }

    const profileType = profileId.toUpperCase();
    const updatedUser = await updateUserRecord(appState.user.id, { profileType, alias: appState.user.alias });
    if (!updatedUser) {
      setLoginError("Não foi possível atualizar seu perfil no servidor.");
      return;
    }

    setAppState((prev) => ({
      ...prev,
      profileId,
      screen: "home",
      lastScreen: "home",
      user: {
        ...prev.user,
        profileType: profileType.toLowerCase(),
        alias: updatedUser.alias || prev.user.alias,
      },
    }));

    if (!appState.gestor.id) {
      const gestor = await saveGestorStateRecord(appState.user.id, { activeTab: appState.gestor.activeTab });
      if (gestor?.id) {
        setAppState((prev) => ({ ...prev, gestor: { ...prev.gestor, id: gestor.id, activeTab: gestor.activeTab } }));
      }
    }
  };

  useEffect(() => {
    if (!appState.user.id) return;
    let cancelled = false;

    const loadUserData = async () => {
      const user = await fetchUserDetails(appState.user.id);
      if (cancelled || !user) return;

      const profileId = user.profileType ? user.profileType.toLowerCase() : appState.profileId;
      const onboarding = user.onboarding
        ? {
            id: user.onboarding.id,
            step: user.onboarding.step,
            nome: user.onboarding.nome || "",
            empresa: user.onboarding.empresa || "",
            perfil: user.onboarding.perfil || null,
            embarcacao: {
              nome: user.onboarding.embarcacaoNome || "",
              tipo: user.onboarding.embarcacaoTipo || "",
              registro: user.onboarding.embarcacaoRegistro || "",
            },
            alertas: user.onboarding.alertas || ["docs", "os", "estoque"],
            skipEmb: user.onboarding.skipEmb || false,
            completed: user.onboarding.completed || false,
          }
        : appState.onboarding;

      const gestor = user.gestorState
        ? { id: user.gestorState.id, activeTab: user.gestorState.activeTab || "dashboard" }
        : appState.gestor;

      const notifications = Array.isArray(user.notifications) ? user.notifications : appState.notificacoes.items;

      setAppState((prev) => ({
        ...prev,
        profileId,
        user: {
          ...prev.user,
          id: user.id,
          email: user.email,
          alias: user.alias || prev.user.alias,
          profileType: user.profileType ? user.profileType.toLowerCase() : prev.user.profileType,
        },
        onboarding,
        gestor,
        notificacoes: { ...prev.notificacoes, items: notifications },
      }));
    };

    loadUserData();

    return () => {
      cancelled = true;
    };
  }, [appState.user.id]);

  const handleLogout = () => {
    clearAppState();
    setLoginPass("");
    setLoginError("");
    setAppState(initialState);
  };

  const handleOnboardingSave = async (next) => {
    const nextState = { ...appState.onboarding, ...next };
    setAppState((prev) => ({ ...prev, onboarding: nextState }));

    if (!appState.user.id) return;
    const savedOnboarding = await saveOnboardingRecord(appState.user.id, nextState);
    if (savedOnboarding?.id) {
      setAppState((prev) => ({ ...prev, onboarding: { ...prev.onboarding, id: savedOnboarding.id } }));
    }
  };

  const handleGestorSave = async (next) => {
    const nextState = { ...appState.gestor, ...next };
    setAppState((prev) => ({ ...prev, gestor: nextState }));

    if (!appState.user.id) return;
    const savedGestor = await saveGestorStateRecord(appState.user.id, nextState);
    if (savedGestor?.id) {
      setAppState((prev) => ({ ...prev, gestor: { ...prev.gestor, id: savedGestor.id } }));
    }
  };

  const handleMarkNotificationRead = async (idOrIds) => {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    const nextItems = (appState.notificacoes.items || []).map((item) =>
      ids.includes(item.id) ? { ...item, read: true } : item
    );
    setAppState((prev) => ({ ...prev, notificacoes: { ...prev.notificacoes, items: nextItems } }));

    await Promise.all(ids.map((id) => updateNotificationRecord(id, { read: true })));
  };

  const handleDismissNotification = async (id) => {
    const nextItems = (appState.notificacoes.items || []).filter((item) => item.id !== id);
    setAppState((prev) => ({ ...prev, notificacoes: { ...prev.notificacoes, items: nextItems } }));
    await deleteNotificationRecord(id);
  };

  const handleNotificacoesSave = async (next) => {
    setAppState((prev) => ({ ...prev, notificacoes: { ...prev.notificacoes, ...next } }));
  };

  const handleProfileSave = async (next) => {
    const updatedUser = { ...appState.user, ...next };
    setAppState((prev) => ({ ...prev, user: updatedUser }));
    if (!appState.user.id) return;
    await updateUserRecord(appState.user.id, {
      email: updatedUser.email,
      alias: updatedUser.alias,
      profileType: appState.user.profileType?.toUpperCase(),
    });
  };

  const shellScreen = () => {
    if (!selectedProfile) return null;
    if (appState.screen === "home") {
      return (
        <HomeScreen
          profile={selectedProfile}
          onboardingState={appState.onboarding}
          notificacoesState={appState.notificacoes}
          onNavigate={handleScreenChange}
          onLogout={handleLogout}
        />
      );
    }
    if (appState.screen === "onboarding") {
      return <Onboarding profile={selectedProfile} state={appState.onboarding} onSave={handleOnboardingSave} onBack={() => handleScreenChange("home")} />;
    }
    if (appState.screen === "gestor") {
      return <GestorMarina profile={selectedProfile} state={appState.gestor} onSave={handleGestorSave} onBack={() => handleScreenChange("home")} />;
    }
    if (appState.screen === "notificacoes") {
      return <Notificacoes profile={selectedProfile} state={appState.notificacoes} onSave={handleNotificacoesSave} onMarkRead={handleMarkNotificationRead} onDismiss={handleDismissNotification} onBack={() => handleScreenChange("home")} />;
    }
    if (appState.screen === "profile") {
      return <ProfileScreen profile={selectedProfile} user={appState.user} onSave={handleProfileSave} onBack={() => handleScreenChange("home")} />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-900">
      {appState.screen === "splash" && <SplashScreen onNext={() => handleScreenChange("login")} />}
      {appState.screen === "login" && (
        <LoginScreen
          email={appState.user.email}
          password={loginPass}
          onEmailChange={handleEmailChange}
          onPasswordChange={setLoginPass}
          onSubmit={handleLogin}
          onBack={() => handleScreenChange("splash")}
          error={loginError}
        />
      )}
      {appState.screen === "pick" && (
        <ProfilePicker profiles={PROFILES} onSelect={handleSelectProfile} onBack={() => handleScreenChange("login")} />
      )}
      {appState.screen !== "splash" && appState.screen !== "login" && appState.screen !== "pick" && selectedProfile && (
        <ShellLayout current={appState.screen} onNavigate={handleScreenChange} selectedProfile={selectedProfile}>
          {shellScreen()}
        </ShellLayout>
      )}
    </div>
  );
}

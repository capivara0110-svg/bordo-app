const db = require("./database.cjs");

const PLANOS = {
  trial: {
    nome: "Teste",
    diasTeste: 14,
    usuarios: 3,
    ordensMes: 20,
    diarioMes: 50,
  },
  gratis: {
    nome: "Gratis",
    diasTeste: null,
    usuarios: 1,
    ordensMes: 3,
    diarioMes: 30,
  },
  profissional: {
    nome: "Profissional",
    diasTeste: null,
    usuarios: 1,
    ordensMes: null,
    diarioMes: null,
  },
  empresa: {
    nome: "Empresa",
    diasTeste: null,
    usuarios: 10,
    ordensMes: null,
    diarioMes: null,
  },
};

function getPlano(plano) {
  return PLANOS[plano] || PLANOS.trial;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function trialEndsAt(from = new Date()) {
  return addDays(from, PLANOS.trial.diasTeste).toISOString();
}

function monthStart() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

function isExpired(empresa) {
  if (empresa.plano !== "trial" || !empresa.trial_termina_em) return false;
  return new Date(empresa.trial_termina_em).getTime() < Date.now();
}

async function getEmpresa(empresaId) {
  return db.prepare(
    `SELECT id, nome, slug, plano, ativo, trial_termina_em,
            billing_status, billing_provider, provider_customer_id,
            provider_subscription_id, current_period_end, inadimplente_em,
            criado_em
     FROM empresas
     WHERE id = ?`,
  ).get(empresaId);
}

async function getUso(empresaId) {
  const inicioMes = monthStart();
  const [usuarios, ordens, diario] = await Promise.all([
    db.prepare("SELECT COUNT(*) AS total FROM usuarios WHERE empresa_id = ?").get(empresaId),
    db.prepare(
      "SELECT COUNT(*) AS total FROM ordens_servico WHERE empresa_id = ? AND criado_em >= ?",
    ).get(empresaId, inicioMes),
    db.prepare(
      "SELECT COUNT(*) AS total FROM diario WHERE empresa_id = ? AND criado_em >= ?",
    ).get(empresaId, inicioMes),
  ]);

  return {
    usuarios: Number(usuarios.total),
    ordensMes: Number(ordens.total),
    diarioMes: Number(diario.total),
  };
}

function remaining(limit, used) {
  if (limit === null || limit === undefined) return null;
  return Math.max(limit - used, 0);
}

async function getResumoPlano(empresaId) {
  const empresa = await getEmpresa(empresaId);
  if (!empresa) return null;

  const limites = getPlano(empresa.plano);
  const uso = await getUso(empresaId);
  const expirado = isExpired(empresa);
  const inadimplente = ["past_due", "unpaid", "canceled", "blocked"].includes(empresa.billing_status);
  const ativo = Boolean(Number(empresa.ativo)) && !expirado && !inadimplente;

  return {
    plano: empresa.plano,
    nome: limites.nome,
    ativo,
    expirado,
    inadimplente,
    billing_status: empresa.billing_status || (empresa.plano === "trial" ? "trialing" : "active"),
    billing_provider: empresa.billing_provider,
    current_period_end: empresa.current_period_end,
    inadimplente_em: empresa.inadimplente_em,
    trial_termina_em: empresa.trial_termina_em,
    limites: {
      usuarios: limites.usuarios,
      ordensMes: limites.ordensMes,
      diarioMes: limites.diarioMes,
    },
    uso,
    restante: {
      usuarios: remaining(limites.usuarios, uso.usuarios),
      ordensMes: remaining(limites.ordensMes, uso.ordensMes),
      diarioMes: remaining(limites.diarioMes, uso.diarioMes),
    },
  };
}

function limitExceeded(limit, used) {
  return limit !== null && limit !== undefined && used >= limit;
}

function requirePlanoAtivo(req, res, next) {
  getResumoPlano(req.usuario.empresa_id)
    .then((resumo) => {
      if (!resumo || !resumo.ativo) {
        return res.status(402).json({
          erro: "Plano inativo ou periodo de teste expirado",
          codigo: "PLANO_INATIVO",
        });
      }
      req.plano = resumo;
      return next();
    })
    .catch(next);
}

function requireLimite(recurso) {
  return async (req, res, next) => {
    try {
      const resumo = req.plano || await getResumoPlano(req.usuario.empresa_id);
      if (!resumo || !resumo.ativo) {
        return res.status(402).json({
          erro: "Plano inativo ou periodo de teste expirado",
          codigo: "PLANO_INATIVO",
        });
      }

      const limite = resumo.limites[recurso];
      const uso = resumo.uso[recurso];
      if (limitExceeded(limite, uso)) {
        return res.status(403).json({
          erro: "Limite do plano atingido",
          codigo: "LIMITE_PLANO",
          recurso,
          limite,
          uso,
        });
      }

      req.plano = resumo;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = {
  PLANOS,
  getPlano,
  getResumoPlano,
  requirePlanoAtivo,
  requireLimite,
  trialEndsAt,
};

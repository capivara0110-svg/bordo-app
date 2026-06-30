const express = require("express");
const { createHmac, timingSafeEqual } = require("crypto");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");
const { requireRoles } = require("../middleware.cjs");
const { PLANOS, getResumoPlano } = require("../planos.cjs");
const { audit } = require("../audit.cjs");

const router = express.Router();
const canManage = requireRoles("proprietario", "gestor");
const commercialStatuses = ["trialing", "pending", "active", "past_due", "unpaid", "canceled", "blocked"];
const planPrices = {
  profissional: { amount: 49.9, label: "BORDO. Profissional" },
  empresa: { amount: 149.9, label: "BORDO. Empresa" },
};

function clean(value) {
  return String(value || "").trim();
}

function publicBaseUrl(req) {
  return process.env.PUBLIC_APP_URL || `${req.protocol}://${req.get("host")}`;
}

function mercadoPagoHeaders() {
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    const error = new Error("MERCADOPAGO_ACCESS_TOKEN nao configurado");
    error.statusCode = 400;
    throw error;
  }
  return {
    Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
}

function externalReference(empresaId, plano) {
  return `bordo:empresa:${empresaId}:plano:${plano}`;
}

function parseExternalReference(value) {
  const parts = clean(value).split(":");
  if (parts[0] !== "bordo" || parts[1] !== "empresa" || parts[3] !== "plano") return null;
  const empresaId = Number(parts[2]);
  const plano = parts[4];
  if (!empresaId || !PLANOS[plano]) return null;
  return { empresaId, plano };
}

function mapMercadoPagoStatus(status) {
  const value = clean(status).toLowerCase();
  if (["authorized", "active"].includes(value)) return "active";
  if (["pending", "in_process"].includes(value)) return "pending";
  if (["paused"].includes(value)) return "past_due";
  if (["cancelled", "canceled", "cancelled_by_collector"].includes(value)) return "canceled";
  if (["rejected"].includes(value)) return "unpaid";
  return value || "pending";
}

function parseSignature(signature) {
  return clean(signature).split(",").reduce((acc, part) => {
    const [key, ...value] = part.split("=");
    if (key && value.length) acc[key.trim()] = value.join("=").trim();
    return acc;
  }, {});
}

function secureCompare(received, expected) {
  const receivedBuffer = Buffer.from(received || "");
  const expectedBuffer = Buffer.from(expected || "");
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

function verifyMercadoPagoSignature(req) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return;

  const signature = req.headers["x-signature"];
  const requestId = req.headers["x-request-id"];
  const dataId = clean(req.query?.["data.id"] || req.query?.id || req.body?.data?.id || req.body?.id).toLowerCase();
  const parts = parseSignature(signature);
  const timestamp = parts.ts;
  const received = parts.v1;

  if (!requestId || !dataId || !timestamp || !received) {
    const error = new Error("Webhook Mercado Pago sem assinatura valida");
    error.statusCode = 401;
    throw error;
  }

  const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  if (!secureCompare(received, expected)) {
    const error = new Error("Assinatura Mercado Pago invalida");
    error.statusCode = 401;
    throw error;
  }
}

async function mercadoPagoRequest(path, options = {}) {
  const response = await fetch(`https://api.mercadopago.com${path}`, {
    ...options,
    headers: {
      ...mercadoPagoHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || data.error || "Erro Mercado Pago");
    error.statusCode = response.status;
    error.details = data;
    throw error;
  }
  return data;
}

async function getEmpresa(empresaId) {
  return db.prepare(
    `SELECT id, nome, slug, plano, ativo, trial_termina_em, billing_status,
            billing_provider, provider_customer_id, provider_subscription_id,
            current_period_end, inadimplente_em, criado_em
     FROM empresas
     WHERE id = ?`,
  ).get(empresaId);
}

router.post("/checkout", auth, canManage, async (req, res) => {
  const plano = PLANOS[req.body.plano] ? req.body.plano : "profissional";
  const empresa = await getEmpresa(req.usuario.empresa_id);
  const provider = clean(req.body.provider || "mercadopago");

  if (provider === "mercadopago") {
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return res.status(400).json({ erro: "MERCADOPAGO_ACCESS_TOKEN nao configurado no BORDO" });
    }
    const planInfo = planPrices[plano] || planPrices.profissional;
    const data = await mercadoPagoRequest("/preapproval", {
      method: "POST",
      body: JSON.stringify({
        reason: planInfo.label,
        payer_email: req.usuario.email,
        external_reference: externalReference(empresa.id, plano),
        back_url: `${publicBaseUrl(req)}/empresa?assinatura=ok`,
        notification_url: `${publicBaseUrl(req)}/api/assinaturas/webhook/mercadopago`,
        status: "pending",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: planInfo.amount,
          currency_id: "BRL",
        },
      }),
    });

    await db.prepare(
      `UPDATE empresas
       SET plano = ?, billing_status = ?, billing_provider = ?,
           provider_subscription_id = ?, provider_customer_id = ?,
           current_period_end = ?, inadimplente_em = NULL
       WHERE id = ?`,
    ).run(
      plano,
      mapMercadoPagoStatus(data.status),
      "mercadopago",
      clean(data.id),
      clean(data.payer_id || ""),
      clean(data.next_payment_date || ""),
      empresa.id,
    );

    await db.prepare(
      `INSERT INTO pagamento_eventos (empresa_id,provider,event_id,tipo,status,payload)
       VALUES (?,?,?,?,?,?)`,
    ).run(empresa.id, "mercadopago", clean(data.id), "checkout.created", clean(data.status), JSON.stringify(data).slice(0, 4000));

    await audit(req.usuario, "assinatura", empresa.id, "checkout", `Checkout Mercado Pago ${plano} criado`, empresa, data);
    return res.status(201).json({
      provider: "mercadopago",
      plano,
      checkout_id: data.id,
      checkout_url: data.init_point,
      subscription_id: data.id,
      modo: "mercadopago_preapproval",
    });
  }

  const checkoutId = `manual_${empresa.id}_${Date.now()}`;
  const checkoutUrl = `${publicBaseUrl(req)}/checkout/manual?empresa=${empresa.slug}&plano=${plano}&ref=${checkoutId}`;

  await db.prepare(
    `INSERT INTO pagamento_eventos (empresa_id,provider,event_id,tipo,status,payload)
     VALUES (?,?,?,?,?,?)`,
  ).run(
    empresa.id,
    provider || "manual",
    checkoutId,
    "checkout.created",
    "pending",
    JSON.stringify({ plano, checkoutUrl }),
  );

  await audit(req.usuario, "assinatura", empresa.id, "checkout", `Checkout ${plano} criado`, empresa, { plano, checkoutUrl });
  return res.status(201).json({
    provider: provider || "manual",
    plano,
    checkout_id: checkoutId,
    checkout_url: checkoutUrl,
    modo: "manual_placeholder",
  });
});

async function syncMercadoPagoSubscription(subscriptionId) {
  const subscription = await mercadoPagoRequest(`/preapproval/${subscriptionId}`);
  const reference = parseExternalReference(subscription.external_reference);
  if (!reference) return null;

  const billingStatus = mapMercadoPagoStatus(subscription.status);
  await db.prepare(
    `UPDATE empresas
     SET plano = ?, billing_status = ?, billing_provider = ?,
         provider_subscription_id = ?, provider_customer_id = ?,
         current_period_end = ?,
         inadimplente_em = CASE WHEN ? IN ('past_due','unpaid','blocked') THEN COALESCE(inadimplente_em, CURRENT_TIMESTAMP) ELSE NULL END
     WHERE id = ?`,
  ).run(
    reference.plano,
    billingStatus,
    "mercadopago",
    clean(subscription.id || subscriptionId),
    clean(subscription.payer_id || ""),
    clean(subscription.next_payment_date || ""),
    billingStatus,
    reference.empresaId,
  );

  await db.prepare(
    `INSERT INTO pagamento_eventos (empresa_id,provider,event_id,tipo,status,payload)
     VALUES (?,?,?,?,?,?)`,
  ).run(reference.empresaId, "mercadopago", clean(subscription.id || subscriptionId), "preapproval.synced", billingStatus, JSON.stringify(subscription).slice(0, 4000));

  return { empresaId: reference.empresaId, plano: reference.plano, billingStatus };
}

async function syncMercadoPagoPayment(paymentId) {
  const payment = await mercadoPagoRequest(`/v1/payments/${paymentId}`);
  const reference = parseExternalReference(payment.external_reference);
  if (!reference) return null;

  await db.prepare(
    `INSERT INTO pagamento_eventos (empresa_id,provider,event_id,tipo,status,payload)
     VALUES (?,?,?,?,?,?)`,
  ).run(reference.empresaId, "mercadopago", clean(payment.id || paymentId), "payment.synced", clean(payment.status), JSON.stringify(payment).slice(0, 4000));

  if (payment.status === "approved") {
    await db.prepare(
      `UPDATE empresas
       SET plano = ?, billing_status = 'active', billing_provider = 'mercadopago',
           inadimplente_em = NULL
       WHERE id = ?`,
    ).run(reference.plano, reference.empresaId);
  }

  return { empresaId: reference.empresaId, plano: reference.plano, status: payment.status };
}

router.post("/webhook/:provider", async (req, res) => {
  const provider = clean(req.params.provider).toLowerCase() || "manual";
  if (provider === "mercadopago") {
    verifyMercadoPagoSignature(req);
    const id = clean(req.body?.data?.id || req.body?.id || req.query?.["data.id"] || req.query?.id);
    const type = clean(req.body?.type || req.body?.topic || req.query?.type || "");
    if (!id) return res.json({ ok: true });

    if (type.includes("preapproval") || type.includes("subscription")) {
      await syncMercadoPagoSubscription(id);
    } else {
      await syncMercadoPagoPayment(id);
    }
    return res.json({ ok: true });
  }

  const eventId = clean(req.body.id || req.body.event_id || `${provider}_${Date.now()}`);
  const tipo = clean(req.body.type || req.body.tipo || "");
  const status = clean(req.body.status || req.body.billing_status || "");
  const empresaId = Number(req.body.empresa_id || req.body.metadata?.empresa_id);

  if (!empresaId || !tipo) return res.status(400).json({ erro: "empresa_id e tipo sao obrigatorios" });

  await db.prepare(
    `INSERT INTO pagamento_eventos (empresa_id,provider,event_id,tipo,status,payload)
     VALUES (?,?,?,?,?,?)`,
  ).run(empresaId, provider, eventId, tipo, status, JSON.stringify(req.body).slice(0, 4000));

  if (commercialStatuses.includes(status)) {
    await db.prepare(
      `UPDATE empresas
       SET billing_status = ?, billing_provider = ?, provider_customer_id = ?,
           provider_subscription_id = ?, current_period_end = ?,
           inadimplente_em = CASE WHEN ? IN ('past_due','unpaid','blocked') THEN CURRENT_TIMESTAMP ELSE inadimplente_em END
       WHERE id = ?`,
    ).run(
      status,
      provider,
      clean(req.body.customer_id || req.body.customer || ""),
      clean(req.body.subscription_id || req.body.subscription || ""),
      clean(req.body.current_period_end || ""),
      status,
      empresaId,
    );
  }

  return res.json({ ok: true });
});

router.get("/admin", auth, canManage, async (req, res) => {
  const empresas = await db.prepare(
    `SELECT id, nome, slug, plano, ativo, trial_termina_em, billing_status,
            billing_provider, provider_customer_id, provider_subscription_id,
            current_period_end, inadimplente_em, criado_em
     FROM empresas
     ORDER BY criado_em DESC, id DESC`,
  ).all();

  const result = [];
  for (const empresa of empresas) {
    result.push({ ...empresa, assinatura: await getResumoPlano(empresa.id) });
  }
  return res.json(result);
});

router.put("/admin/:empresaId", auth, canManage, async (req, res) => {
  const current = await getEmpresa(req.params.empresaId);
  if (!current) return res.status(404).json({ erro: "Empresa nao encontrada" });

  const plano = PLANOS[req.body.plano] ? req.body.plano : current.plano;
  const billingStatus = commercialStatuses.includes(req.body.billing_status)
    ? req.body.billing_status
    : current.billing_status || "trialing";
  const ativo = Object.prototype.hasOwnProperty.call(req.body, "ativo")
    ? Number(Boolean(req.body.ativo))
    : Number(current.ativo);

  await db.prepare(
    `UPDATE empresas
     SET plano = ?, ativo = ?, billing_status = ?, current_period_end = ?,
         inadimplente_em = ?
     WHERE id = ?`,
  ).run(
    plano,
    ativo,
    billingStatus,
    clean(req.body.current_period_end || current.current_period_end || ""),
    ["past_due", "unpaid", "blocked"].includes(billingStatus)
      ? (current.inadimplente_em || new Date().toISOString())
      : null,
    current.id,
  );

  const updated = await getEmpresa(current.id);
  await audit(req.usuario, "assinatura", current.id, "atualizar", `Assinatura de ${updated.nome} atualizada`, current, updated);
  return res.json({ ...updated, assinatura: await getResumoPlano(updated.id) });
});

module.exports = router;

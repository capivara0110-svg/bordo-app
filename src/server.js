import "dotenv/config";
import path from "path";
import express from "express";
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  console.warn("Warning: DATABASE_URL is not set. Prisma will fail to connect without a valid PostgreSQL URL.");
}

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  return next();
});

const distPath = path.resolve(process.cwd(), "dist");
app.use(express.static(distPath));
app.get("/", (req, res) => res.sendFile(path.resolve(distPath, "index.html")));

app.get("/api/users", async (req, res) => {
  try {
    const { email } = req.query;
    const where = email ? { email: { equals: String(email).trim().toLowerCase() } } : {};
    const users = await prisma.user.findMany({
      where,
      include: { vessel: true, onboarding: true, gestorState: true, notifications: true },
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error("Failed to fetch users", error);
    return res.status(500).json({ error: "Não foi possível carregar os usuários." });
  }
});

app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { vessel: true, onboarding: true, gestorState: true, notifications: true },
    });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Failed to fetch user", error);
    return res.status(500).json({ error: "Erro ao buscar o usuário." });
  }
});

app.post("/api/users", async (req, res) => {
  const { email, alias, profileType, password, vesselId } = req.body;
  try {
    const user = await prisma.user.create({
      data: { email, alias, profileType, password, vesselId },
    });
    return res.status(201).json(user);
  } catch (error) {
    console.error("Failed to create user", error);
    return res.status(500).json({ error: "Não foi possível criar o usuário." });
  }
});

app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { alias, profileType, vesselId, password } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { alias, profileType, vesselId, password },
    });
    return res.status(200).json(user);
  } catch (error) {
    console.error("Failed to update user", error);
    return res.status(500).json({ error: "Não foi possível atualizar o usuário." });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error("Failed to delete user", error);
    return res.status(500).json({ error: "Não foi possível remover o usuário." });
  }
});

app.get("/api/vessels", async (req, res) => {
  try {
    const vessels = await prisma.vessel.findMany();
    return res.status(200).json(vessels);
  } catch (error) {
    console.error("Failed to fetch vessels", error);
    return res.status(500).json({ error: "Não foi possível carregar as embarcações." });
  }
});

app.post("/api/vessels", async (req, res) => {
  const { name, type, registration, location } = req.body;
  try {
    const vessel = await prisma.vessel.create({ data: { name, type, registration, location } });
    return res.status(201).json(vessel);
  } catch (error) {
    console.error("Failed to create vessel", error);
    return res.status(500).json({ error: "Não foi possível criar a embarcação." });
  }
});

app.put("/api/vessels/:id", async (req, res) => {
  const { id } = req.params;
  const { name, type, registration, location } = req.body;
  try {
    const vessel = await prisma.vessel.update({
      where: { id },
      data: { name, type, registration, location },
    });
    return res.status(200).json(vessel);
  } catch (error) {
    console.error("Failed to update vessel", error);
    return res.status(500).json({ error: "Não foi possível atualizar a embarcação." });
  }
});

app.delete("/api/vessels/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.vessel.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error("Failed to delete vessel", error);
    return res.status(500).json({ error: "Não foi possível remover a embarcação." });
  }
});

app.get("/api/onboarding/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const onboarding = await prisma.onboarding.findUnique({ where: { userId } });
    if (!onboarding) {
      return res.status(404).json({ error: "Onboarding não encontrado." });
    }
    return res.status(200).json(onboarding);
  } catch (error) {
    console.error("Failed to fetch onboarding", error);
    return res.status(500).json({ error: "Erro ao carregar o onboarding." });
  }
});

app.post("/api/onboarding", async (req, res) => {
  const { userId, step, empresa, perfil, embarcacaoNome, embarcacaoTipo, embarcacaoRegistro, alertas, skipEmb, completed } = req.body;
  try {
    const onboarding = await prisma.onboarding.create({
      data: { userId, step, empresa, perfil, embarcacaoNome, embarcacaoTipo, embarcacaoRegistro, alertas, skipEmb, completed },
    });
    return res.status(201).json(onboarding);
  } catch (error) {
    console.error("Failed to create onboarding", error);
    return res.status(500).json({ error: "Não foi possível criar o onboarding." });
  }
});

app.put("/api/onboarding/:id", async (req, res) => {
  const { id } = req.params;
  const { step, empresa, perfil, embarcacaoNome, embarcacaoTipo, embarcacaoRegistro, alertas, skipEmb, completed } = req.body;
  try {
    const onboarding = await prisma.onboarding.update({
      where: { id },
      data: { step, empresa, perfil, embarcacaoNome, embarcacaoTipo, embarcacaoRegistro, alertas, skipEmb, completed },
    });
    return res.status(200).json(onboarding);
  } catch (error) {
    console.error("Failed to update onboarding", error);
    return res.status(500).json({ error: "Não foi possível atualizar o onboarding." });
  }
});

app.get("/api/notifications/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Failed to fetch notifications", error);
    return res.status(500).json({ error: "Não foi possível carregar as notificações." });
  }
});

app.post("/api/notifications", async (req, res) => {
  const { userId, title, message, category, read } = req.body;
  try {
    const notification = await prisma.notification.create({
      data: { userId, title, message, category, read },
    });
    return res.status(201).json(notification);
  } catch (error) {
    console.error("Failed to create notification", error);
    return res.status(500).json({ error: "Não foi possível criar a notificação." });
  }
});

app.put("/api/notifications/:id", async (req, res) => {
  const { id } = req.params;
  const { title, message, category, read } = req.body;
  try {
    const notification = await prisma.notification.update({
      where: { id },
      data: { title, message, category, read },
    });
    return res.status(200).json(notification);
  } catch (error) {
    console.error("Failed to update notification", error);
    return res.status(500).json({ error: "Não foi possível atualizar a notificação." });
  }
});

app.delete("/api/notifications/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.notification.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error("Failed to delete notification", error);
    return res.status(500).json({ error: "Não foi possível remover a notificação." });
  }
});

app.get("/api/gestor/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    if (String(user.status).toUpperCase() === "INATIVO") {
      return res.status(403).json({ error: "Acesso negado: usuário inativo." });
    }

    const gestorState = await prisma.gestorState.findUnique({ where: { userId } });
    if (!gestorState) {
      return res.status(404).json({ error: "Estado do gestor não encontrado." });
    }
    return res.status(200).json(gestorState);
  } catch (error) {
    console.error("Failed to fetch gestor state", error);
    return res.status(500).json({ error: "Erro ao carregar o estado do gestor." });
  }
});

app.post("/api/gestor", async (req, res) => {
  const { userId, activeTab } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    if (String(user.status).toUpperCase() === "INATIVO") {
      return res.status(403).json({ error: "Acesso negado: usuário inativo." });
    }

    const gestorState = await prisma.gestorState.create({ data: { userId, activeTab } });
    return res.status(201).json(gestorState);
  } catch (error) {
    console.error("Failed to create gestor state", error);
    return res.status(500).json({ error: "Não foi possível criar o estado do gestor." });
  }
});

app.put("/api/gestor/:id", async (req, res) => {
  const { id } = req.params;
  const { activeTab } = req.body;
  try {
    // check linked user status before allowing update
    const existing = await prisma.gestorState.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Estado do gestor não encontrado." });
    }
    const user = await prisma.user.findUnique({ where: { id: existing.userId } });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    if (String(user.status).toUpperCase() === "INATIVO") {
      return res.status(403).json({ error: "Acesso negado: usuário inativo." });
    }

    const gestorState = await prisma.gestorState.update({
      where: { id },
      data: { activeTab },
    });
    return res.status(200).json(gestorState);
  } catch (error) {
    console.error("Failed to update gestor state", error);
    return res.status(500).json({ error: "Não foi possível atualizar o estado do gestor." });
  }
});

app.get("/*", (req, res) => {
  res.sendFile(path.resolve(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Bordo backend running on http://localhost:${PORT}`);
});

const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const uploadRoot = path.resolve(process.env.BORDO_UPLOAD_DIR || path.join(__dirname, "uploads"));
const maxPhotoBytes = Number(process.env.BORDO_MAX_PHOTO_BYTES || 900000);
const mimeExtensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function clean(value) {
  return String(value || "").trim();
}

function publicUploadUrl(storageKey) {
  const baseUrl = clean(process.env.BORDO_UPLOAD_BASE_URL).replace(/\/$/, "");
  const normalizedKey = storageKey.split(path.sep).join("/");
  return baseUrl ? `${baseUrl}/${normalizedKey}` : `/uploads/${normalizedKey}`;
}

async function saveDataUrlPhoto({ dataUrl, empresaId, tipo, referenciaId, categoria }) {
  const match = clean(dataUrl).match(/^data:(image\/(?:jpeg|png|webp));base64,([a-z0-9+/=\r\n]+)$/i);
  if (!match) return { erro: "Formato de foto invalido" };

  const mimeType = match[1].toLowerCase();
  const extension = mimeExtensions[mimeType];
  const buffer = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (!buffer.length) return { erro: "Foto obrigatoria" };
  if (buffer.length > maxPhotoBytes) {
    return { erro: `Foto muito grande. Limite atual: ${Math.round(maxPhotoBytes / 1024)} KB` };
  }

  const safeTipo = clean(tipo).replace(/[^a-z0-9_-]/gi, "") || "foto";
  const safeCategoria = clean(categoria).replace(/[^a-z0-9_-]/gi, "") || "geral";
  const key = path.join(
    `empresa-${Number(empresaId) || 0}`,
    safeTipo,
    String(Number(referenciaId) || 0),
    `${Date.now()}-${crypto.randomBytes(8).toString("hex")}-${safeCategoria}.${extension}`,
  );
  const absolutePath = path.join(uploadRoot, key);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, buffer);

  return {
    url: publicUploadUrl(key),
    storage_provider: "local_volume",
    storage_key: key.split(path.sep).join("/"),
    mime_type: mimeType,
    tamanho_bytes: buffer.length,
  };
}

async function preparePhotoPayload(body, { empresaId, tipo, referenciaId, allowedCategories }) {
  const url = clean(body.url);
  if (!url) return { erro: "Foto obrigatoria" };
  const categoria = allowedCategories.includes(body.categoria) ? body.categoria : "geral";

  if (url.startsWith("data:image/")) {
    const stored = await saveDataUrlPhoto({ dataUrl: url, empresaId, tipo, referenciaId, categoria });
    if (stored.erro) return stored;
    return {
      ...stored,
      categoria,
      legenda: clean(body.legenda).slice(0, 180),
    };
  }

  if (!/^https?:\/\//i.test(url) && !url.startsWith("/uploads/")) {
    return { erro: "Formato de foto invalido" };
  }

  return {
    url,
    categoria,
    legenda: clean(body.legenda).slice(0, 180),
    storage_provider: url.startsWith("/uploads/") ? "local_volume" : "external_url",
    storage_key: clean(body.storage_key).slice(0, 240),
    mime_type: clean(body.mime_type).slice(0, 80),
    tamanho_bytes: Number(body.tamanho_bytes) || 0,
  };
}

module.exports = {
  preparePhotoPayload,
  uploadRoot,
};

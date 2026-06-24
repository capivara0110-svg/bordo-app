import React from "react";

const map = {
  concluida: { bg: "#d4edda", color: "#155724", label: "Concluida" },
  em_andamento: { bg: "#fff3cd", color: "#856404", label: "Em andamento" },
  aguardando: { bg: "#E8F4F8", color: "#1B4F72", label: "Aguardando" },
  ativo: { bg: "#d4edda", color: "#155724", label: "Ativo" },
  em_viagem: { bg: "#E8F4F8", color: "#1B4F72", label: "Em viagem" },
  folga: { bg: "#f0f0f0", color: "#6B7B8D", label: "Folga" },
  ocupado: { bg: "#fff3cd", color: "#856404", label: "Ocupado" },
  livre: { bg: "#d4edda", color: "#155724", label: "Livre" },
  reservado: { bg: "#E8F4F8", color: "#1B4F72", label: "Reservado" },
  manutencao: { bg: "#f8d7da", color: "#721c24", label: "Manutencao" },
  ok: { bg: "#d4edda", color: "#155724", label: "OK" },
  alerta: { bg: "#fff3cd", color: "#856404", label: "Atencao" },
  vencido: { bg: "#f8d7da", color: "#721c24", label: "Vencido" },
};

export default function StatusBadge({ status }) {
  const s = map[status] || map.aguardando;
  return React.createElement("span", {
    style: {
      background: s.bg,
      color: s.color,
      borderRadius: 6,
      padding: "3px 9px",
      fontSize: 11,
      fontWeight: 700,
      whiteSpace: "nowrap",
    },
  }, s.label);
}

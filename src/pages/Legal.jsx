import React from "react";
import Header from "../components/Header.jsx";
import { C, fonts } from "../styles/theme.js";

export default function Legal({ type = "privacidade", onBack }) {
  const isTerms = type === "termos";
  const title = isTerms ? "Termos de Uso" : "Privacidade e LGPD";

  return (
    <main className="bordo-app-screen bordo-no-sidebar" style={{ minHeight: "100vh", background: C.ocean, maxWidth: 860, margin: "0 auto", paddingBottom: 32 }}>
      <Header title={title} sub="Documento operacional do BORDO." onBack={onBack} color={C.aqua} />
      <article className="bordo-page-body" style={{ padding: "8px 16px 24px", color: "rgba(255,255,255,0.72)", lineHeight: 1.7 }}>
        <section style={cardStyle}>
          <h1 style={headingStyle}>{title}</h1>
          <p>Versao MVP. Antes da venda em producao, este documento deve ser revisado por assessoria juridica.</p>
        </section>

        {isTerms ? <Terms /> : <Privacy />}
      </article>
    </main>
  );
}

function Privacy() {
  return (
    <section style={cardStyle}>
      <h2 style={sectionTitle}>Dados coletados</h2>
      <p>Coletamos dados de conta, empresa, usuarios, clientes, embarcacoes, ordens de servico, fotos, relatorios, auditoria e informacoes necessarias para operar o servico.</p>
      <h2 style={sectionTitle}>Finalidade</h2>
      <p>Os dados sao usados para gestao operacional nautica, controle de acesso, execucao de OS, relatorios, suporte, cobranca e seguranca.</p>
      <h2 style={sectionTitle}>LGPD</h2>
      <p>O cliente pode solicitar acesso, correcao, exportacao ou exclusao de dados, respeitando obrigacoes legais, fiscais, contratuais e registros de auditoria.</p>
      <h2 style={sectionTitle}>Fotos e documentos</h2>
      <p>Fotos podem conter dados pessoais ou informacoes sensiveis da operacao. O uso deve respeitar autorizacoes internas e finalidade do servico.</p>
      <h2 style={sectionTitle}>Seguranca</h2>
      <p>Contas devem usar senhas fortes. Acesso administrativo deve ser concedido apenas a pessoas autorizadas.</p>
    </section>
  );
}

function Terms() {
  return (
    <section style={cardStyle}>
      <h2 style={sectionTitle}>Uso permitido</h2>
      <p>O BORDO. deve ser usado para gestao de operacoes nauticas, ordens de servico, equipe, registros, relatorios e controles comerciais relacionados.</p>
      <h2 style={sectionTitle}>Responsabilidades</h2>
      <p>A empresa usuaria e responsavel pela veracidade dos dados, autorizacoes de imagem, informacoes de clientes e cumprimento de normas aplicaveis.</p>
      <h2 style={sectionTitle}>Assinatura</h2>
      <p>O acesso pode ser limitado ou bloqueado em caso de inadimplencia, expiracao de teste, abuso ou violacao destes termos, sem exclusao automatica dos dados.</p>
      <h2 style={sectionTitle}>Disponibilidade</h2>
      <p>Podem ocorrer manutencoes, instabilidades de provedores externos e mudancas no servico para seguranca ou melhoria operacional.</p>
      <h2 style={sectionTitle}>Cancelamento</h2>
      <p>O cancelamento encerra novas operacoes comerciais conforme plano contratado, preservando dados conforme politica de retencao e requisitos legais.</p>
    </section>
  );
}

const cardStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 18,
  marginBottom: 14,
};

const headingStyle = {
  color: C.white,
  fontFamily: fonts.display,
  marginBottom: 8,
};

const sectionTitle = {
  color: C.white,
  fontFamily: fonts.display,
  fontSize: 17,
  margin: "16px 0 6px",
};

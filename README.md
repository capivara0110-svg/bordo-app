# ⚓ BORDO. — Gestão Náutica para quem trabalha no mar

**BORDO.** é um sistema de gestão náutica focado no trabalhador do mar — marinheiros, técnicos de manutenção, equipe de marinharia e gestores de marina.

> 🚢 Feito pra quem trabalha no mar, não pra quem assiste da marina.

---

## 🎯 Perfis de Usuário

| Perfil | Emoji | Principal função |
|--------|-------|-----------------|
| **Marinheiro & Tripulante** | 🧑‍✈️ | Diário de bordo, check-list, documentos da tripulação, estoque |
| **Equipe de Marinharia** | 🧹 | Ordens de serviço, fotos, relatório automático |
| **Técnico de Manutenção** | 🔧 | OS com peças, horas trabalhadas, histórico |
| **Gestor / Marina** | 👔 | Painel completo, berços, equipe, faturamento |

## ✨ Funcionalidades

- 📋 **Diário de Bordo Digital** com assinatura
- ✅ **Check-list de Segurança** pré-zarpe
- 🔧 **Ordens de Serviço** com fotos e relatório
- 👥 **Controle de Tripulação** e documentos
- 📦 **Gestão de Estoque** de bordo
- ⚓ **Berços** da marina
- 📊 **Dashboard** do gestor
- 🔔 **Central de Notificações**

## 🛠️ Tecnologias

- **React 19** + **Vite 8**
- **JavaScript (JSX)**
- Design System próprio com tema oceânico

## 🚀 Como rodar

```bash
# Instalar dependências
cd bordo-app
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📂 Estrutura

```
bordo-app/
├── public/
│   └── anchor.svg
├── src/
│   ├── components/        # Componentes reutilizáveis
│   │   ├── AnchorIcon.jsx
│   │   ├── Header.jsx
│   │   └── StatusBadge.jsx
│   ├── data/
│   │   └── mock.js        # Dados mockados do sistema
│   ├── pages/
│   │   ├── Landing.jsx     # Página inicial / marketing
│   │   ├── Login.jsx       # Login + seleção de perfil
│   │   ├── NauticoPro.jsx  # App do marinheiro
│   │   ├── GestorMarina.jsx # Painel do gestor
│   │   ├── Notificacoes.jsx # Central de alertas
│   │   └── TelasSuporte.jsx # Embarcações, galeria, config
│   ├── styles/
│   │   └── theme.js        # Paleta de cores e tipografia
│   ├── App.jsx             # Roteamento principal
│   └── main.jsx            # Entry point
├── index.html
├── vite.config.js
└── package.json
```

## 🎨 Identidade Visual

| Token | Cor |
|-------|-----|
| Ocean `#0A2540` | Azul escuro (fundo) |
| Wave `#1B4F72` | Azul médio |
| Aqua `#17A8BD` | Azul turquesa (destaque) |
| Sand `#F7F3EC` | Areia (seções claras) |
| Fontes | Space Grotesk (display) + Inter (corpo) |

## 🧭 Roadmap

- [ ] Backend com autenticação real (Firebase ou Node.js)
- [ ] Banco de dados (PostgreSQL / Firestore)
- [ ] Upload de fotos (Cloudinary / S3)
- [ ] PWA com suporte offline
- [ ] Assinatura digital com biometria
- [ ] QR Code nas embarcações
- [ ] Notificações push
- [ ] Versão Mobile (React Native / Expo)

## 📄 Licença

Este é um projeto conceitual. Todos os direitos reservados.

---

<p align="center">⚓ <strong>BORDO.</strong> — Gestão Náutica Brasileira</p>



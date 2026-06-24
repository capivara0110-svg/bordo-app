# Plano de evolucao SaaS do BORDO

Este documento guarda a visao combinada para transformar o BORDO em um produto vendavel para marinas, oficinas nauticas, equipes de marinharia e prestadores de servico.

## Posicionamento

O BORDO e um sistema operacional nautico para quem presta, coordena e acompanha servicos em embarcacoes.

Publico principal:

- Marinas
- Oficinas nauticas
- Marinharia
- Mecanicos navais
- Eletrica e eletronica nautica
- Fibra, pintura e polimento
- Limpeza de embarcacao
- Marinheiro avulso
- Equipe de marinheiros
- Gestores de frota ou marina
- Donos de embarcacao, futuramente via portal do cliente

## Perfis do sistema

- Gestor/proprietario: administra empresa, equipe, clientes, embarcacoes, OS, agenda e indicadores.
- Coordenador: organiza agenda, ordens de servico, equipe e prioridades.
- Tecnico/prestador: executa OS, marca tarefas, registra fotos, materiais e horas.
- Marinheiro/tripulante: usa diario, checklist, tarefas de bordo e registros operacionais.
- Cliente/dono da embarcacao: acompanha historico, fotos, orcamentos e aprovacoes em uma fase futura.

## O que ja existe

- [x] Login e cadastro de empresa
- [x] Empresas separadas no banco
- [x] Usuarios vinculados a empresa
- [x] Papeis de acesso: proprietario, gestor, tecnico e membro
- [x] Isolamento multiempresa de dados
- [x] Painel gestor
- [x] Minha Empresa e gestao inicial de membros
- [x] Planos, limites e periodo trial
- [x] Ordens de servico
- [x] Tarefas dentro da OS
- [x] Status, prioridade, responsavel e previsao da OS
- [x] Cadastro de clientes
- [x] Cadastro de embarcacoes
- [x] Vinculo entre cliente, embarcacao e OS
- [x] Historico por cliente
- [x] Historico por embarcacao
- [x] Agenda de servicos baseada na previsao da OS
- [x] Equipe/tripulacao
- [x] Bercos/vagas
- [x] Estoque basico
- [x] Dashboard inicial
- [x] Testes automatizados de migracao e isolamento
- [x] Deploy online na Railway com PostgreSQL

## Proximas fases

### Fase 1 - Fotos e evidencia do servico

- [x] Fotos na OS
- [x] Fotos na embarcacao
- [x] Galeria simples por OS
- [x] Galeria simples por embarcacao
- [x] Descricao curta por foto
- [x] Tipo de foto: antes, durante, depois, documento ou geral
- [ ] Preparar armazenamento externo para producao

Nota tecnica importante:

- Hoje as fotos do MVP podem ser salvas como data URL no banco para validar fluxo rapido.
- Antes de vender em producao, migrar fotos para armazenamento externo.
- Opcoes candidatas: S3 compativel, Cloudinary, Railway Volume ou outro storage com URL publica/assinada.
- O banco deve guardar metadados e URL da foto, nao o arquivo pesado definitivo.
- Essa migracao precisa acontecer antes de uso real com muitos clientes, para evitar banco pesado, backup lento e custo ruim.

### Fase 2 - Prestadores e equipe operacional

- [ ] Cadastro de funcoes operacionais: limpeza, marinharia, marinheiro, mecanico, eletrica, fibra, pintura, polimento
- [ ] Disponibilidade da equipe
- [ ] Responsavel principal e auxiliares na OS
- [ ] Filtro de agenda por prestador/responsavel
- [ ] Visao do prestador com apenas suas OS e tarefas

### Fase 3 - Orcamento e execucao financeira

- [ ] Itens de orcamento na OS
- [ ] Materiais usados na OS
- [ ] Horas trabalhadas
- [ ] Mao de obra por funcao
- [ ] Descontos e acrescimos
- [ ] Status de orcamento: rascunho, enviado, aprovado, recusado
- [ ] Aprovacao do cliente

### Fase 4 - Laudo e relatorio

- [ ] Relatorio da OS com dados do cliente, barco, tarefas e fotos
- [ ] Fotos antes/depois
- [ ] Assinatura/aceite do cliente
- [ ] Exportacao em PDF
- [ ] Compartilhamento por WhatsApp

### Fase 5 - Portal do cliente

- [ ] Acesso do cliente por email ou link seguro
- [ ] Cliente visualiza embarcacoes
- [ ] Cliente acompanha OS
- [ ] Cliente ve fotos e historico
- [ ] Cliente aprova orcamento
- [ ] Cliente recebe relatorio

### Fase 6 - Operacao avancada

- [ ] Checklist por tipo de servico
- [ ] Modelos de OS: limpeza, motor, polimento, marinharia, eletrica, fibra
- [ ] Alertas de vencimento e manutencao preventiva
- [ ] Notificacoes por email/WhatsApp
- [ ] QR Code por embarcacao
- [ ] Auditoria de alteracoes importantes

### Fase 7 - SaaS comercial

- [ ] Checkout e cobranca recorrente
- [ ] Webhooks de pagamento
- [ ] Bloqueio por inadimplencia sem perda de dados
- [ ] Painel interno de assinaturas
- [ ] Remocao dos acessos demonstrativos em producao
- [ ] Politica de privacidade, termos e LGPD

### Fase 8 - Confiabilidade e escala

- [ ] Backups automaticos
- [ ] Restauracao testada
- [ ] Logs estruturados
- [ ] Monitoramento de erros
- [ ] Testes de integracao dos fluxos comerciais
- [ ] PWA melhorado
- [ ] Operacao offline para campo

## Ordem recomendada agora

1. Fotos na OS e na embarcacao
2. Prestadores/equipe com funcao e disponibilidade
3. Orcamento da OS
4. Materiais e horas trabalhadas
5. Relatorio/laudo com fotos
6. Portal do cliente

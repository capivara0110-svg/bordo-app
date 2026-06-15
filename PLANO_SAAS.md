# Plano de evolucao SaaS do BORDO

## Fase 1 - Fundacao multiempresa

- [x] Empresas separadas no banco
- [x] Usuarios vinculados a uma empresa
- [x] Papeis de acesso: proprietario, gestor, tecnico e membro
- [x] Isolamento de OS, estoque, tripulacao, bercos, diario e notificacoes
- [x] Cadastro de empresa com proprietario
- [x] Gestao inicial de membros via API
- [x] Migracao versionada dos dados existentes
- [x] Testes automatizados de isolamento e migracao

## Fase 2 - Seguranca e administracao

- [ ] Tela de cadastro de empresa
- [ ] Tela de equipe, convites e permissoes
- [ ] Confirmacao de email
- [ ] Recuperacao e alteracao de senha
- [ ] Encerramento e revogacao de sessoes
- [ ] Rate limit e trilha de auditoria
- [ ] Remocao dos acessos demonstrativos em producao

## Fase 3 - Operacao comercial

- [ ] Clientes e embarcacoes como entidades proprias
- [ ] OS com tarefas, materiais, horas e fotos
- [ ] Orcamento e aprovacao do cliente
- [ ] Relatorio PDF e compartilhamento por WhatsApp
- [ ] Upload de arquivos em armazenamento externo
- [ ] Alertas de documentos, estoque e manutencao

## Fase 4 - Assinaturas

- [ ] Planos e limites por empresa
- [ ] Periodo gratuito com data de expiracao
- [ ] Checkout e cobranca recorrente
- [ ] Webhooks de pagamento
- [ ] Bloqueio por inadimplencia sem perda de dados
- [ ] Painel interno de clientes e assinaturas

## Fase 5 - Confiabilidade

- [ ] Backups automaticos e restauracao testada
- [ ] Logs estruturados e monitoramento
- [ ] Testes de integracao dos fluxos comerciais
- [ ] PWA e operacao offline
- [ ] Politica de privacidade, termos e processos LGPD

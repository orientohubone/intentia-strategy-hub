# Issue: Aba Relatórios do AdminPanel

## Contexto
- A aba "Relatórios" do `AdminPanel` está com falhas estruturais, conforme observado nos testes (`src/test/AdminPanel.test.tsx`) que não conseguem renderizar o conteúdo esperado mesmo com mocks de Supabase.
- A suíte completa `npm test` continua falhando apenas nesse teste, enquanto o restante passa.
- Existe a possibilidade de descontinuar essa aba se não for possível torná-la funcional.

## Sintoma atual
- Ao executar o teste `AdminPanel.test.tsx`, o conteúdo de "Status por plano" (`Starter`, `Professional`, `Enterprise`) não aparece, causando falha no `waitFor`.
- A mockagem do Supabase foi ampliada, mas o teste ainda não chega a renderizar os textos esperados, indicando que a renderização da aba pode depender de outros fluxos/configurações não cobertos.

## Próximos passos sugeridos
1. Reavaliar a arquitetura da aba (dados carregados, estados e dependências) e decidir se vale a pena refatorar ou descontinuar.
2. Se manter, revisar os mocks para cobrir os fluxos faltantes ou separar/reescrever a aba em componentes mais testáveis.
3. Enquanto isso, utilize o workflow `.windsurf/workflows/admin-panel-test-isolation.md` para rodar apenas o teste falho e evitar poluir o restante da suíte.

## Responsável
- Time de operações/infraestrutura (admin).

## Prioridade
- Alta para evitar caos no `npm test`; possivelmente média/baixa se a decisão for descontinuar.

## Arquitetura de componentes
- Componentes de diálogo pesados funcionam melhor isolados (ex.: Benchmark de nichos), importados onde usados: resolve overflow/layout e facilita reuso.

## UI e rendering
- Dados de UI com JSX precisam vir em fragmentos/prop dedicada (ex.: answerInline) para evitar que arrays sejam serializados e o front não renderize ícones.

## Navegação/UX
- Navegação contextual (focus na Central) é mais fluida com query params + scroll-to-card ativo, mantendo o usuário já no passo certo.

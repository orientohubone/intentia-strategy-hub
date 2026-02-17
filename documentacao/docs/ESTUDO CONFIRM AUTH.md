Fluxo proposto — verificação por e-mail usando Edge Function (desativando confirmação automática no Auth)
Vou descrever dois fluxos completos (A e B) com passos, prós/cons e o que acontece em cada etapa. Assim você escolhe o que se encaixa melhor.

Fluxo A — Token próprio + verificação via Edge Function (total controle)

Objetivo: Supabase Auth não envia e não marca automaticamente; você gera token, envia via SendGrid e valida manualmente.
Passos:
Usuário se registra (Auth): cria conta normalmente no Supabase Auth. Configuração: email confirmation DESATIVADA.
Backend / Edge Function cria um registro de verificação:
Gera um token seguro (ex.: uuid + HMAC ou random bytes codificados).
Insere em tabela verification_tokens: (id, user_id, token_hash, expires_at, used boolean, created_at).
Opcional: salva metadata (IP, user-agent).
Edge Function envia e-mail via SendGrid com link:
Link: https:///verify?token=&uid=<user_id> (ou só token que referencia user internamente).
Usuário clica no link:
Requisita outra Edge Function (ou rota no seu frontend que chama a Edge Function) que recebe token (e opcional user_id).
Edge Function de verificação valida:
Busca token por token_hash, checa expirado/used.
Marca token como used.
Atualiza sua tabela profiles: is_email_verified = true (WHERE id = user_id).
Opcional: também atualiza o Auth user metadata para refletir verificado (via Admin API usando SUPABASE_SERVICE_ROLE_KEY).
Cria sessão/login: você pode redirecionar para front com um login normal (usuário usa senha para autenticar), ou a Edge Function pode trocar token por sessão chamando endpoints Auth (mais trabalho).
RLS / lógica de aplicação:
Políticas e app bloqueiam ações sensíveis se profiles.is_email_verified = false.
Prós:
Total controle do envio (taxas, template, deliverability).
Sem depender de limites do mecanismo Auth.
Token customizável (expiração, tentativas, analytics).
Contras:
Você precisa implementar a troca token → sessão ou confiar no usuário fazer login.
Mais código e responsabilidade de segurança (token lifecycle).
Fluxo B — Gerar magic link com Admin API e enviar por Edge Function (reutiliza login do Supabase)

Objetivo: Permitir que o Supabase crie o magic link (sessão) mas você controla o envio via SendGrid.
Passos:
Usuário se registra (Auth): conta criada; email confirmation DESATIVADA para evitar envio automático.
Edge Function (rodando com SUPABASE_SERVICE_ROLE_KEY) solicita ao Admin Auth API que gere um magic link para o user/email:
Chamando o endpoint de Admin que gera link (ou "invite") — se disponível na versão da API.
Recebe o link (URL de login mágico que ao ser clicado cria sessão).
Edge Function envia o link por SendGrid.
Usuário clica no magic link:
Supabase Auth recebe o clique e cria a sessão automaticamente (como no fluxo normal de magic link).
Supabase Auth provavelmente marca email_confirmed_at (dependendo do endpoint chamado).
RLS / lógica:
Você pode usar auth.email_confirmed_at ou profiles.is_email_verified para permitir ações.
Prós:
Reusa comportamento de sessão do Supabase (login imediato pelo magic link).
Menos trabalho para trocar token por sessão.
Você só controla o envio (evita limites do envio do Auth).
Contras:
Depende dos endpoints Admin do Supabase estarem disponíveis para gerar link programaticamente.
Ainda precisa rodar com service_role key (ambiente protegido).
Menos flexível que o token custom, mas normalmente mais simples.
Comparativo rápido

Controle de envio: A e B — ambos permitem usar SendGrid e controlar taxa.
Facilidade de login (troca token → sessão): B é mais simples (magic link pronto). A exige implementar ou pedir ao usuário que faça login.
Segurança (controle de tokens/expiração): A dá mais opções.
Dependência de API Supabase Admin: somente B depende.
Exemplo de sequência técnica (Fluxo B — típico e recomendável se Admin API suportar gerar magic link)

Registrar usuário via client (ou criar por Admin):
User created in Auth.
Trigger (imediato ou por demanda) chama Edge Function /request-verify:
Input: email ou user_id.
Edge Function calls Supabase Admin endpoint to generate magic link (using SUPABASE_SERVICE_ROLE_KEY).
Edge Function sends e-mail via SendGrid with that link.
User clicks link:
Supabase Auth handles link, creates session and sets email_confirmed_at.
App uses auth session; RLS policies can check auth.jwt() claims or profiles.is_email_verified.
O que você precisa para implementar isso

Edge Functions habilitadas no projeto.
SUPABASE_SERVICE_ROLE_KEY disponível como secret na função.
Conta SendGrid (ou outro provedor) com API key nos secrets.
Tabela profiles com is_email_verified (opcional se você confiar em auth.email_confirmed_at).
RLS policies que verifiquem is_email_verified ou auth.email_confirmed_at.
Posso gerar agora:

Diagrama em texto passo-a-passo (mais visual), e/ou
Código pronto da Edge Function para:
B (chama Admin magic link + envia por SendGrid) — se quiser confirmar que sua versão do Auth Admin tem endpoint para gerar link; eu posso usar o padrão POST /auth/v1/admin/otp?type=magiclink (ou o endpoint apropriado após checar docs), ou
A (gera token custom + envia) — inclui SQL para criar tabela verification_tokens e atualizar profiles, e a função de verificação.
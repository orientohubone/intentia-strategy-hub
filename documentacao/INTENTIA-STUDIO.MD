Configurar studio.intentia.com.br no Lovable
Passo a passo
1. No Lovable
Abra o projeto no Lovable
Va em Project Settings (engrenagem) > Domains
Clique em Connect Domain
Digite: studio.intentia.com.br
O Lovable vai gerar os registros DNS necessarios (um valor TXT para verificacao)
2. No Registro.br
Acesse https://registro.br > Meus Dominios > intentia.com.br > DNS (ou "Editar zona") e adicione:

Tipo	Nome	Valor
A	studio	185.158.133.1
TXT	_lovable.studio	(valor que o Lovable fornecer na tela de setup)
Se voce tambem quiser que www.studio.intentia.com.br funcione, adicione:

Tipo	Nome	Valor
A	www.studio	185.158.133.1
3. Aguardar e publicar
A propagacao DNS pode levar ate 72 horas (normalmente menos de 1h no Registro.br)
O status no Lovable vai mudar: Verifying > Setting up (SSL automatico) > Active
Publique o projeto em Share > Publish para que fique acessivel no subdominio
Observacoes
O Registro.br usa interface propria de zona DNS -- nao precisa de painel externo (Cloudflare etc.)
Se voce ja usa DNS externo (ex: Cloudflare) para intentia.com.br, os registros devem ser criados la, nao no Registro.br
O SSL (https) e provisionado automaticamente pelo Lovable apos a verificacao
Nenhuma alteracao de codigo e necessaria no projeto
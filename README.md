# Lorent — E-commerce com backend e administração

Projeto 4 de 4: estrutura completa de catálogo, autenticação administrativa, PostgreSQL, gestão de produto e estoque, pedidos e checkout Mercado Pago.

## Contas de clientes, busca e sacola

O cadastro em `/cadastro` e o login em `/entrar` usam e-mail e senha no próprio site. As contas de clientes são separadas da administração. `/minha-conta` exige uma sessão válida e mostra apenas pedidos vinculados ao cliente autenticado. Pedidos antigos ou de visitantes não são vinculados automaticamente pelo e-mail.

As senhas são armazenadas como hashes pelo Better Auth. As sessões expiram em sete dias e usam cookies HttpOnly. As tentativas de autenticação são limitadas no PostgreSQL, inclusive entre instâncias do servidor.

A sacola permite alterar quantidades e marcar os produtos para compra. Visitantes guardam a sacola neste navegador; clientes também a sincronizam no banco. Ao entrar, os itens do visitante são incorporados sem somar duplicatas. Preços e estoque são conferidos no servidor e produtos sem preço não são vendidos como gratuitos. A busca ignora acentos e pesquisa nome, referência e descrição.

### Configurar autenticação

Defina `BETTER_AUTH_URL` com o endereço oficial da loja e `BETTER_AUTH_SECRET` com uma chave aleatória criptográfica de pelo menos 32 caracteres. Mantenha a chave somente nas variáveis protegidas da Vercel ou em `.env` local. Nunca a coloque no Git. Cadastro e login não dependem de OAuth ou credenciais do GitHub.

Recuperação de senha por e-mail e verificação de e-mail exigem um serviço de envio configurado; não estão habilitadas nesta implementação. Clientes autenticados podem alterar sua senha informando a senha atual.

### Atualizações do banco

`prisma/migrations` mantém uma migração inicial e uma atualização aditiva com contas, sessões, métodos de autenticação, limites de acesso e itens da sacola. Use `npm run db:migrate` em bancos novos antes do seed. Em um banco existente criado com o esquema inicial, registre primeiro a migração inicial com `npx prisma migrate resolve --applied 20261007000000_baseline`, depois execute `npm run db:migrate`. Não execute reset no banco de produção.

O Neon de produção da Lorent já recebeu essas duas migrações e seus registros em `_prisma_migrations`. Nesse banco, `npm run db:migrate` somente aplicará atualizações futuras.

## Catálogo inicial

O banco começa com 23 registros básicos (“Modelo 01” a “Modelo 23”), sem fotos, preços ou estoque presumido. No painel administrativo, basta informar o preço e o link acessível da foto para completar cada cadastro. A quantidade de estoque é opcional: se preenchida, passa a ser controlada no checkout.

## Stack

- Next.js 16, React 19, TypeScript e Tailwind CSS 4
- PostgreSQL e Prisma ORM
- Login administrativo com hash bcrypt e cookie HttpOnly assinado
- Mercado Pago para checkout e webhook de confirmação

## Rodar localmente

Requisitos: Node.js 22.18+ e npm.

```bash
npm install
cp .env.example .env
```

No Windows PowerShell, copie o arquivo com `Copy-Item .env.example .env`.

Configure `DATABASE_URL` e `ADMIN_SESSION_SECRET` em `.env`, depois execute:

```bash
npx prisma migrate dev
npm run db:seed
npm run dev
```

Acesse http://localhost:3000.

### Administração e pagamentos

1. Defina temporariamente `ADMIN_INITIAL_EMAIL` e `ADMIN_INITIAL_PASSWORD` e execute `npm run admin:create`; use uma senha com ao menos 12 caracteres e remova essas variáveis após criar o usuário.
2. Entre em `/admin` e preencha preço e link de foto nos produtos que a Lorent definiu. A quantidade de estoque pode permanecer sem controle até ser conhecida.
3. Para habilitar o checkout, configure `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET` e `NEXT_PUBLIC_SITE_URL` no ambiente de execução.
4. Antes de produção, use HTTPS e revise política de frete/devolução, limites de login, logs, backups e eventos do webhook.

## Próximos passos

Definir as fotos e preços com o cliente, configurar credenciais externas e validar a operação de produção.

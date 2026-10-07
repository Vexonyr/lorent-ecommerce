# Lorent — E-commerce com backend e administração

Projeto 4 de 4: estrutura completa de catálogo, autenticação administrativa, PostgreSQL, gestão de produto e estoque, pedidos e checkout Mercado Pago.

## Catálogo e edição de produtos

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

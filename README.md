# Lorent — E-commerce com arquitetura de produção, backend e administração

Projeto independente de estágio 4 para evolução da presença digital da Lorent. A identidade visual escura e editorial e as imagens dos 23 modelos foram derivadas do arquivo de catálogo de referência `CATALOGO_LORENT_SEM_VALORES.pdf`.

## O que existe nesta etapa

- Interface de catálogo e pedido.
- Esquema Prisma/PostgreSQL para produtos, usuários administrativos, estoque e pedidos.
- Login administrativo por senha com hash bcrypt e sessão assinada em cookie HttpOnly.
- APIs de catálogo, estoque, pedidos e checkout Mercado Pago com validação de assinatura do webhook.
- Estoque começa em zero e preços ficam em branco; venda bloqueada até cadastro aprovado e configuração de credenciais.

## Stack

- Next.js 16.3.8, React 19, TypeScript
- Tailwind CSS 4.3
- Prisma e PostgreSQL, Zod, bcryptjs e SDK Mercado Pago (dependências para a etapa completa).

## Como executar localmente

Requisitos: Node.js 22.18 ou superior e npm.

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Para gerar a versão de produção local, use `npm run build` e depois `npm run start`.

### Configuração do backend

1. Copie `.env.example` para `.env` e configure uma URL PostgreSQL e um segredo administrativo forte.
2. Execute `npx prisma migrate dev` para criar as tabelas e `npm run db:seed` para inserir os 23 modelos sem preço ou estoque presumido.
3. Crie um administrador definindo temporariamente `ADMIN_INITIAL_EMAIL` e `ADMIN_INITIAL_PASSWORD` no ambiente e executando `npm run admin:create`. A senha deve ter ao menos 12 caracteres; o banco guarda apenas o hash. Remova as duas variáveis após a execução.
4. Configure `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET` e URL pública do site em ambiente seguro. O checkout recusa produtos sem preço/estoque e cria uma preferência quando as credenciais estão disponíveis.
5. Revise os eventos de pagamento, configure HTTPS, limite de tentativas no login, logs e alertas antes de produção. Consulte `prisma/schema.prisma` e `src/app/api/` para os contratos iniciais.


## Próximos passos

Configurar o ambiente PostgreSQL e as credenciais Mercado Pago, preencher valores e estoque confirmados, definir frete, políticas de troca, e-mails transacionais e observabilidade antes da publicação.

## Fonte e limites dos dados

O PDF fornece imagens de produto, mas não nomes comerciais, descrições técnicas, preços, estoque, dimensões, materiais, garantias ou contatos. Por isso cada item aparece como “Modelo NN” e qualquer dado comercial deverá ser fornecido e aprovado pela Lorent antes de publicação. A página indicada em cada modelo é a posição da imagem no PDF de referência.


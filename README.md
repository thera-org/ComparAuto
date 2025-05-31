# ComparAuto

Plataforma para comparar preços de serviços automotivos.

## Como rodar localmente

1. Instale as dependências:

```bash
npm install
```

2. Configure as variáveis de ambiente:

Crie um arquivo `.env.local` na raiz com:

```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

3. Rode o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Deploy

Recomenda-se o deploy na [Vercel](https://vercel.com/). Basta importar o repositório e configurar as variáveis de ambiente.

## Tecnologias principais
- Next.js
- React
- TypeScript
- Supabase
- Tailwind CSS
- Radix UI

## Scripts úteis
- `npm run dev` — inicia o servidor de desenvolvimento
- `npm run build` — gera build de produção
- `npm run start` — inicia o servidor em produção
- `npm run lint` — executa o linter

## Contribuição
Pull requests são bem-vindos!

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

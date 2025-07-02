# ComparAuto 🚗

Uma plataforma moderna para comparar preços de serviços automotivos, conectando clientes a oficinas especializadas.

## ✨ Funcionalidades

- 🔍 **Busca Inteligente**: Encontre oficinas por localização e serviços
- 🗺️ **Visualização em Mapa**: Integração com Google Maps
- 👨‍💼 **Painel Administrativo**: Gestão completa de oficinas e usuários
- 🔐 **Autenticação Segura**: Sistema robusto com Supabase Auth
- 📱 **Responsivo**: Funciona perfeitamente em todos os dispositivos
- ⚡ **Performance**: Otimizado com Next.js 15 e React 19

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+ 
- npm/yarn/pnpm
- Conta no Supabase

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/comparauto.git
cd comparauto
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

4. **Edite o arquivo .env.local** com suas configurações:
```env
# Obrigatórias
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima

# Opcionais
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_google_maps
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_stripe
```

5. **Execute o projeto**
```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

6. **Acesse** http://localhost:3000

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

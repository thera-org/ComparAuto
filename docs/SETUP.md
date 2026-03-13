# 🛠️ Guia de Setup e Desenvolvimento - ComparAuto

Instruções detalhadas para configurar o ambiente de desenvolvimento local do ComparAuto.

## 📋 Sumário

- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Configuração do Supabase](#-configuração-do-supabase)
- [Executando o Projeto](#-executando-o-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Troubleshooting](#-troubleshooting)
- [IDE Setup](#-ide-setup)

---

#### ✅ Pré-requisitos

### Software Necessário

- **Node.js**: 18.0.0 ou superior
  - Download: https://nodejs.org/
  - Verificar: `node --version`

- **npm**: 8.0.0 ou superior (vem com Node.js)
  - Verificar: `npm --version`

- **Git**: Versão recente
  - Download: https://git-scm.com/
  - Verificar: `git --version`

- **IDE recomendado**: Visual Studio Code
  - Download: https://code.visualstudio.com/

### Contas Online

- **GitHub**: Para clonar repositórios
  - Signup: https://github.com/signup

- **Supabase**: Para banco de dados e autenticação
  - Signup: https://supabase.com (com conta GitHub)

- *(Opcional)* **Google OAuth**: Para login com Google
  - Console: https://console.cloud.google.com/

- *(Opcional)* **Stripe**: Para pagamentos
  - Signup: https://stripe.com/

---

## 📥 Instalação

### 1. Fork do Repositório

1. Acesse https://github.com/thera-org/ComparAuto
2. Clique em **Fork** no canto superior direito
3. Selecione sua conta pessoal

### 2. Clone seu Fork

```bash
# Substitua SEU_USUARIO pelo seu nome de usuário GitHub
git clone https://github.com/SEU_USUARIO/ComparAuto.git
cd ComparAuto
```

### 3. Adicione Upstream

```bash
# Para manter sincronizado com repo principal
git remote add upstream https://github.com/thera-org/ComparAuto.git

# Verifique
git remote -v
# Deve mostrar:
# origin    https://github.com/SEU_USUARIO/ComparAuto.git
# upstream  https://github.com/thera-org/ComparAuto.git
```

### 4. Instale Dependências

```bash
npm install
```

Isto vai instalar todas as dependências listadas em `package.json`.

### 5. Crie um arquivo .env.local

```bash
cp .env.example .env.local
```

O arquivo `.env.local` será criado. Não commit isto no Git (já está em `.gitignore`).

---

## 🔐 Variáveis de Ambiente

### Variáveis Obrigatórias

As seguintes variáveis **DEVEM** estar configuradas para que a aplicação funcione:

#### Supabase

```env
# URL do seu projeto Supabase
# Formato: https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co

# Chave anônima (pública) do Supabase
# Começa com 'eyJ'
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGc6IkhTMjU2In0...
```

### Variáveis Opcionais

Estas variáveis permitirão funcionalidades extras:

#### Stripe (Pagamentos)

```env
# Chave pública do Stripe (teste)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Chave secreta do Stripe (teste)
STRIPE_SECRET_KEY=sk_test_...
```

#### Facebook OAuth

```env
# Para login com Facebook
NEXT_PUBLIC_FACEBOOK_APP_ID=...
```

### Exemplo Completo

```env
# ============ OBRIGATÓRIO ============
NEXT_PUBLIC_SUPABASE_URL=https://xyzabc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

# ============ OPCIONAL ============
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51H...
STRIPE_SECRET_KEY=sk_test_4eC39HqL...
NEXT_PUBLIC_FACEBOOK_APP_ID=123456789
```

---

## 🔧 Configuração do Supabase

### Criando um Projeto no Supabase

1. **Acesse** https://app.supabase.com e faça login/signup
2. **Crie um novo projeto**:
   - Clique em "New Project"
   - Nome: "ComparAuto-dev" (ou similar)
   - Database password: Guarde com segurança
   - Region: Escolha a mais próxima
   - Aguarde o projeto ser criado (~2 minutos)

3. **Copie as credenciais**:
   - Vá em Project Settings → API
   - Copie `Project URL` para `NEXT_PUBLIC_SUPABASE_URL`
   - Copie `anon public` key para `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Cole em .env.local**

### Criando as Tabelas

1. **Acesse o SQL Editor** no Supabase
2. **Crie as tabelas necessárias**

```sql
-- Tabela de usuários (gerenciada por Auth)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  role text DEFAULT 'customer' CHECK (role IN ('customer', 'workshop', 'admin')),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Tabela de oficinas
CREATE TABLE workshops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  email text,
  phone text,
  latitude decimal,
  longitude decimal,
  address text,
  city text,
  state text,
  zip_code text,
  website text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Tabela de serviços
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id uuid NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text,
  base_price decimal,
  estimated_time_minutes integer,
  created_at timestamp DEFAULT now()
);

-- Tabela de avaliações
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id uuid NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp DEFAULT now()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
```

3. **Execute o SQL**

### Configurando Autenticação

1. **Acesse Authentication → Providers**
2. **Habilite Email Provider**:
   - Já vem habilitado por padrão
3. *(Opcional)* **Habilite Google OAuth**:
   - Clique em "Google"
   - Vá em https://console.cloud.google.com/
   - Crie novo projeto
   - Habilite API do Google
   - Crie credenciais OAuth
   - Cole Client ID e Client Secret no Supabase

---

## 🚀 Executando o Projeto

### Servidor de Desenvolvimento

```bash
npm run dev
```

Isto iniciará:
- Next.js dev server em `http://localhost:3000`
- Supabase realtime listeners
- Hot module reloading

Acesse: http://localhost:3000

### Build para Produção

```bash
npm run build
```

Gera otimizações de build e verifica erros.

### Iniciar Servidor de Produção

```bash
# Primeiro build
npm run build

# Depois inicie
npm run start
```

---

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor dev com hot reload
npm run build            # Cria build de produção
npm run start            # Inicia servidor em modo produção

# Qualidade de código
npm run lint             # Verifica problemas com ESLint
npm run lint:fix         # Corrige problemas automaticamente
npm run format           # Formata código com Prettier
npm run format:check     # Verifica formatação
npm run type-check       # Verifica tipos TypeScript

# Testing
npm run test             # Executa testes uma vez
npm run test:watch       # Modo watch (reexecuta ao salvar)
npm run test:coverage    # Gera relatório de cobertura

# Banco de dados
npm run db:generate      # Gera tipos do Supabase

# Análise
npm run analyze          # Analisa tamanho do bundle (Node 18+)

# Limpeza
npm run clean            # Remove diretórios de build
```

### Exemplos de Uso

```bash
# Desenvolvimento dia a dia
npm run dev              # Terminal 1
npm run lint:fix         # Terminal 2 (quando necessário)

# Antes de fazer commit
npm run lint:fix
npm run format
npm run type-check
npm run test

# Build final
npm run build
npm run start
```

---

## 🐛 Troubleshooting

### "Module not found" errors

```bash
# Limpe node_modules e reinstale
rm -rf node_modules package-lock.json
npm install
```

### "NEXT_PUBLIC_SUPABASE_URL is not defined"

- Verifique se `.env.local` existe na raiz do projeto
- Verifique se contém `NEXT_PUBLIC_SUPABASE_URL=...`
- Reinicie o servidor dev (`npm run dev`)

### Erro "Auth session missing"

Isto geralmente significa que Supabase não está configurado:

1. Verifique `.env.local`:
   ```bash
   grep NEXT_PUBLIC_SUPABASE ~/.env.local
   ```

2. Copie corretamente da URL e chave (sem espaços)

3. Teste a conexão:
   ```bash
   curl "https://[seu-projeto].supabase.co/rest/v1/" \
     -H "apikey: [sua-chave-anon]"
   ```

### "Port 3000 already in use"

```bash
# Mude a porta
npm run dev -- -p 3001

# Ou mate o processo na porta 3000
lsof -i :3000
kill -9 <PID>
```

### Problemas com MapLibre/Mapas

```bash
npm install maplibre-gl react-map-gl
```

### Erro ao fazer build

```bash
# Limpe cache de build
npm run clean
npm run build
```

---

## 🎨 IDE Setup

### VS Code (Recomendado)

#### Extensões Recomendadas

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",           // ESLint
    "esbenp.prettier-vscode",           // Prettier
    "ms-vscode.vscode-typescript-next", // TypeScript
    "bradlc.vscode-tailwindcss",        // Tailwind CSS
    "usernamehw.errorlens"              // Error Lens
  ]
}
```

Instale via: `code --install-extension [extension-id]`

#### Settings Recomendadas

`.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

#### Launch Config

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

### WebStorm / IntelliJ

1. File → Project Structure → Project
2. Set Node.js interpreter
3. Enable ESLint:
   - Settings > Languages & Frameworks > JavaScript > Linters > ESLint
4. Enable Prettier:
   - Settings > Languages & Frameworks > JavaScript > Prettier

---

## 📚 Próximos Passos

1. ✅ Setup completo? Comece um servidor com `npm run dev`
2. 📖 Leia [CONTRIBUTING.md](./CONTRIBUTING.md) para padrões
3. 📋 Leia [PADRONIZACAO.md](./PADRONIZACAO.md) para commits
4. 🏗️ Leia [ARCHITECTURE.md](./ARCHITECTURE.md) para arquitetura
5. 🐛 Procure por issues `good first issue` para começar
6. 💬 Dúvidas? Abra uma [Discussion](https://github.com/thera-org/ComparAuto/discussions)

---

## 🆘 Precisa de Ajuda?

- 💬 [GitHub Discussions](https://github.com/thera-org/ComparAuto/discussions)
- 🐛 [Issues](https://github.com/thera-org/ComparAuto/issues)
- 📧 Entre em contato direto com mantenedores

---

**Versão:** 1.0  
**Última atualização:** 5 de março de 2026

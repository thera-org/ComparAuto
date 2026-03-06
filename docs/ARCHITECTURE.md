# 🏗️ Arquitetura - ComparAuto

Documentação das decisões arquiteturais, padrões de design e estrutura geral do projeto ComparAuto.

## 📑 Sumário

- [Visão Geral](#-visão-geral)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitetura Geral](#-arquitetura-geral)
- [Estrutura de Diretórios](#-estrutura-de-diretórios)
- [Padrões de Design](#-padrões-de-design)
- [Data Flow](#-data-flow)
- [Autenticação](#-autenticação)
- [Banco de Dados](#-banco-de-dados)
- [API Routes](#-api-routes)
- [Componentes e Hooks](#-componentes-e-hooks)
- [Decisões Arquiteturais](#-decisões-arquiteturais)

---

## 🎯 Visão Geral

ComparAuto é uma plataforma moderna para comparação de preços de serviços automotivos. A aplicação conecta:

- **Clientes**: Buscam serviços automotivos
- **Oficinas**: Oferecem serviços e gerenciam agendamentos
- **Administradores**: Gerenciam usuários e conteúdo

### Objetivos Arquiteturais

1. **Escalabilidade**: Suportar crescimento de usuários e dados
2. **Manutenibilidade**: Código limpo, testável e bem documentado
3. **Segurança**: Proteger dados de usuários e transações
4. **Performance**: Carregamento rápido e experiência fluida
5. **Flexibilidade**: Facilitar adição de novas features

---

## 💻 Stack Tecnológico

### Frontend

| Tecnologia | Versão | Motivo |
|------------|--------|--------|
| **Next.js** | 15 | SSR/SSG, App Router, performance |
| **React** | 19 | UI components, reuse de código |
| **TypeScript** | 5+ | Type safety, melhor DX |
| **Tailwind CSS** | 4+ | Utility-first CSS, rapid development |
| **Radix UI** | Última | Accessible components |
| **MapLibre GL** | 4+ | Mapas interativos |

### Backend

| Tecnologia | Motivo |
|------------|--------|
| **Supabase** | PostgreSQL gerenciado, Auth, Real-time |
| **Next.js API Routes** | Serverless, fácil deployment |
| **PostgreSQL** | Banco relacional robusto |

### Devops & Testing

| Tecnologia | Motivo |
|------------|--------|
| **Vercel** | Hosting otimizado para Next.js |
| **GitHub Actions** | CI/CD automatizado |
| **Jest** | Testing framework robusto |
| **ESLint + Prettier** | Code quality e formatting |

---

## 🎨 Arquitetura Geral

```
┌─────────────────────────────────────────┐
│           Frontend (Next.js)            │
│  ┌────────────────────────────────────┐ │
│  │      React Components & Hooks      │ │
│  │  (UI, Contexts, Custom Hooks)      │ │
│  └──────────────────┬─────────────────┘ │
│                     │                     │
└─────────────────────┼─────────────────────┘
                      │
                  (fetch/RPC)
                      │
         ┌────────────┴────────────┐
         │                         │
    ┌────▼─────┐          ┌───────▼──────┐
    │  API     │          │   Supabase   │
    │ Routes   │          │   (PostgreSQL)
    │(Next.js) │          │   & Auth      │
    └──────────┘          └───────────────┘
         │                         │
         └────────────┬────────────┘
                      │
              ┌───────▼──────┐
              │  PostgreSQL  │
              │   Database   │
              └──────────────┘
```

### Camadas

#### 1. **Presentation Layer** (Frontend)
- Componentes React
- Pages (App Router)
- Contextos e hooks

#### 2. **API Layer**
- Next.js API Routes
- Business logic
- Validação de dados

#### 3. **Data Layer**
- Supabase cliente
- PostgreSQL
- Cache

---

## 📁 Estrutura de Diretórios

```
src/
├── app/                          # App Router (Next.js 15)
│   ├── layout.tsx               # Layout raiz
│   ├── page.tsx                 # Página home
│   ├── globals.css              # Estilos globais
│   ├── api/                     # API routes
│   │   ├── admin/               # APIs administrativas
│   │   ├── auth/                # APIs de autenticação
│   │   └── ...
│   ├── admin/                   # Rotas protegidas (admin)
│   │   ├── layout.tsx           # Layout admin
│   │   ├── page.tsx             # Dashboard
│   │   ├── usuarios/            # Gerenciamento de usuários
│   │   ├── oficinas/            # Gerenciamento de oficinas
│   │   └── ...
│   ├── auth/                    # Rotas de autenticação
│   │   ├── login/               # Login
│   │   ├── signup/              # Registro
│   │   └── ...
│   └── ...
│
├── components/                  # Componentes reutilizáveis
│   ├── ui/                      # Componentes de UI base (Radix)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   └── ...
│   ├── maps/                    # Componentes de mapa
│   │   ├── BaseMap.tsx
│   │   ├── LocationPicker.tsx
│   │   └── WorkshopMapLeaflet.tsx
│   ├── Header.tsx               # Header global
│   ├── Footer.tsx               # Footer global
│   ├── AdminLayout.tsx          # Layout admin
│   ├── LoadingSpinner.tsx       # Loading state
│   ├── __tests__/               # Testes de componentes
│   │   ├── LoadingSpinner.test.tsx
│   │   └── ...
│   └── ...
│
├── contexts/                    # React Contexts
│   ├── AuthContext.tsx          # Autenticação global
│   └── NotificationContext.tsx  # Notificações global
│
├── hooks/                       # Custom hooks
│   ├── useAuth.ts              # Hook de autenticação
│   ├── useAppNotifications.ts  # Hook de notificações
│   ├── useEnvironmentCheck.ts  # Check de env vars
│   ├── useIsMobile.ts          # Detec responsividade
│   └── ...
│
├── lib/                         # Utilitários e serviços
│   ├── supabase.ts             # Cliente Supabase
│   ├── data-service.ts         # Serviço de dados
│   ├── utils.ts                # Funções utilitárias
│   ├── validations.ts          # Schemas de validação
│   ├── errors.ts               # Classes de erro
│   ├── storage.ts              # Local storage utils
│   ├── performance.ts          # Performance monitoring
│   └── test-utils.tsx          # Utilitários de teste
│
├── types/                       # Types TypeScript
│   ├── user.ts                 # Types de usuário
│   ├── supabase.ts             # Types gerados
│   └── ...
│
└── __tests__/                   # Testes integração
    └── integration.test.ts
```

---

## 🎭 Padrões de Design

### 1. **Container/Presentational Pattern**

```typescript
// Container component (lógica)
export const UserListContainer: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUsers().then(setUsers).finally(() => setLoading(false));
  }, []);
  
  return <UserListPresentation users={users} loading={loading} />;
};

// Presentational component (apenas renderiza)
interface UserListProps {
  users: User[];
  loading: boolean;
}

const UserListPresentation: React.FC<UserListProps> = ({ users, loading }) => {
  if (loading) return <LoadingSpinner />;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
};
```

### 2. **Custom Hooks Pattern**

Extrair lógica complexa em hooks customize:

```typescript
// Hook customizado
function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    checkAuth().then(setUser).finally(() => setLoading(false));
  }, []);
  
  return { user, loading };
}

// Usar em componentes
function Dashboard() {
  const { user, loading } = useAuth();
  // ...
}
```

### 3. **Context for Global State**

```typescript
// Criar Context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Sync auth state
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook para usar
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve estar dentro de AuthProvider');
  return context;
}
```

### 4. **API Service Pattern**

```typescript
// Serviço centralizado
export const userService = {
  async getUser(id: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new AppError('Erro ao buscar usuário', error);
    return data;
  },
  
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new AppError('Erro ao atualizar usuário', error);
    return data;
  }
};

// Usar em componentes
function UserProfile({ userId }: Props) {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    userService.getUser(userId).then(setUser);
  }, [userId]);
}
```

---

## 🔄 Data Flow

### Fluxo de Dados Típico

```
User Interaction
     ↓
 Component Handler
     ↓
 API Service Call / Supabase
     ↓
 Backend Validation
     ↓
 Database Operation
     ↓
 Response Processing
     ↓
 State Update (useState/Context)
     ↓
 Component Re-render
```

### Exemplo Prático

```typescript
// 1. Componente
<Button onClick={handleDelete}>Delete</Button>

// 2. Handler
const handleDelete = async () => {
  try {
    setLoading(true);
    
    // 3. Service call
    await userService.deleteUser(userId);
    
    // 4. Update context
    updateAuthState();
    
    // 5. Show success
    notify.success('Usuário deletado');
  } catch (error) {
    notify.error(error.message);
  } finally {
    setLoading(false);
  }
};
```

---

## 🔐 Autenticação

### Fluxo de Autenticação

```
Login/Signup
    ↓
Supabase Auth
    ↓
Token gerado + Stored em localStorage
    ↓
AuthContext atualizado
    ↓
Redirect para dashboard
    ↓
Middleware verifica auth em protected routes
```

### AuthContext

```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp(email: string, password: string): Promise<void>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check auth on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      // Fetch user data if needed
    }).finally(() => setLoading(false));
  }, []);
  
  // signUp, signIn, signOut implementations
  
  return (
    <AuthContext.Provider value={{ user, session, loading, ... }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Proteção de Rotas

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*']
};
```

---

## 🗄️ Banco de Dados

### Schema Principal

```sql
-- Usuários
CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  role text CHECK (role IN ('customer', 'workshop', 'admin')),
  created_at timestamp DEFAULT now()
);

-- Oficinas
CREATE TABLE workshops (
  id uuid PRIMARY KEY,
  owner_id uuid REFERENCES users(id),
  name text NOT NULL,
  location point,
  email text,
  phone text,
  created_at timestamp DEFAULT now()
);

-- Serviços
CREATE TABLE services (
  id uuid PRIMARY KEY,
  workshop_id uuid REFERENCES workshops(id),
  name text NOT NULL,
  description text,
  price decimal,
  created_at timestamp DEFAULT now()
);

-- Agendamentos
CREATE TABLE appointments (
  id uuid PRIMARY KEY,
  customer_id uuid REFERENCES users(id),
  workshop_id uuid REFERENCES workshops(id),
  service_id uuid REFERENCES services(id),
  date timestamp NOT NULL,
  status text CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamp DEFAULT now()
);
```

### RLS (Row Level Security)

```sql
-- Exemplo: Usuários só podem ver suas próprias informações
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

---

## 🌐 API Routes

### Estrutura de API Routes

```
src/app/api/
├── auth/
│   ├── login/route.ts
│   ├── signup/route.ts
│   └── logout/route.ts
├── admin/
│   ├── users/route.ts
│   ├── workshops/route.ts
│   └── ...
├── workshops/
│   ├── [id]/route.ts
│   └── route.ts
└── healthcheck/route.ts
```

### Padrão de API Route

```typescript
// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Validar autenticação
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }
    
    // Buscar dados
    const users = await userService.getAllUsers();
    
    return NextResponse.json({ data: users });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validar entrada
    const validated = userSchema.parse(body);
    
    // Processar
    const user = await userService.createUser(validated);
    
    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validação falhou', details: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

---

## ⚛️ Componentes e Hooks

### Estrutura de Componente

```typescript
import React, { useState, useEffect } from 'react';
import type { FC, ReactNode } from 'react';

interface ComponentProps {
  title: string;
  children?: ReactNode;
  onAction?: () => void;
}

/**
 * Descrição clara do componente
 * @param title - O título a exibir
 * @param children - Conteúdo filho
 * @param onAction - Callback quando ação acontece
 */
export const MyComponent: FC<ComponentProps> = ({
  title,
  children,
  onAction
}) => {
  const [state, setState] = useState<StateType>(initialValue);
  
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  const handleClick = () => {
    onAction?.();
  };
  
  return (
    <div className="...">
      <h1>{title}</h1>
      <button onClick={handleClick}>Action</button>
      {children}
    </div>
  );
};

export default MyComponent;
```

### Custom Hooks

```typescript
interface UseDataReturn {
  data: DataType | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useData(id: string): UseDataReturn {
  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiService.getData(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { data, loading, error, refetch: fetchData };
}
```

---

## 🏛️ Decisões Arquiteturais

### ADR-001: Next.js 15 com App Router

**Status:** Aceito

**Contexto:** Precisávamos de um framework React com SSR, SSG e suporte a API builtin.

**Decisão:** Usamos Next.js 15 com o novo App Router.

**Consequências:**
- ✅ SSR/SSG built-in
- ✅ API routes no mesmo projeto
- ✅ Performance otimizada
- ⚠️ Curva de aprendizado para App Router
- ⚠️ Mudanças frequentes no Next.js

---

### ADR-002: Supabase para Backend

**Status:** Aceito

**Contexto:** Precisávamos de um backend que oferecesse autenticação, banco de dados e real-time.

**Decisão:** Usar Supabase (PostgreSQL managed + Auth).

**Consequências:**
- ✅ Rápido setup
- ✅ Autenticação integrada
- ✅ Real-time capabilities
- ✅ Open source
- ⚠️ Vendor lock-in
- ⚠️ Limitações de queries complexas

---

### ADR-003: Tailwind CSS + Radix UI

**Status:** Aceito

**Contexto:** Precisávamos de um sistema de design escalável e acessível.

**Decisão:** Usar Tailwind CSS para styling e Radix UI para componentes.

**Consequências:**
- ✅ Acessibilidade garantida
- ✅ Desenvolvimento rápido
- ✅ Customização fácil
- ⚠️ Bundle size maior
- ⚠️ CSS em classe

---

## 📞 Contato

Dúvidas sobre arquitetura? Abra uma [Discussion](https://github.com/thera-org/ComparAuto/discussions).

---

**Versão:** 1.0  
**Última atualização:** 5 de março de 2026

# 📚 Guia de Padronização - ComparAuto

Bem-vindo ao documento de padronização do projeto **ComparAuto**! Este documento funciona como um guia norteador para garantir consistência, qualidade e colaboração eficiente em todo o projeto.

## 📑 Índice

1. [Convenção de Commits](#-convenção-de-commits)
2. [Padrões de Código](#-padrões-de-código)
3. [Estrutura do Projeto](#-estrutura-do-projeto)
4. [Nomenclatura](#-nomenclatura)
5. [Branches](#-branches)
6. [Pull Requests](#-pull-requests)
7. [Code Review](#-code-review)
8. [Testing](#-testing)
9. [Documentação](#-documentação)
10. [Performance](#-performance)

---

## 🔄 Convenção de Commits

Utilizamos uma versão simplificada do **Conventional Commits** adaptada para o projeto, com **suporte a português**. Todos os commits devem seguir este padrão:

### Formato

```
<tipo>(<escopo>): <assunto>

<corpo>

<rodapé>
```

### Tipos Permitidos

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| **feat** | Nova funcionalidade | `feat(auth): adicionar login com Google` |
| **fix** | Correção de bug | `fix(maps): corrigir erro ao carregar mapa` |
| **style** | Formatação, sem mudança de lógica | `style(components): ajustar indentação` |
| **refactor** | Refatoração de código | `refactor(api): simplificar lógica de busca` |
| **perf** | Melhoria de performance | `perf(dashboard): otimizar queries do banco` |
| **test** | Adicionar/atualizar testes | `test(auth): adicionar teste de login` |
| **docs** | Documentação | `docs: atualizar README` |
| **chore** | Atualizações de dependências, configuração | `chore: atualizar Next.js para v15` |
| **ci** | Alterações em CI/CD | `ci: adicionar step de coverage no workflow` |

### Escopo (Opcional)

O escopo deve representar a área afetada pelo commit:

- `auth` - Autenticação e segurança
- `api` - APIs e endpoints
- `maps` - Funcionalidades de mapa
- `admin` - Painel administrativo
- `components` - Componentes React
- `styles` - Estilos e temas
- `db` - Banco de dados e migrations
- `config` - Configuração do projeto
- `ci` - CI/CD
- `docs` - Documentação

### Assunto

- Use o **imperativo** ("adicionar" em vez de "adicionado" ou "adiciona")
- Não deixe em maiúschulas no início
- Máximo de **50 caracteres**
- Não termine com ponto

### Corpo

- Use o imperativo
- Explique O QUE foi mudado e POR QUE (não COMO)
- Limite a **72 caracteres por linha**
- Separado do assunto por uma linha em branco

### Rodapé

```
Closes #123
Breaking-Change: descrição da mudança quebradora
Refs #456
```

### Exemplos Corretos

```
feat(auth): implementar autenticação com Supabase

Adicionado sistema de login usando Supabase Auth com persistência
no localStorage. Implementado AuthContext para gerenciar estado
de autenticação globalmente.

Closes #42
```

```
fix(maps): corrigir erro de carregamento do mapa

O mapa não carregava quando o usuário estava offline. Agora
verifica a conexão antes de tentar carregar e mostra fallback.

Refs #89
```

```
style: aplicar prettier ao diretório de componentes

---

refactor(api): simplificar função de busca de oficinas

Extração de lógica de filtragem para função separada e
removido parâmetros desnecessários.
```

### Dicas

✅ **Faça:**
- Commits pequenos e focados em uma única mudança
- Commits frequentes durante o desenvolvimento
- Mensagens descritivas e úteis

❌ **Evite:**
- Commits genéricos como "ajustado", "correção", "teste"
- Múltipolas mudanças não relacionadas em um commit
- Commits com mensagens em CAPS LOCK
- Misturar português e inglês na mesma mensagem

---

## 🎨 Padrões de Código

### TypeScript

- Use `strict: true` em `tsconfig.json`
- Sempre defina tipos explícitos para funções
- Prefira `interface` para objetos, `type` para unions
- Evite `any` - sempre especifique o tipo

```typescript
// ❌ Ruim
function getData(id) {
  const data = fetchUser(id);
  return data;
}

// ✅ Bom
function getUser(id: string): Promise<User> {
  const user = await fetchUser(id);
  return user;
}
```

### React / JSX

- Use **componentes funcionais** com hooks
- Nomeie componentes com **PascalCase**
- Use `React.FC<Props>` para tipagem
- Desestruture props sempre que possível

```typescript
// ✅ Padrão
interface UserCardProps {
  user: User;
  onDelete?: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onDelete }) => {
  return (
    <div className="card">
      <h3>{user.name}</h3>
      {onDelete && <button onClick={onDelete}>Deletar</button>}
    </div>
  );
};
```

### CSS/Tailwind

- Use `@apply` para componentes reutilizáveis
- Mantenha a hierarquia lógica de estilos
- Evite inline styles, prefira classes

```typescript
// ✅ Padrão em globals.css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700;
  }
}

// No componente
<button className="btn-primary">Click me</button>
```

---

## 📁 Estrutura do Projeto

```
src/
├── app/                 # App Router (Next.js 15)
│   ├── layout.tsx      # Layout principal
│   ├── page.tsx        # Home page
│   ├── api/            # API routes
│   ├── admin/          # Rotas protegidas (admin)
│   ├── auth/           # Rotas de autenticação
│   └── ...
├── components/          # Componentes React reutilizáveis
│   ├── ui/             # Componentes de UI (Radix)
│   ├── maps/           # Componentes de mapa
│   ├── __tests__/      # Testes de componentes
│   └── ...
├── contexts/           # React Contexts
│   ├── AuthContext.tsx
│   └── NotificationContext.tsx
├── hooks/              # Custom hooks
│   ├── useAppNotifications.ts
│   └── ...
├── lib/                # Utilidades e serviços
│   ├── supabase.ts
│   ├── data-service.ts
│   ├── utils.ts
│   └── ...
├── types/              # Tipos TypeScript
│   ├── user.ts
│   └── ...
└── styles/             # Estilos globais
```

### Regras de Organização

- **1 componente por arquivo**
- Arquivo de teste adjacente ao arquivo testado
- Imports relativos dentro da pasta, absolutos para fora
- Agrupar imports: React → libs externas → relativas

```typescript
// ✅ Padrão de imports
import React from 'react';
import { useRouter } from 'next/navigation';
import { UserCard } from '../components/UserCard';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from '../lib/constants';
```

---

## 🏷️ Nomenclatura

### Variáveis e Funções

Use **camelCase**:

```typescript
// ❌
const user_name = 'João';
const fetch_data = () => {};

// ✅
const userName = 'João';
const fetchData = () => {};
```

### Constantes

Use **UPPER_SNAKE_CASE**:

```typescript
// ✅
const MAX_RETRIES = 3;
const API_BASE_URL = 'https://api.example.com';
```

### Componentes

Use **PascalCase**:

```typescript
// ✅
export const UserProfile = () => {};
export const AdminDashboard = () => {};
const HeaderComponent = () => {}; // mesmo privados
```

### Arquivos

Use **kebab-case** para arquivos normais, **PascalCase** para componentes:

```
src/
├── components/
│   ├── UserProfile.tsx        # ✅ Componente
│   ├── user-profile.test.tsx  # ✅ Teste
├── hooks/
│   └── use-auth.ts            # ✅ Hook
├── lib/
│   └── data-service.ts        # ✅ Serviço
```

### IDs no HTML

Use **kebab-case**:

```tsx
// ✅
<button id="submit-button" aria-label="enviar-formulário">
  Enviar
</button>
```

---

## 🌳 Branches

### Nomenclatura

Use o padrão: `tipo/descrição`

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| **feature** | Nova funcionalidade | `feature/authentication-google` |
| **bugfix** | Correção de bug | `bugfix/auth-session-timeout` |
| **hotfix** | Corrção urgente em produção | `hotfix/payment-processing-error` |
| **docs** | Documentação | `docs/api-reference` |
| **refactor** | Refatoração | `refactor/user-service` |
| **test** | Testes | `test/auth-coverage` |

### Fluxo de Branches

```
main (produção)
  ↑
  └── develop (staging)
       ↑
       ├── feature/user-auth
       ├── feature/maps-integration
       └── bugfix/login-error
```

### Regras

- Sempre crie a feature branch a partir de `develop`
- Nunca commite diretamente em `main` ou `develop`
- Delete branches após merge
- Use kebab-case com hífens

---

## 🔄 Pull Requests

### Nomeação

Siga o padrão de commits na PR:

```
feat(auth): implementar login com Google

[Descrição completa usando o template de PR]
```

### Checklist Obrigatório

Toda PR deve ter:

- [ ] Título descritivo
- [ ] Descrição clara das mudanças
- [ ] Link para issue relacionada (`Closes #X`)
- [ ] Testes adicionados/atualizados
- [ ] Tudo passando (`lint`, `type-check`, `test`)

### Boas Práticas

✅ **Faça:**
- Pequenas PRs focadas (máximo 400 linhas)
- PRs atômicas que podem ser revertidas
- Referências a issues
- Screenshots para mudanças visuais

❌ **Evite:**
- PRs gigantes com múltiplas mudanças
- Commits mesclados/squashed antes do review
- Resolver discussões sem responder
- Ignorar comentários de review

---

## 👀 Code Review

### Para Submeter uma PR

1. Certifique-se de que:
   - Código segue padrões estabelecidos
   - Testes cobrem as mudanças
   - Mensagens de commit são descritivas
   - Sem console.logs ou código comentado

2. Marque para review quando pronto
3. Responda a comentários de forma profissional
4. Faça push de mudanças como novos commits (não corrija história)

### Para Fazer Code Review

Foque em:

- **Qualidade**: O código é limpo, legível?
- **Segurança**: Existem brechas de segurança?
- **Performance**: Pode impactar performance?
- **Testes**: A cobertura é adequada?
- **Documentação**: Está documentado?

Seja construtivo e educacional. Use:

```
// Bom comentário
Este método poderia usar um Map em vez de lodash forEach
para melhor performance com grandes arrays. Veja: [link]
```

---

## 🧪 Testing

### Estrutura

```typescript
describe('UserCard', () => {
  it('deveria renderizar nome do usuário', () => {
    // Arrange
    const user = { id: '1', name: 'João' };
    
    // Act
    render(<UserCard user={user} />);
    
    // Assert
    expect(screen.getByText('João')).toBeInTheDocument();
  });
});
```

### Cobertura Mínima

- **Components**: 80% (focus em funcionalidade)
- **Utils**: 90% (bem simples testar)
- **Hooks**: 85% (comportamentos principais)

### Executar Testes

```bash
npm run test              # Executar testes
npm run test:watch       # Modo watch
npm run test:coverage    # Com cobertura
```

---

## 📚 Documentação

### README.md

Deve conter:
- Descrição do projeto
- Features principais
- Como instalar/executar
- Estrutura de diretórios
- Scripts disponíveis
- Como contribuir

### Comentários no Código

✅ **Quando comentar:**
- Lógica complexa ou pouco óbvia
- Razão por trás de uma decisão técnica
- TODOs ou FIXMEs

```typescript
// ✅ Bom
// Usa busca binária em vez de filter() para
// melhor performance em arrays grandes (O(log n))
function binarySearch(arr: number[], target: number): number {
  // implementação...
}
```

❌ **Não comentar:**
- Código óbvio que fala por si
- Comentários repetindo o código

```typescript
// ❌ Ruim
// Incrementa contador
counter++;

// ✅ Apenas o código já é suficiente
counter++;
```

### Docs Estruturados

Para documentação extensa, use a pasta `docs/`:

- `docs/SETUP.md` - Setup e configuração
- `docs/ARCHITECTURE.md` - Decisões de arquitetura
- `docs/APIs.md` - Documentação de APIs
- `docs/DATABASE.md` - Schema do banco

---

## ⚡ Performance

### Checklist

- [ ] Sem N+1 queries no banco
- [ ] Componentes rerender minimizados (use `useMemo`, `useCallback`)
- [ ] Imagens otimizadas (Next.js Image)
- [ ] Code splitting implementado
- [ ] Bundle size monitorizado

### Exemplos

```typescript
// ❌ Rerender desnecessário
function UserList() {
  const handleClick = () => doSomething(); // Novo objeto a cada render!
  return <List onClick={handleClick} />;
}

// ✅ Memoizado
function UserList() {
  const handleClick = useCallback(() => doSomething(), []);
  return <List onClick={handleClick} />;
}
```

```typescript
// ❌ Fetch sem otimização
function UserProfile() {
  const [user] = useState(null);
  useEffect(() => {
    fetchUser(); // Sempre busca!
  });
  return <div>{user?.name}</div>;
}

// ✅ Com dependências
function UserProfile({ userId }) {
  const [user] = useState(null);
  useEffect(() => {
    fetchUser(userId);
  }, [userId]); // Só busca quando userId muda
  return <div>{user?.name}</div>;
}
```

---

## 🚀 CI/CD

### Antes de Fazer Push

```bash
npm run lint:fix       # Fixar linting issues
npm run format         # Formatar código
npm run type-check     # Checar tipos TypeScript
npm run test           # Executar testes
npm run build          # Fazer build
```

### Workflow de CI

O GitHub Actions automticamente executa:

1. Linting (ESLint)
2. Type checking (TypeScript)
3. Tests (Jest)
4. Build (Next.js)

Se algum step falhar, a PR não pode ser mesclada.

---

## 📋 Checklist de Submissão

Antes de fazer commit/push:

- [ ] Código segue padrões de nomenclatura
- [ ] Mensagem de commit é descritiva
- [ ] Sem console.logs, debuggers
- [ ] Sem code commented
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Scripts executados localmente

Antes de submeter PR:

- [ ] Branch atualizado com develop
- [ ] Sem conflitos de merge
- [ ] Teste local completo executado
- [ ] Build local bem-sucedido
- [ ] Descrição e checklist preenchidos

---

## 📞 Contato e Dúvidas

- Dúvidas gerais? Abra uma [Discussion](https://github.com/thera-org/ComparAuto/discussions)
- Encontrou um problema neste guide? [Abra uma issue](https://github.com/thera-org/ComparAuto/issues)
- Quer sugerir mudanças? Faça um PR!

---

**Última atualização:** 5 de março de 2026

**Versão:** 1.0

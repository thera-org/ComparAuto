# ❓ FAQ - Perguntas Frequentes - ComparAuto

Respostas para perguntas comuns sobre desenvolvimento, setup e contribuição no ComparAuto.

## 📑 Categorias

- [Setup e Instalação](#-setup-e-instalação)
- [Desenvolvimento](#-desenvolvimento)
- [Git e Commits](#-git-e-commits)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Problemas Comuns](#-problemas-comuns)

---

## 🔧 Setup e Instalação

### P: Qual versão de Node.js preciso?

**R:** Node.js 18.0.0 ou superior. Verifique com:

```bash
node --version
```

Se estiver abaixo de 18, instale uma versão mais recente de https://nodejs.org/

### P: Como atualizar npm?

**R:**

```bash
npm install -g npm@latest
```

### P: Posso usar yarn ou pnpm em vez de npm?

**R:** Sim! O projeto suporta qualquer gerenciador de pacotes. Porém, mantenha consistência: não misture `npm install`, `yarn install` e `pnpm install` no mesmo projeto.

Escolha um:
```bash
npm install      # npm
yarn install     # yarn
pnpm install     # pnpm
```

### P: Preciso criar conta no Supabase?

**R:** Sim, para desenvolvimento local. É gratuito!

1. Acesse https://supabase.com
2. Faça login com GitHub
3. Crie novo projeto
4. Copie URL e chave anônima

### P: Já tenho seu banco de dados anterior, como migro?

**R:** Consulte [ARCHITECTURE.md](./ARCHITECTURE.md#-banco-de-dados) para schema. Para migração de dados:

1. Exporte dados do banco anterior
2. Crie script de insert em Supabase SQL Editor
3. Ou use `pgsql_bulk_load_csv` se tiver CSV

---

## 💻 Desenvolvimento

### P: Qual editor devo usar?

**R:** Recomendamos **VS Code** com extensões:
- ESLint
- Prettier
- TypeScript
- Tailwind CSS Intellisense

Consulte [SETUP.md - IDE Setup](./SETUP.md#-ide-setup) para configuração detalhada.

### P: Como faço linting e formatting?

**R:**

```bash
# Ver problemas
npm run lint

# Corrigir automaticamente
npm run lint:fix

# Formatar código
npm run format
```

**Dica:** Configure seu editor para fazer isso automaticamente ao salvar.

### P: Encontrei um erro de tipo TypeScript, como resolver?

**R:**

```bash
npm run type-check
```

Isto mostra todos os erros de tipo. Use o editor para ir até o erro específico.

### P: Como adiciono uma nova dependência?

**R:**

```bash
npm install nome-do-pacote
```

**Para dependências de desenvolvimento:**

```bash
npm install --save-dev nome-do-pacote-dev
```

### P: Posso usar bibliotecas X, Y, Z?

**R:** Antes de adicionar nova dependência:

1. Verifique se já existe algo similar
2. Considere o tamanho do bundle
3. Discuta em uma Issue ou Discussion
4. Geralmente OK: utilidades, componentes, validação
5. A evitar: duplicatas, tamanho grande, desconhecidas

### P: Como organizo arquivos de teste?

**R:** Teste adjacente ao arquivo testado:

```
src/
├── components/
│   ├── UserCard.tsx
│   └── UserCard.test.tsx      # ✅ Aqui!
│
├── hooks/
│   ├── useAuth.ts
│   └── useAuth.test.ts         # ✅ Aqui!
│
└── __tests__/
    └── integration.test.ts     # Para testes integração
```

### P: Preciso de fixtures ou dados mock?

**R:** Sim! Crie um arquivo `__mocks__` ou use factories:

```typescript
// src/lib/__mocks__/data.ts
export const mockUser = {
  id: '123',
  name: 'João',
  email: 'joao@example.com'
};

// Ou use Factory Pattern
export function createMockUser(overrides = {}) {
  return {
    id: '123',
    name: 'João',
    email: 'joao@example.com',
    ...overrides
  };
}

// Usar em teste
const testUser = createMockUser({ name: 'Maria' });
```

---

## 🔀 Git e Commits

### P: Como nameo minha branch?

**R:** Use padrão `tipo/descricao` em kebab-case:

```
feature/autenticacao-google    ✅
bugfix/erro-login              ✅
refactor/user-service          ✅
docs/setup-guide               ✅

my_feature                      ❌
feat/Auth                       ❌ (use lowercase)
branchMuitoGrande              ❌ (use hífens, não camelCase)
```

Consulte [PADRONIZACAO.md - Branches](./PADRONIZACAO.md#-branches) para lista completa.

### P: Como escrevo mensagem de commit boa?

**R:** Use formato: `tipo(escopo): assunto`

```
feature(auth): implementar login com Google      ✅
fix(maps): corrigir erro ao carregar mapa        ✅
docs: atualizar README                           ✅
style(components): ajustar indentação            ✅

ajustado                                         ❌
Feature - Adicionar novo componente             ❌
FIX BUG                                          ❌
```

Consulte [PADRONIZACAO.md - Convenção de Commits](./PADRONIZACAO.md#-convenção-de-commits) para detalhes.

### P: Errei a mensagem de commit, como corrijo?

**R:** Para último commit:

```bash
git commit --amend
```

Isto abre editor para corrigir. Se já fez push, você pode forçar (evite em colaboração):

```bash
git push --force-with-lease origin sua-branch
```

### P: Como sincronizo meu fork com principal?

**R:**

```bash
git fetch upstream
git rebase upstream/develop
git push origin develop
```

Ou via interface GitHub: "Sync fork" botão.

### P: Cometi erro num commit passado, como reverso?

**R:** Para último commit (não feito push):

```bash
git reset --soft HEAD~1
```

Para reverso um commit feito push (cria novo commit):

```bash
git revert <commit-hash>
```

### P: Como squash múltiplos commits?

**R:** Se ainda não fez push:

```bash
git rebase -i HEAD~3  # Rebase últimos 3 commits
```

Mude `pick` para `squash` nos que quer squashar. Se já fez push, melhor deixar assim ou use `git revert`.

---

## 🧪 Testing

### P: Como executo testes?

**R:**

```bash
npm run test          # Uma vez
npm run test:watch    # Modo watch
npm run test:coverage # Com relatório
```

### P: Qual cobertura de teste devo ter?

**R:** Mínimos recomendados:
- **Components:** 80% (foco em funcionalidade)
- **Hooks:** 85% (comportamentos principais)
- **Utils:** 90% (bem simples testar)
- **Pages:** 70% (geralmente complexas)

Veja cobertura atual:

```bash
npm run test:coverage
```

### P: Como testo async/await?

**R:** Use `async` no teste:

```typescript
it('deveria buscar usuário', async () => {
  const user = await fetchUser('123');
  expect(user.id).toBe('123');
});
```

Ou com `waitFor`:

```typescript
import { waitFor } from '@testing-library/react';

it('deveria atualizar após requisição', async () => {
  render(<MyComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Carregado')).toBeInTheDocument();
  });
});
```

### P: Como mock funções externas?

**R:** Use `jest.mock()`:

```typescript
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: [] }))
    }))
  }
}));
```

### P: Meus testes estão falhando, por quê?

**R:** Checklist:

- [ ] Dependências mock corretamente?
- [ ] Variáveis de ambiente definidas?
- [ ] Async/await aguardando?
- [ ] Seletores corretos (texto, role, etc)?
- [ ] Estado inicial correto?

Rode com debug:

```bash
npm run test -- --detectOpenHandles
```

### P: Como faço snapshot tests?

**R:**

```typescript
it('deveria matchear snapshot', () => {
  const { container } = render(<MyComponent />);
  expect(container).toMatchSnapshot();
});
```

Quando snapshot está OK, commite `__snapshots__` junto:

```bash
git add "**/__snapshots__"
```

---

## 🚀 Deployment

### P: Como faço deploy?

**R:** O projeto é configurado para Vercel. Após merge em `main`:

1. Vercel automticamente detecta mudanças
2. Constrói e testa
3. Deploy em staging
4. Deploy em produção (se teste passar)

Para acelerar, lembra:

```bash
npm run build  # Teste build localmente
```

### P: Posso fazer deploy manual?

**R:** Sim, em Vercel:

1. Acesse https://vercel.com/dashboard
2. Selecione projeto ComparAuto
3. Clique "Deploy"

Ou via CLI:

```bash
npm install -g vercel
vercel
```

### P: Minha env var não foi aplicada no deploy

**R:** Variáveis precisa ser definidas em Vercel:

1. Projeto → Settings → Environment Variables
2. Se for `NEXT_PUBLIC_*`, adicione como "Preview", "Production", "Development"
3. Redeploy: `vercel --prod`

### P: Como faço rollback de deploy?

**R:** Em Vercel:

1. Deployments tab
2. Clique num deploy anterior
3. "Promote to Production"

---

## ⚠️ Problemas Comuns

### P: "Cannot find module X"

**R:**

```bash
# Reinstale deps
rm -rf node_modules
npm install

# Ou use npm ci para consistência
npm ci
```

### P: "Tailwind classes não estão funcionando"

**R:** Verifique:

1. Classe está em `globals.css`?
2. Arquivo é `.tsx` e tem className?
3. Rodou `npm run dev` (não só `npm install`)?
4. Arquivo está em `src/`?

### P: Mapas não carregam

**R:**

1. MapLibre GL está instalado? `npm install maplibre-gl react-map-gl`
2. O CSS do MapLibre está sendo importado? (MapLibreCSS.tsx faz isso automaticamente)
3. Verifique se o componente é carregado com `dynamic(() => import(...), { ssr: false })`

### P: Autenticação não funciona

**R:**

1. Supabase conectado? (check `.env.local`)
2. Projeto Supabase criado?
3. Auth Provider em `layout.tsx`?
4. Session check em middleware?

Debug:

```typescript
const session = await supabase.auth.getSession();
console.log('Session:', session);
```

### P: Build falha com erro de tipo

**R:**

```bash
npm run type-check
```

Fix todos os erros, depois:

```bash
npm run build
```

### P: Servidor dev não inicia

**R:**

1. Verifique porta 3000 está livre:
   ```bash
   lsof -i :3000
   ```

2. Limpe cache:
   ```bash
   rm -rf .next
   npm run dev
   ```

3. Cheque `.env.local` (sem erros)

4. Reinstale:
   ```bash
   rm -rf node_modules
   npm install
   ```

---

## 📞 Ainda com Dúvidas?

- 💬 [Abra uma Discussion](https://github.com/thera-org/ComparAuto/discussions)
- 🐛 [Abra uma Issue](https://github.com/thera-org/ComparAuto/issues)
- 📖 Consulte [documentação](./docs)

---

**Versão:** 1.0  
**Última atualização:** 5 de março de 2026

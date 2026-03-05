# 🚀 Guia Rápido de Contribuição - ComparAuto

Guia rápido e visual para começar a contribuir ao projeto.

## ⚡ 5 Passos para Começar

### 1️⃣ Fork + Clone

```bash
# 1. Fork em GitHub (botão no canto superior)
# 2. Clone seu fork
git clone https://github.com/SEU_USUARIO/ComparAuto.git
cd ComparAuto

# 3. Adicione upstream
git remote add upstream https://github.com/thera-org/ComparAuto.git
```

### 2️⃣ Instale + Configure

```bash
# Instale dependências
npm install

# Configure ambiente
cp .env.example .env.local

# Edite .env.local com suas credenciais Supabase
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3️⃣ Inicie Desenvolvimento

```bash
# Inicie servidor
npm run dev

# Acesse http://localhost:3000
```

### 4️⃣ Faça suas Mudanças

```bash
# Crie branch
git checkout -b feature/sua-feature

# Trabalhe, commit com padrão:
git add .
git commit -m "feat(escopo): descrição clara"

# Múltiplos commits pequenos > um commit grande
```

### 5️⃣ Submeta PR

```bash
# Push branch
git push origin feature/sua-feature

# Vá a GitHub e clique "Create Pull Request"
# Preencha template completamente
```

**Pronto! Sua contribuição está em revisão! 🎉**

---

## ✅ Checklist Rápido

### Antes de fazer commit

- [ ] Código limpo (sem console.logs, código comentado)
- [ ] Formatação OK
  ```bash
  npm run lint:fix && npm run format
  ```
- [ ] Tudo compilando
  ```bash
  npm run type-check
  ```
- [ ] Testes passando
  ```bash
  npm run test
  ```

### Mensagem de Commit

**Padrão:** `tipo(escopo): descrição`

```
✅ feat(auth): implementar login com Google
✅ fix(maps): corrigir erro de carregamento
✅ docs: atualizar README
✅ refactor(api): simplificar lógica de busca

❌ ajustado
❌ FIX BUG!!!
❌ wip
```

**Dica:** Primeiro commit tem limite de 50 caracteres

### Ao submeter PR

- [ ] Título descritivo: `feat(escopo): descrição`
- [ ] Descrição clara (use template)
- [ ] Referencia issue: `Closes #123`
- [ ] Testes inclusos
- [ ] Sem merge conflicts
- [ ] Build passando (CI/CD)

---

## 🎯 Padrões Essenciais

### Nomenclatura de Branch

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Feature | `feature/...` | `feature/oauth-google` |
| Bug Fix | `bugfix/...` | `bugfix/auth-timeout` |
| Hotfix | `hotfix/...` | `hotfix/payment-error` |
| Docs | `docs/...` | `docs/api-reference` |
| Refactor | `refactor/...` | `refactor/user-service` |

**Use kebab-case:** `feature/nome-descritivo`

### Código TypeScript

```typescript
// ✅ Bom
export const UserCard: React.FC<UserCardProps> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  
  return <div>{user?.name}</div>;
};

interface UserCardProps {
  userId: string;
}

// ❌ Evitar
const usercard = (userId) => <div></div>;
const ANY_VARIABLE = 'value';
const myVar = useState(null);
```

### Componentes React

```typescript
// ✅ Padrão
export const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initial);
  
  useEffect(() => {
    // effect
  }, [dependencies]);
  
  return <div className="...">content</div>;
};

// ❌ Evitar
class MyComponent extends React.Component { }  // Use funcional
export default MyComponent;                     // Export named acima
const result = MyComponent();                   // Não chame assim
```

---

## 📊 Fluxo Visual

```
┌─────────────────────────────────────────────┐
│ Github: Fork do Repositório                 │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│ git clone seu-fork                          │
│ npm install                                 │
│ cp .env.example .env.local                  │
│ # Configure .env.local                      │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│ npm run dev (http://localhost:3000)         │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│ git checkout -b feature/sua-feature         │
│ Desenvolva sua feature / fix                │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│ npm run lint:fix                            │
│ npm run format                              │
│ npm run type-check                          │
│ npm run test                                │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│ git commit -m "feat(escopo): descrição"     │
│ git push origin feature/sua-feature         │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│ GitHub: Create Pull Request                 │
│ Preencha template de PR                     │
│ Adicione "Closes #issue"                    │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│ CI/CD: Testes automáticos                   │
│ Code Review: Revisores comentam             │
│ Você: Responde feedback e faz ajustes       │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│ ✅ PR Aprovada                              │
│ 🚀 Mergeada em develop                      │
│ 🎉 Parabéns! Contribuição completa!         │
└─────────────────────────────────────────────┘
```

---

## 📚 Links Rápidos

| O que você quer | Leia |
|---|---|
| **Setup detalhado** | [SETUP.md](./docs/SETUP.md) |
| **Padrões de código** | [PADRONIZACAO.md](./docs/PADRONIZACAO.md) |
| **Arquitetura** | [ARCHITECTURE.md](./docs/ARCHITECTURE.md) |
| **Como contribuir** | [CONTRIBUTING.md](./docs/CONTRIBUTING.md) |
| **Dúvidas frequentes** | [FAQ.md](./docs/FAQ.md) |
| **Menu principal docs** | [docs/README.md](./docs/README.md) |

---

## 🐛 Problemas Comuns

| Problema | Solução |
|---|---|
| "Module not found" | `npm install` |
| ".env.local não lê" | Reinicie `npm run dev` |
| Linting errors | `npm run lint:fix` |
| Type errors | `npm run type-check` |
| Testes falhando | `npm run test -- --detectOpenHandles` |
| Porta 3000 em uso | `npm run dev -- -p 3001` |

---

## 💪 Dica: Seu Primeiro Commit

```bash
# 1. Clone e setup (passos acima)
npm run dev

# 2. Abra em navegador: http://localhost:3000

# 3. Faça algo simples (ex: mudar cor de botão)
# Arquivo: src/components/Header.tsx
# Mude: className="bg-blue-600" → className="bg-purple-600"

# 4. Commit
git add .
git commit -m "style(header): mudar cor do botão para roxo"

# 5. Push e PR
git push origin feature/your-feature
# Vá a GitHub e clique "Create Pull Request"
```

---

## ⭐ Boas Práticas

✅ **Faça:**
- Commits pequenos e focados
- Uma funcionalidade por PR
- Testes para novas features
- Issues bem descritas
- Discussões educadas

❌ **Evite:**
- Commits gigantes com tudo misturado
- Múltiplas features em uma PR
- Ignorar feedback de review
- PRs sem descrição
- Linguagem agressiva

---

## 🎓 Recursos de Aprendizado

- [Conventional Commits](https://www.conventionalcommits.org/) 
- [Git Tutorial](https://git-scm.com/book/en/v2)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🙋 Pergunta?

Antes de abrir issue, checklist:

- [ ] Leu [FAQ.md](./docs/FAQ.md)?
- [ ] Procurou issues/discussions existentes?
- [ ] Erro está em suas notas?

Se ainda tiver dúvida:

- 💬 [Abra Discussion](https://github.com/thera-org/ComparAuto/discussions)
- 🐛 [Abra Issue](https://github.com/thera-org/ComparAuto/issues)

---

**Pronto para começar? 🚀**

1. Fork o repositório
2. Siga os 5 passos acima
3. Escolha uma issue
4. Comece a codificar!

Obrigado por contribuir para ComparAuto! ❤️

---

Versão 1.0 - 5 de março de 2026

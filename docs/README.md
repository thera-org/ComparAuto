# 📚 Documentação - ComparAuto

Bem-vindo à documentação do projeto ComparAuto! Este diretório contém guias, padrões e referências para desenvolvimento, contribução e manutenção do projeto.

## 📑 Documentos Disponíveis

### 🚀 Início Rápido

| Documento | Descrição |
|-----------|-----------|
| [**SETUP.md**](./SETUP.md) | **⬅️ COMECE AQUI** - Como configurar ambiente local, instalar dependências e rodar o projeto |
| [**CONTRIBUTING.md**](./CONTRIBUTING.md) | Como contribuir para o projeto, padrões de código e processo de submissão |
| [**FAQ.md**](./FAQ.md) | Perguntas frequentes, troubleshooting e soluções rápidas |

### 📋 Padrões e Guias

| Documento | Descrição |
|-----------|-----------|
| [**PADRONIZACAO.md**](./PADRONIZACAO.md) | 🎯 **IMPORTANTE** - Padrões de código, commits, branches, naming conventions, testing, documentação |
| [**ARCHITECTURE.md**](./ARCHITECTURE.md) | Arquitetura geral, stack tecnológico, padrões de design, data flow, banco de dados |

---

## 🚀 Começando a Contribuir

### Passo 1: Setup Inicial

```bash
# Clone seu fork
git clone https://github.com/SEU_USUARIO/ComparAuto.git
cd ComparAuto

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais Supabase

# Inicie o servidor
npm run dev
```

👉 Consulte [**SETUP.md**](./SETUP.md) para instruções detalhadas.

### Passo 2: Entenda os Padrões

Antes de começar a codificar:

1. Leia [**PADRONIZACAO.md**](./PADRONIZACAO.md) - Especialmente:
   - Convenção de Commits
   - Nomenclatura de Branches
   - Padrões de Código (TypeScript, React, CSS)

2. Familiarize-se com [**ARCHITECTURE.md**](./ARCHITECTURE.md) para entender:
   - Estrutura do projeto
   - Padrões de design usados
   - Como dados fluem

### Passo 3: Encontre uma Tarefa

1. Acesse [Issues do projeto](https://github.com/thera-org/ComparAuto/issues)
2. Procure por rótulos:
   - `good first issue` - Perfeito para iniciantes
   - `help wanted` - Precisa de ajuda
   - `documented` - Já tem requisitos claros

### Passo 4: Desenvolva e Submeta

1. Crie uma branch: `git checkout -b feature/minha-feature`
2. Faça commits menores: `git commit -m "feat(escopo): descrição"`
3. Submeta PR referenciando a issue: `Closes #123`

👉 Consulte [**CONTRIBUTING.md**](./CONTRIBUTING.md) para processo detalhado.

---

## 💻 Scripts Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor (http://localhost:3000)
npm run build            # Build de produção
npm run start            # Inicia em produção

# Qualidade
npm run lint             # Verifica problemas
npm run lint:fix         # Corrige automaticamente
npm run format           # Formata com Prettier
npm run type-check       # Verifica tipos TypeScript

# Testing
npm run test             # Executa testes
npm run test:watch       # Modo watch
npm run test:coverage    # Com cobertura

# Antes de fazer commit/push
npm run lint:fix && npm run format && npm run type-check && npm run test
```

---

## 📖 Navegação por Tópico

### Se você quer...

#### **Contribuir código**
→ Leia [CONTRIBUTING.md](./CONTRIBUTING.md) + [PADRONIZACAO.md](./PADRONIZACAO.md)

#### **Entender a arquitetura**
→ Leia [ARCHITECTURE.md](./ARCHITECTURE.md)

#### **Escrever padrão de código**
→ Leia [PADRONIZACAO.md](./PADRONIZACAO.md#-padrões-de-código)

#### **Fazer commit corretamente**
→ Leia [PADRONIZACAO.md](./PADRONIZACAO.md#-convenção-de-commits)

#### **Criar testes**
→ Leia [PADRONIZACAO.md](./PADRONIZACAO.md#-testing) + [FAQ.md](./FAQ.md#-testing)

#### **Resolver um problema**
→ Leia [FAQ.md](./FAQ.md#-problemas-comuns)

#### **Fazer deploy**
→ Leia [FAQ.md](./FAQ.md#-deployment)

#### **Configurar IDE**
→ Leia [SETUP.md](./SETUP.md#-ide-setup)

#### **Configurar Supabase**
→ Leia [SETUP.md](./SETUP.md#-configuração-do-supabase)

---

## 🎯 Pontos Principais de Padronização

### Commits

```
✅ BOM
feat(auth): implementar login com Google
fix(maps): corrigir erro de carregamento
refactor(api): simplificar lógica de busca

❌ RUIM
ajustado
FIX BUG URGENTE!!!
melhorias varias
```

[Consulte convenção completa](./PADRONIZACAO.md#-convenção-de-commits)

### Branches

```
✅ BOM
feature/autenticacao-google
bugfix/erro-no-mapa
refactor/componente-user

❌ RUIM
minha_feature
develop2
bug-fix-urgente!
```

[Consulte padrão completo](./PADRONIZACAO.md#-branches)

### Código TypeScript

```typescript
✅ BOM
function getUser(id: string): Promise<User> {
  // implementação
}

const userName: string = 'João';

interface UserProps {
  id: string;
  name: string;
}

export const UserCard: React.FC<UserProps> = ({ id, name }) => {
  // component code
};

❌ RUIM
function get_user(id) {
  // implementação
}

const user_name = 'João';

export const usercard = () => {
  // ...
};
```

[Consulte padrões completos](./PADRONIZACAO.md#-padrões-de-código)

---

## 🔒 Pull Request Checklist

Antes de submeter:

- [ ] Código segue padrões de [PADRONIZACAO.md](./PADRONIZACAO.md)
- [ ] `npm run lint:fix && npm run format`
- [ ] `npm run type-check` ✅
- [ ] `npm run test` ✅
- [ ] Testes para novas features
- [ ] Documentação atualizada
- [ ] Sem console.logs ou código comentado
- [ ] PR tem descrição clara
- [ ] Referencia a issue: `Closes #123`

---

## 🆘 Precisa de Ajuda?

- 💬 [GitHub Discussions](https://github.com/thera-org/ComparAuto/discussions) - Dúvidas gerais
- 🐛 [GitHub Issues](https://github.com/thera-org/ComparAuto/issues) - Bugs ou features
- 📧 Contato direto com mantenedores

---

## 📚 Recursos Externos

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 📝 Mudanças na Documentação

Esta documentação é livingDocs - evoluem com o projeto!

Para sugerir melhorias:

1. Abra uma [Discussion](https://github.com/thera-org/ComparAuto/discussions)
2. Ou submeta um PR com suas sugestões
3. Use label `documentation`

---

## 📊 Versionamento da Documentação

| Versão | Data | Mudanças |
|--------|------|----------|
| 1.0 | 5 mar 2026 | Documentação inicial completa |

---

**Obrigado por contribuir para ComparAuto! 🚗✨**

Última atualização: 5 de março de 2026

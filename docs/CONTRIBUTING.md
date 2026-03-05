# 🤝 Guia de Contribuição - ComparAuto

Obrigado por considerar contribuir para o projeto ComparAuto! Este documento fornece orientações e instruções para contribuir de forma eficiente e alinhada com nossos padrões.

## 📋 Sumário

- [Código de Conduta](#-código-de-conduta)
- [Como Começar](#-como-começar)
- [Encontrando Tarefas](#-encontrando-tarefas)
- [Processo de Desenvolvimento](#-processo-de-desenvolvimento)
- [Submetendo Mudanças](#-submetendo-mudanças)
- [Padrões de Código](#-padrões-de-código)
- [Testing](#-testing)

---

## 👥 Código de Conduta

### Nossa Promessa

No interesse de promover um ambiente aberto e acolhedor, nós, como colaboradores e mantenedores, nos comprometemos a tornar a participação em nosso projeto e nossa comunidade uma experiência livre de assédio para todos.

### Nossos Padrões

Exemplos de comportamento que contribuem para criar um ambiente positivo incluem:

- Usar linguagem acolhedora e inclusiva
- Ser respeitoso com pontos de vista e experiências divergentes
- Aceitar críticas construtivas graciosamente
- Focar no que é melhor para a comunidade
- Mostrar empatia com outros membros da comunidade

Exemplos de comportamento inaceitável incluem:

- Uso de linguagem ou imagens sexualizadas
- Ataques pessoais, insultos ou comentários depreciativos
- Assédio público ou privado
- Publicação de informações privadas de outros sem permissão
- Outra conduta que poderia ser razoavelmente considerada inadequada

### Aplicação

Instâncias de comportamento abusivo, de assédio ou inaceitável podem ser reportadas entrando em contato com a equipe do projeto. Todas as reclamações serão revisadas e investigadas.

---

## 🚀 Como Começar

### Pré-requisitos

- Node.js 18+
- npm/yarn/pnpm
- Git
- Conta no GitHub
- Conta no Supabase (para testar features de autenticação)

### Fork e Clone

1. **Faça um fork** do repositório em sua conta GitHub
2. **Clone seu fork** localmente:

```bash
git clone https://github.com/seu-usuario/ComparAuto.git
cd ComparAuto
```

3. **Adicione upstream** para sincronizar com a main:

```bash
git remote add upstream https://github.com/thera-org/ComparAuto.git
```

### Configuração Local

1. **Instale dependências:**

```bash
npm install
```

2. **Configure variáveis de ambiente:**

```bash
cp .env.example .env.local
```

3. **Preencha as variáveis necessárias:**

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave
```

4. **Comece o servidor de desenvolvimento:**

```bash
npm run dev
```

5. **Acesse** http://localhost:3000

---

## 🔍 Encontrando Tarefas

### Issues Ativas

Procure por issues com os rótulos:

- `good first issue` - Perfeito para novos colaboradores
- `help wanted` - Precisa de ajuda da comunidade
- `documentation` - Melhorias de documentação
- `enhancement` - Novas features propostas

### Como Claimar uma Issue

1. Comente na issue: "Vou trabalhar nisso 👍"
2. Configure sua branch local
3. Abra um PR referenciando a issue quando tiver mudanças

---

## 🔄 Processo de Desenvolvimento

### 1. Crie uma Branch

A partir de `develop`:

```bash
git checkout develop
git pull upstream develop

# Para feature
git checkout -b feature/descricao-clara

# Para bugfix
git checkout -b bugfix/descricao-clara

# Ver padrão completo em docs/PADRONIZACAO.md
```

### 2. Faça suas Mudanças

Trabalhe em pequenas mudanças focadas:

- Um commit = uma mudança lógica
- Commits frequentes e pequenos
- Mensagens descritivas

```bash
# Ver convenção de commits em docs/PADRONIZACAO.md
git commit -m "feat(auth): adicionar login com Google"
```

### 3. Mantenha-se Atualizado

Rebase com a develop regularmente:

```bash
git fetch upstream
git rebase upstream/develop
```

### 4. Teste Localmente

Antes de fazer push:

```bash
npm run lint:fix         # Fixar linting
npm run format           # Formatar código
npm run type-check       # Checar tipos
npm run test             # Executar testes
npm run build            # Fazer build completo
```

---

## 📤 Submetendo Mudanças

### 1. Push para seu Fork

```bash
git push origin feature/descricao-clara
```

### 2. Abra um Pull Request

- Vá para [https://github.com/thera-org/ComparAuto](https://github.com/thera-org/ComparAuto)
- Clique em "New Pull Request"
- Selecione `develop` como branch base
- Preencha o template completamente

### 3. Checklist de PR

Sua PR deve ter:

- ✅ Título claro e descritivo
- ✅ Descrição das mudanças
- ✅ Link para issue (`Closes #X`)
- ✅ Testes adicionados
- ✅ Documentação atualizada (se necessário)
- ✅ Sem console.logs ou código comentado
- ✅ Lint e type-check passando

### 4. Feedback e Revisão

- Monitore comentários de revisores
- Responda a feedbacks de forma educada
- Faça mudanças quando solicitado
- **NÃO** reescreva histórico de commits (adicione novos commits)

### 5. Aprovação e Merge

Uma vez aprovado:

- A PR será mergeada em `develop`
- Sua branch será deletada
- Parabéns! 🎉

---

## 🎨 Padrões de Código

### Nomenclatura

Consulte [docs/PADRONIZACAO.md - Nomenclatura](./PADRONIZACAO.md#-nomenclatura)

- **Funções/variáveis:** camelCase
- **Componentes:** PascalCase
- **Constantes:** UPPER_SNAKE_CASE
- **Arquivos:** kebab-case

### TypeScript

```typescript
// ✅ Sempre defina tipos
interface UserProps {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User | null> {
  // implementação
}

export const UserProfile: React.FC<UserProps> = ({ id, name, email }) => {
  return <div>{name}</div>;
};
```

### React Components

```typescript
// ✅ Use functional components
export const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  const [state, setState] = React.useState<Type>(initial);
  
  React.useEffect(() => {
    // effect
  }, [dependencies]);
  
  return <div>{prop1}</div>;
};

// ✅ Exporte no fim do arquivo
export default MyComponent;
```

### Tailwind CSS

```typescript
// ✅ Use classes Tailwind
<div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">

// ✅ Para componentes, use @apply em globals.css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700;
  }
}
```

### Imports

```typescript
// ✅ Organize por tipo
import React from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@radix-ui/react-button';

import { UserCard } from '@/components/UserCard';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/lib/constants';
```

---

## 🧪 Testing

### Executar Testes

```bash
npm run test              # Uma vez
npm run test:watch       # Modo watch
npm run test:coverage    # Com cobertura
```

### Escrever Testes

Siga o padrão AAA (Arrange, Act, Assert):

```typescript
describe('UserCard', () => {
  it('deveria renderizar nome do usuário', () => {
    // Arrange - Configure dados de teste
    const user = { id: '1', name: 'João Silva' };
    
    // Act - Executa a ação
    render(<UserCard user={user} />);
    
    // Assert - Valida o resultado
    expect(screen.getByText('João Silva')).toBeInTheDocument();
  });

  it('deveria chamar onDelete quando botão for clicado', () => {
    // Arrange
    const handleDelete = jest.fn();
    const user = { id: '1', name: 'João' };
    
    // Act
    render(<UserCard user={user} onDelete={handleDelete} />);
    fireEvent.click(screen.getByText('Deletar'));
    
    // Assert
    expect(handleDelete).toHaveBeenCalled();
  });
});
```

### Cobertura Esperada

- **Components:** 80%+
- **Hooks:** 85%+
- **Utils:** 90%+
- **Pages:** 70%+ (geralmente mais complexas)

---

## 🐛 Reportando Bugs

Encontrou um bug? Ótimo, abra uma issue!

Use o template [Bug Report](./.github/ISSUE_TEMPLATE/bug_report.md) e forneça:

1. Descrição clara do problema
2. Passos para reproduzir
3. Comportamento esperado
4. Seu ambiente (OS, Node version, etc)
5. Screenshots/logs (se aplicável)

---

## 💡 Sugerindo Features

Quer sugerir uma nova feature?

Use o template [Feature Request](./.github/ISSUE_TEMPLATE/feature_request.md) e descreva:

1. O problema que a feature resolve
2. A solução proposta
3. Exemplos ou mockups (se houver)

---

## ❓ Dúvidas?

- 💬 [Abra uma Discussion](https://github.com/thera-org/ComparAuto/discussions)
- 📧 Contate a equipe principal
- 📖 Verifique a [documentação](./docs/)

---

## 📚 Recursos Úteis

- [Guia de Padronização Completo](./PADRONIZACAO.md)
- [Documentação de Arquitetura](./ARCHITECTURE.md)
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

---

**Obrigado por contribuir! Sua ajuda torna ComparAuto melhor! 🙌**

Versão 1.0 - Última atualização: 5 de março de 2026

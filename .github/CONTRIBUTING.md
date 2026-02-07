# Guia de Contribuição

Obrigado por considerar contribuir com o ComparAuto! 🎉

## 📋 Código de Conduta

Este projeto segue um código de conduta. Ao participar, você concorda em manter um ambiente respeitoso e inclusivo.

## 🚀 Como Contribuir

### 1. Fork e Clone

```bash
# Fork o repositório no GitHub
# Clone seu fork
git clone https://github.com/SEU-USUARIO/ComparAuto.git
cd ComparAuto

# Adicione o repositório original como upstream
git remote add upstream https://github.com/thera-org/ComparAuto.git
```

### 2. Crie uma Branch

```bash
# Atualize sua branch main
git checkout main
git pull upstream main

# Crie uma nova branch
git checkout -b feat/minha-funcionalidade
# ou
git checkout -b fix/meu-bug
```

### 3. Faça suas Mudanças

```bash
# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run dev

# Faça suas mudanças
# ...

# Execute os testes
npm run test

# Verifique linting
npm run lint

# Verifique formatação
npm run format:check
```

### 4. Commit suas Mudanças

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Formato: tipo(escopo opcional): descrição

git commit -m "feat: adicionar busca por localização"
git commit -m "fix: corrigir erro no login"
git commit -m "docs: atualizar README"
```

**Tipos de commit:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação
- `refactor`: Refatoração
- `perf`: Performance
- `test`: Testes
- `build`: Build system
- `ci`: CI/CD
- `chore`: Tarefas gerais

### 5. Push e Pull Request

```bash
# Push para seu fork
git push origin feat/minha-funcionalidade

# Abra um Pull Request no GitHub
```

## ✅ Checklist do Pull Request

Antes de abrir um PR, certifique-se de que:

- [ ] O código segue o guia de estilo do projeto
- [ ] Você adicionou testes para suas mudanças
- [ ] Todos os testes passam (`npm run test`)
- [ ] O linting passa (`npm run lint`)
- [ ] A verificação de tipos passa (`npm run type-check`)
- [ ] A formatação está correta (`npm run format:check`)
- [ ] O build funciona (`npm run build`)
- [ ] Você atualizou a documentação (se necessário)
- [ ] O título do PR segue o padrão Conventional Commits
- [ ] O PR tem uma descrição clara do que foi feito

## 🏗️ Estrutura do Projeto

```
ComparAuto/
├── .github/              # Workflows e configurações do GitHub
│   ├── workflows/        # GitHub Actions workflows
│   └── CI_CD_GUIDE.md   # Guia da pipeline CI/CD
├── public/              # Arquivos estáticos
├── src/                 # Código fonte
│   ├── app/            # App Router do Next.js
│   ├── components/     # Componentes React
│   ├── lib/            # Utilitários e helpers
│   ├── types/          # Tipos TypeScript
│   └── __tests__/      # Testes
├── scripts/            # Scripts de automação
└── ...
```

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
npm run test

# Modo watch
npm run test:watch

# Com cobertura
npm run test:coverage
```

### Escrever Testes

- Use Jest e React Testing Library
- Coloque testes em `__tests__/` ou ao lado do arquivo com `.test.ts(x)`
- Siga o padrão AAA (Arrange, Act, Assert)

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    // Arrange
    render(<MyComponent />);
    
    // Act
    const element = screen.getByText('Hello World');
    
    // Assert
    expect(element).toBeInTheDocument();
  });
});
```

## 🎨 Guia de Estilo

### TypeScript

- Use TypeScript para todo código novo
- Evite `any` quando possível
- Use interfaces para props e tipos complexos
- Prefira `type` para unions e primitivos

### React

- Use componentes funcionais com hooks
- Mantenha componentes pequenos e focados
- Use `use client` apenas quando necessário (Next.js 15)
- Extraia lógica complexa para hooks customizados

### CSS/Tailwind

- Use Tailwind CSS para estilização
- Siga a ordem de classes: layout → spacing → sizing → colors → typography → effects
- Use classes do projeto quando disponíveis
- Evite CSS inline quando possível

### Nomenclatura

- Componentes: `PascalCase` (ex: `SearchBar.tsx`)
- Funções/variáveis: `camelCase` (ex: `getUserData`)
- Constantes: `UPPER_SNAKE_CASE` (ex: `MAX_RETRIES`)
- Arquivos: `kebab-case` ou `PascalCase` (ex: `user-service.ts` ou `UserService.ts`)

## 🐛 Reportar Bugs

### Antes de Reportar

1. Verifique se o bug já foi reportado
2. Use a versão mais recente
3. Colete informações sobre o ambiente

### Como Reportar

Abra uma issue com:

- Título claro e descritivo
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots/logs (se aplicável)
- Ambiente (OS, navegador, versão do Node, etc)

## 💡 Sugerir Funcionalidades

Abra uma issue com:

- Título claro e descritivo
- Descrição detalhada da funcionalidade
- Por que seria útil
- Possíveis implementações
- Mockups/wireframes (se aplicável)

## 🔄 Processo de Review

1. Todos os PRs passam por code review
2. Pelo menos 1 aprovação é necessária
3. Todos os checks da CI devem passar
4. Comentários devem ser resolvidos
5. Mantenedor fará o merge

## 📝 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a licença MIT do projeto.

## 💬 Dúvidas?

- Abra uma issue para discussão
- Entre em contato com os mantenedores

## 🙏 Agradecimentos

Obrigado por contribuir para tornar o ComparAuto melhor! 🚗✨

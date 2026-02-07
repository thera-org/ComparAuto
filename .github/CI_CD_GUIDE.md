# Guia da Pipeline de CI/CD

Este documento descreve a configuração da pipeline de CI/CD do ComparAuto e as boas práticas implementadas.

## 📋 Visão Geral

A pipeline de CI/CD é composta por múltiplos workflows que garantem a qualidade, segurança e confiabilidade do código:

### Workflows Configurados

1. **CI/CD Pipeline** (`ci-cd.yml`)
   - Execução: Push em `main` e `develop`, PRs para `main`
   - Jobs: Lint, Test, Build, Deploy

2. **Pull Request Validation** (`pr-validation.yml`)
   - Execução: Abertura/atualização de PRs
   - Validações: Título, tamanho, qualidade de código

3. **CodeQL Security Scan** (`codeql.yml`)
   - Execução: Push, PRs, schedule semanal
   - Análise de segurança de código

4. **Dependabot** (`dependabot.yml`)
   - Atualizações automáticas de dependências
   - Execução: Semanal

## 🔒 Segurança

### CodeQL
- Análise automática de código para vulnerabilidades
- Queries: `security-extended` e `security-and-quality`
- Linguagem: JavaScript/TypeScript

### Dependabot
- Atualização automática de dependências npm
- Atualização de GitHub Actions
- Agrupamento de updates menores
- PRs limitados para evitar spam

### NPM Audit
- Verificação de vulnerabilidades conhecidas
- Nível: `high` (críticas e altas)
- Executa em todos os workflows

## ✅ Validações de Qualidade

### Type Checking
```bash
npm run type-check
```
- Verifica tipos TypeScript sem gerar saída

### Linting
```bash
npm run lint
```
- ESLint com configurações Next.js
- Regras customizadas para o projeto

### Formatação
```bash
npm run format:check
```
- Prettier com plugin Tailwind
- Verifica consistência de formatação

### Testes
```bash
npm run test:coverage
```
- Jest com React Testing Library
- Cobertura de código configurada
- Thresholds mínimos:
  - Branches: 50%
  - Functions: 50%
  - Lines: 60%
  - Statements: 60%

## 🚀 Build e Deploy

### Build
- Next.js build em modo produção
- Verificação de saída do build
- Variáveis de ambiente configuradas

### Deploy
- Apenas na branch `main`
- Requer configuração de secrets Vercel
- Configurável para outros provedores

## 🎯 Boas Práticas Implementadas

### 1. Controle de Concorrência
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```
- Cancela execuções duplicadas
- Economiza recursos de CI/CD

### 2. Permissões Mínimas
```yaml
permissions:
  contents: read
  pull-requests: write
  checks: write
```
- Princípio do menor privilégio
- Cada job tem apenas as permissões necessárias

### 3. Timeouts
```yaml
timeout-minutes: 15
```
- Previne jobs travados
- Libera recursos rapidamente

### 4. Fail-Fast Strategy
```yaml
strategy:
  fail-fast: false
```
- Continua testando outras versões do Node.js
- Fornece feedback completo

### 5. Cache de Dependências
```yaml
cache: 'npm'
```
- Acelera instalação de dependências
- Reduz tempo de execução

### 6. Matrix Testing
```yaml
matrix:
  node-version: [18, 20]
```
- Testa em múltiplas versões do Node.js
- Garante compatibilidade

## 📊 Métricas e Monitoramento

### Code Coverage
- Integração com Codecov
- Relatórios de cobertura em cada PR
- Trends de cobertura ao longo do tempo

### Status Checks
- Todos os workflows devem passar
- Bloqueio de merge se houver falhas
- Feedback em tempo real

## 🔧 Configuração de Branch Protection

### Regras Recomendadas para `main`:

1. **Require pull request reviews**
   - Número mínimo de aprovações: 1
   - Dismiss stale reviews quando novos commits são feitos

2. **Require status checks to pass**
   - CI/CD Pipeline
   - CodeQL
   - PR Validation

3. **Require conversation resolution**
   - Todos os comentários devem ser resolvidos

4. **Do not allow bypassing**
   - Nem administradores podem fazer bypass

5. **Require linear history**
   - Força rebase ou squash merge

6. **Require signed commits** (opcional)
   - Maior segurança e rastreabilidade

## 📝 Validação de Pull Requests

### Convenção de Títulos
PRs devem seguir o formato Conventional Commits:

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `perf:` Melhoria de performance
- `test:` Testes
- `build:` Build system
- `ci:` CI/CD
- `chore:` Tarefas gerais

### Tamanho de PR
- ⚠️ Warning: > 500 linhas
- ❌ Error: > 1000 linhas
- Incentiva PRs menores e mais focados

## 🛠️ Manutenção

### Atualização de Actions
- Dependabot cuida automaticamente
- Review e merge semanalmente

### Atualização de Dependências
- Review PRs do Dependabot
- Testar localmente se necessário
- Merge após CI passar

### Monitoramento de Vulnerabilidades
- CodeQL: Semanal + em cada push/PR
- NPM Audit: Em cada workflow
- GitHub Security Advisories

## 📞 Troubleshooting

### CI Falhou - Como Resolver

1. **Lint Errors**
   ```bash
   npm run lint:fix
   ```

2. **Format Errors**
   ```bash
   npm run format
   ```

3. **Type Errors**
   ```bash
   npm run type-check
   # Corrigir erros manualmente
   ```

4. **Test Failures**
   ```bash
   npm run test
   # Corrigir testes falhos
   ```

5. **Build Failures**
   ```bash
   npm run build
   # Verificar logs de erro
   ```

### Secrets Necessários

Para funcionalidade completa, configure:

- `CODECOV_TOKEN` - Token do Codecov
- `VERCEL_TOKEN` - Token da Vercel (para deploy)
- `VERCEL_ORG_ID` - ID da organização Vercel
- `VERCEL_PROJECT_ID` - ID do projeto Vercel

## 📚 Recursos Adicionais

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)

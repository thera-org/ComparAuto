# Configuração do OAuth do Google no Supabase

## Problema
Quando você faz login com Google em produção, a URL de callback está redirecionando para `localhost` em vez do domínio de produção.

## Solução

### 1. Configurar a URL do site no Supabase

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Authentication** → **URL Configuration**
4. Configure as seguintes URLs:

   - **Site URL**: `https://seu-dominio.com` (URL do seu site em produção)
   - **Redirect URLs**: Adicione as seguintes URLs:
     - `http://localhost:3000/auth/callback` (para desenvolvimento)
     - `https://seu-dominio.com/auth/callback` (para produção)
     - `http://localhost:3000/**` (para desenvolvimento)
     - `https://seu-dominio.com/**` (para produção)

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com
```

⚠️ **IMPORTANTE**: Em produção (Vercel, Netlify, etc.), adicione as variáveis de ambiente:
- `NEXT_PUBLIC_SITE_URL` com a URL do seu domínio de produção

### 3. Configurar OAuth do Google

1. No Dashboard do Supabase, vá em **Authentication** → **Providers**
2. Encontre **Google** e clique em **Edit**
3. Adicione as **Authorized redirect URIs** no Google Cloud Console:
   - `https://your-project-id.supabase.co/auth/v1/callback`
   - Substitua `your-project-id` pelo ID do seu projeto Supabase

### 4. Verificar as mudanças no código

As seguintes mudanças foram feitas:

1. **`src/app/login/page.tsx`**:
   - Atualizado `handleOAuthLogin` para incluir `redirectTo` correto
   - Usa `window.location.origin` para garantir que a URL de produção seja usada

2. **`src/app/auth/callback/route.ts`** (NOVO):
   - Criada rota de callback para processar a resposta do OAuth
   - Troca o código de autorização por uma sessão
   - Redireciona para o destino correto após login

3. **`src/lib/supabase.ts`**:
   - Adicionado `detectSessionInUrl: true`
   - Adicionado `flowType: 'pkce'` para maior segurança

### 5. Testar

1. **Em desenvolvimento**:
   ```bash
   npm run dev
   ```
   - Acesse `http://localhost:3000/login`
   - Clique em "Entrar com Google"
   - Deve redirecionar corretamente após o login

2. **Em produção**:
   - Faça o deploy das mudanças
   - Certifique-se de que `NEXT_PUBLIC_SITE_URL` está configurado corretamente
   - Teste o login com Google no seu domínio de produção

## Checklist de Configuração

- [ ] Configurar Site URL no Supabase
- [ ] Adicionar Redirect URLs no Supabase
- [ ] Configurar variável `NEXT_PUBLIC_SITE_URL` em produção
- [ ] Adicionar Authorized redirect URIs no Google Cloud Console
- [ ] Fazer deploy das mudanças
- [ ] Testar login com Google em produção

## Troubleshooting

### Erro: "redirect_uri_mismatch"
- Verifique se a URL de callback está registrada no Google Cloud Console
- A URL deve ser exatamente: `https://your-project-id.supabase.co/auth/v1/callback`

### Ainda redireciona para localhost
- Verifique se `NEXT_PUBLIC_SITE_URL` está configurado em produção
- Limpe o cache do navegador
- Verifique se o deploy foi feito corretamente

### Erro: "Invalid code verifier"
- Limpe o cache do navegador e cookies
- Tente fazer logout e login novamente

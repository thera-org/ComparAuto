-- Migration: Padronizar campo tipo + index único em email
-- Issue #66: Refatoração do sistema de autenticação

-- 1. Permitir valor 'admin' no campo tipo
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_tipo_check;

-- Normalizar valores legados de tipo antes de recriar o CHECK
UPDATE usuarios
  SET tipo = 'oficina'
  WHERE tipo = 'mechanic';

ALTER TABLE usuarios ADD CONSTRAINT usuarios_tipo_check
  CHECK (tipo IN ('cliente', 'oficina', 'admin'));

-- 2. Se coluna role existir, migrar admins para tipo='admin' e dropar
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'role'
  ) THEN
    UPDATE usuarios SET tipo = 'admin' WHERE role = 'admin' AND tipo != 'admin';
    ALTER TABLE usuarios DROP COLUMN role;
  END IF;
END $$;

-- 3. Index único em email para eliminar race condition no signup
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_email_unique ON usuarios (email);

-- 4. Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS (idempotentes)
DROP POLICY IF EXISTS "Users can read own profile" ON usuarios;
CREATE POLICY "Users can read own profile"
  ON usuarios FOR SELECT
  USING (auth.uid() = id);

-- Admins podem ler todos os usuários (necessário para telas que listam usuários/oficinas).
-- Atenção: isso assume que apenas o backend (service role) consegue atribuir tipo='admin'.
DROP POLICY IF EXISTS "Admins can read all users" ON usuarios;
CREATE POLICY "Admins can read all users"
  ON usuarios FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM usuarios u_admin
      WHERE u_admin.id = auth.uid()
        AND u_admin.tipo = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can update own profile" ON usuarios;
CREATE POLICY "Users can update own profile"
  ON usuarios FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- INSERT: permite ao próprio usuário inserir seu perfil.
-- auth.uid() pode ser NULL no fluxo de confirmação de e-mail (sessão ainda não existe),
-- por isso o fallback para service_role garante que a inserção feita pelo servidor
-- (via trigger ou API route com service role) também seja permitida.
DROP POLICY IF EXISTS "Users can insert own profile" ON usuarios;
CREATE POLICY "Users can insert own profile"
  ON usuarios FOR INSERT
  WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

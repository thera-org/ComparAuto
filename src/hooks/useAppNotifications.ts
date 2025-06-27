"use client";

import { useNotifications } from '@/contexts/NotificationContext';

/**
 * Hook utilitário para notificações pré-configuradas com mensagens comuns
 */
export const useAppNotifications = () => {
  const { success, error, warning, info } = useNotifications();

  return {
    // Notificações de autenticação
    auth: {
      loginSuccess: (userName?: string) => 
        success("Login realizado!", userName ? `Bem-vindo, ${userName}!` : "Bem-vindo de volta!"),
      
      loginError: (message?: string) => 
        error("Falha no Login", message || "Credenciais inválidas. Tente novamente."),
      
      signupSuccess: () => 
        success("Conta criada!", "Verifique seu email para confirmar sua conta."),
      
      signupError: (message?: string) => 
        error("Erro no Cadastro", message || "Erro ao criar conta. Tente novamente."),
      
      logoutSuccess: () => 
        info("Logout realizado", "Até logo!"),
      
      emailConfirmed: () => 
        success("Email confirmado!", "Sua conta foi ativada com sucesso."),
      
      passwordResetSent: () => 
        info("Email enviado", "Verifique sua caixa de entrada para redefinir sua senha."),
      
      passwordResetSuccess: () => 
        success("Senha alterada!", "Sua senha foi atualizada com sucesso.")
    },

    // Notificações de CRUD
    crud: {
      createSuccess: (item: string) => 
        success(`${item} criado!`, `${item} foi criado com sucesso.`),
      
      createError: (item: string, message?: string) => 
        error(`Erro ao criar ${item}`, message || `Não foi possível criar o ${item}.`),
      
      updateSuccess: (item: string) => 
        success(`${item} atualizado!`, `${item} foi atualizado com sucesso.`),
      
      updateError: (item: string, message?: string) => 
        error(`Erro ao atualizar ${item}`, message || `Não foi possível atualizar o ${item}.`),
      
      deleteSuccess: (item: string) => 
        success(`${item} excluído!`, `${item} foi excluído com sucesso.`),
      
      deleteError: (item: string, message?: string) => 
        error(`Erro ao excluir ${item}`, message || `Não foi possível excluir o ${item}.`),
      
      saveSuccess: () => 
        success("Salvo com sucesso!", "Suas alterações foram salvas."),
      
      saveError: (message?: string) => 
        error("Erro ao salvar", message || "Não foi possível salvar as alterações.")
    },

    // Notificações de upload/arquivo
    upload: {
      uploadSuccess: (fileName?: string, count?: number) => {
        if (count && count > 1) {
          success("Upload concluído!", `${count} arquivos foram enviados com sucesso.`);
        } else if (fileName) {
          success("Upload concluído!", `${fileName} foi enviado com sucesso.`);
        } else {
          success("Upload concluído!", "Arquivo enviado com sucesso.");
        }
      },
      
      uploadError: (message?: string) => 
        error("Erro no Upload", message || "Falha ao enviar arquivo. Tente novamente."),
      
      uploadProgress: (fileName: string) => 
        info("Enviando arquivo...", `Enviando ${fileName}...`),
      
      fileSizeError: () => 
        warning("Arquivo muito grande", "O arquivo excede o tamanho máximo permitido."),
      
      fileTypeError: () => 
        warning("Tipo de arquivo inválido", "Este tipo de arquivo não é permitido.")
    },

    // Notificações de validação
    validation: {
      requiredFields: () => 
        warning("Campos obrigatórios", "Preencha todos os campos obrigatórios."),
      
      invalidEmail: () => 
        warning("Email inválido", "Digite um endereço de email válido."),
      
      passwordMismatch: () => 
        warning("Senhas não coincidem", "As senhas digitadas não são iguais."),
      
      weakPassword: () => 
        warning("Senha fraca", "A senha deve ter pelo menos 8 caracteres."),
      
      invalidField: (fieldName: string) => 
        warning("Campo inválido", `O campo ${fieldName} não está válido.`)
    },

    // Notificações de sistema
    system: {
      networkError: () => 
        error("Erro de conexão", "Verifique sua conexão com a internet."),
      
      serverError: () => 
        error("Erro do servidor", "Ocorreu um erro interno. Tente novamente mais tarde."),
      
      maintenanceMode: () => 
        info("Sistema em manutenção", "O sistema está temporariamente indisponível."),
      
      sessionExpired: () => 
        warning("Sessão expirada", "Faça login novamente para continuar."),
      
      permissionDenied: () => 
        error("Acesso negado", "Você não tem permissão para realizar esta ação."),
      
      loadingComplete: () => 
        info("Carregamento concluído", "Dados carregados com sucesso.")
    },

    // Funções básicas (para casos específicos)
    success,
    error,
    warning,
    info
  };
};

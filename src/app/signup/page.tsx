"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Loader2, Facebook, Apple, ArrowLeft } from "lucide-react";
import Image from "next/image";
import styles from './signup.module.css';
import { useNotifications } from '@/contexts/NotificationContext';

type AccountType = 'pessoal' | 'empresa' | null;
type UserType = 'cliente' | 'oficina' | null;

interface SignupFormData {
  // Etapa 1 - Telefone
  telefone: string;
  
  // Etapa 2 - Tipo de conta
  tipoContaEmpresa: AccountType;
  tipoUsuario: UserType;
  
  // Para Clientes - 7 Etapas:
  // Etapa 1: Dados essenciais (nome, email, senha)
  nome: string;
  email: string;
  password: string;
  confirmPassword: string;
  
  // Etapa 2: Contato e localização
  cpf?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  
  // Etapa 3: Preferências ou perfil
  dataNascimento?: string;
  genero?: string;
  
  // Etapa 4: Dados sensíveis ou comerciais (se necessário)
  // [Para expansão futura]
  
  // Etapa 5: Confirmação e consentimentos
  aceitaTermos?: boolean;
  aceitaMarketing?: boolean;
  
  // Informações condicionais - Pessoa Jurídica
  nomeEmpresa?: string;
  cnpj?: string;
  razaoSocial?: string;
  inscricaoEstadual?: string;
  
  // Informações condicionais - Oficina
  nomeOficina?: string;
  especialidades?: string[];
  horarioFuncionamento?: string;
  descricao?: string;
  website?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const { success, error: showError } = useNotifications();
  const [currentStep, setCurrentStep] = useState(1);  const [formData, setFormData] = useState<SignupFormData>({
    telefone: "",
    tipoContaEmpresa: null,
    tipoUsuario: null,
    nome: "",
    email: "",
    password: "",
    confirmPassword: "",
    aceitaTermos: false,
    aceitaMarketing: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [cpfExists, setCpfExists] = useState(false);

  // Número total de etapas baseado no tipo de usuário
  const getTotalSteps = () => {
    if (formData.tipoUsuario === 'cliente') {
      return 7; // 1:telefone, 2:tipo, 3:essenciais, 4:contato, 5:preferências, 6:dados sensíveis, 7:confirmação
    }
    return 3; // Para oficinas mantém o formato atual
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAccountTypeSelect = (type: AccountType) => {
    setFormData(prev => ({
      ...prev,
      tipoContaEmpresa: type
    }));
  };

  const handleUserTypeSelect = (type: UserType) => {
    setFormData(prev => ({
      ...prev,
      tipoUsuario: type
    }));
  };
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  const formatCNPJ = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/);
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}/${match[4]}-${match[5]}`;
    }
    return value;
  };

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
    }
    return value;
  };

  const formatCEP = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{5})(\d{3})$/);
    if (match) {
      return `${match[1]}-${match[2]}`;
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, telefone: formatted }));
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setFormData(prev => ({ ...prev, cnpj: formatted }));
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData(prev => ({ ...prev, cpf: formatted }));
  };
  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setFormData(prev => ({ ...prev, cep: formatted }));
  };

  // Verificar se email já existe
  const checkEmailExists = async (email: string) => {
    if (!email || email.length < 5) return;
    
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', email)
        .limit(1);
      
      if (error) {
        console.error('Erro ao verificar email:', error);
        return;
      }
      
      setEmailExists(data && data.length > 0);
    } catch (error) {
      console.error('Erro ao verificar email:', error);
    }
  };

  // Verificar se CPF já existe
  const checkCpfExists = async (cpf: string) => {
    if (!cpf || cpf.replace(/\D/g, '').length !== 11) return;
    
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id')
        .eq('cpf', cpf)
        .limit(1);
      
      if (error) {
        console.error('Erro ao verificar CPF:', error);
        return;
      }
      
      setCpfExists(data && data.length > 0);
    } catch (error) {
      console.error('Erro ao verificar CPF:', error);
    }
  };  // Debounce para validações
  const debounce = <T extends unknown[]>(func: (...args: T) => void, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: T) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const debouncedEmailCheck = debounce(checkEmailExists, 500);
  const debouncedCpfCheck = debounce(checkCpfExists, 500);const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.telefone.replace(/\D/g, '').length === 11;
      case 2:
        return formData.tipoContaEmpresa !== null && formData.tipoUsuario !== null;      case 3:
        // Para clientes: dados essenciais (nome, email, senha)
        if (formData.tipoUsuario === 'cliente') {
          const isValid = formData.nome !== "" && 
                          formData.email !== "" && 
                          formData.password.length >= 6 &&
                          formData.confirmPassword !== "" &&
                          formData.password === formData.confirmPassword &&
                          !emailExists;
          return isValid;
        }
        
        // Para oficinas e empresas: validação completa (mantém lógica atual)
        const basicValid = formData.nome !== "" && formData.email !== "" && formData.password.length >= 6;
        
        if (formData.tipoContaEmpresa === 'empresa') {
          return basicValid && formData.nomeEmpresa !== "" && formData.cnpj !== "" && formData.razaoSocial !== "";
        }
        
        if (formData.tipoUsuario === 'oficina') {
          return basicValid && formData.nomeOficina !== "" && formData.endereco !== "" && 
                 formData.cidade !== "" && formData.estado !== "" && formData.cep !== "";
        }
        
        return basicValid;      case 4:
        // Para clientes: contato e localização
        if (formData.tipoUsuario === 'cliente') {
          return formData.cpf !== undefined && formData.cpf !== "" &&
                 formData.endereco !== undefined && formData.endereco !== "" &&
                 formData.cidade !== undefined && formData.cidade !== "" &&
                 formData.estado !== undefined && formData.estado !== "" &&
                 formData.cep !== undefined && formData.cep !== "" &&
                 !cpfExists;
        }
        return true;
      case 5:
        // Para clientes: preferências ou perfil
        if (formData.tipoUsuario === 'cliente') {
          return formData.dataNascimento !== undefined && formData.dataNascimento !== "" &&
                 formData.genero !== undefined && formData.genero !== "";
        }
        return true;
      case 6:
        // Para clientes: dados sensíveis ou comerciais (opcional por enquanto)
        if (formData.tipoUsuario === 'cliente') {
          return true; // Sem validação obrigatória por enquanto
        }
        return true;
      case 7:
        // Para clientes: confirmação e consentimentos
        if (formData.tipoUsuario === 'cliente') {
          return formData.aceitaTermos === true;
        }
        return true;
      default:
        return false;
    }
  };
  const nextStep = () => {
    const totalSteps = getTotalSteps();
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      setError("");
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setError("");
    }
  };
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    const finalStep = getTotalSteps();
    if (!validateStep(finalStep)) {
      const errorMsg = "Preencha todos os campos obrigatórios.";
      setError(errorMsg);
      showError("Campos obrigatórios", errorMsg);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { 
          data: { 
            full_name: formData.nome,
            phone: formData.telefone
          } 
        },
      });
      
      if (error) throw error;
        if (data?.user) {        // Inserir usuário na tabela personalizada
        const userData: Record<string, unknown> = {
          id: data.user.id,
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          tipo: formData.tipoUsuario, // agora só 'cliente' ou 'oficina'
        };

        // Campos de empresa (apenas se for empresa)
        if (formData.tipoContaEmpresa === 'empresa') {
          if (formData.nomeEmpresa) userData.nome_empresa = formData.nomeEmpresa;
          if (formData.cnpj) userData.cnpj = formData.cnpj;
          if (formData.razaoSocial) userData.razao_social = formData.razaoSocial;
        }
        
        // Campos de oficina (apenas se for oficina)
        if (formData.tipoUsuario === 'oficina') {
          if (formData.nomeOficina) userData.nome_oficina = formData.nomeOficina;
          if (formData.endereco) userData.endereco = formData.endereco;
          if (formData.cidade) userData.cidade = formData.cidade;
          if (formData.estado) userData.estado = formData.estado;
          if (formData.cep) userData.cep = formData.cep;
        }

        console.log('Dados do usuário a serem inseridos:', userData);
          const { data: insertData, error: insertError } = await supabase
          .from("usuarios")
          .insert(userData)
          .select();
          
        if (insertError) {
          console.error('Erro ao inserir usuário na tabela:', insertError);
          
          // Se o erro é sobre colunas que não existem, tenta inserir apenas campos básicos
          if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
            console.log('Tentando inserir apenas campos básicos...');
            const basicUserData = {
              id: data.user.id,
              nome: formData.nome,
              email: formData.email,
              telefone: formData.telefone,
              tipo: formData.tipoUsuario === 'oficina' ? 'oficina' : 'user',
            };
            
            const { error: basicInsertError } = await supabase
              .from("usuarios")
              .insert(basicUserData);
              
            if (basicInsertError) {
              throw new Error(`Erro ao salvar dados básicos: ${basicInsertError.message}`);
            }
          } else {
            throw new Error(`Erro ao salvar dados do usuário: ${insertError.message}`);
          }
        }
          console.log('Usuário inserido com sucesso:', insertData);
      }
      
      // Verifica se há sessão ativa (usuário confirmou email automaticamente)
      if (data.session) {
        success("Conta criada com sucesso!", "Bem-vindo ao ComparAuto!");
        router.push("/"); // Redireciona para a home se já autenticado
      } else {
        success("Conta criada!", "Verifique seu email para confirmar sua conta.");
        // Redireciona para a tela de confirmação de e-mail
        router.push(`/signup/confirm-email?email=${encodeURIComponent(formData.email)}`);
      }
    } catch (error: unknown) {
      console.error('Erro completo no signup:', error);
        // Tratamento de erros mais específico
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('duplicate key') || errorMessage.includes('already registered')) {
        const errorMsg = "Este email já está cadastrado. Tente fazer login.";
        setError(errorMsg);
        showError("Email já cadastrado", errorMsg);
      } else if (errorMessage.includes('violates check constraint')) {
        const errorMsg = "Dados inválidos. Verifique os campos obrigatórios.";
        setError(errorMsg);
        showError("Dados inválidos", errorMsg);
      } else if (errorMessage.includes('column') && errorMessage.includes('does not exist')) {
        const errorMsg = "Erro na estrutura dos dados. Contacte o suporte.";
        setError(errorMsg);
        showError("Erro do sistema", errorMsg);
      } else if (errorMessage.includes('Invalid login credentials')) {
        setError("Credenciais inválidas. Verifique email e senha.");
      } else if (error instanceof Error) {
        setError(`Erro: ${error.message}`);
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Cadastro com OAuth
  const handleOAuthSignup = async (provider: "google" | "facebook" | "apple") => {
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) setError("Erro ao cadastrar com " + provider);
    } catch {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };  const renderStepIndicator = () => {
    const totalSteps = getTotalSteps();
    return (
      <div className={styles.stepIndicator}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`${styles.stepDot} ${
              index + 1 === currentStep ? styles.active : 
              index + 1 < currentStep ? styles.completed : ''
            }`}
          />
        ))}
      </div>
    );
  };

  const renderStep1 = () => (
    <>
      <div className={styles.signupHeader}>
        <Image src="/logo.png" alt="ComparAuto Logo" width={60} height={60} className={styles.logo} />
        <h2 className={styles.title}>Vamos começar!</h2>
        <p className={styles.subtitle}>Digite seu número de telefone para continuar</p>
      </div>

      <div className={styles.phoneInputGroup}>
        <label htmlFor="telefone" className={styles.label}>Número de telefone</label>
        <input
          id="telefone"
          type="tel"
          name="telefone"
          placeholder="(11) 99999-9999"
          value={formData.telefone}
          onChange={handlePhoneChange}
          className={styles.phoneInput}
          maxLength={15}
          required
          autoFocus
        />
      </div>

      <div className={styles.navigationButtons}>
        <button 
          type="button" 
          onClick={nextStep}
          className={styles.nextButton}
          disabled={!validateStep(1)}
        >
          Continuar
        </button>
      </div>

      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>ou cadastre-se com</span>
        <span className={styles.dividerLine} />
      </div>

      <div className={styles.oauthButtons}>
        <button
          type="button"
          onClick={() => handleOAuthSignup("google")}
          className={styles.oauthButton}
          disabled={loading}
          aria-label="Cadastrar com Google"
        >
          <Image src="/google-icon.svg" alt="Google" width={20} height={20} />
          Cadastrar com Google
        </button>
        <button
          type="button"
          onClick={() => handleOAuthSignup("facebook")}
          className={`${styles.oauthButton} ${styles.facebook}`}
          disabled={loading}
          aria-label="Cadastrar com Facebook"
        >
          <Facebook size={20} />
          Cadastrar com Facebook
        </button>
        <button
          type="button"
          onClick={() => handleOAuthSignup("apple")}
          className={`${styles.oauthButton} ${styles.apple}`}
          disabled={loading}
          aria-label="Cadastrar com Apple"
        >
          <Apple size={20} />
          Cadastrar com Apple
        </button>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className={styles.signupHeader}>
        <h2 className={styles.title}>Tipo de conta</h2>
        <p className={styles.subtitle}>Selecione o tipo de conta e como você usará a plataforma</p>
      </div>

      <div>
        <label className={styles.label}>Tipo de conta</label>
        <div className={styles.accountTypeSelection}>
          <div 
            className={`${styles.accountTypeOption} ${formData.tipoContaEmpresa === 'pessoal' ? styles.selected : ''}`}
            onClick={() => handleAccountTypeSelect('pessoal')}
          >
            <div className={styles.accountTypeTitle}>Pessoa Física</div>
            <div className={styles.accountTypeDescription}>Para uso pessoal</div>
          </div>
          <div 
            className={`${styles.accountTypeOption} ${formData.tipoContaEmpresa === 'empresa' ? styles.selected : ''}`}
            onClick={() => handleAccountTypeSelect('empresa')}
          >
            <div className={styles.accountTypeTitle}>Pessoa Jurídica</div>
            <div className={styles.accountTypeDescription}>Para empresas e MEIs</div>
          </div>
        </div>
      </div>

      <div>
        <label className={styles.label}>Como você usará a plataforma?</label>
        <div className={styles.accountTypeSelection}>
          <div 
            className={`${styles.accountTypeOption} ${formData.tipoUsuario === 'cliente' ? styles.selected : ''}`}
            onClick={() => handleUserTypeSelect('cliente')}
          >
            <div className={styles.accountTypeTitle}>Sou Cliente</div>
            <div className={styles.accountTypeDescription}>Quero encontrar oficinas e serviços automotivos</div>
          </div>
          <div 
            className={`${styles.accountTypeOption} ${formData.tipoUsuario === 'oficina' ? styles.selected : ''}`}
            onClick={() => handleUserTypeSelect('oficina')}
          >
            <div className={styles.accountTypeTitle}>Tenho uma Oficina</div>
            <div className={styles.accountTypeDescription}>Quero oferecer meus serviços na plataforma</div>
          </div>
        </div>
      </div>

      <div className={styles.navigationButtons}>
        <button type="button" onClick={prevStep} className={styles.backButton}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <button 
          type="button" 
          onClick={nextStep}
          className={styles.nextButton}
          disabled={!validateStep(2)}
        >
          Continuar
        </button>
      </div>
    </>
  );
  const renderStep3 = () => {
    // Para clientes: apenas dados essenciais
    if (formData.tipoUsuario === 'cliente') {
      return (
        <>
          <div className={styles.signupHeader}>
            <h2 className={styles.title}>Dados Essenciais</h2>
            <p className={styles.subtitle}>Informe seus dados básicos para criar a conta</p>
          </div>

          <div className={styles.twoColumnForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="nome" className={styles.label}>Nome completo *</label>
              <input
                id="nome"
                type="text"
                name="nome"
                placeholder="Nome completo"
                value={formData.nome}
                onChange={handleChange}
                className={styles.input}
                required
                autoFocus
              />
            </div>            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>E-mail *</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => {
                  handleChange(e);
                  debouncedEmailCheck(e.target.value);
                }}
                className={`${styles.input} ${emailExists ? styles.inputError : ''}`}
                required
              />
              {emailExists && (
                <span className={styles.errorText}>Este e-mail já está cadastrado</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Senha *</label>
              <div className={styles.passwordContainer}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  className={styles.input}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>Confirmar Senha *</label>
              <div className={styles.passwordContainer}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Digite a senha novamente"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${styles.input} ${formData.confirmPassword && formData.password !== formData.confirmPassword ? styles.inputError : ''}`}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <span className={styles.errorText}>As senhas não coincidem</span>
              )}
            </div>
          </div>

          <div className={styles.navigationButtons}>
            <button type="button" onClick={prevStep} className={styles.backButton}>
              <ArrowLeft size={16} /> Voltar
            </button>
            <button 
              type="button" 
              onClick={nextStep}
              className={styles.nextButton}
              disabled={!validateStep(3)}
            >
              Continuar
            </button>
          </div>
        </>
      );
    }

    // Para oficinas e empresas: formulário completo (lógica existente)
    return (
    <>
      <div className={styles.signupHeader}>
        <h2 className={styles.title}>Complete seu cadastro</h2>
        <p className={styles.subtitle}>Finalize criando sua conta</p>
      </div>

      <form onSubmit={handleSignup} className={styles.form}>
        <div className={styles.twoColumnForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="nome" className={styles.label}>
              Nome {formData.tipoContaEmpresa === 'empresa' ? 'do responsável' : 'completo'} *
            </label>
            <input
              id="nome"
              type="text"
              name="nome"
              placeholder="Nome completo"
              value={formData.nome}
              onChange={handleChange}
              className={styles.input}
              required
              autoFocus
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>E-mail *</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>

          {formData.tipoContaEmpresa === 'empresa' && (
            <>
              <div className={styles.inputGroup}>
                <label htmlFor="nomeEmpresa" className={styles.label}>Nome da Empresa *</label>
                <input
                  id="nomeEmpresa"
                  type="text"
                  name="nomeEmpresa"
                  placeholder="Nome fantasia"
                  value={formData.nomeEmpresa || ''}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>              <div className={styles.inputGroup}>
                <label htmlFor="cnpj" className={styles.label}>CNPJ *</label>
                <input
                  id="cnpj"
                  type="text"
                  name="cnpj"
                  placeholder="00.000.000/0001-00"
                  value={formData.cnpj || ''}
                  onChange={handleCNPJChange}
                  className={styles.input}
                  maxLength={18}
                  required
                />
              </div>

              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label htmlFor="razaoSocial" className={styles.label}>Razão Social *</label>
                <input
                  id="razaoSocial"
                  type="text"
                  name="razaoSocial"
                  placeholder="Razão social da empresa"
                  value={formData.razaoSocial || ''}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="inscricaoEstadual" className={styles.label}>Inscrição Estadual</label>
                <input
                  id="inscricaoEstadual"
                  type="text"
                  name="inscricaoEstadual"
                  placeholder="Opcional"
                  value={formData.inscricaoEstadual || ''}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
            </>
          )}

          {formData.tipoUsuario === 'oficina' && (
            <>
              <div className={styles.inputGroup}>
                <label htmlFor="nomeOficina" className={styles.label}>Nome da Oficina *</label>
                <input
                  id="nomeOficina"
                  type="text"
                  name="nomeOficina"
                  placeholder="Nome da sua oficina"
                  value={formData.nomeOficina || ''}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>              <div className={styles.inputGroup}>
                <label htmlFor="cep" className={styles.label}>CEP *</label>
                <input
                  id="cep"
                  type="text"
                  name="cep"
                  placeholder="00000-000"
                  value={formData.cep || ''}
                  onChange={handleCEPChange}
                  className={styles.input}
                  maxLength={9}
                  required
                />
              </div>

              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label htmlFor="endereco" className={styles.label}>Endereço *</label>
                <input
                  id="endereco"
                  type="text"
                  name="endereco"
                  placeholder="Rua, número, bairro"
                  value={formData.endereco || ''}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="cidade" className={styles.label}>Cidade *</label>
                <input
                  id="cidade"
                  type="text"
                  name="cidade"
                  placeholder="Cidade"
                  value={formData.cidade || ''}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="estado" className={styles.label}>Estado *</label>                <select
                  id="estado"
                  name="estado"
                  value={formData.estado || ''}
                  onChange={handleChange}
                  className={styles.input}
                  required
                >
                  <option value="">Selecione o estado</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
              </div>

              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label htmlFor="descricao" className={styles.label}>Descrição da Oficina</label>
                <input
                  id="descricao"
                  type="text"
                  name="descricao"
                  placeholder="Descreva brevemente os serviços da sua oficina"
                  value={formData.descricao || ''}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="horarioFuncionamento" className={styles.label}>Horário de Funcionamento</label>
                <input
                  id="horarioFuncionamento"
                  type="text"
                  name="horarioFuncionamento"
                  placeholder="Ex: Seg-Sex 8h-18h, Sáb 8h-12h"
                  value={formData.horarioFuncionamento || ''}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="website" className={styles.label}>Website</label>
                <input
                  id="website"
                  type="url"
                  name="website"
                  placeholder="https://www.suaoficina.com.br"
                  value={formData.website || ''}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
            </>
          )}

          <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
            <label htmlFor="password" className={styles.label}>Senha *</label>
            <div className={styles.passwordContainer}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                className={styles.input}
                required
                minLength={6}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.navigationButtons}>
          <button type="button" onClick={prevStep} className={styles.backButton}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <button type="submit" className={styles.nextButton} disabled={loading || !validateStep(3)}>
            {loading ? <Loader2 className={styles.spinning} size={20} /> : null}
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </div>
      </form>
    </>
    );
  };

  // Etapa 4 para clientes: Contato e localização
  const renderStep4 = () => (
    <>
      <div className={styles.signupHeader}>
        <h2 className={styles.title}>Contato e Localização</h2>
        <p className={styles.subtitle}>Ajude-nos a personalizar sua experiência</p>
      </div>

      <div className={styles.twoColumnForm}>        <div className={styles.inputGroup}>
          <label htmlFor="cpf" className={styles.label}>CPF *</label>
          <input
            id="cpf"
            type="text"
            name="cpf"
            placeholder="000.000.000-00"
            value={formData.cpf || ''}
            onChange={(e) => {
              handleCPFChange(e);
              debouncedCpfCheck(e.target.value);
            }}
            className={`${styles.input} ${cpfExists ? styles.inputError : ''}`}
            maxLength={14}
            required
            autoFocus
          />
          {cpfExists && (
            <span className={styles.errorText}>Este CPF já está cadastrado</span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="cep" className={styles.label}>CEP *</label>
          <input
            id="cep"
            type="text"
            name="cep"
            placeholder="00000-000"
            value={formData.cep || ''}
            onChange={handleCEPChange}
            className={styles.input}
            maxLength={9}
            required
          />
        </div>

        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
          <label htmlFor="endereco" className={styles.label}>Endereço *</label>
          <input
            id="endereco"
            type="text"
            name="endereco"
            placeholder="Rua, número, bairro"
            value={formData.endereco || ''}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="cidade" className={styles.label}>Cidade *</label>
          <input
            id="cidade"
            type="text"
            name="cidade"
            placeholder="Cidade"
            value={formData.cidade || ''}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="estado" className={styles.label}>Estado *</label>
          <select
            id="estado"
            name="estado"
            value={formData.estado || ''}
            onChange={handleChange}
            className={styles.input}
            required
          >
            <option value="">Selecione o estado</option>
            <option value="AC">Acre</option>
            <option value="AL">Alagoas</option>
            <option value="AP">Amapá</option>
            <option value="AM">Amazonas</option>
            <option value="BA">Bahia</option>
            <option value="CE">Ceará</option>
            <option value="DF">Distrito Federal</option>
            <option value="ES">Espírito Santo</option>
            <option value="GO">Goiás</option>
            <option value="MA">Maranhão</option>
            <option value="MT">Mato Grosso</option>
            <option value="MS">Mato Grosso do Sul</option>
            <option value="MG">Minas Gerais</option>
            <option value="PA">Pará</option>
            <option value="PB">Paraíba</option>
            <option value="PR">Paraná</option>
            <option value="PE">Pernambuco</option>
            <option value="PI">Piauí</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="RN">Rio Grande do Norte</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="RO">Rondônia</option>
            <option value="RR">Roraima</option>
            <option value="SC">Santa Catarina</option>
            <option value="SP">São Paulo</option>
            <option value="SE">Sergipe</option>
            <option value="TO">Tocantins</option>
          </select>
        </div>
      </div>

      <div className={styles.navigationButtons}>
        <button type="button" onClick={prevStep} className={styles.backButton}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <button 
          type="button" 
          onClick={nextStep}
          className={styles.nextButton}
          disabled={!validateStep(4)}
        >
          Continuar
        </button>
      </div>
    </>
  );

  // Etapa 5 para clientes: Preferências ou perfil
  const renderStep5 = () => (
    <>
      <div className={styles.signupHeader}>
        <h2 className={styles.title}>Preferências de Perfil</h2>
        <p className={styles.subtitle}>Informações para personalizar sua experiência</p>
      </div>

      <div className={styles.twoColumnForm}>
        <div className={styles.inputGroup}>
          <label htmlFor="dataNascimento" className={styles.label}>Data de Nascimento *</label>
          <input
            id="dataNascimento"
            type="date"
            name="dataNascimento"
            value={formData.dataNascimento || ''}
            onChange={handleChange}
            className={styles.input}
            required
            autoFocus
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="genero" className={styles.label}>Gênero *</label>
          <select
            id="genero"
            name="genero"
            value={formData.genero || ''}
            onChange={handleChange}
            className={styles.input}
            required
          >
            <option value="">Selecione</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="outro">Outro</option>
            <option value="prefiro_nao_dizer">Prefiro não dizer</option>
          </select>
        </div>
      </div>

      <div className={styles.navigationButtons}>
        <button type="button" onClick={prevStep} className={styles.backButton}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <button 
          type="button" 
          onClick={nextStep}
          className={styles.nextButton}
          disabled={!validateStep(5)}
        >
          Continuar
        </button>
      </div>
    </>
  );

  // Etapa 6 para clientes: Dados sensíveis ou comerciais (reservado para futuro)
  const renderStep6 = () => (
    <>
      <div className={styles.signupHeader}>
        <h2 className={styles.title}>Dados Comerciais</h2>
        <p className={styles.subtitle}>Campos reservados para expansão futura</p>
      </div>

      <div className={styles.twoColumnForm}>
        <div className={styles.inputGroup}>
          <p className={styles.label}>Esta etapa está reservada para funcionalidades futuras.</p>
          <p className={styles.subtitle}>Continue para finalizar seu cadastro.</p>
        </div>
      </div>

      <div className={styles.navigationButtons}>
        <button type="button" onClick={prevStep} className={styles.backButton}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <button 
          type="button" 
          onClick={nextStep}
          className={styles.nextButton}
        >
          Continuar
        </button>
      </div>
    </>
  );

  // Etapa 7 para clientes: Confirmação e consentimentos
  const renderStep7 = () => (
    <>
      <div className={styles.signupHeader}>
        <h2 className={styles.title}>Confirmação e Consentimentos</h2>
        <p className={styles.subtitle}>Finalize concordando com nossos termos</p>
      </div>

      <form onSubmit={handleSignup} className={styles.form}>
        <div className={styles.twoColumnForm}>
          <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="aceitaTermos"
                checked={formData.aceitaTermos || false}
                onChange={(e) => setFormData(prev => ({ ...prev, aceitaTermos: e.target.checked }))
                }
                className={styles.checkbox}
                required
              />
              <span className={styles.checkboxText}>
                Eu aceito os <a href="/termos" target="_blank" className={styles.link}>Termos de Uso</a> e a{' '}
                <a href="/privacidade" target="_blank" className={styles.link}>Política de Privacidade</a> *
              </span>
            </label>
          </div>

          <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="aceitaMarketing"
                checked={formData.aceitaMarketing || false}
                onChange={(e) => setFormData(prev => ({ ...prev, aceitaMarketing: e.target.checked }))
                }
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>
                Aceito receber comunicações de marketing e promoções por e-mail
              </span>
            </label>
          </div>
        </div>

        <div className={styles.navigationButtons}>
          <button type="button" onClick={prevStep} className={styles.backButton}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <button type="submit" className={styles.nextButton} disabled={loading || !validateStep(7)}>
            {loading ? <Loader2 className={styles.spinning} size={20} /> : null}
            {loading ? "Criando conta..." : "Finalizar Cadastro"}
          </button>
        </div>
      </form>
    </>
  );

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupCard}>
        {renderStepIndicator()}
        
        {error && (
          <div className={styles.errorMessage} role="alert">
            <span>{error}</span>
          </div>
        )}        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && formData.tipoUsuario === 'cliente' && renderStep4()}
        {currentStep === 5 && formData.tipoUsuario === 'cliente' && renderStep5()}
        {currentStep === 6 && formData.tipoUsuario === 'cliente' && renderStep6()}
        {currentStep === 7 && formData.tipoUsuario === 'cliente' && renderStep7()}

        <div className={styles.loginPrompt}>
          Já tem uma conta?{' '}
          <a href="/login" className={styles.loginLink}>
            Entrar
          </a>
        </div>
      </div>
    </div>
  );
}
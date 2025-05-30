"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

interface FormType {
  // Passo 0: Oficina
  nome_oficina: string;
  cnpj_cpf: string;
  razao_social: string;
  descricao: string;
  // Passo 1: Endereço
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  // Passo 2: Contato
  telefone_fixo: string;
  whatsapp: string;
  email: string;
  site: string;
  // Passo 3: Serviços
  servicos: string;
  servico_outros: string;
  // Passo 4: Horário
  dias_semana: string;
  horario_abertura: string;
  horario_fechamento: string;
  // Passo 5: Pagamento
  pagamento: string;
  pagamento_outros: string;
  // Passo 6: Imagens
  imagens: FileList | null;
  // Passo 7: Acesso
  email_login: string;
  senha: string;
  confirmar_senha: string;
  // Passo 8: Termos
  termos: boolean;
  // Novos campos
  servicosSelecionados: { nome: string; valor: string }[];
  pagamentosSelecionados: string[];
  diasSelecionados: string[];
}

const steps = [
  { label: "Oficina" },
  { label: "Endereço" },
  { label: "Contato" },
  { label: "Serviços" },
  { label: "Horário" },
  { label: "Pagamento" },
  { label: "Imagens" },
  { label: "Acesso" },
  { label: "Termos" },
];

const initialForm: FormType = {
  nome_oficina: "",
  cnpj_cpf: "",
  razao_social: "",
  descricao: "",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  telefone_fixo: "",
  whatsapp: "",
  email: "",
  site: "",
  servicos: "",
  servico_outros: "",
  dias_semana: "",
  horario_abertura: "",
  horario_fechamento: "",
  pagamento: "",
  pagamento_outros: "",
  imagens: null,
  email_login: "",
  senha: "",
  confirmar_senha: "",
  termos: false,
  servicosSelecionados: [],
  pagamentosSelecionados: [],
  diasSelecionados: [],
};

const servicosList = [
  { nome: "Troca de óleo", icon: "/oleo.png" },
  { nome: "Alinhamento e balanceamento", icon: "/balanceamento.png" },
  { nome: "Elétrica", icon: "/filtro.png" },
  { nome: "Mecânica geral", icon: "/freio.png" },
  { nome: "Ar-condicionado", icon: "/ar-condicionado.png" },
  { nome: "Freios", icon: "/freio.png" },
  { nome: "Escapamento", icon: "/file.svg" },
  { nome: "Suspensão", icon: "/polimento.png" },
  { nome: "Acessórios", icon: "/acessorios.png" },
  { nome: "Higienização", icon: "/higienizacao.png" },
  { nome: "Película", icon: "/pelicula.png" },
];

const pagamentosList = [
  { nome: "Dinheiro", icon: "/file.svg" },
  { nome: "Cartão de crédito", icon: "/file.svg" },
  { nome: "Cartão de débito", icon: "/file.svg" },
  { nome: "Pix", icon: "/file.svg" },
  { nome: "Transferência", icon: "/file.svg" },
];

const diasSemana = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];

function validateStep(step: number, form: FormType): boolean {
  switch (step) {
    case 0:
      return !!form.nome_oficina;
    case 1:
      return (
        !!form.cep &&
        !!form.rua &&
        !!form.numero &&
        !!form.bairro &&
        !!form.cidade &&
        !!form.estado
      );
    case 2:
      return !!form.whatsapp && !!form.email;
    case 3:
      return form.servicosSelecionados.length > 0 && form.servicosSelecionados.every(s => s.valor);
    case 4:
      return form.diasSelecionados.length > 0;
    case 5:
      return form.pagamentosSelecionados.length > 0;
    case 6:
      return !!form.imagens && form.imagens.length > 0;
    case 7:
      return (
        !!form.email_login &&
        !!form.senha &&
        form.senha === form.confirmar_senha
      );
    case 8:
      return !!form.termos;
    default:
      return true;
  }
}

export default function MultiStepFullPageForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormType>(initialForm);
  const [touched, setTouched] = useState<Partial<Record<keyof FormType, boolean>>>(
    {}
  );

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    const { name, value } = target;
    if (target.type === "checkbox") {
      setForm({ ...form, [name]: (target as HTMLInputElement).checked });
    } else if (target.type === "file") {
      setForm({ ...form, [name]: (target as HTMLInputElement).files });
    } else {
      setForm({ ...form, [name]: value });
    }
    setTouched({ ...touched, [name]: true });
  };

  const handleNext = () => {
    if (validateStep(step, form)) setStep((s) => s + 1);
    else setTouched((t) => ({ ...t, [`step${step}`]: true }));
  };

  const handlePrev = () => setStep((s) => Math.max(0, s - 1));

  // Busca endereço por CEP
  useEffect(() => {
    if (form.cep && form.cep.length === 8) {
      fetch(`https://viacep.com.br/ws/${form.cep}/json/`)
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            setForm(f => ({ ...f, bairro: data.bairro || "", cidade: data.localidade || "", estado: data.uf || "" }));
          }
        });
    }
    // eslint-disable-next-line
  }, [form.cep]);

  // Busca usuário logado para passo de conta
  const [userData, setUserData] = useState<{ nome: string; email: string; avatar_url: string } | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserData({
          nome: data.user.user_metadata?.full_name || data.user.email || "Usuário",
          email: data.user.email || "",
          avatar_url: data.user.user_metadata?.avatar_url || "/placeholder.svg"
        });
      }
    });
  }, []);

  const handleServicoCheck = (nome: string) => {
    setForm(f => {
      const exists = f.servicosSelecionados.find(s => s.nome === nome);
      if (exists) {
        return { ...f, servicosSelecionados: f.servicosSelecionados.filter(s => s.nome !== nome) };
      } else {
        return { ...f, servicosSelecionados: [...f.servicosSelecionados, { nome, valor: "" }] };
      }
    });
  };
  const handleServicoValor = (nome: string, valor: string) => {
    setForm(f => ({
      ...f,
      servicosSelecionados: f.servicosSelecionados.map(s => s.nome === nome ? { ...s, valor } : s)
    }));
  };
  const handlePagamentoCheck = (nome: string) => {
    setForm(f => {
      if (f.pagamentosSelecionados.includes(nome)) {
        return { ...f, pagamentosSelecionados: f.pagamentosSelecionados.filter(p => p !== nome) };
      } else {
        return { ...f, pagamentosSelecionados: [...f.pagamentosSelecionados, nome] };
      }
    });
  };
  const handleDiaCheck = (dia: string) => {
    setForm(f => {
      if (f.diasSelecionados.includes(dia)) {
        return { ...f, diasSelecionados: f.diasSelecionados.filter(d => d !== dia) };
      } else {
        return { ...f, diasSelecionados: [...f.diasSelecionados, dia] };
      }
    });
  };

  const estados = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];

  // Campos de cada passo
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
            <label className="font-medium text-lg">Nome da oficina *</label>
            <input
              name="nome_oficina"
              value={form.nome_oficina}
              onChange={handleChange}
              className={`px-4 py-3 rounded-lg border ${
                touched.nome_oficina && !form.nome_oficina
                  ? "border-red-500"
                  : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg bg-white shadow-sm`}
              placeholder="Digite o nome da oficina"
              required
            />
            {touched.nome_oficina && !form.nome_oficina && (
              <span className="text-red-500 text-sm">Campo obrigatório</span>
            )}
            <label className="font-medium">CNPJ ou CPF</label>
            <input
              name="cnpj_cpf"
              value={form.cnpj_cpf}
              onChange={handleChange}
              className="px-4 py-3 rounded-lg border border-gray-300"
            />
            <label className="font-medium">Razão social</label>
            <input
              name="razao_social"
              value={form.razao_social}
              onChange={handleChange}
              className="px-4 py-3 rounded-lg border border-gray-300"
            />
            <label className="font-medium">Descrição da oficina</label>
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              className="px-4 py-3 rounded-lg border border-gray-300"
              rows={3}
            />
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
            <label>CEP *</label>
            <input
              name="cep"
              value={form.cep}
              onChange={handleChange}
              className={`px-4 py-3 rounded-lg border ${
                touched.cep && !form.cep ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            <label>Rua *</label>
            <input
              name="rua"
              value={form.rua}
              onChange={handleChange}
              className={`px-4 py-3 rounded-lg border ${
                touched.rua && !form.rua ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            <label>Número *</label>
            <input
              name="numero"
              value={form.numero}
              onChange={handleChange}
              className={`px-4 py-3 rounded-lg border ${
                touched.numero && !form.numero
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              required
            />
            <label>Complemento</label>
            <input
              name="complemento"
              value={form.complemento}
              onChange={handleChange}
              className="px-4 py-3 rounded-lg border border-gray-300"
            />
            <label>Bairro *</label>
            <input
              name="bairro"
              value={form.bairro}
              onChange={handleChange}
              className={`px-4 py-3 rounded-lg border ${
                touched.bairro && !form.bairro ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            <label>Cidade *</label>
            <input
              name="cidade"
              value={form.cidade}
              onChange={handleChange}
              className={`px-4 py-3 rounded-lg border ${
                touched.cidade && !form.cidade ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            <label>Estado *</label>
            <select
              name="estado"
              value={form.estado}
              onChange={handleChange}
              className={`px-4 py-3 rounded-lg border ${
                touched.estado && !form.estado ? "border-red-500" : "border-gray-300"
              }`}
              required
            >
              <option value="">Selecione</option>
              {estados.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
            <label>Telefone fixo</label>
            <input
              name="telefone_fixo"
              value={form.telefone_fixo}
              onChange={handleChange}
              className="px-4 py-3 rounded-lg border border-gray-300"
            />
            <label>WhatsApp comercial *</label>
            <input
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              className={`px-4 py-3 rounded-lg border ${
                touched.whatsapp && !form.whatsapp
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              required
            />
            <label>E-mail *</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={`px-4 py-3 rounded-lg border ${
                touched.email && !form.email ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            <label>Site ou redes sociais</label>
            <input
              name="site"
              value={form.site}
              onChange={handleChange}
              className="px-4 py-3 rounded-lg border border-gray-300"
            />
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
            <label className="font-medium">Selecione os serviços oferecidos *</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {servicosList.map(servico => {
                const checked = form.servicosSelecionados.some(s => s.nome === servico.nome);
                return (
                  <div key={servico.nome} className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleServicoCheck(servico.nome)}
                      className="w-5 h-5 accent-blue-600"
                    />
                    <Image src={servico.icon} alt={servico.nome} width={32} height={32} />
                    <span className="flex-1">{servico.nome}</span>
                    {checked && (
                      <input
                        type="text"
                        placeholder="Valor médio (R$)"
                        value={form.servicosSelecionados.find(s => s.nome === servico.nome)?.valor || ""}
                        onChange={e => handleServicoValor(servico.nome, e.target.value)}
                        className="ml-2 px-2 py-1 border rounded w-32"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
            <label className="font-medium">Selecione os dias de atendimento *</label>
            <div className="flex flex-wrap gap-2">
              {diasSemana.map(dia => (
                <label key={dia} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${form.diasSelecionados.includes(dia) ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-white"}`}>
                  <input
                    type="checkbox"
                    checked={form.diasSelecionados.includes(dia)}
                    onChange={() => handleDiaCheck(dia)}
                    className="accent-blue-600"
                  />
                  {dia}
                </label>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
            <label className="font-medium">Formas de pagamento aceitas *</label>
            <div className="flex flex-wrap gap-4">
              {pagamentosList.map(pag => (
                <label key={pag.nome} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${form.pagamentosSelecionados.includes(pag.nome) ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-white"}`}>
                  <input
                    type="checkbox"
                    checked={form.pagamentosSelecionados.includes(pag.nome)}
                    onChange={() => handlePagamentoCheck(pag.nome)}
                    className="accent-blue-600"
                  />
                  <Image src={pag.icon} alt={pag.nome} width={24} height={24} />
                  {pag.nome}
                </label>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
            <label>Imagens da oficina *</label>
            <input
              name="imagens"
              type="file"
              accept="image/*"
              multiple
              onChange={handleChange}
              className={`px-4 py-3 rounded-lg border ${
                touched.imagens && (!form.imagens || form.imagens.length === 0)
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              required
            />
            <span className="text-gray-500 text-sm">
              Envie até 5 imagens (fachada, área de serviço, etc.)
            </span>
          </div>
        );
      case 7:
        return (
          <div className="flex flex-col items-center justify-center min-h-[40vh] w-full">
            <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center gap-4 max-w-md w-full">
              <span className="text-lg font-semibold text-blue-800">A oficina será vinculada à sua conta:</span>
              {userData && (
                <>
                  <Image src={userData.avatar_url} alt="Avatar" width={80} height={80} className="rounded-full" />
                  <div className="text-xl font-bold text-blue-900">{userData.nome}</div>
                  <div className="text-blue-700">{userData.email}</div>
                </>
              )}
            </div>
          </div>
        );
      case 8:
        return (
          <TermosScrollStep onAvancar={() => setStep(9)} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-blue-100 to-white">
      <main className="flex-1 flex flex-col justify-center items-center w-full px-2 py-8">
        <form
          className="w-full flex flex-col justify-center items-center"
          onSubmit={(e) => e.preventDefault()}
        >
          {renderStep()}
        </form>
      </main>
      {/* Indicador de passos na base */}
      <footer className="w-full py-6 bg-white/80 shadow-inner flex flex-col gap-4">
        <div className="flex justify-center gap-2 md:gap-4">
          {steps.map((s, i) => (
            <div key={s.label} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-lg font-bold transition-all duration-200 ${
                  i === step
                    ? "border-blue-700 bg-blue-100 text-blue-900 shadow-lg"
                    : "border-gray-300 bg-gray-100 text-gray-400"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-xs mt-1 ${
                  i === step ? "text-blue-800 font-semibold" : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center max-w-2xl mx-auto w-full mt-4 px-2">
          {step > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-6 py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-blue-800 font-semibold shadow transition"
            >
              Voltar
            </button>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!validateStep(step, form)}
            className={`px-8 py-3 rounded-full font-bold shadow transition text-white ${
              validateStep(step, form)
                ? "bg-blue-700 hover:bg-blue-800"
                : "bg-blue-200 cursor-not-allowed"
            }`}
          >
            Avançar
          </button>
        </div>
      </footer>
    </div>
  );
}

// Componente TermosScrollStep
import { useRef, useState as useStateReact } from "react";
function TermosScrollStep({ onAvancar }: { onAvancar: () => void }) {
  const [scrolled, setScrolled] = useStateReact(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) setScrolled(true);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);
  // Exemplo de texto longo
  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
      <div ref={ref} className="bg-white rounded-lg p-6 shadow max-h-80 overflow-y-auto border border-gray-200" style={{ minHeight: 240 }}>
        <h2 className="text-xl font-bold mb-2">Termos de Uso e Política de Privacidade</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat cursus enim, nec dictum ex enim nec urna. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat cursus enim, nec dictum ex enim nec urna. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat cursus enim, nec dictum ex enim nec urna.</p>
        <p>Proin nec urna euismod, tincidunt nunc eu, dictum erat. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat cursus enim, nec dictum ex enim nec urna. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat cursus enim, nec dictum ex enim nec urna.</p>
        <p>Proin nec urna euismod, tincidunt nunc eu, dictum erat. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat cursus enim, nec dictum ex enim nec urna. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat cursus enim, nec dictum ex enim nec urna.</p>
        <p>Proin nec urna euismod, tincidunt nunc eu, dictum erat. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat cursus enim, nec dictum ex enim nec urna. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat cursus enim, nec dictum ex enim nec urna.</p>
      </div>
      <button
        type="button"
        disabled={!scrolled}
        onClick={onAvancar}
        className={`px-8 py-3 rounded-full font-bold shadow transition text-white ${scrolled ? "bg-blue-700 hover:bg-blue-800" : "bg-blue-200 cursor-not-allowed"}`}
      >
        Avançar
      </button>
    </div>
  );
}

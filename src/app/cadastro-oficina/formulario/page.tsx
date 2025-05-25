"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";

// Lista de cidades por estado (exemplo simplificado, pode ser expandido)
const cidadesPorEstado: Record<string, string[]> = {
  AC: ["Rio Branco", "Cruzeiro do Sul"],
  AL: ["Maceió", "Arapiraca"],
  AP: ["Macapá", "Santana"],
  AM: ["Manaus", "Parintins"],
  BA: ["Salvador", "Feira de Santana"],
  CE: ["Fortaleza", "Juazeiro do Norte"],
  DF: ["Brasília"],
  ES: ["Vitória", "Vila Velha"],
  GO: ["Goiânia", "Aparecida de Goiânia"],
  MA: ["São Luís", "Imperatriz"],
  MT: ["Cuiabá", "Várzea Grande"],
  MS: ["Campo Grande", "Dourados"],
  MG: ["Belo Horizonte", "Uberlândia"],
  PA: ["Belém", "Ananindeua"],
  PB: ["João Pessoa", "Campina Grande"],
  PR: ["Curitiba", "Londrina"],
  PE: ["Recife", "Jaboatão dos Guararapes"],
  PI: ["Teresina", "Parnaíba"],
  RJ: ["Rio de Janeiro", "Niterói"],
  RN: ["Natal", "Mossoró"],
  RS: ["Porto Alegre", "Caxias do Sul"],
  RO: ["Porto Velho", "Ji-Paraná"],
  RR: ["Boa Vista"],
  SC: ["Florianópolis", "Joinville"],
  SP: ["São Paulo", "Campinas", "Santos"],
  SE: ["Aracaju", "Nossa Senhora do Socorro"],
  TO: ["Palmas", "Araguaína"],
};

const MapWithNoSSR = dynamic(() => import("@/components/WorkshopMap"), { ssr: false });

const estados = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

const servicos = [
  "Troca de óleo",
  "Alinhamento e balanceamento",
  "Elétrica",
  "Mecânica geral",
  "Ar-condicionado",
  "Freios",
  "Escapamento",
  "Suspensão"
];

const pagamentos = [
  "Dinheiro",
  "Cartão de crédito",
  "Cartão de débito",
  "Pix",
  "Transferência"
];

export default function FormularioOficina() {
  const router = useRouter();
  // Multi-step state
  const [step, setStep] = useState(0);

  // Dados do formulário
  const [form, setForm] = useState({
    nome_oficina: "",
    cnpj_cpf: "",
    razao_social: "",
    descricao: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    estado: "",
    cidade: "",
    latLng: null as { lat: number; lng: number } | null,
    telefone_fixo: "",
    whatsapp: "",
    email: "",
    site: "",
    servicos: [] as { nome: string; valor: string }[],
    servico_outros: "",
    dias_semana: "",
    horario_abertura: "",
    horario_fechamento: "",
    pagamentos: [] as string[],
    pagamento_outros: "",
    email_login: "",
    senha: "",
    confirmar_senha: "",
  });
  const [termos, setTermos] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estado para controlar o checkbox "Outros" em pagamentos
  const [outrosPagamentoAtivo, setOutrosPagamentoAtivo] = useState(!!form.pagamento_outros);

  // Ícones para as etapas
  const stepIcons = [
    <svg key="oficina" className="w-5 h-5 mr-1 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 13l2-2m0 0l7-7 7 7M5 11v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" /></svg>,
    <svg key="endereco" className="w-5 h-5 mr-1 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 12.414a4 4 0 10-5.657 5.657l4.243 4.243a8 8 0 1011.314-11.314l-4.243 4.243z" /></svg>,
    <svg key="contato" className="w-5 h-5 mr-1 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10a9 9 0 11-18 0 9 9 0 0118 0z" /><path d="M9 9h.01M15 9h.01M12 15h.01" /></svg>,
    <svg key="servicos" className="w-5 h-5 mr-1 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9.75 17L8 21h8l-1.75-4M12 3v12" /></svg>,
    <svg key="funcionamento" className="w-5 h-5 mr-1 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>,
    <svg key="pagamento" className="w-5 h-5 mr-1 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 10h20" /></svg>,
  ];

  // Mensagens de erro por campo obrigatório
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Animação de troca de etapa
  const [animating, setAnimating] = useState(false);
  function goToStep(next: number) {
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 220);
  }

  // Validação por etapa (com mensagens)
  function validateStepWithErrors() {
    const newErrors: { [key: string]: string } = {};
    if (step === 0) {
      if (!form.nome_oficina) newErrors.nome_oficina = "Campo obrigatório";
    }
    if (step === 1) {
      if (!form.cep) newErrors.cep = "Campo obrigatório";
      if (!form.rua) newErrors.rua = "Campo obrigatório";
      if (!form.bairro) newErrors.bairro = "Campo obrigatório";
      if (!form.estado) newErrors.estado = "Campo obrigatório";
      if (!form.cidade) newErrors.cidade = "Campo obrigatório";
      if (!form.latLng) newErrors.latLng = "Selecione no mapa";
    }
    if (step === 3) {
      if (form.servicos.length === 0) newErrors.servicos = "Selecione pelo menos um serviço";
      form.servicos.forEach((s, i) => {
        if (!s.valor) newErrors[`servico_${i}`] = "Informe o valor";
      });
    }
    if (step === 4) {
      if (!form.dias_semana) newErrors.dias_semana = "Campo obrigatório";
      if (!form.horario_abertura) newErrors.horario_abertura = "Campo obrigatório";
      if (!form.horario_fechamento) newErrors.horario_fechamento = "Campo obrigatório";
    }
    if (step === 5) {
      if (form.pagamentos.length === 0) newErrors.pagamentos = "Selecione pelo menos uma forma de pagamento";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Handlers para navegação e atualização de campos
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    // Só atualiza campos simples (string/number), não arrays/objetos
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      // Só use para checkboxes booleanos simples (ex: termos, não arrays)
      if (name === "termos") {
        setTermos(e.target.checked);
      }
      // Não atualize outros checkboxes via handleChange, pois arrays/objetos usam handlers próprios
      return; // <-- Adicionado para garantir que não caia no setForm abaixo
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleServicoChange(idx: number, field: "nome" | "valor", value: string) {
    setForm((prev) => {
      const servicos = [...prev.servicos];
      servicos[idx] = { ...servicos[idx], [field]: value };
      return { ...prev, servicos };
    });
  }

  function handleAddServico(nome: string) {
    setForm((prev) => {
      if (prev.servicos.find((s) => s.nome === nome)) return prev;
      return { ...prev, servicos: [...prev.servicos, { nome, valor: "" }] };
    });
  }

  function handleRemoveServico(nome: string) {
    setForm((prev) => ({ ...prev, servicos: prev.servicos.filter((s) => s.nome !== nome) }));
  }

  function handlePagamentoChange(nome: string, checked: boolean) {
    setForm((prev) => {
      const pagamentos = checked
        ? [...prev.pagamentos, nome]
        : prev.pagamentos.filter((p) => p !== nome);
      return { ...prev, pagamentos };
    });
  }

  // Submit final
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!termos) return alert("Você deve aceitar os termos.");
    setLoading(true);
    try {
      const { error } = await supabase.from("oficinas").insert({
        nome: form.nome_oficina,
        cnpj_cpf: form.cnpj_cpf,
        razao_social: form.razao_social,
        descricao: form.descricao,
        cep: form.cep,
        rua: form.rua,
        numero: form.numero,
        complemento: form.complemento,
        bairro: form.bairro,
        cidade: form.cidade,
        estado: form.estado,
        latitude: form.latLng?.lat,
        longitude: form.latLng?.lng,
        telefone_fixo: form.telefone_fixo,
        whatsapp: form.whatsapp,
        email: form.email,
        site: form.site,
        servicos: form.servicos.map(s => `${s.nome} (R$${s.valor})`).join(", "),
        servico_outros: form.servico_outros,
        dias_semana: form.dias_semana,
        horario_abertura: form.horario_abertura,
        horario_fechamento: form.horario_fechamento,
        pagamentos: form.pagamentos.join(", "),
        pagamento_outros: form.pagamento_outros,
        status: "pendente",
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      alert("Cadastro enviado para aprovação do admin!");
      router.push("/cadastro-oficina");
    } catch {
      alert("Erro ao cadastrar oficina. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // Renderização das etapas
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-blue-50 flex flex-col items-center py-8 px-2">
      <form className="w-full max-w-2xl px-2 md:px-0" onSubmit={handleSubmit} autoComplete="on">
        {/* Etapas do formulário com ícones e destaque visual */}
        <nav className="flex justify-between mb-8 select-none" aria-label="Etapas do cadastro">
          {["Oficina", "Endereço", "Contato", "Serviços", "Funcionamento", "Pagamento"].map((label, i) => (
            <div
              key={label}
              className={`flex flex-col items-center flex-1 cursor-pointer group transition-all duration-200 ${step === i ? "font-bold text-blue-700" : "text-gray-400"}`}
              aria-current={step === i ? "step" : undefined}
              tabIndex={0}
              onClick={() => goToStep(i)}
              onKeyDown={e => (e.key === "Enter" || e.key === " ") && goToStep(i)}
            >
              <span className={`mb-1 ${step === i ? "scale-110" : "opacity-60"}`}>{stepIcons[i]}</span>
              <span className="relative">
                {label}
                {step === i && (
                  <span className="block h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full w-full mt-1 animate-slideIn" />
                )}
              </span>
            </div>
          ))}
        </nav>
        {/* Animação de fade/slide entre etapas */}
        <div className={`transition-all duration-200 ${animating ? "opacity-0 translate-x-8 pointer-events-none" : "opacity-100 translate-x-0"}`}>
          {step === 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-blue-700 mb-2 flex items-center">{stepIcons[0]} Informações da Oficina</h4>
              <div>
                <label className="font-medium flex items-center">Nome da oficina *<span className="ml-1 text-red-500">*</span></label>
                <Input name="nome_oficina" value={form.nome_oficina} onChange={handleChange} required aria-required="true" aria-invalid={!!errors.nome_oficina} className="rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm" />
                {errors.nome_oficina && <span className="text-xs text-red-600 mt-1">{errors.nome_oficina}</span>}
              </div>
              <div>
                <label className="font-medium">CNPJ ou CPF</label>
                <Input name="cnpj_cpf" value={form.cnpj_cpf} onChange={handleChange} className="rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm" />
              </div>
              <div>
                <label className="font-medium">Razão social</label>
                <Input name="razao_social" value={form.razao_social} onChange={handleChange} className="rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm" />
              </div>
              <div>
                <label className="font-medium">Descrição da oficina</label>
                <Textarea name="descricao" value={form.descricao} onChange={handleChange} rows={3} className="rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm" />
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-blue-700 mb-2">Endereço</h4>
              <div>
                <label className="font-medium">CEP *</label>
                <Input name="cep" value={form.cep} onChange={handleChange} required className="rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm" />
              </div>
              <div>
                <label className="font-medium">Rua *</label>
                <Input name="rua" value={form.rua} onChange={handleChange} required className="rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm" />
              </div>
              <div>
                <label className="font-medium">Número *</label>
                <Input name="numero" value={form.numero} onChange={handleChange} className="rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm" />
              </div>
              <div>
                <label className="font-medium">Complemento</label>
                <Input name="complemento" value={form.complemento} onChange={handleChange} className="rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm" />
              </div>
              <div>
                <label className="font-medium">Bairro *</label>
                <Input name="bairro" value={form.bairro} onChange={handleChange} required className="rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm" />
              </div>
              <div>
                <label className="font-medium">Estado *</label>
                <select name="estado" className="form-select w-full border rounded px-2 py-2" value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value, cidade: "" }))} required>
                  <option value="">Selecione</option>
                  {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
              <div>
                <label className="font-medium">Cidade *</label>
                <select name="cidade" className="form-select w-full border rounded px-2 py-2" value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} required disabled={!form.estado}>
                  <option value="">{form.estado ? "Selecione" : "Escolha o estado primeiro"}</option>
                  {(form.estado ? cidadesPorEstado[form.estado] : []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-blue-700 mb-2">Localização no mapa *</h4>
                <div className="h-64 rounded-lg overflow-hidden border border-blue-200">
                  <MapWithNoSSR selectLocationMode={true} marker={form.latLng} onLocationSelect={(lat, lng) => setForm(f => ({ ...f, latLng: { lat, lng } }))} height="100%" />
                </div>
                {!form.latLng && <p className="text-sm text-red-600 mt-1">Clique no mapa para definir a localização.</p>}
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-blue-700 mb-2">Contato</h4>
              <div>
                <label className="font-medium">Telefone fixo</label>
                <Input name="telefone_fixo" value={form.telefone_fixo} onChange={handleChange} className="rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm" />
              </div>
              <div>
                <label className="font-medium">WhatsApp comercial</label>
                <Input name="whatsapp" value={form.whatsapp} onChange={handleChange} className="rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm" />
              </div>
              <div>
                <label className="font-medium">E-mail</label>
                <Input name="email" type="email" value={form.email} onChange={handleChange} className="rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm" />
              </div>
              <div>
                <label className="font-medium">Site ou redes sociais</label>
                <Input name="site" type="url" value={form.site} onChange={handleChange} className="rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm" />
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-blue-700 mb-2">Serviços oferecidos</h4>
              <div className="grid md:grid-cols-2 gap-2 mb-2">
                {servicos.map((serv) => {
                  const checked = form.servicos.some(s => s.nome === serv);
                  return (
                    <label key={serv} className="flex items-center gap-2">
                      <input type="checkbox" checked={checked} onChange={e => e.target.checked ? handleAddServico(serv) : handleRemoveServico(serv)} />
                      {serv}
                      {checked && (
                        <Input                        className="ml-2 w-32 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm"
                        placeholder="Valor (R$)"
                        value={form.servicos.find(s => s.nome === serv)?.valor || ""}
                        onChange={e => handleServicoChange(form.servicos.findIndex(s => s.nome === serv), "valor", e.target.value)}
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        />
                      )}
                    </label>
                  );
                })}
                <div className="md:col-span-2 flex flex-col gap-1 mt-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!form.servico_outros} onChange={e => setForm(f => ({ ...f, servico_outros: e.target.checked ? f.servico_outros : "" }))} /> Outros
                  </label>
                  <Input name="servico_outros" placeholder="Especifique outros serviços" value={form.servico_outros} onChange={handleChange} className="rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm" />
                </div>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-blue-700 mb-2">Horário de funcionamento</h4>
              <div>
                <label className="font-medium">Dias da semana atendidos</label>
                <Input name="dias_semana" placeholder="Ex: Segunda a sábado" value={form.dias_semana} onChange={handleChange} className="rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm" />
              </div>
              <div>
                <label className="font-medium">Horário de abertura</label>
                <Input name="horario_abertura" type="time" value={form.horario_abertura} onChange={handleChange} className="rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm" />
              </div>
              <div>
                <label className="font-medium">Horário de fechamento</label>
                <Input name="horario_fechamento" type="time" value={form.horario_fechamento} onChange={handleChange} className="rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm" />
              </div>
            </div>
          )}
          {step === 5 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-blue-700 mb-2">Formas de pagamento aceitas</h4>
              <div className="grid md:grid-cols-2 gap-2 mb-2">
                {pagamentos.map((pag) => (
                  <label key={pag} className="flex items-center gap-2">
                    <input type="checkbox" checked={form.pagamentos.includes(pag)} onChange={e => handlePagamentoChange(pag, e.target.checked)} /> {pag}
                  </label>
                ))}
                <div className="md:col-span-2 flex flex-col gap-1 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={outrosPagamentoAtivo}
                      onChange={e => {
                        setOutrosPagamentoAtivo(e.target.checked);
                        if (!e.target.checked) setForm(f => ({ ...f, pagamento_outros: "" }));
                      }}
                    /> Outros
                  </label>
                  {outrosPagamentoAtivo && (
                    <Input
                      name="pagamento_outros"
                      placeholder="Especifique outros"
                      value={form.pagamento_outros}
                      onChange={handleChange}
                      className="rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Navegação entre etapas e barra de progresso animada */}
        <div className="flex flex-col gap-4 mt-8">
          <div className="flex justify-between items-center">
            {step > 0 && (
              <Button type="button" variant="outline" onClick={() => goToStep(step - 1)} className="rounded-lg px-6 py-2 font-semibold bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                Voltar
              </Button>
            )}
            <div className="flex-1" />
            {step < 5 && (
              <Button type="button" onClick={() => validateStepWithErrors() && goToStep(step + 1)} disabled={animating} className="rounded-lg px-6 py-2 font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 text-white hover:brightness-110 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300">
                Próximo
              </Button>
            )}
            {step === 5 && (
              <Button type="submit" className="w-full text-lg py-3 rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 text-white font-bold shadow-md hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-blue-300" disabled={loading || !validateStepWithErrors() || !termos}>
                {loading ? "Enviando..." : "Cadastrar Oficina"}
              </Button>
            )}
          </div>
          {/* Barra de progresso animada */}
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-400 rounded-full transition-all duration-500 animate-progress"
              style={{ width: `${((step + 1) / 6) * 100}%` }}
              aria-valuenow={step + 1}
              aria-valuemin={1}
              aria-valuemax={6}
              role="progressbar"
            />
          </div>
        </div>
        {/* Termos de uso só na última etapa */}
        {step === 5 && (
          <div className="flex items-center mt-4">
            <Checkbox id="termos" checked={termos} onCheckedChange={v => setTermos(!!v)} required />
            <label htmlFor="termos" className="ml-2 text-sm">Li e aceito os <a href="#" className="underline text-blue-700">termos de uso</a> e a <a href="#" className="underline text-blue-700">política de privacidade</a> *</label>
          </div>
        )}
      </form>
      {/* Tailwind animation keyframes para barra e underline */}
      <style>{`
        @keyframes slideIn { from { width: 0; opacity: 0.5; } to { width: 100%; opacity: 1; } }
        .animate-slideIn { animation: slideIn 0.4s cubic-bezier(.4,0,.2,1) forwards; }
        @keyframes progress { 0% { width: 0; } 100% { width: 100%; } }
        .animate-progress { animation: progress 0.7s cubic-bezier(.4,0,.2,1); }
      `}</style>
    </div>
  );
}

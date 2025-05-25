"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

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

const steps = [
  "Oficina",
  "Endereço",
  "Contato",
  "Serviços",
  "Horário",
  "Pagamento",
  "Imagens",
  "Acesso",
  "Termos"
];

export default function FormularioOficina() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [outrosServicos, setOutrosServicos] = useState("");
  const [outrosPagamentos, setOutrosPagamentos] = useState("");
  const [termos, setTermos] = useState(false);
  // const [form, setForm] = useState({});

  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleChange = () => {
    // This function previously updated 'form', but now does nothing.
    // You may implement state handling here if needed in the future.
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!termos) return alert("Você deve aceitar os termos.");
    alert("Cadastro enviado! (Exemplo)");
    router.push("/cadastro-oficina");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white flex flex-col items-center py-8 px-2">
      <form className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 md:p-10" onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="flex justify-between items-center mb-8">
          {steps.map((s, i) => (
            <div key={s} className={`flex-1 flex flex-col items-center ${i === step ? 'text-blue-800 font-bold' : 'text-gray-400'}`}> 
              <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${i === step ? 'border-blue-800 bg-blue-100' : 'border-gray-300 bg-gray-100'}`}>{i+1}</div>
              <span className="text-xs mt-1 text-center">{s}</span>
            </div>
          ))}
        </div>
        {step === 0 && (
          <>
            <h4 className="text-lg font-semibold text-blue-700 mb-2 mt-4">Informações da Oficina</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="font-medium">Nome da oficina *</label>
                <Input name="nome_oficina" required onChange={handleChange} />
              </div>
              <div>
                <label className="font-medium">CNPJ ou CPF</label>
                <Input name="cnpj_cpf" onChange={handleChange} />
              </div>
              <div>
                <label className="font-medium">Razão social</label>
                <Input name="razao_social" onChange={handleChange} />
              </div>
              <div className="md:col-span-2">
                <label className="font-medium">Descrição da oficina</label>
                <Textarea name="descricao" rows={3} onChange={handleChange} />
              </div>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <h4 className="text-lg font-semibold text-blue-700 mb-2">Endereço</h4>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="font-medium">CEP</label>
                <Input name="cep" onChange={handleChange} />
              </div>
              <div className="md:col-span-2">
                <label className="font-medium">Rua</label>
                <Input name="rua" onChange={handleChange} />
              </div>
              <div>
                <label className="font-medium">Número</label>
                <Input name="numero" onChange={handleChange} />
              </div>
              <div className="md:col-span-2">
                <label className="font-medium">Complemento</label>
                <Input name="complemento" onChange={handleChange} />
              </div>
              <div className="md:col-span-2">
                <label className="font-medium">Bairro</label>
                <Input name="bairro" onChange={handleChange} />
              </div>
              <div className="md:col-span-2">
                <label className="font-medium">Cidade</label>
                <Input name="cidade" onChange={handleChange} />
              </div>
              <div>
                <label className="font-medium">Estado</label>
                <select name="estado" className="form-select w-full border rounded px-2 py-2" onChange={handleChange}>
                  <option value="">Selecione</option>
                  {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h4 className="text-lg font-semibold text-blue-700 mb-2">Contato</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="font-medium">Telefone fixo</label>
                <Input name="telefone_fixo" onChange={handleChange} />
              </div>
              <div>
                <label className="font-medium">WhatsApp comercial</label>
                <Input name="whatsapp" onChange={handleChange} />
              </div>
              <div>
                <label className="font-medium">E-mail</label>
                <Input name="email" type="email" onChange={handleChange} />
              </div>
              <div>
                <label className="font-medium">Site ou redes sociais</label>
                <Input name="site" type="url" onChange={handleChange} />
              </div>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h4 className="text-lg font-semibold text-blue-700 mb-2">Serviços oferecidos</h4>
            <div className="grid md:grid-cols-4 gap-2 mb-2">
              {servicos.map((serv) => (
                <label key={serv} className="flex items-center gap-2">
                  <Checkbox name="servicos" value={serv} onChange={handleChange} /> {serv}
                </label>
              ))}
              <div className="md:col-span-2 flex flex-col gap-1 mt-2">
                <label className="flex items-center gap-2">
                  <Checkbox name="servicos" value="Outros" onChange={handleChange} /> Outros
                </label>
                <Input name="servico_outros" placeholder="Especifique outros serviços" value={outrosServicos} onChange={e => setOutrosServicos(e.target.value)} />
              </div>
            </div>
          </>
        )}
        {step === 4 && (
          <>
            <h4 className="text-lg font-semibold text-blue-700 mb-2">Horário de funcionamento</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="font-medium">Dias da semana atendidos</label>
                <Input name="dias_semana" placeholder="Ex: Segunda a sábado" onChange={handleChange} />
              </div>
              <div>
                <label className="font-medium">Horário de abertura</label>
                <Input name="horario_abertura" type="time" onChange={handleChange} />
              </div>
              <div>
                <label className="font-medium">Horário de fechamento</label>
                <Input name="horario_fechamento" type="time" onChange={handleChange} />
              </div>
            </div>
          </>
        )}
        {step === 5 && (
          <>
            <h4 className="text-lg font-semibold text-blue-700 mb-2">Formas de pagamento aceitas</h4>
            <div className="grid md:grid-cols-3 gap-2 mb-2">
              {pagamentos.map((pag) => (
                <label key={pag} className="flex items-center gap-2">
                  <Checkbox name="pagamento" value={pag} onChange={handleChange} /> {pag}
                </label>
              ))}
              <div className="md:col-span-2 flex flex-col gap-1 mt-2">
                <label className="flex items-center gap-2">
                  <Checkbox name="pagamento" value="Outros" onChange={handleChange} /> Outros
                </label>
                <Input name="pagamento_outros" placeholder="Especifique outros" value={outrosPagamentos} onChange={e => setOutrosPagamentos(e.target.value)} />
              </div>
            </div>
          </>
        )}
        {step === 6 && (
          <>
            <h4 className="text-lg font-semibold text-blue-700 mb-2">Imagens da oficina</h4>
            <div className="mb-4">
              <label className="font-medium">Envie até 5 imagens (fachada, área de serviço, etc.)</label>
              <Input name="imagens" type="file" accept="image/*" multiple onChange={handleChange} />
            </div>
          </>
        )}
        {step === 7 && (
          <>
            <h4 className="text-lg font-semibold text-blue-700 mb-2">Dados de acesso</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="font-medium">E-mail de login *</label>
                <Input name="email_login" type="email" required onChange={handleChange} />
              </div>
              <div>
                <label className="font-medium">Senha *</label>
                <Input name="senha" type="password" required onChange={handleChange} />
              </div>
              <div>
                <label className="font-medium">Confirmar senha *</label>
                <Input name="confirmar_senha" type="password" required onChange={handleChange} />
              </div>
            </div>
          </>
        )}
        {step === 8 && (
          <>
            <div className="flex items-center mb-4">
              <Checkbox id="termos" checked={termos} onCheckedChange={v => setTermos(!!v)} required />
              <label htmlFor="termos" className="ml-2 text-sm">Li e aceito os <a href="#" className="underline text-blue-700">termos de uso</a> e a <a href="#" className="underline text-blue-700">política de privacidade</a> *</label>
            </div>
          </>
        )}
        <div className="flex justify-between mt-8">
          <Button type="button" onClick={prevStep} disabled={step === 0} className="px-6">Voltar</Button>
          {step < steps.length - 1 ? (
            <Button type="button" onClick={nextStep} className="px-6">Avançar</Button>
          ) : (
            <Button type="submit" className="w-40 text-lg py-3">Cadastrar Oficina</Button>
          )}
        </div>
      </form>
    </div>
  );
}

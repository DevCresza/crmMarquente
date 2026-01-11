import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, CreditCard, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { registrationsApi } from '@/api';
import type { B2BStatus, BusinessPartner, BankReference } from '@/types';

export function B2BRegistration() {
  const [registrationType, setRegistrationType] = useState<'vista' | 'prazo'>('vista');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Dados comuns
  const [brandOfInterest, setBrandOfInterest] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [billingRange, setBillingRange] = useState('');

  // Dados específicos para "a prazo"
  const [businessPartners, setBusinessPartners] = useState<BusinessPartner[]>([
    { name: '', cpf: '' },
  ]);
  const [bankReferences, setBankReferences] = useState<BankReference[]>([
    { bank_name: '', agency: '', account: '', account_type: 'corrente' },
  ]);

  const resetForm = () => {
    setBrandOfInterest('');
    setCnpj('');
    setRazaoSocial('');
    setContactName('');
    setEmail('');
    setWhatsapp('');
    setCidade('');
    setUf('');
    setBillingRange('');
    setBusinessPartners([{ name: '', cpf: '' }]);
    setBankReferences([{ bank_name: '', agency: '', account: '', account_type: 'corrente' }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // Determina o status inicial baseado no tipo de cadastro
      const initialStatus: B2BStatus = registrationType === 'vista'
        ? 'Lead Site - À Vista'
        : 'Lead Site - A Prazo';

      const registrationData = {
        registration_type: registrationType,
        brand_of_interest: brandOfInterest,
        cnpj,
        razao_social: razaoSocial,
        contact_name: contactName,
        email,
        whatsapp_phone: whatsapp,
        cidade,
        uf,
        billing_range: billingRange,
        status: initialStatus,
        lgpd_accepted: true,
        ...(registrationType === 'prazo' && {
          business_partners: businessPartners,
          bank_references: bankReferences,
        }),
      };

      const result = await registrationsApi.create(registrationData);

      if (result) {
        setSuccess(true);
        resetForm();
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError('Erro ao enviar cadastro. Por favor, tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao enviar cadastro:', err);
      setError('Erro ao enviar cadastro. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addBusinessPartner = () => {
    setBusinessPartners([...businessPartners, { name: '', cpf: '' }]);
  };

  const removeBusinessPartner = (index: number) => {
    setBusinessPartners(businessPartners.filter((_, i) => i !== index));
  };

  const updateBusinessPartner = (index: number, field: keyof BusinessPartner, value: string) => {
    const updated = [...businessPartners];
    updated[index][field] = value;
    setBusinessPartners(updated);
  };

  const addBankReference = () => {
    setBankReferences([...bankReferences, { bank_name: '', agency: '', account: '', account_type: 'corrente' }]);
  };

  const removeBankReference = (index: number) => {
    setBankReferences(bankReferences.filter((_, i) => i !== index));
  };

  const updateBankReference = (index: number, field: keyof BankReference, value: string) => {
    const updated = [...bankReferences];
    if (field === 'account_type') {
      updated[index][field] = value as 'corrente' | 'poupanca';
    } else {
      updated[index][field] = value;
    }
    setBankReferences(updated);
  };

  const ESTADOS_BRASILEIROS = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cadastro B2B</h1>
        <p className="text-muted-foreground mt-2">
          Preencha o formulário para registrar um novo cliente B2B
        </p>
      </div>

      {/* Success Alert */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <AlertDescription className="text-green-800 dark:text-green-200">
                Cadastro enviado com sucesso! O cliente será analisado em breve.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Registration Type Tabs */}
      <Tabs value={registrationType} onValueChange={(v) => setRegistrationType(v as 'vista' | 'prazo')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vista">
            <CreditCard className="h-4 w-4 mr-2" />
            À Vista
          </TabsTrigger>
          <TabsTrigger value="prazo">
            <Building2 className="h-4 w-4 mr-2" />
            A Prazo
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="vista" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Cadastro simplificado para compras à vista
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Marca de Interesse</Label>
                    <Input
                      id="brand"
                      value={brandOfInterest}
                      onChange={(e) => setBrandOfInterest(e.target.value)}
                      placeholder="Ex: Marca A"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      placeholder="00.000.000/0000-00"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="razaoSocial">Razão Social</Label>
                    <Input
                      id="razaoSocial"
                      value={razaoSocial}
                      onChange={(e) => setRazaoSocial(e.target.value)}
                      placeholder="Nome da empresa"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactName">Nome do Contato</Label>
                    <Input
                      id="contactName"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Nome completo"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contato@empresa.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      placeholder="Nome da cidade"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="uf">UF</Label>
                    <Select value={uf} onValueChange={setUf} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS_BRASILEIROS.map((estado) => (
                          <SelectItem key={estado} value={estado}>
                            {estado}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="billingRange">Faixa de Faturamento</Label>
                    <Select value={billingRange} onValueChange={setBillingRange} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a faixa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="R$ 0 - R$ 50k">R$ 0 - R$ 50k</SelectItem>
                        <SelectItem value="R$ 50k - R$ 100k">R$ 50k - R$ 100k</SelectItem>
                        <SelectItem value="R$ 100k - R$ 200k">R$ 100k - R$ 200k</SelectItem>
                        <SelectItem value="R$ 200k - R$ 500k">R$ 200k - R$ 500k</SelectItem>
                        <SelectItem value="R$ 500k+">R$ 500k+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar Cadastro'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="prazo" className="space-y-6 mt-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Dados principais da empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand-prazo">Marca de Interesse</Label>
                    <Input
                      id="brand-prazo"
                      value={brandOfInterest}
                      onChange={(e) => setBrandOfInterest(e.target.value)}
                      placeholder="Ex: Marca A"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj-prazo">CNPJ</Label>
                    <Input
                      id="cnpj-prazo"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      placeholder="00.000.000/0000-00"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="razaoSocial-prazo">Razão Social</Label>
                    <Input
                      id="razaoSocial-prazo"
                      value={razaoSocial}
                      onChange={(e) => setRazaoSocial(e.target.value)}
                      placeholder="Nome da empresa"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactName-prazo">Nome do Contato</Label>
                    <Input
                      id="contactName-prazo"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Nome completo"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-prazo">Email</Label>
                    <Input
                      id="email-prazo"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contato@empresa.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-prazo">WhatsApp</Label>
                    <Input
                      id="whatsapp-prazo"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cidade-prazo">Cidade</Label>
                    <Input
                      id="cidade-prazo"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      placeholder="Nome da cidade"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="uf-prazo">UF</Label>
                    <Select value={uf} onValueChange={setUf} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS_BRASILEIROS.map((estado) => (
                          <SelectItem key={estado} value={estado}>
                            {estado}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="billingRange-prazo">Faixa de Faturamento</Label>
                    <Select value={billingRange} onValueChange={setBillingRange} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a faixa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="R$ 0 - R$ 50k">R$ 0 - R$ 50k</SelectItem>
                        <SelectItem value="R$ 50k - R$ 100k">R$ 50k - R$ 100k</SelectItem>
                        <SelectItem value="R$ 100k - R$ 200k">R$ 100k - R$ 200k</SelectItem>
                        <SelectItem value="R$ 200k - R$ 500k">R$ 200k - R$ 500k</SelectItem>
                        <SelectItem value="R$ 500k+">R$ 500k+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sócios */}
            <Card>
              <CardHeader>
                <CardTitle>Sócios da Empresa</CardTitle>
                <CardDescription>
                  Adicione os sócios responsáveis pela empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {businessPartners.map((partner, index) => (
                  <div key={index} className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Nome do Sócio</Label>
                      <Input
                        value={partner.name}
                        onChange={(e) =>
                          updateBusinessPartner(index, 'name', e.target.value)
                        }
                        placeholder="Nome completo"
                        required
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>CPF</Label>
                      <Input
                        value={partner.cpf}
                        onChange={(e) =>
                          updateBusinessPartner(index, 'cpf', e.target.value)
                        }
                        placeholder="000.000.000-00"
                        required
                      />
                    </div>
                    {businessPartners.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBusinessPartner(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addBusinessPartner}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Sócio
                </Button>
              </CardContent>
            </Card>

            {/* Referências Bancárias */}
            <Card>
              <CardHeader>
                <CardTitle>Referências Bancárias</CardTitle>
                <CardDescription>
                  Informe as contas bancárias da empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {bankReferences.map((reference, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Banco</Label>
                        <Input
                          value={reference.bank_name}
                          onChange={(e) =>
                            updateBankReference(index, 'bank_name', e.target.value)
                          }
                          placeholder="Nome do banco"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Agência</Label>
                        <Input
                          value={reference.agency}
                          onChange={(e) =>
                            updateBankReference(index, 'agency', e.target.value)
                          }
                          placeholder="0000"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Conta</Label>
                        <Input
                          value={reference.account}
                          onChange={(e) =>
                            updateBankReference(index, 'account', e.target.value)
                          }
                          placeholder="00000-0"
                          required
                        />
                      </div>
                    </div>
                    {bankReferences.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBankReference(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover Referência
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addBankReference}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Referência Bancária
                </Button>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar Cadastro'}
              </Button>
            </div>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  );
}

import { Check, Crown, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function Planos() {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const { toast } = useToast();

  const plans = [
    {
      icon: Shield,
      name: 'Básico',
      price: 'R$ 99',
      period: '/mês',
      description: 'Perfeito para pets que precisam de cuidados essenciais',
      color: 'from-primary to-primary-glow',
      features: [
        '1 Consulta veterinária por mês',
        '10% de desconto em banho e tosa',
        'Vacinação com 15% de desconto',
        'Atendimento prioritário via WhatsApp',
        'Carteirinha digital do pet',
      ],
    },
    {
      icon: Zap,
      name: 'Premium',
      price: 'R$ 199',
      period: '/mês',
      description: 'Ideal para tutores que querem mais benefícios',
      color: 'from-accent to-secondary',
      popular: true,
      features: [
        '2 Consultas veterinárias por mês',
        '20% de desconto em banho e tosa',
        'Vacinação com 25% de desconto',
        'Check-up completo semestral grátis',
        'Atendimento prioritário 24/7',
        'Carteirinha digital premium',
        'Desconto em medicamentos',
      ],
    },
    {
      icon: Crown,
      name: 'VIP',
      price: 'R$ 349',
      period: '/mês',
      description: 'O melhor cuidado para o seu melhor amigo',
      color: 'from-secondary to-brand-orange',
      features: [
        'Consultas veterinárias ilimitadas',
        '30% de desconto em todos os serviços',
        'Vacinação com 40% de desconto',
        'Check-up completo trimestral grátis',
        'Atendimento VIP com veterinário dedicado',
        'Emergências 24/7 sem custo adicional',
        'Banho e tosa mensais inclusos',
        'Desconto especial em cirurgias',
      ],
    },
  ];

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setPaymentMethod('');
  };

  const handlePayment = () => {
    if (!paymentMethod) {
      toast({
        title: 'Selecione uma forma de pagamento',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Plano selecionado!',
      description: `Você escolheu o plano ${selectedPlan.name} com pagamento via ${
        paymentMethod === 'credit' ? 'Cartão de Crédito' : 
        paymentMethod === 'debit' ? 'Cartão de Débito' : 'PIX'
      }.`,
    });

    setSelectedPlan(null);
    setPaymentMethod('');
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="section-title">Planos PetCare</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
            Escolha o plano ideal para garantir o melhor cuidado contínuo para seu pet
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`pet-card relative ${
                plan.popular ? 'ring-2 ring-primary shadow-2xl scale-105' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Mais Popular
                </div>
              )}

              <div className={`service-icon bg-gradient-to-br ${plan.color} mx-auto`}>
                <plan.icon className="h-8 w-8" />
              </div>

              <h3 className="text-2xl font-bold mb-2 text-center">{plan.name}</h3>

              <div className="text-center mb-4">
                <span className="text-4xl font-bold text-primary">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <p className="text-muted-foreground text-center mb-6">
                {plan.description}
              </p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full ${
                  plan.popular
                    ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90'
                    : ''
                }`}
              >
                Escolher Plano
              </Button>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="pet-card bg-gradient-to-br from-primary/5 to-accent/5 text-center py-12">
          <h2 className="text-3xl font-bold mb-4">Por Que Assinar um Plano?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {[
              {
                title: 'Economia',
                description: 'Economize até 40% em todos os serviços veterinários',
              },
              {
                title: 'Praticidade',
                description: 'Agendamento prioritário e atendimento preferencial',
              },
              {
                title: 'Tranquilidade',
                description: 'Seu pet sempre protegido com cuidados regulares',
              },
            ].map((benefit, index) => (
              <div key={index}>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar Assinatura</DialogTitle>
            <DialogDescription>
              Plano {selectedPlan?.name} - {selectedPlan?.price}/mês
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Escolha a forma de pagamento:
              </Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted cursor-pointer">
                  <RadioGroupItem value="credit" id="credit" />
                  <Label htmlFor="credit" className="cursor-pointer flex-1">
                    💳 Cartão de Crédito
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted cursor-pointer">
                  <RadioGroupItem value="debit" id="debit" />
                  <Label htmlFor="debit" className="cursor-pointer flex-1">
                    💳 Cartão de Débito
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted cursor-pointer">
                  <RadioGroupItem value="pix" id="pix" />
                  <Label htmlFor="pix" className="cursor-pointer flex-1">
                    📱 PIX
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedPlan(null)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handlePayment} className="flex-1">
                Confirmar Pagamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

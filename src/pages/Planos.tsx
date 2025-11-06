"use client"

import { Check, Crown, Zap, Shield, Star } from 'lucide-react';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import NumberFlow from '@number-flow/react';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Planos() {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const { toast } = useToast();
  const switchRef = useRef<HTMLButtonElement>(null);

  const plans = [
    {
      icon: Shield,
      name: 'Amigo Fiel',
      monthlyPrice: 99,
      yearlyPrice: 950,
      period: 'mês',
      description: 'Cuidados essenciais para quem está começando',
      priceId: 'price_1SO4nkPSIQsRBK245qRvn6dB',
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
      icon: Crown,
      name: 'Elite Total',
      monthlyPrice: 349,
      yearlyPrice: 3350,
      period: 'mês',
      description: 'Experiência premium sem limites para seu pet',
      priceId: 'price_1SO4oTPSIQsRBK24cZzSLrTR',
      color: 'from-accent to-primary',
      popular: true,
      features: [
        'Consultas veterinárias ilimitadas',
        '30% de desconto em todos os serviços',
        'Vacinação com 40% de desconto',
        'Check-up completo trimestral grátis',
        'Veterinário dedicado exclusivo',
        'Emergências 24/7 sem custo adicional',
        'Banho e tosa mensais inclusos',
        'Desconto especial em cirurgias',
      ],
    },
    {
      icon: Zap,
      name: 'Protetor Premium',
      monthlyPrice: 199,
      yearlyPrice: 1910,
      period: 'mês',
      description: 'Equilíbrio perfeito entre benefícios e investimento',
      priceId: 'price_1SO4oTPSIQsRBK24cZzSLrTR',
      color: 'from-secondary to-brand-orange',
      features: [
        '3 Consultas veterinárias por mês',
        '20% de desconto em todos os serviços',
        'Vacinação com 30% de desconto',
        'Check-up semestral grátis',
        'Atendimento preferencial',
        '1 Banho e tosa mensal incluso',
      ],
    },
  ];

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
  };

  const handleToggle = (checked: boolean) => {
    setIsYearly(checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: [
          'hsl(var(--primary))',
          'hsl(var(--accent))',
          'hsl(var(--secondary))',
          'hsl(var(--muted))',
        ],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ['circle'],
      });
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan?.priceId) {
      toast({
        title: 'Erro',
        description: 'Plano inválido. Tente novamente.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Creating checkout session for:', selectedPlan.name);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId: selectedPlan.priceId,
          mode: 'subscription'
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout não retornada');
      }
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      toast({
        title: 'Erro ao processar pagamento',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Planos PetCare
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano que funciona para você
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="flex justify-center mb-10">
          <label className="relative inline-flex items-center cursor-pointer gap-3">
            <span className="font-semibold">Mensal</span>
            <Label>
              <Switch
                ref={switchRef as any}
                checked={isYearly}
                onCheckedChange={handleToggle}
                className="relative"
              />
            </Label>
            <span className="font-semibold">
              Anual <span className="text-primary">(Economize 20%)</span>
            </span>
          </label>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              animate={{ 
                y: plan.popular ? -20 : 0, 
                opacity: 1,
                scale: plan.popular ? 1 : 0.94,
              }}
              transition={{
                duration: 0.6,
                type: 'spring',
                stiffness: 100,
                damping: 30,
                delay: index * 0.1,
              }}
              className={cn(
                `rounded-2xl border-[1px] p-6 bg-background text-center flex flex-col relative`,
                plan.popular ? 'border-primary border-2 shadow-2xl' : 'border-border',
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary py-0.5 px-2 rounded-bl-xl rounded-tr-xl flex items-center">
                  <Star className="text-primary-foreground h-4 w-4 fill-current" />
                  <span className="text-primary-foreground ml-1 font-sans font-semibold">
                    Popular
                  </span>
                </div>
              )}
              
              <div className="flex-1 flex flex-col">
                <div className={`service-icon bg-gradient-to-br ${plan.color} mx-auto mb-4`}>
                  <plan.icon className="h-8 w-8" />
                </div>

                <p className="text-base font-semibold text-muted-foreground mb-4">
                  {plan.name}
                </p>

                <div className="flex items-center justify-center gap-x-2 mb-2">
                  <span className="text-5xl font-bold tracking-tight text-foreground">
                    <NumberFlow
                      value={isYearly ? plan.yearlyPrice / 12 : plan.monthlyPrice}
                      format={{
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }}
                      transformTiming={{
                        duration: 500,
                        easing: 'ease-out',
                      }}
                      willChange
                    />
                  </span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-muted-foreground">
                    / {plan.period}
                  </span>
                </div>

                <p className="text-xs leading-5 text-muted-foreground mb-6">
                  {isYearly ? 'cobrado anualmente' : 'cobrado mensalmente'}
                </p>

                <p className="text-sm text-muted-foreground mb-6">
                  {plan.description}
                </p>

                <ul className="space-y-3 mb-6 text-left">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <hr className="w-full my-4" />

                <Button
                  onClick={() => handleSelectPlan(plan)}
                  className={cn(
                    "w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter",
                    "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-1",
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  )}
                >
                  Escolher Plano
                </Button>
              </div>
            </motion.div>
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
      <Dialog open={!!selectedPlan} onOpenChange={() => !isProcessing && setSelectedPlan(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar Assinatura</DialogTitle>
            <DialogDescription>
              Plano {selectedPlan?.name} - R$ {isYearly ? selectedPlan?.yearlyPrice : selectedPlan?.monthlyPrice}/{isYearly ? 'ano' : 'mês'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                Você será redirecionado para o checkout seguro do Stripe onde poderá:
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1 list-disc list-inside">
                <li>Pagar com cartão de crédito (até 12x sem juros)</li>
                <li>Pagar com cartão de débito</li>
                <li>Pagar com boleto bancário</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedPlan(null)}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handlePayment} 
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processando...' : 'Ir para Pagamento'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { Syringe, Scissors, Heart, Stethoscope, Pill, Bath } from 'lucide-react';
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

export default function Servicos() {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const { toast } = useToast();
  const services = [
    {
      icon: Stethoscope,
      title: 'Consulta Veterinária',
      description: 'Atendimento completo com veterinários especializados para diagnóstico e tratamento.',
      price: 'A partir de R$ 150',
      color: 'from-primary to-primary-glow',
    },
    {
      icon: Syringe,
      title: 'Vacinação',
      description: 'Vacinas essenciais para manter seu pet protegido contra doenças.',
      price: 'A partir de R$ 80',
      color: 'from-accent to-secondary',
    },
    {
      icon: Scissors,
      title: 'Banho e Tosa',
      description: 'Serviço completo de higiene e estética para seu pet ficar ainda mais bonito.',
      price: 'A partir de R$ 100',
      color: 'from-secondary to-brand-orange',
    },
    {
      icon: Bath,
      title: 'Banho Terapêutico',
      description: 'Tratamento especial para pets com problemas de pele ou alergias.',
      price: 'A partir de R$ 120',
      color: 'from-primary to-accent',
    },
    {
      icon: Pill,
      title: 'Vermifugação',
      description: 'Prevenção e tratamento contra vermes e parasitas intestinais.',
      price: 'A partir de R$ 60',
      color: 'from-accent to-brand-orange',
    },
    {
      icon: Heart,
      title: 'Check-up Completo',
      description: 'Exame geral de saúde com avaliação detalhada do seu pet.',
      price: 'A partir de R$ 200',
      color: 'from-primary to-secondary',
    },
  ];

  const handleSelectService = (service: any) => {
    setSelectedService(service);
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
      title: 'Pagamento confirmado!',
      description: `Serviço ${selectedService.title} - Pagamento via ${
        paymentMethod === 'credit' ? 'Cartão de Crédito' : 
        paymentMethod === 'debit' ? 'Cartão de Débito' : 'PIX'
      }.`,
    });

    setSelectedService(null);
    setPaymentMethod('');
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="section-title">Nossos Serviços</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
            Oferecemos uma gama completa de serviços veterinários para garantir a saúde e bem-estar do seu pet
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <div
              key={index}
              className="service-card"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`service-icon bg-gradient-to-br ${service.color}`}>
                <service.icon className="h-8 w-8" />
              </div>
              
              <h3 className="text-2xl font-bold mb-3 text-center">{service.title}</h3>
              
              <p className="text-muted-foreground text-center mb-4">
                {service.description}
              </p>
              
              <div className="text-center">
                <p className="text-primary font-semibold text-lg mb-4">{service.price}</p>
                <Button 
                  onClick={() => handleSelectService(service)}
                  className="w-full"
                >
                  Contratar Serviço
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="pet-card text-center py-12 bg-gradient-to-br from-primary/5 to-accent/5">
          <h2 className="text-3xl font-bold mb-4">Pronto para Agendar?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Escolha o serviço ideal para seu pet e agende seu horário. Atendimento rápido e profissional!
          </p>
          <Link to="/agendar" className="pet-button">
            Agendar Agora
          </Link>
        </div>

        {/* Dicas Section */}
        <div className="mt-20">
          <h2 className="section-title text-center mb-12">Dicas de Cuidados com Pets</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Alimentação Saudável',
                description: 'Uma dieta balanceada é essencial para a saúde do seu pet. Consulte sempre um veterinário para escolher a melhor ração.',
                tip: 'Evite dar comida humana ao seu pet',
              },
              {
                title: 'Exercícios Diários',
                description: 'Passeios regulares ajudam a manter seu pet ativo, saudável e feliz. Adapte a intensidade à raça e idade.',
                tip: 'Pelo menos 30 minutos de exercício por dia',
              },
              {
                title: 'Higiene Regular',
                description: 'Banhos periódicos, escovação e cuidados dentários são fundamentais para prevenir doenças e manter seu pet limpo.',
                tip: 'Escove os dentes do seu pet 3x por semana',
              },
            ].map((dica, index) => (
              <div key={index} className="pet-card">
                <h3 className="text-xl font-bold mb-3">{dica.title}</h3>
                <p className="text-muted-foreground mb-4">{dica.description}</p>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-primary font-medium">💡 {dica.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar Pagamento</DialogTitle>
            <DialogDescription>
              {selectedService?.title} - {selectedService?.price}
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
                onClick={() => setSelectedService(null)}
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
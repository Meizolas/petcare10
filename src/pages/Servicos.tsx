import { Syringe, Scissors, Heart, Stethoscope, Pill, Bath } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Servicos() {
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
                <p className="text-primary font-semibold text-lg">{service.price}</p>
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
    </div>
  );
}
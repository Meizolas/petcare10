import { Link } from 'react-router-dom';
import { Heart, Sparkles, Shield, Clock } from 'lucide-react';

export default function PetCareHome() {
  const features = [
    {
      icon: Heart,
      title: 'Cuidado com Amor',
      description: 'Tratamos cada pet como se fosse nosso, com carinho e dedicação.',
    },
    {
      icon: Shield,
      title: 'Profissionais Qualificados',
      description: 'Equipe experiente e capacitada para cuidar do seu melhor amigo.',
    },
    {
      icon: Clock,
      title: 'Atendimento Rápido',
      description: 'Agende consultas de forma prática e seja atendido no horário marcado.',
    },
    {
      icon: Sparkles,
      title: 'Ambiente Acolhedor',
      description: 'Espaço preparado para o conforto e bem-estar do seu pet.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-hero py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="h-4 w-4 mr-2" />
              Cuidado Veterinário Profissional
            </div>
            
            <h1 className="section-title text-5xl md:text-7xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Seu Pet Merece o<br />Melhor Cuidado
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Agende consultas, vacinação, banho e tosa com profissionais qualificados. 
              Fácil, rápido e com todo carinho que seu amigo merece.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <Link to="/agendar" className="pet-button">
                Agendar Consulta
              </Link>
              <Link to="/servicos" className="pet-button-outline">
                Ver Serviços
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="section-title">Por Que Escolher o PetCare?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
              Oferecemos os melhores serviços para garantir a saúde e felicidade do seu pet
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="pet-card text-center group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="service-icon mx-auto">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-accent to-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold">
              Pronto para Cuidar do Seu Pet?
            </h2>
            <p className="text-lg opacity-90">
              Agende agora mesmo e garanta o melhor atendimento veterinário para seu melhor amigo!
            </p>
            <Link
              to="/agendar"
              className="inline-block bg-white text-primary px-8 py-4 rounded-full font-semibold hover:scale-105 transition-all hover:shadow-2xl"
            >
              Agendar Agora
            </Link>
          </div>
        </div>
      </section>

      {/* Depoimentos Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="section-title">O Que Dizem Nossos Clientes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Maria Silva',
                pet: 'Tutora do Rex',
                text: 'Melhor clínica veterinária da região! O atendimento é impecável e meu cachorro adora ir lá.',
              },
              {
                name: 'João Santos',
                pet: 'Tutor da Mia',
                text: 'Profissionais super atenciosos e carinhosos. Recomendo de olhos fechados!',
              },
              {
                name: 'Ana Costa',
                pet: 'Tutora do Bob',
                text: 'Sistema de agendamento super prático. Nunca mais perdi tempo em filas!',
              },
            ].map((depoimento, index) => (
              <div key={index} className="pet-card">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                    {depoimento.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold">{depoimento.name}</h4>
                    <p className="text-sm text-muted-foreground">{depoimento.pet}</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic">"{depoimento.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
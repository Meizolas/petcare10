import { Calendar, Heart, Shield, Clock, Users, Award, ArrowRight, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Home = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Agendamento Fácil',
      description: 'Agende consultas, banhos e vacinas de forma simples e rápida.',
    },
    {
      icon: Heart,
      title: 'Cuidado Completo',
      description: 'Acompanhe a saúde e bem-estar do seu pet em um só lugar.',
    },
    {
      icon: Shield,
      title: 'Segurança',
      description: 'Seus dados e os do seu pet estão sempre protegidos.',
    },
  ];

  const stats = [
    { icon: Users, value: '1000+', label: 'Pets Atendidos' },
    { icon: Award, value: '5 Anos', label: 'de Experiência' },
    { icon: Clock, value: '24/7', label: 'Suporte' },
  ];

  const upcomingAppointments = [
    { type: 'Banho', date: '12/05/2024', pet: 'Rex' },
    { type: 'Vacina', date: '15/05/2024', pet: 'Luna' },
    { type: 'Consulta', date: '20/05/2024', pet: 'Max' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-care opacity-50"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Bem-vindo ao{' '}
                  <span className="text-primary">Pet Check</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Aqui você pode gerenciar a saúde e os cuidados do seu pet de forma fácil e organizada.
                  Agende consultas, acompanhe vacinas e mantenha tudo em dia!
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/agenda">
                  <Button className="pet-button text-lg px-8 py-6 bg-gradient-pet border-0">
                    <Calendar className="w-5 h-5 mr-2" />
                    Agendar Consulta
                  </Button>
                </Link>
                <Link to="/pets">
                  <Button 
                    variant="outline" 
                    className="text-lg px-8 py-6 border-2 hover:bg-secondary"
                  >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Cadastrar Pet
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="relative">
              <div className="pet-card bg-gradient-pet p-8 text-center">
                <div className="text-6xl mb-4 animate-float">🐕</div>
                <h3 className="text-2xl font-bold mb-2">Seu Pet Merece o Melhor!</h3>
                <p className="text-muted-foreground">
                  Cuidados especializados para a felicidade do seu companheiro.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Por que escolher o Pet Check?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Oferecemos uma plataforma completa para você cuidar do seu pet com praticidade e segurança.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="pet-card group cursor-pointer">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Access Section */}
        <section className="py-20">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Próximos Compromissos */}
            <Card className="pet-card">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">Próximos Compromissos</h3>
                  <Link 
                    to="/agenda"
                    className="text-primary hover:text-primary/80 flex items-center gap-2 font-medium"
                  >
                    Ver todos <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {upcomingAppointments.map((appointment, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{appointment.type}</p>
                          <p className="text-sm text-muted-foreground">
                            Pet: {appointment.pet}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {appointment.date}
                      </span>
                    </div>
                  ))}
                </div>

                <Link to="/agenda" className="block mt-6">
                  <Button className="w-full pet-button">
                    <Calendar className="w-4 h-4 mr-2" />
                    Gerenciar Agenda
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Meus Pets */}
            <Card className="pet-card">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">Meus Pets</h3>
                  <Link 
                    to="/pets"
                    className="text-primary hover:text-primary/80 flex items-center gap-2 font-medium"
                  >
                    Ver todos <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-4 p-4 bg-secondary/50 rounded-xl">
                    <div className="w-12 h-12 bg-gradient-pet rounded-full flex items-center justify-center text-2xl">
                      🐕
                    </div>
                    <div>
                      <p className="font-medium">Rex</p>
                      <p className="text-sm text-muted-foreground">Vira-lata • 3 anos • 12 kg</p>
                    </div>
                  </div>
                </div>

                <Link to="/pets" className="block">
                  <Button variant="outline" className="w-full">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Adicionar Novo Pet
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
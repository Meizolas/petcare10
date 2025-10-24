import { Link } from 'react-router-dom';
import { Heart, Sparkles, Shield, Clock, Stethoscope, Scissors, Syringe, PawPrint, BadgePercent, Gift, Tag, ArrowRight } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from 'react';
import Autoplay from "embla-carousel-autoplay";

import heroGrooming from '@/assets/hero-grooming.jpg';
import heroVet from '@/assets/hero-vet.jpg';
import heroDaycare from '@/assets/hero-daycare.jpg';
import heroBath from '@/assets/hero-bath.jpg';

export default function PetCareHome() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const carouselSlides = [
    {
      image: heroVet,
      title: 'Consulta Veterinária',
      subtitle: 'Cuidado profissional para seu pet',
      badge: '15% OFF',
      badgeColor: 'bg-accent',
      link: '/agendar'
    },
    {
      image: heroGrooming,
      title: 'Banho & Tosa',
      subtitle: 'Deixe seu pet sempre lindo',
      badge: '20% OFF',
      badgeColor: 'bg-secondary',
      link: '/servicos'
    },
    {
      image: heroDaycare,
      title: 'Creche para Pets',
      subtitle: 'Diversão e segurança garantidas',
      badge: 'NOVO',
      badgeColor: 'bg-primary',
      link: '/servicos'
    },
    {
      image: heroBath,
      title: 'Planos de Saúde',
      subtitle: 'Economia e tranquilidade',
      badge: 'ATÉ 35% OFF',
      badgeColor: 'bg-brand-orange',
      link: '/planos'
    },
  ];

  const services = [
    {
      icon: Stethoscope,
      title: 'Veterinário',
      description: 'A saúde do seu pet em dia.',
      color: 'bg-[#8B2F8C]',
    },
    {
      icon: Scissors,
      title: 'Banho & Tosa',
      description: 'Higiene e conforto para a sua melhor companhia.',
      color: 'bg-[#0066CC]',
    },
    {
      icon: Syringe,
      title: 'Vacinação',
      description: 'Proteção completa contra doenças.',
      color: 'bg-[#FF6B35]',
    },
    {
      icon: PawPrint,
      title: 'Adestramento',
      description: 'Educação e comportamento.',
      color: 'bg-[#82C45C]',
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: 'Receba em Horas',
      description: 'Atendimento rápido e eficiente',
    },
    {
      icon: Shield,
      title: 'Frete Grátis Brasil',
      description: 'Em compras acima de R$99',
    },
    {
      icon: BadgePercent,
      title: 'Até 3x Sem Juros',
      description: 'Parcelamento facilitado',
    },
    {
      icon: Gift,
      title: 'Retire e Troque na Loja',
      description: 'Mais comodidade para você',
    },
  ];

  const plans = [
    {
      name: 'Básico',
      price: 'R$ 89',
      description: 'Ideal para quem busca cuidados essenciais',
      features: ['1 Consulta por mês', '10% em serviços', 'Atendimento prioritário'],
      color: 'from-[#82C45C] to-[#6BA847]',
    },
    {
      name: 'VIP',
      price: 'R$ 349',
      description: 'Cuidado completo para seu melhor amigo',
      features: ['Consultas ilimitadas', '30% em todos os serviços', 'Suporte 24/7'],
      color: 'from-[#8B2F8C] to-[#6D2470]',
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Animated Particles Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="particle absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          >
            <PawPrint className="h-6 w-6 text-primary" />
          </div>
        ))}
      </div>

      {/* Hero Carousel Section */}
      <section className="relative py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 5000 })]}
            className="w-full"
          >
            <CarouselContent>
              {carouselSlides.map((slide, index) => (
                <CarouselItem key={index}>
                  <Link to={slide.link}>
                    <div className="relative h-[500px] rounded-3xl overflow-hidden group cursor-pointer">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                      <div className="absolute inset-0 flex flex-col justify-center px-12 md:px-20 space-y-6">
                        <div className={`promo-badge ${slide.badgeColor} w-fit animate-bounce`}>
                          <Tag className="h-5 w-5" />
                          {slide.badge}
                        </div>
                        <h2 className="text-5xl md:text-7xl font-bold text-white drop-shadow-2xl">
                          {slide.title}
                        </h2>
                        <p className="text-2xl md:text-3xl text-white/90 max-w-xl">
                          {slide.subtitle}
                        </p>
                        <div className="flex items-center gap-2 text-white font-semibold text-lg">
                          Saiba mais <ArrowRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-background border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-4 group">
                <div className="p-3 rounded-xl bg-muted group-hover:bg-primary transition-colors">
                  <benefit.icon className="h-8 w-8 text-foreground group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - Cuidados Essenciais */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Cuidados Essenciais</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
              Serviços profissionais para o bem-estar do seu pet
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {services.map((service, index) => (
              <Link key={index} to="/servicos">
                <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-0">
                  <div className="relative h-48 flex items-center justify-center">
                    <div className={`absolute inset-0 ${service.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
                    <div className="relative z-10 text-center text-white space-y-3 p-6">
                      <service.icon className="h-16 w-16 mx-auto" strokeWidth={1.5} />
                      <h3 className="text-2xl font-bold">{service.title}</h3>
                      <p className="text-white/90">{service.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Plano de Saúde</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
              Escolha o melhor plano para seu pet
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative overflow-hidden ${plan.popular ? 'border-4 border-primary shadow-2xl' : 'border-2'}`}>
                {plan.popular && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-primary text-white px-4 py-1 rounded-full text-sm font-bold">
                      MAIS POPULAR
                    </div>
                  </div>
                )}
                <div className={`h-32 bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                  <div className="text-center text-white">
                    <h3 className="text-3xl font-bold">{plan.name}</h3>
                    <p className="text-4xl font-bold mt-2">{plan.price}<span className="text-lg">/mês</span></p>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <p className="text-muted-foreground text-center">{plan.description}</p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Heart className="h-4 w-4 text-primary" fill="currentColor" />
                        </div>
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/planos" className="block">
                    <button className={`w-full py-3 rounded-full font-bold transition-all ${
                      plan.popular 
                        ? 'bg-primary text-white hover:bg-primary/90 hover:scale-105' 
                        : 'bg-muted text-foreground hover:bg-muted/80 hover:scale-105'
                    }`}>
                      Assinar Plano
                    </button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white space-y-6">
            <Sparkles className="h-16 w-16 mx-auto" />
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

      {/* Testimonials Section */}
      <section className="py-20">
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
              <Card key={index} className="p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                    {depoimento.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-foreground">{depoimento.name}</h4>
                    <p className="text-sm text-muted-foreground">{depoimento.pet}</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic">"{depoimento.text}"</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
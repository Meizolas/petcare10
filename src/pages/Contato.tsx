import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

export default function Contato() {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="section-title">Entre em Contato</h1>
          <p className="text-lg text-muted-foreground mt-4">
            Estamos aqui para ajudar você e seu pet!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="pet-card">
            <Phone className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Telefone</h3>
            <a href="tel:+5577988197912" className="text-muted-foreground hover:text-primary">
              (77) 98819-7912
            </a>
          </div>

          <div className="pet-card">
            <Mail className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Email</h3>
            <a href="mailto:PetCare@gmail.com" className="text-muted-foreground hover:text-primary">
              PetCare@gmail.com
            </a>
          </div>

          <div className="pet-card">
            <MapPin className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Localização</h3>
            <p className="text-muted-foreground">Brasil</p>
          </div>

          <div className="pet-card">
            <MessageCircle className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">WhatsApp</h3>
            <a 
              href="https://wa.me/5577988197912" 
              target="_blank" 
              rel="noopener noreferrer"
              className="pet-button-secondary inline-block"
            >
              Enviar Mensagem
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
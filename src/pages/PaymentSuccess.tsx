import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="pet-card">
            <div className="service-icon bg-gradient-to-br from-green-500 to-green-600 mx-auto mb-6">
              <CheckCircle className="h-12 w-12" />
            </div>

            <h1 className="text-3xl font-bold mb-4">Pagamento Confirmado!</h1>
            
            <p className="text-muted-foreground mb-6">
              Seu pagamento foi processado com sucesso. Entraremos em contato em breve para confirmar os detalhes do serviço.
            </p>

            {sessionId && (
              <div className="bg-muted p-4 rounded-lg mb-6">
                <p className="text-sm text-muted-foreground">
                  ID da Transação:
                </p>
                <p className="text-xs font-mono break-all">{sessionId}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/">
                <Button className="w-full sm:w-auto">
                  <Home className="mr-2 h-4 w-4" />
                  Voltar ao Início
                </Button>
              </Link>
              <Link to="/servicos">
                <Button variant="outline" className="w-full sm:w-auto">
                  Ver Outros Serviços
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

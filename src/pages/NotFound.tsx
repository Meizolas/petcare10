import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="max-w-md mx-auto px-4 text-center">
        <Card className="pet-card">
          <CardContent className="p-12">
            <div className="text-8xl mb-6 animate-bounce">🐾</div>
            
            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
            
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Página não encontrada
            </h2>
            
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Parece que esta página saiu para passear! Não conseguimos encontrá-la, 
              mas temos várias outras páginas esperando por você.
            </p>

            <div className="space-y-4">
              <Link to="/" className="block">
                <Button className="pet-button w-full bg-gradient-pet border-0">
                  <Home className="w-5 h-5 mr-2" />
                  Voltar ao Início
                </Button>
              </Link>
              
              <Button 
                onClick={() => window.history.back()}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Página Anterior
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;

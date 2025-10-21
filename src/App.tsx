import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PetCareHeader from "./components/PetCareHeader";
import PetCareFooter from "./components/PetCareFooter";
import PetCareHome from "./pages/PetCareHome";
import Servicos from "./pages/Servicos";
import Planos from "./pages/Planos";
import Agendar from "./pages/Agendar";
import Contato from "./pages/Contato";
import Auth from "./pages/Auth";
import MinhaConta from "./pages/MinhaConta";
import Admin from "./pages/Admin";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-background">
            <PetCareHeader />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<PetCareHome />} />
                <Route path="/servicos" element={<Servicos />} />
                <Route path="/planos" element={<Planos />} />
                <Route path="/agendar" element={<Agendar />} />
                <Route path="/contato" element={<Contato />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/minha-conta" element={<MinhaConta />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <PetCareFooter />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

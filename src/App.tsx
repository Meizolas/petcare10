import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import PetCareHeader from "./components/PetCareHeader";
import PetCareFooter from "./components/PetCareFooter";
import FloatingAiAssistant from "./components/FloatingAiAssistant";
import AdminRoute from "./components/AdminRoute";
import UserRoute from "./components/UserRoute";
import PetCareHome from "./pages/PetCareHome";
import Servicos from "./pages/Servicos";
import Planos from "./pages/Planos";
import Agendar from "./pages/Agendar";
import Contato from "./pages/Contato";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import MinhaConta from "./pages/MinhaConta";
import Admin from "./pages/Admin";
import AdminCoupons from "./pages/AdminCoupons";
import AdminOrders from "./pages/AdminOrders";
import Medicamentos from "./pages/Medicamentos";
import Carrinho from "./pages/Carrinho";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-background">
            <PetCareHeader />
            <FloatingAiAssistant />
            <main className="flex-1">
              <Routes>
                {/* User Routes */}
                <Route path="/" element={<UserRoute><PetCareHome /></UserRoute>} />
                <Route path="/servicos" element={<UserRoute><Servicos /></UserRoute>} />
                <Route path="/planos" element={<UserRoute><Planos /></UserRoute>} />
                <Route path="/medicamentos" element={<UserRoute><Medicamentos /></UserRoute>} />
                <Route path="/carrinho" element={<UserRoute><Carrinho /></UserRoute>} />
                <Route path="/agendar" element={<UserRoute><Agendar /></UserRoute>} />
                <Route path="/contato" element={<UserRoute><Contato /></UserRoute>} />
                <Route path="/minha-conta" element={<UserRoute><MinhaConta /></UserRoute>} />
                <Route path="/payment-success" element={<UserRoute><PaymentSuccess /></UserRoute>} />
                
                {/* Auth Routes (accessible to all) */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                <Route path="/admin/cupons" element={<AdminRoute><AdminCoupons /></AdminRoute>} />
                <Route path="/admin/pedidos" element={<AdminRoute><AdminOrders /></AdminRoute>} />
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <PetCareFooter />
          </div>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

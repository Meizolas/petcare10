import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, Calendar, ShoppingBag, DollarSign, 
  CheckCircle2, Clock, XCircle, Package
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import AdminKanban from "@/components/AdminKanban";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface Appointment {
  id: string;
  tutor_name: string;
  pet_name: string;
  service: string;
  appointment_date: string;
  status: string;
  phone: string;
  created_at: string;
  user_id: string;
}

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!isAdmin) {
      toast({ title: "Acesso Negado", description: "Você não tem permissão.", variant: "destructive" });
      navigate("/");
      return;
    }
    fetchData();
  }, [user, isAdmin, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appointmentsRes, ordersRes] = await Promise.all([
        supabase.from("appointments").select("*").order("appointment_date", { ascending: true }),
        supabase.from("orders").select("final_total")
      ]);
      setAppointments(appointmentsRes.data || []);
      const orders = ordersRes.data || [];
      setTotalOrders(orders.length);
      setTotalRevenue(orders.reduce((sum, o) => sum + (o.final_total || 0), 0));
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível carregar os dados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const todayCount = appointments.filter(a => { const d = new Date(a.appointment_date); return d >= today && d < tomorrow; }).length;
  const pending = appointments.filter(a => a.status === 'pending').length;
  const confirmed = appointments.filter(a => a.status === 'confirmed').length;
  const completed = appointments.filter(a => a.status === 'completed').length;
  const cancelled = appointments.filter(a => a.status === 'cancelled').length;

  if (loading) {
    return <AdminLayout><div className="flex flex-col justify-center items-center h-96 space-y-4"><Loader2 className="h-12 w-12 text-primary animate-spin" /><div className="text-lg text-muted-foreground">Carregando...</div></div></AdminLayout>;
  }

  const stats = [
    { title: "Hoje", value: todayCount, icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Aguardando", value: pending, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { title: "Confirmados", value: confirmed, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Finalizados", value: completed, icon: Package, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Cancelados", value: cancelled, icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
    { title: "Pedidos", value: totalOrders, icon: ShoppingBag, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Gerencie agendamentos, pedidos e cupons.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/20">
            <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Receita Total</p>
                <p className="text-3xl md:text-4xl font-bold text-primary">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="p-4 rounded-2xl bg-primary/10"><DollarSign className="h-8 w-8 text-primary" /></div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map((s) => { const Icon = s.icon; return (
            <Card key={s.title} className={`${s.bg} hover:shadow-lg transition-all`}>
              <CardContent className="p-4"><Icon className={`h-5 w-5 ${s.color} mb-2`} /><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.title}</p></CardContent>
            </Card>
          ); })}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xl md:text-2xl font-bold mb-4">Kanban de Agendamentos</h2>
          {appointments.length === 0 ? (
            <Card className="text-center py-12 border-2 border-dashed"><CardContent><Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" /><p className="font-semibold mb-2">Nenhum agendamento</p><p className="text-muted-foreground text-sm">Os novos agendamentos aparecerão aqui</p></CardContent></Card>
          ) : (
            <AdminKanban appointments={appointments} onUpdate={fetchData} />
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}

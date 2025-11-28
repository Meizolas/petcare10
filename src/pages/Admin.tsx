import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, Calendar, ShoppingBag } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import AdminKanban from "@/components/AdminKanban";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface UserProfile {
  full_name: string;
  phone: string;
}

interface UserWithProfile {
  email: string;
  profiles?: UserProfile;
}

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!isAdmin) {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar esta área.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    fetchAppointments();
  }, [user, isAdmin, navigate]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("appointment_date", { ascending: true });

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const pending = appointments.filter(a => a.status === 'pending').length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const total = appointments.length;
    
    return { pending, confirmed, completed, total };
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col justify-center items-center h-96 space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <div className="text-lg text-muted-foreground">Carregando dados...</div>
        </div>
      </AdminLayout>
    );
  }

  const stats = getStats();

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Dashboard Stats */}
        <div>
          <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Agendamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{stats.total}</div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Aguardando Confirmação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                  <TrendingUp className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Confirmados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-green-600">{stats.confirmed}</div>
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Finalizados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-blue-600">{stats.completed}</div>
                  <ShoppingBag className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Kanban Board */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Kanban de Agendamentos</h2>
          {appointments.length === 0 ? (
            <Card className="text-center py-16 border-2 border-dashed">
              <CardContent>
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-xl font-semibold text-foreground mb-2">
                  Nenhum agendamento encontrado
                </p>
                <p className="text-muted-foreground">
                  Os novos agendamentos aparecerão aqui automaticamente
                </p>
              </CardContent>
            </Card>
          ) : (
            <AdminKanban appointments={appointments} onUpdate={fetchAppointments} />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

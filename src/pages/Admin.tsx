import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, CheckCircle, Clock, Phone, User, PawPrint, Mail, Loader2 } from "lucide-react";

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

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      // Get appointment details with user email
      const { data: appointment, error: appointmentError } = await supabase
        .from("appointments")
        .select(`
          *,
          user:user_id (
            email,
            profiles (
              full_name,
              phone
            )
          )
        `)
        .eq("id", appointmentId)
        .single();

      if (appointmentError) {
        throw appointmentError;
      }

      // Update status to confirmed
      const { error: updateError } = await supabase
        .from("appointments")
        .update({ status: "confirmed" })
        .eq("id", appointmentId);

      if (updateError) {
        throw updateError;
      }

      // Trigger webhook with confirmation data
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        "send-appointment-webhook",
        {
          body: { 
            appointmentId,
            confirmed: true,
            userEmail: (appointment.user as unknown as UserWithProfile)?.email || ""
          },
        }
      );

      if (functionError) {
        console.error("Error triggering webhook:", functionError);
        toast({
          title: "Atenção",
          description: "Agendamento confirmado, mas houve erro ao enviar notificação.",
          variant: "destructive",
        });
      } else {
        console.log("Webhook triggered successfully:", functionData);
        toast({
          title: "Sucesso!",
          description: "Agendamento confirmado e notificação enviada.",
        });
      }

      // Refresh appointments
      fetchAppointments();
    } catch (error) {
      console.error("Error confirming appointment:", error);
      toast({
        title: "Erro",
        description: "Não foi possível confirmar o agendamento.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "confirmed") {
      return (
        <Badge className="bg-gradient-to-r from-accent to-primary text-white border-0 px-4 py-1">
          <CheckCircle className="w-3 h-3 mr-1" />
          Confirmado
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-2 border-secondary text-secondary px-4 py-1">
        <Clock className="w-3 h-3 mr-1" />
        Pendente
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/30">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-xl icon-float">
              <PawPrint className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Painel Administrativo
            </h1>
          </div>
          <p className="text-muted-foreground text-lg ml-16">
            Gerencie todos os agendamentos de forma profissional
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <div className="text-lg text-muted-foreground">Carregando agendamentos...</div>
          </div>
        ) : appointments.length === 0 ? (
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
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {appointments.map((appointment) => (
              <Card 
                key={appointment.id} 
                className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 hover:scale-[1.02] overflow-hidden"
              >
                <div className={`h-2 ${appointment.status === 'confirmed' ? 'bg-gradient-to-r from-accent to-primary' : 'bg-gradient-to-r from-secondary to-primary'}`} />
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-lg icon-float">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-lg font-bold">{appointment.service}</span>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <User className="h-5 w-5 text-primary flex-shrink-0 icon-float" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Tutor</p>
                        <p className="font-semibold">{appointment.tutor_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <PawPrint className="h-5 w-5 text-secondary flex-shrink-0 icon-float" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Pet</p>
                        <p className="font-semibold">{appointment.pet_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <Phone className="h-5 w-5 text-accent flex-shrink-0 icon-float" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Telefone</p>
                        <p className="font-semibold">{appointment.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <Clock className="h-5 w-5 text-primary flex-shrink-0 icon-float" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Data e Hora</p>
                        <p className="font-semibold">
                          {format(new Date(appointment.appointment_date), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {appointment.status === "pending" && (
                    <Button
                      onClick={() => handleConfirmAppointment(appointment.id)}
                      className="w-full bg-gradient-to-r from-primary via-primary to-accent hover:brightness-110 text-white font-semibold py-6 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/50 hover:scale-105"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirmar Agendamento
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

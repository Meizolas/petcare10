import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Phone, User, PawPrint, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Appointment {
  id: string;
  tutor_name: string;
  pet_name: string;
  phone: string;
  service: string;
  appointment_date: string;
  status: string;
  created_at: string;
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
        title: "Acesso negado",
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
      console.error("Erro ao buscar agendamentos:", error);
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
      // Atualiza o status do agendamento
      const { error: updateError } = await supabase
        .from("appointments")
        .update({ status: "confirmed" })
        .eq("id", appointmentId);

      if (updateError) throw updateError;

      // Dispara o webhook com os dados do agendamento confirmado
      const { error: webhookError } = await supabase.functions.invoke(
        "send-appointment-webhook",
        {
          body: { appointmentId },
        }
      );

      if (webhookError) {
        console.error("Erro ao enviar webhook:", webhookError);
        toast({
          title: "Agendamento confirmado!",
          description: "Status atualizado, mas houve um problema ao enviar a notificação.",
          variant: "default",
        });
      } else {
        toast({
          title: "Agendamento confirmado!",
          description: "O status foi atualizado e a notificação foi enviada com sucesso.",
        });
      }

      fetchAppointments();
    } catch (error) {
      console.error("Erro ao confirmar agendamento:", error);
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
        <Badge className="bg-green-600 hover:bg-green-700 text-white">
          Confirmado
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-orange-400 text-orange-600">
        Pendente
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-lime-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Painel Administrativo
          </h1>
          <p className="text-gray-600">
            Gerencie todos os agendamentos da clínica
          </p>
        </div>

        <div className="grid gap-6">
          {appointments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <PawPrint className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum agendamento encontrado.</p>
              </CardContent>
            </Card>
          ) : (
            appointments.map((appointment) => (
              <Card
                key={appointment.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-600" />
                      {appointment.tutor_name}
                    </CardTitle>
                    {getStatusBadge(appointment.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <PawPrint className="w-4 h-4 text-coral-500" />
                        <span className="font-medium">Pet:</span>
                        <span>{appointment.pet_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-lime-600" />
                        <span className="font-medium">Telefone:</span>
                        <span>{appointment.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Sparkles className="w-4 h-4 text-orange-500" />
                        <span className="font-medium">Serviço:</span>
                        <span>{appointment.service}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">Data:</span>
                        <span>
                          {format(
                            new Date(appointment.appointment_date),
                            "dd/MM/yyyy",
                            { locale: ptBR }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-4 h-4 text-coral-500" />
                        <span className="font-medium">Horário:</span>
                        <span>
                          {format(
                            new Date(appointment.appointment_date),
                            "HH:mm",
                            { locale: ptBR }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {appointment.status === "pending" && (
                    <div className="pt-4 border-t">
                      <Button
                        onClick={() => handleConfirmAppointment(appointment.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        Confirmar Agendamento
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

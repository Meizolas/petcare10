import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, XCircle, Phone, User, PawPrint, Clock, Calendar } from 'lucide-react';

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

interface AdminKanbanProps {
  appointments: Appointment[];
  onUpdate: () => void;
}

export default function AdminKanban({ appointments, onUpdate }: AdminKanbanProps) {
  const { toast } = useToast();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const columns = [
    { id: 'pending', title: 'Aguardando Confirmação', status: 'pending', color: 'bg-yellow-500' },
    { id: 'confirmed', title: 'Confirmado', status: 'confirmed', color: 'bg-green-500' },
    { id: 'completed', title: 'Finalizado', status: 'completed', color: 'bg-blue-500' },
    { id: 'cancelled', title: 'Cancelado', status: 'cancelled', color: 'bg-red-500' },
  ];

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: 'Status atualizado!',
        description: 'O agendamento foi movido com sucesso.',
      });

      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    }
  };

  const handleDragStart = (appointmentId: string) => {
    setDraggedItem(appointmentId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedItem) {
      handleStatusChange(draggedItem, newStatus);
      setDraggedItem(null);
    }
  };

  const getAppointmentsByStatus = (status: string) => {
    return appointments.filter(app => app.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex flex-col"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.status)}
        >
          <div className={`${column.color} text-white p-4 rounded-t-lg`}>
            <h3 className="font-bold text-lg flex items-center justify-between">
              {column.title}
              <Badge variant="secondary" className="bg-white/20 text-white">
                {getAppointmentsByStatus(column.status).length}
              </Badge>
            </h3>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-b-lg min-h-[400px] space-y-4">
            {getAppointmentsByStatus(column.status).map((appointment) => (
              <Card
                key={appointment.id}
                draggable
                onDragStart={() => handleDragStart(appointment.id)}
                className="cursor-move hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {appointment.service}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{appointment.tutor_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <PawPrint className="h-4 w-4 text-muted-foreground" />
                    <span>{appointment.pet_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{appointment.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(appointment.appointment_date), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>

                  {appointment.status === 'pending' && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1"
                        onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Aceitar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Recusar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

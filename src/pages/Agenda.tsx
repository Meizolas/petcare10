import { useState } from 'react';
import { Calendar, Clock, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  completed: boolean;
}

const Agenda = () => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      title: 'Banho - Rex',
      description: 'Banho completo e tosa higiênica',
      date: '2024-05-12',
      time: '10:00',
      completed: false
    },
    {
      id: '2',
      title: 'Vacina - Luna',
      description: 'Vacinação antirrábica',
      date: '2024-05-15',
      time: '14:30',
      completed: false
    },
    {
      id: '3',
      title: 'Consulta - Max',
      description: 'Consulta de rotina e check-up geral',
      date: '2024-05-20',
      time: '09:00',
      completed: false
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAppointment) {
      // Update existing appointment
      setAppointments(appointments.map(apt => 
        apt.id === editingAppointment.id 
          ? { ...apt, ...formData }
          : apt
      ));
      toast({
        title: "Compromisso atualizado!",
        description: `${formData.title} foi atualizado com sucesso.`,
      });
    } else {
      // Add new appointment
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        ...formData,
        completed: false
      };
      setAppointments([...appointments, newAppointment]);
      toast({
        title: "Compromisso agendado!",
        description: `${formData.title} foi agendado para ${formData.date}.`,
      });
    }

    // Reset form
    setFormData({ title: '', description: '', date: '', time: '' });
    setEditingAppointment(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      title: appointment.title,
      description: appointment.description,
      date: appointment.date,
      time: appointment.time
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (appointmentId: string) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    setAppointments(appointments.filter(a => a.id !== appointmentId));
    toast({
      title: "Compromisso removido",
      description: `${appointment?.title} foi removido da agenda.`,
      variant: "destructive",
    });
  };

  const handleToggleComplete = (appointmentId: string) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId 
        ? { ...apt, completed: !apt.completed }
        : apt
    ));
    
    if (appointment) {
      toast({
        title: appointment.completed ? "Compromisso reaberto" : "Compromisso concluído!",
        description: `${appointment.title} foi ${appointment.completed ? 'reaberto' : 'marcado como concluído'}.`,
      });
    }
  };

  const handleNewAppointment = () => {
    setEditingAppointment(null);
    setFormData({ title: '', description: '', date: '', time: '' });
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const upcomingAppointments = appointments
    .filter(apt => !apt.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const completedAppointments = appointments.filter(apt => apt.completed);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            <span className="text-primary">Agenda</span> Pet Check
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Organize e acompanhe todos os compromissos do seu pet
          </p>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={handleNewAppointment}
                className="pet-button bg-gradient-pet border-0"
              >
                <Plus className="w-5 h-5 mr-2" />
                Novo Agendamento
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingAppointment ? 'Editar Compromisso' : 'Novo Agendamento'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Banho - Rex, Consulta - Luna..."
                    required
                    className="pet-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva os detalhes do compromisso..."
                    rows={3}
                    className="pet-input resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="pet-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Hora</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                      className="pet-input"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full pet-button">
                  {editingAppointment ? 'Atualizar Compromisso' : 'Agendar Compromisso'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Appointments Sections */}
        <div className="space-y-12">
          {/* Upcoming Appointments */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-3 text-primary" />
              Próximos Compromissos
            </h2>
            
            {upcomingAppointments.length === 0 ? (
              <Card className="pet-card">
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-2xl font-semibold mb-2">Nenhum compromisso agendado</h3>
                  <p className="text-muted-foreground mb-6">
                    Que tal agendar a próxima consulta do seu pet?
                  </p>
                  <Button 
                    onClick={handleNewAppointment}
                    className="pet-button"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Criar Primeiro Agendamento
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id} className="pet-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-start justify-between">
                        <span>{appointment.title}</span>
                        <div className="flex space-x-1">
                          <Button
                            onClick={() => handleToggleComplete(appointment.id)}
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 p-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                        {appointment.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 mr-2 text-primary" />
                          <span>{formatDate(appointment.date)}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="w-4 h-4 mr-2 text-primary" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEdit(appointment)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          onClick={() => handleDelete(appointment.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Completed Appointments */}
          {completedAppointments.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
                Compromissos Concluídos
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedAppointments.map((appointment) => (
                  <Card key={appointment.id} className="pet-card opacity-75">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-start justify-between">
                        <span className="line-through">{appointment.title}</span>
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                        {appointment.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(appointment.date)}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleToggleComplete(appointment.id)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Reabrir Compromisso
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Stats */}
        {appointments.length > 0 && (
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <Card className="pet-card text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">
                  {appointments.length}
                </div>
                <div className="text-muted-foreground">Total de Compromissos</div>
              </CardContent>
            </Card>
            
            <Card className="pet-card text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {completedAppointments.length}
                </div>
                <div className="text-muted-foreground">Concluídos</div>
              </CardContent>
            </Card>
            
            <Card className="pet-card text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {upcomingAppointments.length}
                </div>
                <div className="text-muted-foreground">Próximos</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agenda;
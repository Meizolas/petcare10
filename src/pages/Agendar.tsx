import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { z } from 'zod';

const appointmentSchema = z.object({
  tutorName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  petName: z.string().min(2, 'Nome do pet deve ter pelo menos 2 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
  service: z.string().min(1, 'Selecione um serviço'),
  date: z.date({ required_error: 'Selecione uma data' }),
  time: z.string().min(1, 'Selecione um horário'),
});

export default function Agendar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [profileData, setProfileData] = useState<any>(null);

  const [formData, setFormData] = useState({
    tutorName: '',
    petName: '',
    phone: '',
    service: '',
    time: '',
  });

  const services = [
    'Consulta Veterinária',
    'Vacinação',
    'Banho e Tosa',
    'Banho Terapêutico',
    'Vermifugação',
    'Check-up Completo',
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00',
  ];

  useEffect(() => {
    if (!user) {
      toast({
        title: 'Login necessário',
        description: 'Você precisa estar logado para agendar consultas.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfileData(data);
      setFormData((prev) => ({
        ...prev,
        tutorName: data.full_name || '',
        phone: data.phone || '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!user || !selectedDate) {
      toast({
        title: 'Erro',
        description: 'Selecione uma data para o agendamento',
        variant: 'destructive',
      });
      return;
    }

    try {
      const appointmentData = {
        tutorName: formData.tutorName,
        petName: formData.petName,
        phone: formData.phone,
        service: formData.service,
        date: selectedDate,
        time: formData.time,
      };

      appointmentSchema.parse(appointmentData);
      setIsLoading(true);

      // Create appointment date
      const [hours, minutes] = formData.time.split(':');
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Insert appointment
      const { data: appointment, error: insertError } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          tutor_name: formData.tutorName,
          pet_name: formData.petName,
          phone: formData.phone,
          service: formData.service,
          appointment_date: appointmentDate.toISOString(),
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Send webhook
      try {
        await supabase.functions.invoke('send-appointment-webhook', {
          body: { appointmentId: appointment.id },
        });
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
      }

      toast({
        title: 'Agendamento realizado!',
        description: 'Seu agendamento foi confirmado com sucesso.',
      });

      // Reset form
      setFormData({
        tutorName: profileData?.full_name || '',
        petName: '',
        phone: profileData?.phone || '',
        service: '',
        time: '',
      });
      setSelectedDate(undefined);

      navigate('/minha-conta');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: 'Erro ao agendar',
          description: 'Ocorreu um erro ao processar seu agendamento. Tente novamente.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen py-20 gradient-hero">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="section-title">Agendar Consulta</h1>
          <p className="text-lg text-muted-foreground mt-4">
            Preencha os dados abaixo para agendar o atendimento do seu pet
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados do Agendamento</CardTitle>
            <CardDescription>
              Informe os dados do tutor, pet e selecione o serviço desejado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tutorName">Nome do Tutor</Label>
                  <Input
                    id="tutorName"
                    value={formData.tutorName}
                    onChange={(e) => setFormData({ ...formData, tutorName: e.target.value })}
                    className={errors.tutorName ? 'border-destructive' : ''}
                  />
                  {errors.tutorName && (
                    <p className="text-sm text-destructive">{errors.tutorName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="petName">Nome do Pet</Label>
                  <Input
                    id="petName"
                    value={formData.petName}
                    onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                    className={errors.petName ? 'border-destructive' : ''}
                  />
                  {errors.petName && (
                    <p className="text-sm text-destructive">{errors.petName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service">Serviço</Label>
                  <Select
                    value={formData.service}
                    onValueChange={(value) => setFormData({ ...formData, service: value })}
                  >
                    <SelectTrigger className={errors.service ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.service && (
                    <p className="text-sm text-destructive">{errors.service}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label>
                  <CalendarIcon className="h-4 w-4 inline mr-2" />
                  Selecione a Data
                </Label>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date.getDay() === 0}
                    locale={ptBR}
                    className="rounded-xl border pointer-events-auto"
                  />
                </div>
                {errors.date && (
                  <p className="text-sm text-destructive text-center">{errors.date}</p>
                )}
              </div>

              {selectedDate && (
                <div className="space-y-2">
                  <Label>
                    <Clock className="h-4 w-4 inline mr-2" />
                    Horário ({format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })})
                  </Label>
                  <Select
                    value={formData.time}
                    onValueChange={(value) => setFormData({ ...formData, time: value })}
                  >
                    <SelectTrigger className={errors.time ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.time && (
                    <p className="text-sm text-destructive">{errors.time}</p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full pet-button"
                disabled={isLoading}
              >
                {isLoading ? 'Agendando...' : 'Confirmar Agendamento'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
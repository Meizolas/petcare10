import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock } from 'lucide-react';

export default function MinhaConta() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    const [profileRes, appointmentsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('appointments').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (appointmentsRes.data) setAppointments(appointmentsRes.data);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen py-20 gradient-hero">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="section-title mb-12">Minha Conta</h1>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Nome:</strong> {profile?.full_name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Telefone:</strong> {profile?.phone}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meus Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <p className="text-muted-foreground">Nenhum agendamento encontrado.</p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="pet-card">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold">{apt.service}</h3>
                          <p className="text-sm text-muted-foreground">Pet: {apt.pet_name}</p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(apt.appointment_date), 'dd/MM/yyyy', { locale: ptBR })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {format(new Date(apt.appointment_date), 'HH:mm')}
                            </span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          apt.status === 'pending' ? 'bg-secondary text-secondary-foreground' : 'bg-success text-success-foreground'
                        }`}>
                          {apt.status === 'pending' ? 'Pendente' : 'Confirmado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
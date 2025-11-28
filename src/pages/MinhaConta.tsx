import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, Upload, User, LogOut, MapPin, Shield, Save, Package } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function MinhaConta() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>({});

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    const [profileRes, appointmentsRes, ordersRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('appointments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('orders').select('*, order_items(*, products(*))').eq('user_id', user.id).order('created_at', { ascending: false })
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data);
      setEditedProfile(profileRes.data);
    }
    if (appointmentsRes.data) setAppointments(appointmentsRes.data);
    if (ordersRes.data) setOrders(ordersRes.data);
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editedProfile.full_name,
          phone: editedProfile.phone,
          street: editedProfile.street,
          number: editedProfile.number,
          neighborhood: editedProfile.neighborhood,
          city: editedProfile.city,
          state: editedProfile.state,
          zip_code: editedProfile.zip_code,
        })
        .eq('id', user!.id);

      if (error) throw error;

      setProfile(editedProfile);
      setEditing(false);
      
      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user!.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user!.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });

      toast({
        title: 'Sucesso!',
        description: 'Foto de perfil atualizada.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen py-20 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-12">
          <h1 className="section-title">Minha Conta</h1>
          <Button
            onClick={signOut}
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>

        <Tabs defaultValue="perfil" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="pedidos" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="agendamentos" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Agendamentos
            </TabsTrigger>
          </TabsList>

          {/* Perfil Tab */}
          <TabsContent value="perfil" className="space-y-6">
            {/* Avatar Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Foto de Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      <User className="w-12 h-12" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Label htmlFor="avatar" className="cursor-pointer">
                      <div className="flex items-center gap-2 pet-button inline-flex">
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Enviando...' : 'Alterar Foto'}
                      </div>
                    </Label>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      JPG, PNG ou WEBP. Máx 5MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Info Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Informações Pessoais
                  </CardTitle>
                  {!editing ? (
                    <Button onClick={() => setEditing(true)} variant="outline" size="sm">
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={() => {
                        setEditing(false);
                        setEditedProfile(profile);
                      }} variant="outline" size="sm">
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveProfile} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nome Completo</Label>
                    <Input
                      id="full_name"
                      value={editing ? editedProfile.full_name : profile?.full_name}
                      onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={editing ? editedProfile.phone : profile?.phone}
                      onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      value={editing ? editedProfile.street || '' : profile?.street || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, street: e.target.value })}
                      disabled={!editing}
                      placeholder="Ex: Rua das Flores"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      value={editing ? editedProfile.number || '' : profile?.number || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, number: e.target.value })}
                      disabled={!editing}
                      placeholder="123"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      value={editing ? editedProfile.neighborhood || '' : profile?.neighborhood || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, neighborhood: e.target.value })}
                      disabled={!editing}
                      placeholder="Centro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={editing ? editedProfile.city || '' : profile?.city || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, city: e.target.value })}
                      disabled={!editing}
                      placeholder="São Paulo"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={editing ? editedProfile.state || '' : profile?.state || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, state: e.target.value })}
                      disabled={!editing}
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip_code">CEP</Label>
                    <Input
                      id="zip_code"
                      value={editing ? editedProfile.zip_code || '' : profile?.zip_code || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, zip_code: e.target.value })}
                      disabled={!editing}
                      placeholder="12345-678"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pedidos Tab */}
          <TabsContent value="pedidos">
            <Card>
              <CardHeader>
                <CardTitle>Meus Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhum pedido encontrado.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="pet-card">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Pedido #{order.id.slice(0, 8)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'pending' ? 'bg-secondary text-secondary-foreground' : 'bg-success text-success-foreground'
                          }`}>
                            {order.status === 'pending' ? 'Pendente' : 'Confirmado'}
                          </span>
                        </div>
                        <Separator className="my-3" />
                        <div className="space-y-2 mb-4">
                          {order.order_items.map((item: any) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.products.name} (x{item.quantity})</span>
                              <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <Separator className="my-3" />
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>R$ {order.total.toFixed(2)}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Desconto ({order.coupon_code}):</span>
                            <span>- R$ {order.discount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold mt-2">
                          <span>Total:</span>
                          <span className="text-primary">R$ {order.final_total.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agendamentos Tab */}
          <TabsContent value="agendamentos">
            <Card>
              <CardHeader>
                <CardTitle>Meus Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhum agendamento encontrado.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="pet-card">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg">{apt.service}</h3>
                            <p className="text-sm text-muted-foreground mt-1">Pet: {apt.pet_name}</p>
                            <p className="text-sm text-muted-foreground">Tutor: {apt.tutor_name}</p>
                            <div className="flex gap-4 mt-3 text-sm">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-primary" />
                                {format(new Date(apt.appointment_date), 'dd/MM/yyyy', { locale: ptBR })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-primary" />
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
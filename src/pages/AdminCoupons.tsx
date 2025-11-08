import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Tag, Calendar, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  max_uses_per_user: number;
  current_uses: number;
  active: boolean;
  expires_at: string | null;
}

export default function AdminCoupons() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    max_uses: '',
    max_uses_per_user: '1',
    expires_at: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadCoupons();
  }, [user, isAdmin]);

  const loadCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar cupons',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('coupons').insert({
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        max_uses_per_user: parseInt(formData.max_uses_per_user),
        expires_at: formData.expires_at || null,
        active: true,
      });

      if (error) throw error;

      toast({
        title: 'Cupom criado!',
        description: 'Cupom criado com sucesso',
      });

      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        max_uses: '',
        max_uses_per_user: '1',
        expires_at: '',
      });
      setShowForm(false);
      loadCoupons();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleCoupon = async (couponId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ active: !active })
        .eq('id', couponId);

      if (error) throw error;
      
      loadCoupons();
      toast({
        title: active ? 'Cupom desativado' : 'Cupom ativado',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar cupom',
        variant: 'destructive',
      });
    }
  };

  const deleteCoupon = async (couponId: string) => {
    if (!confirm('Tem certeza que deseja deletar este cupom?')) return;

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponId);

      if (error) throw error;
      
      loadCoupons();
      toast({
        title: 'Cupom deletado',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao deletar cupom',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold mb-4">Painel Administrativo</h1>
        
        {/* Admin Navigation */}
        <div className="flex gap-4 mb-8">
          <Link to="/admin">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Agendamentos
            </Button>
          </Link>
          <Link to="/admin/cupons">
            <Button variant="default">
              <Tag className="h-4 w-4 mr-2" />
              Cupons
            </Button>
          </Link>
          <Link to="/admin/pedidos">
            <Button variant="outline">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Pedidos
            </Button>
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Gerenciar Cupons</h2>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cupom
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Criar Novo Cupom</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createCoupon} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Código do Cupom</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="DESCONTO10"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="discount_type">Tipo de Desconto</Label>
                    <Select
                      value={formData.discount_type}
                      onValueChange={(value) => setFormData({ ...formData, discount_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                        <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="discount_value">
                      Valor do Desconto {formData.discount_type === 'percentage' ? '(%)' : '(R$)'}
                    </Label>
                    <Input
                      id="discount_value"
                      type="number"
                      step="0.01"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="max_uses">Usos Totais (opcional)</Label>
                    <Input
                      id="max_uses"
                      type="number"
                      value={formData.max_uses}
                      onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                      placeholder="Ilimitado"
                    />
                  </div>

                  <div>
                    <Label htmlFor="max_uses_per_user">Usos por Usuário</Label>
                    <Input
                      id="max_uses_per_user"
                      type="number"
                      value={formData.max_uses_per_user}
                      onChange={(e) => setFormData({ ...formData, max_uses_per_user: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="expires_at">Data de Expiração (opcional)</Label>
                    <Input
                      id="expires_at"
                      type="datetime-local"
                      value={formData.expires_at}
                      onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Criar Cupom</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {coupons.map((coupon) => (
            <Card key={coupon.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Tag className="h-8 w-8 text-primary" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold">{coupon.code}</h3>
                        <Badge variant={coupon.active ? 'default' : 'secondary'}>
                          {coupon.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {coupon.discount_type === 'percentage' 
                          ? `${coupon.discount_value}% de desconto` 
                          : `R$ ${coupon.discount_value.toFixed(2)} de desconto`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Usos: {coupon.current_uses} / {coupon.max_uses || '∞'} | 
                        Por usuário: {coupon.max_uses_per_user}x
                        {coupon.expires_at && ` | Expira: ${new Date(coupon.expires_at).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={coupon.active}
                      onCheckedChange={() => toggleCoupon(coupon.id, coupon.active)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCoupon(coupon.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

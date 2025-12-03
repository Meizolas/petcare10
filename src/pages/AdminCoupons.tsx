import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Tag, Loader2, Percent, DollarSign, Edit2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/components/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

const initialFormData = {
  code: '',
  discount_type: 'percentage',
  discount_value: '',
  max_uses: '',
  max_uses_per_user: '1',
  expires_at: '',
};

export default function AdminCoupons() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!isAdmin) {
      toast({
        title: 'Acesso Negado',
        description: 'Você não tem permissão para acessar esta área.',
        variant: 'destructive',
      });
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
        title: 'Erro ao carregar cupons',
        description: 'Não foi possível carregar a lista de cupons. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.code.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, insira o código do cupom.',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.discount_value || parseFloat(formData.discount_value) <= 0) {
      toast({
        title: 'Valor inválido',
        description: 'O valor do desconto deve ser maior que zero.',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.discount_type === 'percentage' && parseFloat(formData.discount_value) > 100) {
      toast({
        title: 'Porcentagem inválida',
        description: 'A porcentagem de desconto não pode ser maior que 100%.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const couponData = {
        code: formData.code.toUpperCase().trim(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        max_uses_per_user: parseInt(formData.max_uses_per_user) || 1,
        expires_at: formData.expires_at || null,
        active: true,
      };

      if (editingCoupon) {
        const { error } = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', editingCoupon.id);

        if (error) throw error;

        toast({
          title: 'Cupom atualizado!',
          description: `O cupom ${couponData.code} foi atualizado com sucesso.`,
        });
      } else {
        const { error } = await supabase.from('coupons').insert(couponData);

        if (error) {
          if (error.code === '23505') {
            toast({
              title: 'Cupom já existe',
              description: 'Já existe um cupom com este código. Escolha outro código.',
              variant: 'destructive',
            });
            return;
          }
          throw error;
        }

        toast({
          title: 'Cupom criado!',
          description: `O cupom ${couponData.code} foi criado com sucesso.`,
        });
      }

      resetForm();
      loadCoupons();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao salvar o cupom.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setShowForm(false);
    setEditingCoupon(null);
  };

  const startEditing = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      max_uses: coupon.max_uses?.toString() || '',
      max_uses_per_user: coupon.max_uses_per_user.toString(),
      expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 16) : '',
    });
    setShowForm(true);
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
        description: active 
          ? 'O cupom foi desativado e não pode mais ser usado.'
          : 'O cupom foi ativado e já pode ser usado.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar cupom',
        description: 'Não foi possível atualizar o status do cupom.',
        variant: 'destructive',
      });
    }
  };

  const confirmDelete = (couponId: string) => {
    setCouponToDelete(couponId);
    setDeleteDialogOpen(true);
  };

  const deleteCoupon = async () => {
    if (!couponToDelete) return;

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponToDelete);

      if (error) throw error;
      
      loadCoupons();
      toast({
        title: 'Cupom deletado',
        description: 'O cupom foi removido permanentemente.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao deletar cupom',
        description: 'Não foi possível deletar o cupom. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setCouponToDelete(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col justify-center items-center h-96 space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <div className="text-lg text-muted-foreground">Carregando cupons...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-4xl font-bold">Gerenciar Cupons</h1>
            <p className="text-muted-foreground mt-1">
              Crie e gerencie cupons de desconto para seus clientes
            </p>
          </div>
          <Button 
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="w-full sm:w-auto"
          >
            {showForm ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Novo Cupom
              </>
            )}
          </Button>
        </motion.div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>{editingCoupon ? 'Editar Cupom' : 'Criar Novo Cupom'}</CardTitle>
                  <CardDescription>
                    {editingCoupon 
                      ? 'Atualize as informações do cupom abaixo'
                      : 'Preencha as informações para criar um novo cupom de desconto'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="code">Código do Cupom *</Label>
                        <Input
                          id="code"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                          placeholder="Ex: DESCONTO10"
                          className="uppercase"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="discount_type">Tipo de Desconto *</Label>
                        <Select
                          value={formData.discount_type}
                          onValueChange={(value) => setFormData({ ...formData, discount_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">
                              <div className="flex items-center gap-2">
                                <Percent className="h-4 w-4" />
                                Porcentagem (%)
                              </div>
                            </SelectItem>
                            <SelectItem value="fixed">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Valor Fixo (R$)
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="discount_value">
                          Valor do Desconto {formData.discount_type === 'percentage' ? '(%)' : '(R$)'} *
                        </Label>
                        <Input
                          id="discount_value"
                          type="number"
                          step="0.01"
                          min="0"
                          max={formData.discount_type === 'percentage' ? '100' : undefined}
                          value={formData.discount_value}
                          onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                          placeholder={formData.discount_type === 'percentage' ? 'Ex: 10' : 'Ex: 25.00'}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max_uses">Limite de Usos Total</Label>
                        <Input
                          id="max_uses"
                          type="number"
                          min="1"
                          value={formData.max_uses}
                          onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                          placeholder="Ilimitado"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max_uses_per_user">Usos por Usuário *</Label>
                        <Input
                          id="max_uses_per_user"
                          type="number"
                          min="1"
                          value={formData.max_uses_per_user}
                          onChange={(e) => setFormData({ ...formData, max_uses_per_user: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expires_at">Data de Expiração</Label>
                        <Input
                          id="expires_at"
                          type="datetime-local"
                          value={formData.expires_at}
                          onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : editingCoupon ? (
                          'Atualizar Cupom'
                        ) : (
                          'Criar Cupom'
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={resetForm}
                        className="w-full sm:w-auto"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Coupons List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {coupons.length === 0 ? (
            <Card className="text-center py-12 border-2 border-dashed">
              <CardContent>
                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">Nenhum cupom cadastrado</p>
                <p className="text-muted-foreground mb-4">
                  Crie seu primeiro cupom de desconto para atrair mais clientes
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Cupom
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {coupons.map((coupon) => (
                <Card 
                  key={coupon.id} 
                  className={`transition-all duration-300 hover:shadow-lg ${
                    !coupon.active ? 'opacity-60' : ''
                  }`}
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${
                          coupon.discount_type === 'percentage' 
                            ? 'bg-blue-500/10 text-blue-500' 
                            : 'bg-green-500/10 text-green-500'
                        }`}>
                          {coupon.discount_type === 'percentage' 
                            ? <Percent className="h-6 w-6" />
                            : <DollarSign className="h-6 w-6" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold">{coupon.code}</h3>
                            <Badge variant={coupon.active ? 'default' : 'secondary'}>
                              {coupon.active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                          <p className="text-base font-medium text-primary">
                            {coupon.discount_type === 'percentage' 
                              ? `${coupon.discount_value}% de desconto` 
                              : `R$ ${coupon.discount_value.toFixed(2)} de desconto`}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                            <span>
                              Usos: {coupon.current_uses} / {coupon.max_uses || '∞'}
                            </span>
                            <span>
                              Por usuário: {coupon.max_uses_per_user}x
                            </span>
                            {coupon.expires_at && (
                              <span>
                                Expira: {new Date(coupon.expires_at).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 justify-end">
                        <Switch
                          checked={coupon.active}
                          onCheckedChange={() => toggleCoupon(coupon.id, coupon.active)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditing(coupon)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(coupon.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este cupom? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteCoupon} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

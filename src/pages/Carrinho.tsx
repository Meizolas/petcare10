import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Trash2, ShoppingBag, Tag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    stock: number;
  };
}

export default function Carrinho() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadCart();
  }, [user]);

  const loadCart = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, products(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar carrinho',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      await loadCart();
      toast({
        title: 'Item removido',
        description: 'Produto removido do carrinho',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao remover item',
        variant: 'destructive',
      });
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('active', true)
        .maybeSingle();

      if (error) throw error;

      if (!coupon) {
        toast({
          title: 'Cupom inválido',
          description: 'Cupom não encontrado ou expirado',
          variant: 'destructive',
        });
        return;
      }

      // Check if expired
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        toast({
          title: 'Cupom expirado',
          description: 'Este cupom não está mais válido',
          variant: 'destructive',
        });
        return;
      }

      // Check usage limits
      if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        toast({
          title: 'Cupom esgotado',
          description: 'Este cupom atingiu o limite de usos',
          variant: 'destructive',
        });
        return;
      }

      // Check per-user usage
      const { data: usage } = await supabase
        .from('coupon_usage')
        .select('usage_count')
        .eq('coupon_id', coupon.id)
        .eq('user_id', user!.id)
        .maybeSingle();

      if (usage && usage.usage_count >= coupon.max_uses_per_user) {
        toast({
          title: 'Limite atingido',
          description: 'Você já usou este cupom o máximo de vezes permitido',
          variant: 'destructive',
        });
        return;
      }

      setAppliedCoupon(coupon);
      toast({
        title: 'Cupom aplicado!',
        description: `Desconto de ${coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `R$ ${coupon.discount_value.toFixed(2)}`} aplicado`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao aplicar cupom',
        variant: 'destructive',
      });
    }
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.products.price * item.quantity,
      0
    );

    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discount_type === 'percentage') {
        discount = subtotal * (appliedCoupon.discount_value / 100);
      } else {
        discount = appliedCoupon.discount_value;
      }
    }

    return {
      subtotal,
      discount,
      total: subtotal - discount,
    };
  };

  const checkout = async () => {
    if (cartItems.length === 0) return;

    setProcessing(true);
    try {
      const { subtotal, discount, total } = calculateTotal();

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user!.id,
          total: subtotal,
          discount: discount,
          final_total: total,
          coupon_code: appliedCoupon?.code || null,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update coupon usage
      if (appliedCoupon) {
        // Increment coupon usage
        await supabase
          .from('coupons')
          .update({ current_uses: appliedCoupon.current_uses + 1 })
          .eq('id', appliedCoupon.id);

        // Track user-specific usage
        const { data: existingUsage } = await supabase
          .from('coupon_usage')
          .select('usage_count')
          .eq('coupon_id', appliedCoupon.id)
          .eq('user_id', user!.id)
          .maybeSingle();

        if (existingUsage) {
          await supabase
            .from('coupon_usage')
            .update({ usage_count: existingUsage.usage_count + 1 })
            .eq('coupon_id', appliedCoupon.id)
            .eq('user_id', user!.id);
        } else {
          await supabase
            .from('coupon_usage')
            .insert({
              coupon_id: appliedCoupon.id,
              user_id: user!.id,
              usage_count: 1,
            });
        }
      }

      // Clear cart
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user!.id);

      toast({
        title: 'Pedido realizado!',
        description: 'Seu pedido foi criado com sucesso',
      });

      navigate('/minha-conta');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao processar pedido',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="h-24 w-24 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Carrinho vazio</h2>
              <p className="text-muted-foreground mb-6">
                Adicione produtos para continuar
              </p>
              <Button onClick={() => navigate('/medicamentos')}>
                Ver Produtos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { subtotal, discount, total } = calculateTotal();

  return (
    <div className="min-h-screen py-20 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          Meu Carrinho
        </h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Itens do Carrinho</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.products.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Quantidade: {item.quantity}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      R$ {(item.products.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cupom de Desconto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="coupon">Código do Cupom</Label>
                  <Input
                    id="coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="DESCONTO10"
                    disabled={appliedCoupon !== null}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={applyCoupon}
                    disabled={appliedCoupon !== null || !couponCode.trim()}
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    Aplicar
                  </Button>
                </div>
              </div>
              {appliedCoupon && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Cupom {appliedCoupon.code} aplicado
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto:</span>
                  <span className="font-medium">- R$ {discount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">R$ {total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={checkout}
                disabled={processing}
              >
                {processing ? 'Processando...' : 'Finalizar Pedido'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

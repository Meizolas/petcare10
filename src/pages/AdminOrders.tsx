import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Package, User, Calendar, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Order {
  id: string;
  user_id: string;
  total: number;
  discount: number;
  final_total: number;
  coupon_code: string | null;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    phone: string;
  };
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
  };
}

export default function AdminOrders() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadOrders();
  }, [user, isAdmin]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles(full_name, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar pedidos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*, products(name)')
        .eq('order_id', orderId);

      if (error) throw error;
      setOrderItems(data || []);
      setSelectedOrder(orderId);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar itens do pedido',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: any }> = {
      pending: { label: 'Pendente', variant: 'secondary' },
      confirmed: { label: 'Confirmado', variant: 'default' },
      shipped: { label: 'Enviado', variant: 'default' },
      delivered: { label: 'Entregue', variant: 'default' },
      cancelled: { label: 'Cancelado', variant: 'destructive' },
    };
    const { label, variant } = variants[status] || variants.pending;
    return <Badge variant={variant}>{label}</Badge>;
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
        <h1 className="text-4xl font-bold mb-8">Logs de Pedidos</h1>

        <div className="grid gap-4">
          {orders.map((order) => (
            <Card 
              key={order.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => loadOrderItems(order.id)}
            >
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Cliente</p>
                      <p className="font-semibold">{order.profiles?.full_name}</p>
                      <p className="text-sm text-muted-foreground">{order.profiles?.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Data</p>
                      <p className="font-semibold">
                        {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Valor</p>
                      <p className="font-semibold">R$ {order.final_total.toFixed(2)}</p>
                      {order.discount > 0 && (
                        <p className="text-xs text-green-600">
                          Desconto: R$ {order.discount.toFixed(2)}
                        </p>
                      )}
                      {order.coupon_code && (
                        <p className="text-xs text-muted-foreground">
                          Cupom: {order.coupon_code}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                </div>

                {selectedOrder === order.id && orderItems.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="font-semibold mb-2">Itens do Pedido:</p>
                    <div className="space-y-2">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.quantity}x {item.products.name}
                          </span>
                          <span className="font-medium">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

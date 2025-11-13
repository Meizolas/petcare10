import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Plus, Minus, Package, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import glicopanImg from '@/assets/glicopan.webp';
import tossPetImg from '@/assets/toss-pet.webp';
import meticortenImg from '@/assets/meticorten.jpg';
import simparicImg from '@/assets/simparic.jpg';
import revolutionImg from '@/assets/revolution.webp';
import chemitalImg from '@/assets/chemital.webp';
import rimadylImg from '@/assets/rimadyl.jpg';
import colirioImg from '@/assets/colirio.jpg';
import drontalImg from '@/assets/drontal.jpg';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url: string | null;
}

interface CartItem {
  product_id: string;
  quantity: number;
}

export default function Medicamentos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const productImages: Record<string, string> = {
    'Glicopan Pet': glicopanImg,
    'Toss-Pet Xarope': tossPetImg,
    'Meticorten 5mg': meticortenImg,
    'Simparic 20mg': simparicImg,
    'Revolution 6% Gatos': revolutionImg,
    'Chemital Gatos 4kg': chemitalImg,
    'Anti-inflamatório Rimadyl': rimadylImg,
    'Colírio Oftálmico Pet': colirioImg,
    'Vermífugo Drontal Plus': drontalImg,
  };

  useEffect(() => {
    loadProducts();
    if (user) {
      loadCart();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar produtos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('product_id, quantity')
        .eq('user_id', user.id);

      if (error) throw error;
      setCart(data || []);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const getCartQuantity = (productId: string) => {
    const item = cart.find(c => c.product_id === productId);
    return item?.quantity || 0;
  };

  const updateCart = async (productId: string, quantity: number) => {
    if (!user) {
      toast({
        title: 'Login necessário',
        description: 'Faça login para adicionar produtos ao carrinho',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    try {
      if (quantity === 0) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
      } else {
        await supabase
          .from('cart_items')
          .upsert({
            user_id: user.id,
            product_id: productId,
            quantity: quantity,
          }, {
            onConflict: 'user_id,product_id',
          });
      }

      await loadCart();
      
      toast({
        title: 'Carrinho atualizado',
        description: quantity === 0 ? 'Produto removido do carrinho' : 'Quantidade atualizada',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar carrinho',
        variant: 'destructive',
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      medicamentos: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      suplementos: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      higiene: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      antiparasitarios: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = selectedCategory === 'todos' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Medicamentos Pet
            </h1>
            <p className="text-lg text-muted-foreground">
              Encontre os melhores produtos para a saúde do seu pet
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="medicamentos">Medicamentos</TabsTrigger>
                <TabsTrigger value="suplementos">Suplementos</TabsTrigger>
                <TabsTrigger value="higiene">Higiene</TabsTrigger>
                <TabsTrigger value="antiparasitarios">Anti-parasitas</TabsTrigger>
              </TabsList>
            </Tabs>

            {user && (
              <Button
                onClick={() => navigate('/carrinho')}
                size="lg"
                className="relative w-full sm:w-auto"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Carrinho
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const quantity = getCartQuantity(product.id);
            
            return (
              <Card key={product.id} className="hover:shadow-lg transition-shadow flex flex-col">
                {productImages[product.name] && (
                  <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                    <img 
                      src={productImages[product.name]} 
                      alt={product.name}
                      className="w-full h-full object-contain p-4 bg-muted/30"
                    />
                  </div>
                )}
                <CardHeader className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getCategoryColor(product.category)}>
                      {product.category}
                    </Badge>
                    {product.stock < 10 && (
                      <Badge variant="destructive">Estoque baixo</Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-primary">
                        R$ {product.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        {product.stock} em estoque
                      </p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  {quantity === 0 ? (
                    <Button
                      className="w-full"
                      onClick={() => updateCart(product.id, 1)}
                      disabled={product.stock === 0}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar ao Carrinho
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 w-full">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateCart(product.id, quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="flex-1 text-center font-semibold">
                        {quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateCart(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

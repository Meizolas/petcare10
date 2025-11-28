import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CartContextType {
  syncCartAfterLogin: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const syncCartAfterLogin = async () => {
    if (!user) return;

    const localCart = localStorage.getItem('cart');
    if (!localCart) return;

    try {
      const cartIds = JSON.parse(localCart);
      
      // Transfer items from localStorage to database
      for (const [productId, quantity] of Object.entries(cartIds)) {
        // Check if item already exists in cart
        const { data: existing } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .maybeSingle();

        if (existing) {
          // Update quantity
          await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + (quantity as number) })
            .eq('id', existing.id);
        } else {
          // Insert new item
          await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: productId,
              quantity: quantity as number,
            });
        }
      }

      // Clear localStorage after syncing
      localStorage.removeItem('cart');
    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  };

  useEffect(() => {
    if (user) {
      syncCartAfterLogin();
    }
  }, [user]);

  return (
    <CartContext.Provider value={{ syncCartAfterLogin }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

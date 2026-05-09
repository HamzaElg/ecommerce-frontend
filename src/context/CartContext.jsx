import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuth } = useAuth();
  const [cart, setCart]       = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuth) return;
    setLoading(true);
    try {
      const { data } = await api.get("/cart");
      setCart(data);
    } catch (_) {}
    finally { setLoading(false); }
  }, [isAuth]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = useCallback(async (productId, quantity = 1) => {
    const { data } = await api.post("/cart/items", { productId, quantity });
    setCart(data);
  }, []);

  const removeItem = useCallback(async (itemId) => {
    const { data } = await api.delete(`/cart/items/${itemId}`);
    setCart(data);
  }, []);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    const { data } = await api.put(`/cart/items/${itemId}`, { quantity });
    setCart(data);
  }, []);

  const clearCart = useCallback(() => setCart({ items: [], total: 0 }), []);

  const itemCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <CartContext.Provider value={{ cart, loading, itemCount, fetchCart, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

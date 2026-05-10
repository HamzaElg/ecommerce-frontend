import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

const emptyCart = {
  cartId: null,
  items: [],
  totalAmount: 0,
};

export function CartProvider({ children }) {
  const { isAuth, isAdmin } = useAuth();

  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuth || isAdmin) {
      setCart(emptyCart);
      return;
    }

    setLoading(true);

    try {
      const response = await api.get("/cart");
      setCart(response.data.data ?? emptyCart);
    } catch (error) {
      console.error("Failed to fetch cart:", error.message);
      setCart(emptyCart);
    } finally {
      setLoading(false);
    }
  }, [isAuth, isAdmin]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(
    async (productId, quantity = 1) => {
      if (!isAuth) {
        throw new Error("Vous devez vous connecter pour ajouter au panier.");
      }

      if (isAdmin) {
        throw new Error("Un administrateur ne peut pas utiliser le panier.");
      }

      const response = await api.post("/cart/items", { productId, quantity });
      setCart(response.data.data ?? emptyCart);
      return response.data.data;
    },
    [isAuth, isAdmin]
  );

  const removeItem = useCallback(
    async (productId) => {
      if (!isAuth || isAdmin) return emptyCart;

      const response = await api.delete(`/cart/items/${productId}`);
      setCart(response.data.data ?? emptyCart);
      return response.data.data;
    },
    [isAuth, isAdmin]
  );

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (!isAuth || isAdmin) return emptyCart;

      const response = await api.put(`/cart/items/${productId}`, null, {
        params: { quantity },
      });

      setCart(response.data.data ?? emptyCart);
      return response.data.data;
    },
    [isAuth, isAdmin]
  );

  const clearCart = useCallback(async () => {
    if (!isAuth || isAdmin) {
      setCart(emptyCart);
      return emptyCart;
    }

    const response = await api.delete("/cart");
    setCart(response.data.data ?? emptyCart);
    return response.data.data;
  }, [isAuth, isAdmin]);

  const resetCartLocal = useCallback(() => {
    setCart(emptyCart);
  }, []);

  const itemCount =
    cart.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        fetchCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        resetCartLocal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
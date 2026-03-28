import { create } from "zustand";

const useCartStore = create((set, get) => ({
  cart: [],

  addItem: (item) =>
    set((state) => ({
      cart: [...state.cart, item],
    })),

  // ✅ FIX: make this a function
  totalPrice: () => {
    return get().cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  },

  totalItems: () => {
    return get().cart.reduce((count, item) => count + item.quantity, 0);
  },
}));

export default useCartStore;
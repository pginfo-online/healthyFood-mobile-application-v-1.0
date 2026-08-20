import { create } from 'zustand';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  discountPrice?: number;
  image?: string;
  unit: string;
  storeId: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  storeId: string | null;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  storeId: null,

  addItem: (product) => {
    const { items, storeId } = get();

    // If adding from a different store, reset cart for single-store checkout
    if (storeId && storeId !== product.storeId) {
      set({
        items: [{ ...product, quantity: 1 }],
        storeId: product.storeId,
      });
      return;
    }

    const existingIndex = items.findIndex((i) => i.productId === product.productId);
    if (existingIndex > -1) {
      const newItems = [...items];
      newItems[existingIndex].quantity += 1;
      set({ items: newItems, storeId: product.storeId });
    } else {
      set({
        items: [...items, { ...product, quantity: 1 }],
        storeId: product.storeId,
      });
    }
  },

  removeItem: (productId) => {
    const newItems = get().items.filter((i) => i.productId !== productId);
    set({
      items: newItems,
      storeId: newItems.length > 0 ? get().storeId : null,
    });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    const newItems = get().items.map((i) =>
      i.productId === productId ? { ...i, quantity } : i,
    );
    set({ items: newItems });
  },

  clearCart: () => set({ items: [], storeId: null }),

  getTotal: () => {
    return get().items.reduce((acc, item) => {
      const finalPrice = item.discountPrice ?? item.price;
      return acc + finalPrice * item.quantity;
    }, 0);
  },

  getItemCount: () => {
    return get().items.reduce((acc, item) => acc + item.quantity, 0);
  },
}));

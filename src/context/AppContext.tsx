import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { PublicProduct, Category, PlatformSettings } from '../types/index.ts';
import { api, getAdminToken } from '../services/api.ts';

export type ViewType =
  | 'home'
  | 'catalog'
  | 'product-detail'
  | 'submit-product'
  | 'contact'
  | 'about'
  | 'terms'
  | 'privacy'
  | 'product-terms'
  | 'cancellation-policy'
  | 'faq'
  | 'how-to-sell'
  | 'cart'
  | 'admin';

export interface CartItem {
  product: PublicProduct;
  quantity: number;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  view: ViewType;
  setView: (view: ViewType) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedWilaya: string;
  setSelectedWilaya: (w: string) => void;
  sortOption: string;
  setSortOption: (s: string) => void;
  cart: CartItem[];
  addToCart: (product: PublicProduct, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  clearCart: () => void;
  orderModalProduct: PublicProduct | null;
  openOrderModal: (product: PublicProduct) => void;
  closeOrderModal: () => void;
  config: PlatformSettings | null;
  categories: Category[];
  refreshCategories: () => Promise<void>;
  refreshConfig: () => Promise<void>;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  checkAuth: () => Promise<void>;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  navigateToProduct: (productId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'wassel_dz_cart';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [view, setView] = useState<ViewType>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedWilaya, setSelectedWilaya] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('newest');
  const [orderModalProduct, setOrderModalProduct] = useState<PublicProduct | null>(null);
  const [config, setConfig] = useState<PlatformSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Cart initialization from localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save cart changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Load config & categories
  const refreshConfig = async () => {
    try {
      const data = await api.getConfig();
      setConfig(data);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshCategories = async () => {
    try {
      const cats = await api.getCategories();
      setCategories(cats);
    } catch (e) {
      console.error(e);
    }
  };

  const checkAuth = async () => {
    const isAuthed = await api.checkAdminAuth();
    setIsAdmin(isAuthed);
  };

  useEffect(() => {
    refreshConfig();
    refreshCategories();
    checkAuth();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (product: PublicProduct, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`تمت إضافة "${product.title}" إلى السلة`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('تم حذف المنتج من السلة', 'info');
  };

  const updateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const openOrderModal = (product: PublicProduct) => {
    setOrderModalProduct(product);
  };

  const closeOrderModal = () => {
    setOrderModalProduct(null);
  };

  const navigateToProduct = (productId: string) => {
    setSelectedProductId(productId);
    setView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppContext.Provider
      value={{
        view,
        setView,
        selectedProductId,
        setSelectedProductId,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedWilaya,
        setSelectedWilaya,
        sortOption,
        setSortOption,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        orderModalProduct,
        openOrderModal,
        closeOrderModal,
        config,
        categories,
        refreshCategories,
        refreshConfig,
        isAdmin,
        setIsAdmin,
        checkAuth,
        toasts,
        showToast,
        removeToast,
        navigateToProduct,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

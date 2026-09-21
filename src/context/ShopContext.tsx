import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductItem, CartItem, Language, ThemeMode, ShopDetails, ReviewItem } from '../types';
import { initialProducts, initialShopDetails, initialReviews } from '../data/initialData';
import { translations } from '../data/translations';

interface ShopContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  products: ProductItem[];
  setProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>;
  updateProductPrice: (id: string, newPrice: number) => void;
  shopDetails: ShopDetails;
  setShopDetails: React.Dispatch<React.SetStateAction<ShopDetails>>;
  reviews: ReviewItem[];
  setReviews: React.Dispatch<React.SetStateAction<ReviewItem[]>>;
  updateReview: (id: string, fields: Partial<ReviewItem>) => void;
  cart: CartItem[];
  addToCart: (product: ProductItem, selectedPortion?: string, customPrice?: number) => void;
  removeFromCart: (productId: string, portion: string) => void;
  updateQuantity: (productId: string, portion: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  t: typeof translations.bn;
  resetToDefaults: () => void;
  resetToDefaultData: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language: Default is Bengali 'bn' as strictly requested
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('ghosh_lang');
    return (saved === 'en' || saved === 'bn') ? saved : 'bn';
  });

  // Theme: Dark vs Bright (Light)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('ghosh_theme');
    return (saved === 'bright' || saved === 'dark') ? saved : 'dark';
  });

  // Products
  const [products, setProducts] = useState<ProductItem[]>(() => {
    const saved = localStorage.getItem('ghosh_products_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((p: ProductItem) => p.id === 'small-rosogolla')) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing saved products', e);
      }
    }
    return initialProducts;
  });

  // Shop details (phone, address, etc.)
  const [shopDetails, setShopDetails] = useState<ShopDetails>(() => {
    const saved = localStorage.getItem('ghosh_shop_details');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved shop details', e);
      }
    }
    return initialShopDetails;
  });

  // Reviews
  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    const saved = localStorage.getItem('ghosh_reviews');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved reviews', e);
      }
    }
    return initialReviews;
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('ghosh_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved cart', e);
      }
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('ghosh_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('ghosh_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('ghosh_products_v3', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ghosh_shop_details', JSON.stringify(shopDetails));
  }, [shopDetails]);

  useEffect(() => {
    localStorage.setItem('ghosh_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('ghosh_cart', JSON.stringify(cart));
  }, [cart]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'bright' : 'dark'));
  };

  const addToCart = (product: ProductItem, selectedPortion?: string, customPrice?: number) => {
    const portion = selectedPortion || (language === 'bn' ? product.portionBn : product.portionEn);
    const itemPrice = customPrice !== undefined ? customPrice : product.price;

    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.selectedPortion === portion
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += 1;
        return next;
      }
      return [...prev, { product, selectedPortion: portion, price: itemPrice, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, portion: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.selectedPortion === portion)));
  };

  const updateQuantity = (productId: string, portion: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId && item.selectedPortion === portion) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const updateProductPrice = (id: string, newPrice: number) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, price: newPrice } : p))
    );
  };

  const updateReview = (id: string, fields: Partial<ReviewItem>) => {
    setReviews(prev =>
      prev.map(r => (r.id === id ? { ...r, ...fields } : r))
    );
  };

  const resetToDefaults = () => {
    setProducts(initialProducts);
    setShopDetails(initialShopDetails);
    setReviews(initialReviews);
    localStorage.removeItem('ghosh_products_v2');
    localStorage.removeItem('ghosh_shop_details');
    localStorage.removeItem('ghosh_reviews');
  };

  const resetToDefaultData = resetToDefaults;

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const t = translations[language];

  return (
    <ShopContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        setTheme,
        toggleTheme,
        products,
        setProducts,
        updateProductPrice,
        shopDetails,
        setShopDetails,
        reviews,
        setReviews,
        updateReview,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        isAdminOpen,
        setIsAdminOpen,
        t,
        resetToDefaults,
        resetToDefaultData
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

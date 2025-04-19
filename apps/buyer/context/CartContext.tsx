import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ProductCategory {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  productCategory: ProductCategory; // Promijenjeno iz productcategoryid
  retailPrice: number;             // Promijenjeno iz price (koristit ćemo maloprodajnu cijenu)
  wholesalePrice: number;         // Dodano
  weight?: number;                 // Promijenjeno iz wieght (ispravljen typo)
  weightUnit?: string;             // Promijenjeno iz wieghtunit (ispravljen typo)
  volume?: number;
  volumeUnit?: string;
  storeId: number;                 // Promijenjeno iz storeID (usklađeno s formatom)
  photos: string[];                // Promijenjeno iz imageUrl u niz stringova
}

interface CartContextType {
  cartItems: {product:Product, qty:number} [];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  handleQuantityChange: (product: Product, newQty: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<{ product: Product; qty: number }[]>([]);

  const addToCart = (product: Product) => {
    // Check if the product is already in the cart
    const exists = cartItems.find(item => item.product.id === product.id);
    if (exists) {
      setCartItems(prev => prev.map(item => item.product.id === product.id ? {...item, qty: item.qty + 1} : item));
    } else {
      setCartItems(prev => [...prev, {product, qty: 1}]);
    }
    console.log("cartItems: ", cartItems);
  };

  const removeFromCart = (productId: number) => {
    // if the quantity is >1 decrease, otherwise remove from cart
    
    const exists = cartItems.find(item => item.product.id === productId);
    if (exists && exists.qty > 1) {
      setCartItems(prev => prev.map(item => item.product.id === productId ? {...item, qty: item.qty - 1} : item));
    }
    else
      setCartItems(prev => prev.filter(item => item.product.id !== productId));

    console.log("cartItems: ", cartItems);
  };

  const clearCart = () => setCartItems([]);

  const handleQuantityChange = (product: Product, newQty: number) => {
    setCartItems(items => {
      const exists = items.find(i => i.product.id === product.id);
      if (exists) {
        if (newQty <= 0) {
          return items.filter(i => i.product.id !== product.id);
        }
        return items.map(i =>
          i.product.id === product.id ? { ...i, qty: newQty } : i
        );
      }
      console.log("cartItems: ", cartItems);
      return [...items, { product, qty: newQty }];
    });
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, handleQuantityChange }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

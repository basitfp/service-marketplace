import { createContext, useContext } from 'react';
import { usePage } from '@inertiajs/react';

const CartContext = createContext({ cartCount: 0 });

/**
 * CartProvider — wraps any subtree that needs cart state.
 * The count is sourced from Inertia shared props (server session),
 * so no local state management is required.
 */
export function CartProvider({ children }) {
    const { cart } = usePage().props;
    const cartCount = cart?.count ?? 0;

    return (
        <CartContext.Provider value={{ cartCount }}>
            {children}
        </CartContext.Provider>
    );
}

/**
 * useCart — consume cart state anywhere inside CartProvider.
 * Returns: { cartCount }
 */
export function useCart() {
    return useContext(CartContext);
}

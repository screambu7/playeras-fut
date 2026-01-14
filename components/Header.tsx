"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCart, getCartItemCount } from "@/lib/cart-medusa";
import SearchInput from "@/components/search/SearchInput";
import MiniCartDrawer from "@/components/cart/MiniCartDrawer";

export default function Header() {
  const [itemCount, setItemCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    async function loadCartCount() {
      try {
        const cart = await getCart();
        if (cart) {
          const count = getCartItemCount(cart);
          setItemCount(count);
        }
      } catch (error) {
        // Error loading cart count - handled silently
      }
    }

    loadCartCount();

    // Escuchar eventos de actualizaci?n del carrito
    const handleCartUpdate = () => {
      loadCartCount();
    };

    window.addEventListener("cart-updated", handleCartUpdate);

    // Recargar el conteo peri?dicamente (fallback)
    const interval = setInterval(loadCartCount, 5000);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCartOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">?</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:inline">
                Playeras Fut
              </span>
            </Link>

            {/* Buscador - Ocupa espacio flexible */}
            <div className="flex-1 max-w-2xl mx-4 hidden md:block">
              <SearchInput
                placeholder="Buscar playeras, equipos, ligas..."
                className="w-full"
              />
            </div>

            {/* Navegaci?n y Carrito */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <nav className="hidden lg:flex items-center space-x-6">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                >
                  Inicio
                </Link>
                <Link
                  href="/catalogo"
                  className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                >
                  Cat?logo
                </Link>
              </nav>

              {/* Bot?n Carrito - Abre Mini Cart */}
              <button
                onClick={handleCartClick}
                className="relative flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                aria-label="Abrir carrito"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="font-medium hidden sm:inline">Carrito</span>
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Buscador Mobile */}
          <div className="md:hidden pb-3">
            <SearchInput
              placeholder="Buscar playeras, equipos, ligas..."
              className="w-full"
            />
          </div>
        </div>
      </header>

      {/* Mini Cart Drawer */}
      <MiniCartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

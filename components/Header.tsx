"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCart, getCartItemCount } from "@/lib/cart-medusa";

export default function Header() {
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    async function loadCartCount() {
      try {
        const cart = await getCart();
        if (cart) {
          const count = getCartItemCount(cart);
          setItemCount(count);
        }
      } catch (error) {
        console.error("Error loading cart count:", error);
      }
    }

    loadCartCount();

    // Escuchar eventos de actualización del carrito
    const handleCartUpdate = () => {
      loadCartCount();
    };

    window.addEventListener("cart-updated", handleCartUpdate);

    // Recargar el conteo periódicamente (fallback)
    const interval = setInterval(loadCartCount, 5000);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚽</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Playeras Fut</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
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
              Catálogo
            </Link>
          </nav>

          <Link
            href="/carrito"
            className="relative flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
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
            <span className="font-medium">Carrito</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

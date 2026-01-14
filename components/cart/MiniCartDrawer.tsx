/**
 * Drawer lateral para Mini Cart
 * Se abre desde el Header al hacer click en el carrito
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getCart,
  updateCartItem,
  removeFromCart,
  calculateCartTotal,
} from "@/lib/cart-medusa";
import { MedusaCart, MedusaCartItem } from "@/types";
import MiniCartItem from "./MiniCartItem";

interface MiniCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MiniCartDrawer({
  isOpen,
  onClose,
}: MiniCartDrawerProps) {
  const [cart, setCart] = useState<MedusaCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Cargar carrito cuando se abre
  useEffect(() => {
    if (isOpen) {
      loadCart();
    }
  }, [isOpen]);

  // Prevenir scroll del body cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Escuchar eventos de actualización del carrito
  useEffect(() => {
    const handleCartUpdate = () => {
      if (isOpen) {
        loadCart();
      }
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, [isOpen]);

  const loadCart = async () => {
    setLoading(true);
    try {
      const cartData = await getCart();
      setCart(cartData);
    } catch (error) {
      // Error silencioso - el carrito puede no estar disponible
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (
    lineItemId: string,
    quantity: number
  ) => {
    if (quantity < 1) {
      await handleRemoveItem(lineItemId);
      return;
    }

    setUpdating(lineItemId);
    try {
      const result = await updateCartItem(lineItemId, quantity);
      if (result.cart) {
        setCart(result.cart);
        // Disparar evento para actualizar header
        window.dispatchEvent(new CustomEvent("cart-updated"));
      }
      // Si hay error, ya está manejado por la función
    } catch (error) {
      // Error inesperado
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (lineItemId: string) => {
    setUpdating(lineItemId);
    try {
      const result = await removeFromCart(lineItemId);
      if (result.cart) {
        setCart(result.cart);
        // Disparar evento para actualizar header
        window.dispatchEvent(new CustomEvent("cart-updated"));
      }
      // Si hay error, ya está manejado por la función
    } catch (error) {
      // Error inesperado
    } finally {
      setUpdating(null);
    }
  };

  if (!isOpen) return null;

  const total = cart ? calculateCartTotal(cart) : 0;
  const itemCount = cart?.items?.length || 0;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Carrito ({itemCount})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cerrar carrito"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
                <p className="text-sm text-gray-500">Cargando carrito...</p>
              </div>
            </div>
          ) : !cart || !cart.items || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tu carrito está vacío
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Agrega algunos productos para comenzar
              </p>
              <Link
                href="/catalogo"
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Ver Catálogo
              </Link>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {cart.items.map((item: MedusaCartItem) => (
                <MiniCartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                  isUpdating={updating === item.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items && cart.items.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-lg font-semibold text-gray-900">
                  €{total.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                El envío se calculará en el checkout
              </p>
            </div>
            <div className="space-y-2">
              <Link
                href="/carrito"
                onClick={onClose}
                className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Ver Carrito Completo
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                className="block w-full text-center px-4 py-3 bg-primary-600 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition-colors"
              >
                Continuar Compra
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

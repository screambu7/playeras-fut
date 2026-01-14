"use client";

import { useEffect, useState } from "react";
import { getCart, updateCartItem, removeFromCart, calculateCartTotal } from "@/lib/cart-medusa";
import { MedusaCart, MedusaCartItem } from "@/types";
import Link from "next/link";

export default function CarritoPage() {
  const [cart, setCart] = useState<MedusaCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  // Escuchar eventos de actualización del carrito (en lugar de polling)
  useEffect(() => {
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, []);

  const loadCart = async () => {
    setLoading(true);
    const cartData = await getCart();
    setCart(cartData);
    setLoading(false);
  };

  const handleUpdateQuantity = async (lineItemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(lineItemId);
      return;
    }

    if (!cart) return;

    setUpdating(lineItemId);
    try {
      const result = await updateCartItem(lineItemId, newQuantity);
      if (result.cart) {
        setCart(result.cart);
        window.dispatchEvent(new CustomEvent("cart-updated"));
      } else if (result.error) {
        // Error ya está manejado por la función, solo actualizamos estado
        // En producción, podrías mostrar un toast aquí
      }
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
        window.dispatchEvent(new CustomEvent("cart-updated"));
      } else if (result.error) {
        // Error ya está manejado por la función
      }
    } catch (error) {
      // Error inesperado
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h1>
          <p className="text-gray-600 mb-8">
            Agrega algunos productos para comenzar tu compra.
          </p>
          <Link
            href="/catalogo"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            Ver Catálogo
          </Link>
        </div>
      </div>
    );
  }

  const total = calculateCartTotal(cart); // Ya viene en euros

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
        Carrito de Compras
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item: MedusaCartItem) => {
            const product = item.variant.product;
            // El precio viene en unit_price (en centavos)
            const priceInEuros = (item.unit_price || 0) / 100;
            const itemTotal = priceInEuros * item.quantity;
            const isUpdating = updating === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].url}
                        alt={product.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-4xl">⚽</span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Link
                          href={`/producto/${product.handle}`}
                          className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                        >
                          {product.title}
                        </Link>
                        <p className="text-sm text-gray-600">
                          {product.metadata?.team || ""}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Talla: {item.variant.title}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isUpdating}
                        className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        aria-label="Eliminar producto"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-4">
                      <div>
                        <span className="text-sm text-gray-600">Precio unitario: </span>
                        <span className="font-medium">€{priceInEuros.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-4 mt-4">
                      <label className="text-sm text-gray-600">Cantidad:</label>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={isUpdating}
                          className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={isUpdating}
                          className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      <div className="ml-auto">
                        <span className="text-lg font-bold text-gray-900">
                          €{itemTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Resumen del Pedido
            </h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>€{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span className="text-green-600">Gratis</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <Link
              href="/checkout"
              className="block w-full bg-primary-600 text-white font-semibold py-4 rounded-lg hover:bg-primary-700 transition-colors text-center mb-4"
            >
              Continuar Compra
            </Link>
            <Link
              href="/catalogo"
              className="block text-center text-primary-600 hover:text-primary-700 font-medium mt-4"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

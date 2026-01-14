/**
 * Resumen de la orden (sticky sidebar)
 */

"use client";

import { MedusaCart } from "@/types/medusa";
import { ShippingOption } from "@/types/checkout";
import Link from "next/link";

interface OrderSummaryProps {
  cart: MedusaCart;
  selectedShipping?: ShippingOption | null;
}

export default function OrderSummary({ cart, selectedShipping }: OrderSummaryProps) {
  // Medusa devuelve precios en centavos
  const subtotal = (cart.subtotal || 0) / 100;
  const shippingTotal = selectedShipping ? selectedShipping.amount / 100 : 0;
  const total = ((cart.total || 0) / 100) + shippingTotal;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen del pedido</h2>

      {/* Items */}
      <div className="space-y-3 mb-6">
        {cart.items.map((item) => {
          const itemPrice = item.unit_price / 100;
          const itemTotal = itemPrice * item.quantity;
          const imageUrl = item.variant.product.images?.[0]?.url;

          return (
            <div key={item.id} className="flex gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl">⚽</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Talla: {item.variant.title}
                </p>
                <p className="text-xs text-gray-500">
                  Cantidad: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  €{itemTotal.toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>€{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Envío</span>
          <span>
            {selectedShipping
              ? `€${shippingTotal.toFixed(2)}`
              : "Selecciona envío"}
          </span>
        </div>
        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>€{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Link
        href="/catalogo"
        className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-4"
      >
        Seguir comprando
      </Link>
    </div>
  );
}

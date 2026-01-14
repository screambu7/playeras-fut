/**
 * Componente para mostrar un item individual en el Mini Cart
 */

"use client";

import Link from "next/link";
import { MedusaCartItem } from "@/types";
import { useState } from "react";

interface MiniCartItemProps {
  item: MedusaCartItem;
  onUpdateQuantity: (lineItemId: string, quantity: number) => Promise<void>;
  onRemove: (lineItemId: string) => Promise<void>;
  isUpdating?: boolean;
}

export default function MiniCartItem({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
}: MiniCartItemProps) {
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const product = item.variant.product;
  const priceInEuros = item.unit_price / 100;
  const itemTotal = priceInEuros * item.quantity;

  const imageUrl = product.images?.[0]?.url || "";

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) {
      await onRemove(item.id);
      return;
    }

    setLocalQuantity(newQuantity);
    await onUpdateQuantity(item.id, newQuantity);
  };

  return (
    <div className="flex gap-3 p-3 hover:bg-gray-50 transition-colors rounded-lg">
      {/* Imagen */}
      <Link
        href={`/producto/${product.handle}`}
        className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-2xl">⚽</span>
          </div>
        )}
      </Link>

      {/* Información */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/producto/${product.handle}`}
          className="block group"
        >
          <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
            {product.title}
          </h3>
          {product.metadata?.team && (
            <p className="text-xs text-gray-500 mt-0.5">
              {product.metadata.team}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">
            Talla: {item.variant.title}
          </p>
        </Link>

        {/* Controles de cantidad y precio */}
        <div className="flex items-center justify-between mt-2">
          {/* Controles de cantidad */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
              className="w-6 h-6 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Disminuir cantidad"
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isUpdating}
              className="w-6 h-6 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          {/* Precio */}
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              €{itemTotal.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              €{priceInEuros.toFixed(2)} c/u
            </p>
          </div>
        </div>
      </div>

      {/* Botón eliminar */}
      <button
        onClick={() => onRemove(item.id)}
        disabled={isUpdating}
        className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 p-1"
        aria-label="Eliminar producto"
      >
        <svg
          className="w-4 h-4"
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
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/cart-medusa";
import { MedusaProductVariant } from "@/types";

interface AddToCartButtonProps {
  variant: MedusaProductVariant | null;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showSuccessMessage?: boolean;
}

/**
 * Componente reutilizable para agregar productos al carrito
 * Maneja estado de carga y errores de forma centralizada
 */
export default function AddToCartButton({
  variant,
  quantity = 1,
  disabled = false,
  className = "",
  onSuccess,
  onError,
  showSuccessMessage = true,
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleAddToCart = async () => {
    if (!variant) {
      const error = new Error("Por favor selecciona una talla");
      onError?.(error);
      return;
    }

    if (disabled || isAdding) {
      return;
    }

    setIsAdding(true);
    setSuccess(false);

    try {
      const cart = await addToCart(variant.id, quantity);

      if (cart) {
        setSuccess(true);
        onSuccess?.();

        if (showSuccessMessage) {
          // Mostrar mensaje de éxito temporal
          setTimeout(() => setSuccess(false), 2000);
        }

        // Notificar al header que el carrito se actualizó
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cart-updated"));
        }

        // Opcional: refrescar el carrito en el header
        router.refresh();
      } else {
        throw new Error("Error al agregar el producto al carrito");
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Error desconocido");
      console.error("Error adding to cart:", err);
      onError?.(err);
    } finally {
      setIsAdding(false);
    }
  };

  const isDisabled = disabled || isAdding || !variant;

  return (
    <button
      onClick={handleAddToCart}
      disabled={isDisabled}
      className={`w-full font-semibold py-4 rounded-lg transition-colors ${
        success
          ? "bg-green-600 text-white"
          : isDisabled
          ? "bg-gray-400 text-white cursor-not-allowed"
          : "bg-primary-600 text-white hover:bg-primary-700"
      } ${className}`}
      aria-label="Agregar al carrito"
    >
      {isAdding ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Agregando...
        </span>
      ) : success ? (
        <span className="flex items-center justify-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          ¡Agregado!
        </span>
      ) : (
        "Agregar al Carrito"
      )}
    </button>
  );
}

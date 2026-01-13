"use client";

import { MedusaProductVariant } from "@/types";

interface VariantSelectorProps {
  variants: MedusaProductVariant[];
  selectedVariant: MedusaProductVariant | null;
  onSelectVariant: (variant: MedusaProductVariant) => void;
  label?: string;
  disabled?: boolean;
}

/**
 * Componente para seleccionar variantes de producto (tallas)
 * Desacoplado y reutilizable
 */
export default function VariantSelector({
  variants,
  selectedVariant,
  onSelectVariant,
  label = "Talla",
  disabled = false,
}: VariantSelectorProps) {
  if (variants.length === 0) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <p className="text-sm text-gray-500">No hay tallas disponibles</p>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const isOutOfStock = variant.inventory_quantity !== undefined && variant.inventory_quantity <= 0;

          return (
            <button
              key={variant.id}
              onClick={() => !disabled && !isOutOfStock && onSelectVariant(variant)}
              disabled={disabled || isOutOfStock}
              className={`px-6 py-3 border-2 rounded-lg font-medium transition-colors ${
                isSelected
                  ? "border-primary-600 bg-primary-50 text-primary-700"
                  : isOutOfStock
                  ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                  : "border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-label={`Seleccionar talla ${variant.title}`}
            >
              {variant.title}
              {isOutOfStock && (
                <span className="ml-2 text-xs">(Agotado)</span>
              )}
            </button>
          );
        })}
      </div>
      {selectedVariant && selectedVariant.inventory_quantity !== undefined && (
        <p className="mt-2 text-sm text-gray-600">
          {selectedVariant.inventory_quantity > 0
            ? `${selectedVariant.inventory_quantity} disponibles`
            : "Agotado"}
        </p>
      )}
    </div>
  );
}

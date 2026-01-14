/**
 * Componente para filtro de rango de precios
 * Inputs numéricos con validación
 */

"use client";

import { useState, useEffect } from "react";

interface PriceRangeProps {
  minPrice: number | null;
  maxPrice: number | null;
  onPriceChange: (min: number | null, max: number | null) => void;
  minValue?: number;
  maxValue?: number;
}

export default function PriceRange({
  minPrice,
  maxPrice,
  onPriceChange,
  minValue = 0,
  maxValue = 1000,
}: PriceRangeProps) {
  const [localMin, setLocalMin] = useState<string>(
    minPrice?.toString() || ""
  );
  const [localMax, setLocalMax] = useState<string>(
    maxPrice?.toString() || ""
  );

  // Sincronizar con props externos
  useEffect(() => {
    setLocalMin(minPrice?.toString() || "");
    setLocalMax(maxPrice?.toString() || "");
  }, [minPrice, maxPrice]);

  const handleMinChange = (value: string) => {
    setLocalMin(value);
    const num = value === "" ? null : parseFloat(value);
    if (num !== null && !isNaN(num) && num >= minValue) {
      onPriceChange(num, maxPrice);
    } else if (value === "") {
      onPriceChange(null, maxPrice);
    }
  };

  const handleMaxChange = (value: string) => {
    setLocalMax(value);
    const num = value === "" ? null : parseFloat(value);
    if (num !== null && !isNaN(num) && num <= maxValue) {
      onPriceChange(minPrice, num);
    } else if (value === "") {
      onPriceChange(minPrice, null);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Precio</h3>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label htmlFor="price-min" className="sr-only">
            Precio mínimo
          </label>
          <input
            id="price-min"
            type="number"
            min={minValue}
            max={maxValue}
            placeholder="Mín"
            value={localMin}
            onChange={(e) => handleMinChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <span className="text-gray-500">-</span>
        <div className="flex-1">
          <label htmlFor="price-max" className="sr-only">
            Precio máximo
          </label>
          <input
            id="price-max"
            type="number"
            min={minValue}
            max={maxValue}
            placeholder="Máx"
            value={localMax}
            onChange={(e) => handleMaxChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Rango: €{minValue} - €{maxValue}
      </p>
    </div>
  );
}

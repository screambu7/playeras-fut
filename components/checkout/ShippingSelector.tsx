/**
 * Selector de opciones de envío
 */

"use client";

import { ShippingOption } from "@/types/checkout";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { CheckoutFormData } from "@/lib/checkout-schema";

interface ShippingSelectorProps {
  options: ShippingOption[];
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  selectedOptionId?: string;
  isLoading?: boolean;
}

export default function ShippingSelector({
  options,
  register,
  errors,
  selectedOptionId,
  isLoading = false,
}: ShippingSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Método de envío</h2>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Método de envío</h2>
        <p className="text-sm text-gray-500">
          No hay opciones de envío disponibles. Por favor, verifica tu dirección.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Método de envío</h2>
      <div className="space-y-3">
        {options.map((option) => {
          const price = (option.amount / 100).toFixed(2);
          const isSelected = selectedOptionId === option.id;

          return (
            <label
              key={option.id}
              className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                isSelected
                  ? "border-primary-600 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    value={option.id}
                    {...register("shipping_option_id")}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 focus:outline-none"
                    aria-label={`Seleccionar ${option.name}`}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{option.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    €{price}
                  </p>
                </div>
              </div>
            </label>
          );
        })}
      </div>
      {errors.shipping_option_id && (
        <p className="mt-1 text-sm text-red-600" role="alert" id="shipping-error">
          {errors.shipping_option_id.message}
        </p>
      )}
    </div>
  );
}

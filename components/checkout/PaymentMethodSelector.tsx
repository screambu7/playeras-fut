/**
 * Selector de método de pago
 */

"use client";

import { PaymentSession } from "@/types/checkout";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { CheckoutFormData } from "@/lib/checkout-schema";

interface PaymentMethodSelectorProps {
  paymentSessions: PaymentSession[];
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  selectedProviderId?: string;
  isLoading?: boolean;
}

export default function PaymentMethodSelector({
  paymentSessions,
  register,
  errors,
  selectedProviderId,
  isLoading = false,
}: PaymentMethodSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Método de pago</h2>
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

  if (paymentSessions.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Método de pago</h2>
        <p className="text-sm text-gray-500">
          No hay métodos de pago disponibles. Por favor, completa la información de envío primero.
        </p>
      </div>
    );
  }

  const getProviderName = (providerId: string): string => {
    const providerNames: Record<string, string> = {
      stripe: "Stripe",
      manual: "Pago Manual",
      "stripe-stripe": "Stripe",
    };
    return providerNames[providerId.toLowerCase()] || providerId;
  };

  const getProviderIcon = (providerId: string): JSX.Element => {
    const normalizedId = providerId.toLowerCase();
    
    if (normalizedId.includes("stripe")) {
      return (
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.307 0 4.94.81 7.83 2.395V2.728C19.335 2.095 17.97 1.5 16.456 1.5c-4.487 0-7.31 2.433-7.31 5.895 0 3.41 2.838 4.805 5.187 5.547 2.34.74 3.356 1.426 3.356 2.41 0 .98-.84 1.545-2.354 1.545-1.905 0-4.375-.61-7.83-2.405v5.331c1.143.515 2.31.896 3.718.896 4.499 0 7.31-2.395 7.31-5.896 0-3.41-2.838-4.806-5.187-5.547z"
            fill="#635BFF"
          />
        </svg>
      );
    }
    
    return (
      <div className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center">
        <span className="text-xs font-semibold text-gray-600">$</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Método de pago</h2>
      <div className="space-y-3">
        {paymentSessions.map((session) => {
          const isSelected = selectedProviderId === session.provider_id;
          const providerName = getProviderName(session.provider_id);

          return (
            <label
              key={session.id}
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
                    value={session.provider_id}
                    {...register("payment_provider_id")}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 focus:outline-none"
                    aria-label={`Seleccionar ${providerName}`}
                  />
                  <div className="flex items-center gap-2">
                    {getProviderIcon(session.provider_id)}
                    <div>
                      <p className="font-medium text-gray-900">{providerName}</p>
                      {session.status && (
                        <p className="text-xs text-gray-500 capitalize">
                          {session.status}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <div className="text-primary-600">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>
      {errors.payment_provider_id && (
        <p className="mt-1 text-sm text-red-600" role="alert" id="payment-error">
          {errors.payment_provider_id.message}
        </p>
      )}
    </div>
  );
}

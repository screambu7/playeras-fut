/**
 * Formulario de dirección de envío
 */

"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { CheckoutFormData } from "@/lib/checkout-schema";

interface AddressFormProps {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
}

export default function AddressForm({ register, errors }: AddressFormProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Información de contacto</h2>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none ${
            errors.email ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="tu@email.com"
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono
        </label>
        <input
          id="phone"
          type="tel"
          {...register("phone")}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="+34 600 000 000"
        />
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mt-6">Dirección de envío</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input
            id="first_name"
            type="text"
            {...register("first_name")}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none ${
              errors.first_name ? "border-red-500" : "border-gray-300"
            }`}
            aria-invalid={errors.first_name ? "true" : "false"}
            aria-describedby={errors.first_name ? "first_name-error" : undefined}
          />
          {errors.first_name && (
            <p id="first_name-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.first_name.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
            Apellido *
          </label>
          <input
            id="last_name"
            type="text"
            {...register("last_name")}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.last_name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.last_name && (
            <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="address_1" className="block text-sm font-medium text-gray-700 mb-1">
          Dirección *
        </label>
        <input
          id="address_1"
          type="text"
          {...register("address_1")}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.address_1 ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Calle y número"
        />
        {errors.address_1 && (
          <p className="mt-1 text-sm text-red-600">{errors.address_1.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="address_2" className="block text-sm font-medium text-gray-700 mb-1">
          Dirección adicional (opcional)
        </label>
        <input
          id="address_2"
          type="text"
          {...register("address_2")}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Piso, puerta, etc."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            Ciudad *
          </label>
          <input
            id="city"
            type="text"
            {...register("city")}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.city ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
            Código Postal *
          </label>
          <input
            id="postal_code"
            type="text"
            {...register("postal_code")}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.postal_code ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.postal_code && (
            <p className="mt-1 text-sm text-red-600">{errors.postal_code.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
            Provincia
          </label>
          <input
            id="province"
            type="text"
            {...register("province")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="country_code" className="block text-sm font-medium text-gray-700 mb-1">
          País *
        </label>
        <select
          id="country_code"
          {...register("country_code")}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.country_code ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Selecciona un país</option>
          <option value="es">España</option>
          <option value="mx">México</option>
          <option value="ar">Argentina</option>
          <option value="co">Colombia</option>
          <option value="cl">Chile</option>
          <option value="pe">Perú</option>
        </select>
        {errors.country_code && (
          <p className="mt-1 text-sm text-red-600">{errors.country_code.message}</p>
        )}
      </div>
    </div>
  );
}

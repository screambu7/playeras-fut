/**
 * Schema de validación para checkout usando Zod
 */

import { z } from "zod";

export const checkoutSchema = z.object({
  // Información de contacto
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),

  // Dirección de envío
  first_name: z.string().min(1, "El nombre es requerido"),
  last_name: z.string().min(1, "El apellido es requerido"),
  address_1: z.string().min(1, "La dirección es requerida"),
  address_2: z.string().optional(),
  city: z.string().min(1, "La ciudad es requerida"),
  country_code: z.string().min(2, "El país es requerido"),
  postal_code: z.string().min(1, "El código postal es requerido"),
  province: z.string().optional(),

  // Opción de envío
  shipping_option_id: z.string().min(1, "Debes seleccionar una opción de envío"),

  // Método de pago
  payment_provider_id: z.string().min(1, "Debes seleccionar un método de pago"),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

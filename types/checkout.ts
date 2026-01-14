/**
 * Tipos para el proceso de checkout
 */

export interface ShippingAddress {
  first_name: string | null;
  last_name: string | null;
  address_1: string | null;
  address_2?: string | null;
  city: string | null;
  country_code: string | null;
  postal_code: string | null;
  province?: string | null;
  phone?: string | null;
}

export interface ShippingOption {
  id: string;
  name: string;
  amount: number;
  currency_code: string;
  data?: Record<string, unknown>;
}

export interface PaymentSession {
  id: string;
  provider_id: string;
  status: string;
  data?: Record<string, unknown>;
}

export interface Order {
  id: string;
  display_id: number;
  email: string;
  items: OrderItem[];
  shipping_address: ShippingAddress | null;
  shipping_methods: ShippingMethod[];
  payment_status: string;
  fulfillment_status: string;
  total: number;
  subtotal: number;
  shipping_total: number;
  tax_total: number;
  currency_code: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  variant: {
    id: string;
    title: string;
    product: {
      id: string;
      title: string;
      handle: string;
      images: Array<{ url: string }>;
    };
  };
}

export interface ShippingMethod {
  id: string;
  name: string;
  amount: number;
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getOrder } from "@/lib/checkout";
import { Order } from "@/types/checkout";
import Link from "next/link";
import Loader from "@/components/ui/Loader";

function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("No se proporcionó un ID de orden");
      setLoading(false);
      return;
    }

    loadOrder(orderId);
  }, [orderId]);

  const loadOrder = async (id: string) => {
    setLoading(true);
    try {
      const result = await getOrder(id);
      if (!result.order) {
        const errorMsg = result.error?.message || "No se pudo cargar la orden";
        setError(errorMsg);
        return;
      }

      // Validar que la orden tiene datos mínimos requeridos
      if (!result.order.id || !result.order.items || result.order.items.length === 0) {
        setError("La orden no tiene datos válidos. Por favor, contacta con soporte.");
        return;
      }

      // Validar que la orden tiene un estado de pago válido
      // Si el pago está pendiente o falló, mostrar advertencia
      if (result.order.payment_status === "not_paid" || result.order.payment_status === "canceled") {
        setError("El pago de esta orden no se completó. Por favor, verifica el estado del pago.");
        return;
      }

      setOrder(result.order);
    } catch (err: any) {
      const errorMsg = err.message || "Error al cargar la orden. Por favor, intenta nuevamente.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Loader size="lg" text="Cargando orden..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Error al cargar la orden
          </h1>
          <p className="text-gray-600 mb-8">{error || "Orden no encontrada"}</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/catalogo"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Ver Catálogo
            </Link>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  const total = order.total / 100;
  const subtotal = order.subtotal / 100;
  const shippingTotal = order.shipping_total / 100;
  const taxTotal = order.tax_total / 100;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header de éxito */}
      <div className="text-center mb-12">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
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
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ¡Pedido Confirmado!
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Gracias por tu compra. Tu pedido ha sido recibido.
        </p>
        <p className="text-sm text-gray-500">
          Número de pedido: #{order.display_id}
        </p>
      </div>

      {/* Información de la orden */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Detalles del Pedido
        </h2>

        {/* Items */}
        <div className="space-y-4 mb-6">
          {order.items.map((item) => {
            const itemPrice = item.unit_price / 100;
            const itemTotal = itemPrice * item.quantity;
            const imageUrl = item.variant.product.images?.[0]?.url;

            return (
              <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
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
                <div className="flex-1">
                  <Link
                    href={`/producto/${item.variant.product.handle}`}
                    className="font-medium text-gray-900 hover:text-primary-600 transition-colors"
                  >
                    {item.title}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    Talla: {item.variant.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    Cantidad: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    €{itemTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dirección de envío */}
        {order.shipping_address && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Dirección de envío
            </h3>
            <div className="text-sm text-gray-600">
              <p>
                {order.shipping_address.first_name || ""}{" "}
                {order.shipping_address.last_name || ""}
              </p>
              {order.shipping_address.address_1 && (
                <p>{order.shipping_address.address_1}</p>
              )}
              {order.shipping_address.address_2 && (
                <p>{order.shipping_address.address_2}</p>
              )}
              <p>
                {order.shipping_address.postal_code || ""}{" "}
                {order.shipping_address.city || ""}
              </p>
              {order.shipping_address.province && (
                <p>{order.shipping_address.province}</p>
              )}
              {order.shipping_address.country_code && (
                <p>{order.shipping_address.country_code.toUpperCase()}</p>
              )}
              {order.shipping_address.phone && (
                <p className="mt-2">Tel: {order.shipping_address.phone}</p>
              )}
            </div>
          </div>
        )}

        {/* Totales */}
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>€{subtotal.toFixed(2)}</span>
          </div>
          {shippingTotal > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Envío</span>
              <span>€{shippingTotal.toFixed(2)}</span>
            </div>
          )}
          {taxTotal > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Impuestos</span>
              <span>€{taxTotal.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>€{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Estado del pedido */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Estado del Pedido
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Pago</p>
            <p className="text-sm font-medium text-gray-900 capitalize">
              {order.payment_status}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Envío</p>
            <p className="text-sm font-medium text-gray-900 capitalize">
              {order.fulfillment_status}
            </p>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/catalogo"
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-center font-medium"
        >
          Seguir Comprando
        </Link>
        <Link
          href="/"
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Loader size="lg" text="Cargando..." />
        </div>
      }
    >
      <ConfirmacionContent />
    </Suspense>
  );
}

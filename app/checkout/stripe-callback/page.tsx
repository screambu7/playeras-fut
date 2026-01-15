"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getCart } from "@/lib/cart-medusa";
import { completeCheckout } from "@/lib/checkout";
import { useToast } from "@/contexts/ToastContext";
import Loader from "@/components/ui/Loader";
import Link from "next/link";

function StripeCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { error: showError, success: showSuccess } = useToast();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Verificar si el usuario canceló el pago
    const canceled = searchParams.get("canceled");
    if (canceled === "true") {
      showError("El pago fue cancelado. Puedes intentar nuevamente.");
      setStatus("error");
      return;
    }

    // Intentar obtener cart_id de los query params primero
    let cartId = searchParams.get("cart_id");
    
    // Si no está en query params, intentar obtenerlo de sessionStorage
    if (!cartId && typeof window !== "undefined") {
      cartId = sessionStorage.getItem("stripe_cart_id");
    }

    if (!cartId) {
      showError("No se pudo identificar el carrito. Por favor, intenta nuevamente.");
      setStatus("error");
      return;
    }

    // Completar el checkout después del redirect de Stripe
    completeCheckoutAfterStripe(cartId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const completeCheckoutAfterStripe = async (cartId: string) => {
    try {
      // Pequeño delay para asegurar que Stripe procesó el webhook
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Intentar completar el checkout
      const checkoutResult = await completeCheckout(cartId);

      // Si requiere otro redirect (no debería pasar, pero por si acaso)
      if (checkoutResult.requiresPayment && checkoutResult.redirectUrl) {
        window.location.href = checkoutResult.redirectUrl;
        return;
      }

      // Si hay error
      if (checkoutResult.error) {
        const errorMessage = checkoutResult.error.message || "Error al procesar el pago";
        showError(errorMessage);
        setStatus("error");
        return;
      }

      // Si no hay orden, es un error
      if (!checkoutResult.order) {
        showError("No se pudo crear la orden después del pago. Por favor, contacta con soporte.");
        setStatus("error");
        return;
      }

      // Éxito - limpiar carrito y redirigir
      if (typeof window !== "undefined") {
        localStorage.removeItem("medusa_cart_id");
        sessionStorage.removeItem("stripe_cart_id");
      }

      window.dispatchEvent(new CustomEvent("cart-updated"));
      setOrderId(checkoutResult.order.id);
      setStatus("success");
      showSuccess("¡Pago completado con éxito!");

      // Redirigir a confirmación después de un breve delay
      setTimeout(() => {
        router.push(`/checkout/confirmacion?order_id=${checkoutResult.order!.id}`);
      }, 1500);
    } catch (error: any) {
      console.error("Error completing checkout after Stripe:", error);
      showError("Error al procesar el pago. Por favor, intenta nuevamente.");
      setStatus("error");
    }
  };

  if (status === "processing") {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Loader size="lg" text="Procesando pago..." />
          <p className="mt-4 text-gray-600">
            Por favor, espera mientras confirmamos tu pago.
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
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
            Error al procesar el pago
          </h1>
          <p className="text-gray-600 mb-8">
            Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/checkout"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Volver al Checkout
            </Link>
            <Link
              href="/carrito"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Ver Carrito
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success - esto no debería mostrarse porque redirige, pero por si acaso
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Pago completado!
        </h1>
        <p className="text-gray-600 mb-8">
          Redirigiendo a la confirmación de tu pedido...
        </p>
        {orderId && (
          <Link
            href={`/checkout/confirmacion?order_id=${orderId}`}
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Ver Confirmación
          </Link>
        )}
      </div>
    </div>
  );
}

export default function StripeCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Loader size="lg" text="Cargando..." />
        </div>
      }
    >
      <StripeCallbackContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { checkCartOrderStatus, completeCheckout } from "@/lib/checkout";
import { useToast } from "@/contexts/ToastContext";
import Loader from "@/components/ui/Loader";
import Link from "next/link";

function StripeCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { error: showError, success: showSuccess } = useToast();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    processStripeCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const processStripeCallback = async () => {
    // 1. Verificar si el usuario canceló el pago
    const canceled = searchParams.get("canceled");
    if (canceled === "true") {
      showError("El pago fue cancelado. Puedes intentar nuevamente.");
      setStatus("error");
      setErrorMessage("El pago fue cancelado por el usuario.");
      return;
    }

    // 2. Verificar si hay un error de Stripe en los query params
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    if (error) {
      const message = errorDescription || "Error al procesar el pago con Stripe";
      showError(message);
      setStatus("error");
      setErrorMessage(message);
      return;
    }

    // 3. Obtener cart_id
    let cartId = searchParams.get("cart_id");
    
    // Si no está en query params, intentar obtenerlo de sessionStorage
    if (!cartId && typeof window !== "undefined") {
      cartId = sessionStorage.getItem("stripe_cart_id");
    }

    if (!cartId) {
      const message = "No se pudo identificar el carrito. Por favor, intenta nuevamente.";
      showError(message);
      setStatus("error");
      setErrorMessage(message);
      return;
    }

    // 4. Procesar el callback de Stripe
    await handleStripeCallback(cartId);
  };

  const handleStripeCallback = async (cartId: string) => {
    try {
      // PRIMERO: Verificar si el webhook de Stripe ya creó la orden
      // Esto es lo más común: Stripe procesa el pago → webhook → Medusa crea la orden
      const orderStatusResult = await checkCartOrderStatus(cartId, 5, 2000);
      
      if (orderStatusResult.order) {
        // ¡La orden ya existe! El webhook funcionó correctamente
        handleOrderSuccess(orderStatusResult.order.id, cartId);
        return;
      }

      // Si no encontramos la orden después del polling, puede ser que:
      // 1. El webhook aún no se procesó (raro pero posible)
      // 2. El pago falló
      // 3. El cart ya no existe (fue consumido)

      // Intentar completar el checkout como fallback
      // Esto puede funcionar si Medusa aún no procesó el webhook
      const checkoutResult = await completeCheckout(cartId);

      // Si requiere otro redirect (no debería pasar después de Stripe)
      if (checkoutResult.requiresPayment && checkoutResult.redirectUrl) {
        window.location.href = checkoutResult.redirectUrl;
        return;
      }

      // Si hay una orden en el resultado del checkout
      if (checkoutResult.order) {
        handleOrderSuccess(checkoutResult.order.id, cartId);
        return;
      }

      // Si hay un error específico
      if (checkoutResult.error) {
        const message = checkoutResult.error.message || "Error al procesar el pago";
        
        // Si el error indica que el cart ya fue completado, buscar la orden nuevamente
        if (message.includes("already") || message.includes("completed")) {
          const retryResult = await checkCartOrderStatus(cartId, 3, 1000);
          if (retryResult.order) {
            handleOrderSuccess(retryResult.order.id, cartId);
            return;
          }
        }
        
        showError(message);
        setStatus("error");
        setErrorMessage(message);
        return;
      }

      // Si llegamos aquí, no hay orden y no hay error claro
      // Puede ser que el webhook aún esté procesando o el pago falló
      const message = "No se pudo confirmar la orden. El pago puede estar aún procesándose. Por favor, verifica tu email o contacta con soporte.";
      showError(message);
      setStatus("error");
      setErrorMessage(message);
      
    } catch (error: any) {
      console.error("[Stripe Callback] Error:", error);
      const message = error.message || "Error al procesar el pago. Por favor, intenta nuevamente.";
      showError(message);
      setStatus("error");
      setErrorMessage(message);
    }
  };

  const handleOrderSuccess = (orderId: string, cartId: string) => {
    // Limpiar carrito y datos temporales
    if (typeof window !== "undefined") {
      localStorage.removeItem("medusa_cart_id");
      sessionStorage.removeItem("stripe_cart_id");
    }

    // Disparar evento de actualización del carrito
    window.dispatchEvent(new CustomEvent("cart-updated"));
    
    setOrderId(orderId);
    setStatus("success");
    showSuccess("¡Pago completado con éxito!");

    // Redirigir a confirmación después de un breve delay
    setTimeout(() => {
      router.push(`/checkout/confirmacion?order_id=${orderId}`);
    }, 1500);
  };

  if (status === "processing") {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Loader size="lg" text="Procesando pago..." />
          <p className="mt-4 text-gray-600">
            Por favor, espera mientras confirmamos tu pago con Stripe.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Esto puede tomar unos segundos mientras verificamos el estado del pago.
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
            {errorMessage || "Hubo un problema al procesar tu pago. Por favor, intenta nuevamente."}
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

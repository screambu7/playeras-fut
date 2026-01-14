"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getCart } from "@/lib/cart-medusa";
import {
  setShippingAddress,
  getShippingOptions,
  setShippingOption,
  setPaymentSession,
  completeCheckout,
} from "@/lib/checkout";
import { checkoutSchema, CheckoutFormData } from "@/lib/checkout-schema";
import { MedusaCart } from "@/types/medusa";
import { ShippingOption } from "@/types/checkout";
import AddressForm from "@/components/checkout/AddressForm";
import ShippingSelector from "@/components/checkout/ShippingSelector";
import OrderSummary from "@/components/checkout/OrderSummary";
import { useToast } from "@/contexts/ToastContext";
import Loader from "@/components/ui/Loader";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { error: showError, success: showSuccess } = useToast();
  const [cart, setCart] = useState<MedusaCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country_code: "es",
    },
  });

  const watchedShippingOption = watch("shipping_option_id");

  // Cargar carrito al montar
  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar opciones de envío cuando cambia la dirección
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (
        name &&
        [
          "address_1",
          "city",
          "postal_code",
          "country_code",
        ].includes(name) &&
        value.address_1 &&
        value.city &&
        value.postal_code &&
        value.country_code
      ) {
        loadShippingOptions();
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  // Sincronizar selectedShippingId con el formulario
  useEffect(() => {
    if (watchedShippingOption) {
      setSelectedShippingId(watchedShippingOption);
    }
  }, [watchedShippingOption]);

  const loadCart = async () => {
    setLoading(true);
    try {
      const cartData = await getCart();
      if (!cartData) {
        showError("No se pudo cargar el carrito. El servidor puede no estar disponible.");
        router.push("/carrito");
        return;
      }

      if (!cartData.items || cartData.items.length === 0) {
        showError("Tu carrito está vacío");
        router.push("/carrito");
        return;
      }

      setCart(cartData);
    } catch (error) {
      showError("Error al cargar el carrito. Por favor, intenta nuevamente.");
      router.push("/carrito");
    } finally {
      setLoading(false);
    }
  };

  const loadShippingOptions = async () => {
    if (!cart) return;

    setLoadingShipping(true);
    try {
      // Primero actualizar la dirección en el carrito
      const address = {
        first_name: watch("first_name") || "",
        last_name: watch("last_name") || "",
        address_1: watch("address_1") || "",
        address_2: watch("address_2"),
        city: watch("city") || "",
        country_code: watch("country_code") || "es",
        postal_code: watch("postal_code") || "",
        province: watch("province"),
        phone: watch("phone"),
      };

      const addressResult = await setShippingAddress(cart.id, address, watch("email"));
      if (!addressResult.success) {
        showError(addressResult.error?.message || "Error al guardar la dirección");
        return;
      }

      // Luego obtener opciones de envío
      const optionsResult = await getShippingOptions(cart.id);
      if (optionsResult.error) {
        showError(optionsResult.error.message);
        setShippingOptions([]);
        return;
      }

      setShippingOptions(optionsResult.options);

      // Si solo hay una opción, seleccionarla automáticamente
      if (optionsResult.options.length === 1) {
        setValue("shipping_option_id", optionsResult.options[0].id);
        await setShippingOption(cart.id, optionsResult.options[0].id);
      }
    } catch (error) {
      showError("Error al cargar opciones de envío");
    } finally {
      setLoadingShipping(false);
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (!cart || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 1. Actualizar dirección y email
      const addressResult = await setShippingAddress(
        cart.id,
        {
          first_name: data.first_name,
          last_name: data.last_name,
          address_1: data.address_1,
          address_2: data.address_2,
          city: data.city,
          country_code: data.country_code,
          postal_code: data.postal_code,
          province: data.province,
          phone: data.phone,
        },
        data.email
      );

      if (!addressResult.success) {
        showError(addressResult.error?.message || "Error al guardar la dirección");
        setIsSubmitting(false);
        return;
      }

      // 2. Establecer opción de envío
      const shippingResult = await setShippingOption(cart.id, data.shipping_option_id);
      if (!shippingResult.success) {
        showError(shippingResult.error?.message || "Error al seleccionar el método de envío");
        setIsSubmitting(false);
        return;
      }

      // 3. Establecer sesión de pago
      const paymentResult = await setPaymentSession(cart.id, "manual");
      if (!paymentResult.success) {
        showError(paymentResult.error?.message || "Error al configurar el pago");
        setIsSubmitting(false);
        return;
      }

      // 4. Completar checkout
      const checkoutResult = await completeCheckout(cart.id);
      if (!checkoutResult.order) {
        showError(checkoutResult.error?.message || "Error al completar el pedido");
        setIsSubmitting(false);
        return;
      }

      // 5. Limpiar carrito del localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("medusa_cart_id");
      }

      // 6. Disparar evento de actualización
      window.dispatchEvent(new CustomEvent("cart-updated"));

      // 7. Redirigir a confirmación
      showSuccess("¡Pedido completado con éxito!");
      router.push(`/checkout/confirmacion?order_id=${checkoutResult.order.id}`);
    } catch (error: any) {
      showError("Error al procesar el pedido. Por favor, intenta nuevamente.");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Loader size="lg" text="Cargando checkout..." />
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Carrito no encontrado
          </h1>
          <Link
            href="/carrito"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Volver al carrito
          </Link>
        </div>
      </div>
    );
  }

  const selectedShipping = shippingOptions.find(
    (opt) => opt.id === selectedShippingId
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario principal */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <AddressForm register={register} errors={errors} />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <ShippingSelector
                options={shippingOptions}
                register={register}
                errors={errors}
                selectedOptionId={selectedShippingId || undefined}
                isLoading={loadingShipping}
              />
            </div>
          </div>

          {/* Resumen sticky */}
          <div className="lg:col-span-1">
            <OrderSummary cart={cart} selectedShipping={selectedShipping || undefined} />
          </div>
        </div>

        {/* Botón de pago */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !selectedShippingId || !cart}
            className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              isSubmitting || !selectedShippingId || !cart
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary-600 hover:bg-primary-700"
            }`}
            aria-label={isSubmitting ? "Procesando pedido..." : "Completar pedido"}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader size="sm" />
                Procesando...
              </span>
            ) : (
              "Completar Pedido"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

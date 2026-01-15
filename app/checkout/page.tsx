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
  getDefaultRegion,
  setCartRegion,
  initPaymentSessions,
  getCartPaymentSessions,
  setPaymentSession,
  completeCheckout,
} from "@/lib/checkout";
import { checkoutSchema, CheckoutFormData } from "@/lib/checkout-schema";
import { MedusaCart } from "@/types/medusa";
import { ShippingOption, PaymentSession } from "@/types/checkout";
import AddressForm from "@/components/checkout/AddressForm";
import ShippingSelector from "@/components/checkout/ShippingSelector";
import PaymentMethodSelector from "@/components/checkout/PaymentMethodSelector";
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
  const [paymentSessions, setPaymentSessions] = useState<PaymentSession[]>([]);
  const [loadingPaymentSessions, setLoadingPaymentSessions] = useState(false);
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<string | null>(null);

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
  const watchedPaymentProvider = watch("payment_provider_id");

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

  // Sincronizar selectedShippingId con el formulario y actualizar cart
  useEffect(() => {
    if (watchedShippingOption && watchedShippingOption !== selectedShippingId) {
      setSelectedShippingId(watchedShippingOption);
      
      // Actualizar shipping option en el cart
      if (cart) {
        setShippingOption(cart.id, watchedShippingOption).then((result) => {
          if (result.success) {
            // Recargar el carrito para obtener totales actualizados
            getCart().then((updatedCart) => {
              if (updatedCart) {
                setCart(updatedCart);
                // Cargar payment sessions después de actualizar shipping
                loadPaymentSessions(updatedCart.id);
              }
            });
          }
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedShippingOption, cart]);

  // Sincronizar selectedPaymentProvider con el formulario
  useEffect(() => {
    if (watchedPaymentProvider && watchedPaymentProvider !== selectedPaymentProvider) {
      setSelectedPaymentProvider(watchedPaymentProvider);
      
      // Actualizar payment session en el cart
      if (cart) {
        setPaymentSession(cart.id, watchedPaymentProvider).then((result) => {
          if (result.success) {
            // Recargar el carrito para obtener datos actualizados
            getCart().then((updatedCart) => {
              if (updatedCart) {
                setCart(updatedCart);
              }
            });
          }
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedPaymentProvider, cart]);

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

      // Asociar región al carrito si no tiene una
      if (!cartData.region) {
        const regionResult = await getDefaultRegion();
        if (regionResult.regionId) {
          const regionUpdateResult = await setCartRegion(cartData.id, regionResult.regionId);
          if (regionUpdateResult.success) {
            // Recargar el carrito para obtener los datos actualizados
            const updatedCart = await getCart();
            if (updatedCart) {
              setCart(updatedCart);
            } else {
              setCart(cartData);
            }
          } else {
            setCart(cartData);
          }
        } else {
          setCart(cartData);
        }
      } else {
        setCart(cartData);
      }
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

      // Recargar el carrito para obtener datos actualizados
      const updatedCart = await getCart();
      if (updatedCart) {
        setCart(updatedCart);
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
        const shippingResult = await setShippingOption(cart.id, optionsResult.options[0].id);
        if (shippingResult.success) {
          // Recargar el carrito para obtener totales actualizados
          const refreshedCart = await getCart();
          if (refreshedCart) {
            setCart(refreshedCart);
            // Cargar payment sessions después de seleccionar shipping
            loadPaymentSessions(refreshedCart.id);
          }
        }
      } else {
        // Si hay múltiples opciones, cargar payment sessions cuando se seleccione una
        // Esto se maneja en el useEffect de watchedShippingOption
      }
    } catch (error) {
      showError("Error al cargar opciones de envío");
    } finally {
      setLoadingShipping(false);
    }
  };

  const loadPaymentSessions = async (cartId: string) => {
    setLoadingPaymentSessions(true);
    try {
      // Primero inicializar payment sessions si no están inicializadas
      const initResult = await initPaymentSessions(cartId);
      if (initResult.error) {
        showError(initResult.error.message || "Error al inicializar métodos de pago");
        return;
      }

      // Luego obtener las payment sessions del cart
      const sessionsResult = await getCartPaymentSessions(cartId);
      if (sessionsResult.error) {
        showError(sessionsResult.error.message || "Error al cargar métodos de pago");
        return;
      }

      setPaymentSessions(sessionsResult.payment_sessions);

      // Si solo hay una opción, seleccionarla automáticamente
      if (sessionsResult.payment_sessions.length === 1) {
        setValue("payment_provider_id", sessionsResult.payment_sessions[0].provider_id);
        setSelectedPaymentProvider(sessionsResult.payment_sessions[0].provider_id);
        await setPaymentSession(cartId, sessionsResult.payment_sessions[0].provider_id);
      }
    } catch (error) {
      showError("Error al cargar métodos de pago");
    } finally {
      setLoadingPaymentSessions(false);
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

      // Recargar carrito después de actualizar dirección
      const cartAfterAddress = await getCart();
      if (cartAfterAddress) {
        setCart(cartAfterAddress);
      }

      // 2. Establecer opción de envío
      const shippingResult = await setShippingOption(cartAfterAddress?.id || cart.id, data.shipping_option_id);
      if (!shippingResult.success) {
        showError(shippingResult.error?.message || "Error al seleccionar el método de envío");
        setIsSubmitting(false);
        return;
      }

      // Recargar carrito después de actualizar shipping
      const cartAfterShipping = await getCart();
      if (!cartAfterShipping) {
        showError("No se pudo actualizar el carrito después de seleccionar el envío");
        setIsSubmitting(false);
        return;
      }
      setCart(cartAfterShipping);

      // 3. Asegurar que payment sessions están inicializadas
      if (paymentSessions.length === 0) {
        const initResult = await initPaymentSessions(cartAfterShipping.id);
        if (initResult.error) {
          showError(initResult.error.message || "Error al inicializar métodos de pago");
          setIsSubmitting(false);
          return;
        }
        
        // Obtener payment sessions del cart
        const sessionsResult = await getCartPaymentSessions(cartAfterShipping.id);
        if (sessionsResult.error) {
          showError(sessionsResult.error.message || "Error al cargar métodos de pago");
          setIsSubmitting(false);
          return;
        }
        
        if (sessionsResult.payment_sessions.length === 0) {
          showError("No hay métodos de pago disponibles. Por favor, verifica tu configuración.");
          setIsSubmitting(false);
          return;
        }
        
        setPaymentSessions(sessionsResult.payment_sessions);
        
        // Si no hay provider seleccionado, seleccionar el primero
        if (!selectedPaymentProvider && sessionsResult.payment_sessions.length > 0) {
          const firstProvider = sessionsResult.payment_sessions[0].provider_id;
          setValue("payment_provider_id", firstProvider);
          setSelectedPaymentProvider(firstProvider);
        }
      }

      // 4. Establecer sesión de pago seleccionada
      const selectedProvider = data.payment_provider_id || selectedPaymentProvider;
      if (!selectedProvider) {
        showError("Debes seleccionar un método de pago");
        setIsSubmitting(false);
        return;
      }

      // Validar que el provider seleccionado existe en las payment sessions
      const providerExists = paymentSessions.some(
        (ps) => ps.provider_id === selectedProvider
      );
      if (!providerExists) {
        showError("El método de pago seleccionado no está disponible");
        setIsSubmitting(false);
        return;
      }

      const paymentResult = await setPaymentSession(cartAfterShipping.id, selectedProvider);
      if (!paymentResult.success) {
        showError(paymentResult.error?.message || "Error al configurar el pago");
        setIsSubmitting(false);
        return;
      }

      // Recargar carrito después de actualizar payment
      const cartAfterPayment = await getCart();
      if (!cartAfterPayment) {
        showError("No se pudo actualizar el carrito después de configurar el pago");
        setIsSubmitting(false);
        return;
      }
      setCart(cartAfterPayment);

      // 5. Completar checkout (puede requerir redirect para Stripe)
      const checkoutResult = await completeCheckout(cartAfterPayment.id);
      
      // Si requiere redirect (Stripe)
      if (checkoutResult.requiresPayment && checkoutResult.redirectUrl) {
        // Guardar cart_id en sessionStorage para el callback
        if (typeof window !== "undefined") {
          sessionStorage.setItem("stripe_cart_id", cartAfterPayment.id);
        }
        
        // Redirigir a Stripe
        window.location.href = checkoutResult.redirectUrl;
        return; // No hacer setIsSubmitting(false) porque estamos redirigiendo
      }
      
      // Si hay error
      if (checkoutResult.error) {
        showError(checkoutResult.error.message || "Error al completar el pedido");
        setIsSubmitting(false);
        return;
      }
      
      // Si no hay orden, es un error
      if (!checkoutResult.order) {
        showError("Error al completar el pedido. Por favor, intenta nuevamente.");
        setIsSubmitting(false);
        return;
      }

      // 6. Limpiar carrito del localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("medusa_cart_id");
      }

      // 7. Disparar evento de actualización
      window.dispatchEvent(new CustomEvent("cart-updated"));

      // 8. Redirigir a confirmación
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

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <PaymentMethodSelector
                paymentSessions={paymentSessions}
                register={register}
                errors={errors}
                selectedProviderId={selectedPaymentProvider || undefined}
                isLoading={loadingPaymentSessions}
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
            disabled={
              isSubmitting || 
              !selectedShippingId || 
              !selectedPaymentProvider || 
              !cart ||
              paymentSessions.length === 0
            }
            className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              isSubmitting || 
              !selectedShippingId || 
              !selectedPaymentProvider || 
              !cart ||
              paymentSessions.length === 0
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

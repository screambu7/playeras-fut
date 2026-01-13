"use client";

import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/products";
import { useState, useEffect } from "react";
import { MedusaProductAdapted, MedusaProductVariant } from "@/types";
import { addToCart } from "@/lib/cart-medusa";
import Link from "next/link";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const [handle, setHandle] = useState<string>("");
  const [product, setProduct] = useState<MedusaProductAdapted | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<MedusaProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params;
      setHandle(resolvedParams.slug);
    }
    getParams();
  }, [params]);

  useEffect(() => {
    async function fetchProduct() {
      if (!handle) return;
      
      setLoading(true);
      const fetchedProduct = await getProductByHandle(handle);
      
      if (!fetchedProduct) {
        setLoading(false);
        return;
      }
      
      setProduct(fetchedProduct);
      
      // Seleccionar la primera variante por defecto
      if (fetchedProduct.variants.length > 0) {
        setSelectedVariant(fetchedProduct.variants[0]);
      }
      
      setLoading(false);
    }
    
    fetchProduct();
  }, [handle]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-200 rounded-lg aspect-square"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      alert("Por favor selecciona una talla");
      return;
    }
    
    setAddingToCart(true);
    
    try {
      const cart = await addToCart(selectedVariant.id, quantity);
      
      if (cart) {
        alert("Producto agregado al carrito");
        // Opcional: redirigir al carrito
        // window.location.href = "/carrito";
      } else {
        alert("Error al agregar el producto al carrito");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Error al agregar el producto al carrito");
    } finally {
      setAddingToCart(false);
    }
  };

  const getPrice = (variant: MedusaProductVariant | null): number => {
    if (!variant || !variant.prices || variant.prices.length === 0) {
      return product.price;
    }
    return variant.prices[0].amount / 100; // Convertir de centavos a euros
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="mb-6 text-sm text-gray-600">
        <Link href="/catalogo" className="hover:text-primary-600">
          Catálogo
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
            {product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-9xl">⚽</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((image, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-100 rounded overflow-hidden cursor-pointer hover:ring-2 ring-primary-500"
                >
                  <img
                    src={image}
                    alt={`${product.title} ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            {product.metadata.bestSeller && (
              <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded mb-2">
                Más Vendida
              </span>
            )}
            {product.originalPrice && (
              <span className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded ml-2 mb-2">
                -{Math.round(((product.originalPrice - getPrice(selectedVariant)) / product.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {product.title}
          </h1>
          <p className="text-xl text-gray-600 mb-4">{product.metadata.team || ""}</p>

          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              {product.originalPrice && (
                <span className="text-2xl text-gray-400 line-through">
                  €{product.originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-4xl font-bold text-gray-900">
                €{getPrice(selectedVariant).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {product.metadata.league && (
                <span className="bg-gray-100 px-3 py-1 rounded">
                  {product.metadata.league}
                </span>
              )}
              {product.metadata.season && (
                <span>Temporada {product.metadata.season}</span>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Talla
            </label>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`px-6 py-3 border-2 rounded-lg font-medium transition-colors ${
                    selectedVariant?.id === variant.id
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-gray-300 hover:border-gray-400 text-gray-700"
                  }`}
                >
                  {variant.title}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad
            </label>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
              >
                -
              </button>
              <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={addingToCart || !selectedVariant}
            className="w-full bg-primary-600 text-white font-semibold py-4 rounded-lg hover:bg-primary-700 transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingToCart ? "Agregando..." : "Agregar al Carrito"}
          </button>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

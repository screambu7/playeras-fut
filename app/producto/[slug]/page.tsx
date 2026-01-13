"use client";

import { notFound } from "next/navigation";
import { getProductByHandle, addToCart } from "@/lib/medusa";
import { adaptMedusaProduct } from "@/types/medusa";
import { useState, useEffect } from "react";
import { Talla, Product } from "@/types";
import Link from "next/link";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const [slug, setSlug] = useState<string>("");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<Talla | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
    }
    getParams();
  }, [params]);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;

      try {
        setLoading(true);
        const medusaProduct = await getProductByHandle(slug);
        if (!medusaProduct) {
          notFound();
          return;
        }
        const adaptedProduct = adaptMedusaProduct(medusaProduct);
        setProduct(adaptedProduct);
      } catch (error) {
        console.error("Error loading product:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  useEffect(() => {
    if (product && selectedSize) {
      const variant = product.variants.find((v) => v.size === selectedSize);
      if (variant) {
        setSelectedVariantId(variant.id);
      }
    }
  }, [product, selectedSize]);

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
    if (!selectedSize || !selectedVariantId) {
      alert("Por favor selecciona una talla");
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(selectedVariantId, quantity);
      alert("Producto agregado al carrito");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Error al agregar el producto al carrito");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="mb-6 text-sm text-gray-600">
        <Link href="/catalogo" className="hover:text-primary-600">
          Catálogo
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
            {product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
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
                    alt={`${product.name} ${index + 2}`}
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
            {product.bestSeller && (
              <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded mb-2">
                Más Vendida
              </span>
            )}
            {product.originalPrice && (
              <span className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded ml-2 mb-2">
                -
                {Math.round(
                  ((product.originalPrice - product.price) /
                    product.originalPrice) *
                    100
                )}
                % OFF
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>
          <p className="text-xl text-gray-600 mb-4">{product.team}</p>

          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              {product.originalPrice && (
                <span className="text-2xl text-gray-400 line-through">
                  €{product.originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-4xl font-bold text-gray-900">
                €{product.price.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="bg-gray-100 px-3 py-1 rounded">
                {product.league}
              </span>
              <span>Temporada {product.season}</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Talla
            </label>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => {
                const variant = product.variants.find((v) => v.size === size);
                const inStock = variant?.inventory_quantity
                  ? variant.inventory_quantity > 0
                  : true;

                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={!inStock}
                    className={`px-6 py-3 border-2 rounded-lg font-medium transition-colors ${
                      selectedSize === size
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : inStock
                        ? "border-gray-300 hover:border-gray-400 text-gray-700"
                        : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {size}
                    {!inStock && " (Agotado)"}
                  </button>
                );
              })}
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
              <span className="text-lg font-semibold w-12 text-center">
                {quantity}
              </span>
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
            disabled={addingToCart || !selectedSize}
            className="w-full bg-primary-600 text-white font-semibold py-4 rounded-lg hover:bg-primary-700 transition-colors mb-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {addingToCart ? "Agregando..." : "Agregar al Carrito"}
          </button>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Descripción
            </h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

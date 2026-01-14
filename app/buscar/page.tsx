"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { searchProducts } from "@/lib/search";
import { SearchResult } from "@/lib/search";
import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";
import { MedusaProductAdapted } from "@/types";

function BuscarContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    async function performSearch() {
      if (!query || query.trim().length < 2) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);
      try {
        const searchResults = await searchProducts(query.trim(), 50);
        setResults(searchResults);
      } catch (error) {
        // Error searching products - handled by empty state
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }

    performSearch();
  }, [query]);

  const products = useMemo(
    () => results.map((r) => r.product),
    [results]
  );

  if (!query || query.trim().length < 2) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Buscar Productos
          </h1>
          <p className="text-gray-600 mb-8">
            Ingresa al menos 2 caracteres para buscar
          </p>
          <Link
            href="/catalogo"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Ver todo el catálogo
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Buscando productos...</p>
        </div>
      </div>
    );
  }

  if (hasSearched && results.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            No se encontraron resultados
          </h1>
          <p className="text-gray-600 mb-2">
            No hay productos que coincidan con &quot;{query}&quot;
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Intenta con otros términos de búsqueda o explora nuestro catálogo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Ver todo el catálogo
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Resultados de búsqueda
        </h1>
        <div className="flex items-center gap-2 text-gray-600">
          <span>
            {results.length} resultado{results.length !== 1 ? "s" : ""} para
          </span>
          <span className="font-semibold text-gray-900">&quot;{query}&quot;</span>
        </div>
      </div>

      {/* Resultados */}
      {products.length > 0 && <ProductGrid products={products} />}

      {/* CTA al final */}
      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">¿No encuentras lo que buscas?</p>
        <Link
          href="/catalogo"
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Ver todo el catálogo
        </Link>
      </div>
    </div>
  );
}

export default function BuscarPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <BuscarContent />
    </Suspense>
  );
}

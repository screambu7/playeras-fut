"use client";

import { useState, useEffect, Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getCollectionByHandleHelper,
  getProductsByCollectionHandle,
} from "@/lib/collections";
import { MedusaStoreCollection } from "@/lib/medusa-store";
import { MedusaProductAdapted } from "@/types";
import ProductGrid from "@/components/ProductGrid";
import Loader from "@/components/ui/Loader";

interface EquipoPageProps {
  params: Promise<{ handle: string }>;
}

function EquipoContent({ params }: EquipoPageProps) {
  const [handle, setHandle] = useState<string>("");
  const [collection, setCollection] = useState<MedusaStoreCollection | null>(
    null
  );
  const [products, setProducts] = useState<MedusaProductAdapted[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params;
      setHandle(resolvedParams.handle);
    }
    getParams();
  }, [params]);

  useEffect(() => {
    async function fetchCollectionAndProducts() {
      if (!handle) return;

      setLoading(true);
      try {
        const [fetchedCollection, fetchedProducts] = await Promise.all([
          getCollectionByHandleHelper(handle),
          getProductsByCollectionHandle(handle),
        ]);

        if (!fetchedCollection) {
          setLoading(false);
          return;
        }

        setCollection(fetchedCollection);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("[Equipo] Error loading collection:", error);
        setCollection(null);
      } finally {
        setLoading(false);
      }
    }

    fetchCollectionAndProducts();
  }, [handle]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg aspect-square"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="mb-6 text-sm text-gray-600">
        <Link href="/catalogo" className="hover:text-primary-600 transition-colors">
          Catálogo
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{collection.title}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {collection.title}
        </h1>
        <p className="text-gray-600">
          {products.length} producto{products.length !== 1 ? "s" : ""} disponible
          {products.length !== 1 ? "s" : ""}
        </p>
      </div>

      <ProductGrid products={products} />
    </div>
  );
}

export default function EquipoPage(props: EquipoPageProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Loader />
        </div>
      }
    >
      <EquipoContent {...props} />
    </Suspense>
  );
}

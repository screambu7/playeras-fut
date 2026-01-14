/**
 * Componente para mostrar un resultado individual de búsqueda
 */

"use client";

import Link from "next/link";
import { MedusaProductAdapted } from "@/types";

interface SearchResultItemProps {
  product: MedusaProductAdapted;
  query?: string;
  onClick?: () => void;
}

export default function SearchResultItem({
  product,
  query,
  onClick,
}: SearchResultItemProps) {
  const imageUrl = product.images[0] || "";
  const highlightText = (text: string) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark key={index} className="bg-primary-100 text-primary-900 font-medium">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <Link
      href={`/producto/${product.handle}`}
      onClick={onClick}
      className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors group"
    >
      {/* Imagen */}
      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-2xl">⚽</span>
          </div>
        )}
      </div>

      {/* Información */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
          {highlightText(product.title)}
        </h3>
        {product.metadata.team && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
            {product.metadata.team}
            {product.metadata.league && ` • ${product.metadata.league}`}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              €{product.originalPrice.toFixed(2)}
            </span>
          )}
          <span className="text-sm font-semibold text-gray-900">
            €{product.price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Icono de flecha */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
}

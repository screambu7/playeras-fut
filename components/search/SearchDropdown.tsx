/**
 * Dropdown de resultados de búsqueda
 * Se muestra debajo del input de búsqueda
 */

"use client";

import { useEffect, useRef } from "react";
import { SearchResult } from "@/lib/search";
import SearchResultItem from "./SearchResultItem";

interface SearchDropdownProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
  isOpen: boolean;
  onClose: () => void;
  onViewAll?: () => void;
}

export default function SearchDropdown({
  results,
  isLoading,
  query,
  isOpen,
  onClose,
  onViewAll,
}: SearchDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-[60] max-h-96 overflow-hidden flex flex-col"
    >
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-sm text-gray-500">Buscando...</p>
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="overflow-y-auto flex-1">
            {results.map((result) => (
              <SearchResultItem
                key={result.product.id}
                product={result.product}
                query={query}
                onClick={onClose}
              />
            ))}
          </div>
          {onViewAll && (
            <div className="border-t border-gray-200 p-3 bg-gray-50">
              <button
                onClick={onViewAll}
                className="w-full text-sm font-medium text-primary-600 hover:text-primary-700 text-center"
              >
                Ver todos los resultados ({results.length}+)
              </button>
            </div>
          )}
        </>
      ) : query.trim().length >= 2 ? (
        <div className="p-8 text-center">
          <p className="text-sm text-gray-500">
            No se encontraron productos para &quot;{query}&quot;
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Intenta con otros términos de búsqueda
          </p>
        </div>
      ) : null}
    </div>
  );
}

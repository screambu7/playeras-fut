/**
 * Input de búsqueda con dropdown de resultados
 * Integrado con useSearch hook
 */

"use client";

import { useRef, useEffect } from "react";
import { useSearch } from "@/hooks/useSearch";
import SearchDropdown from "./SearchDropdown";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export default function SearchInput({
  placeholder = "Buscar productos...",
  className = "",
  onFocus,
  onBlur,
}: SearchInputProps) {
  const {
    query,
    results,
    isLoading,
    isOpen,
    updateQuery,
    navigateToSearch,
    closeDropdown,
    openDropdown,
  } = useSearch();

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  // Manejar Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim().length >= 2) {
      navigateToSearch();
    } else if (e.key === "Escape") {
      closeDropdown();
      inputRef.current?.blur();
    }
  };

  // Manejar focus
  const handleFocus = () => {
    // Cancelar blur pendiente
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    if (query.trim().length >= 2 && results.length > 0) {
      openDropdown();
    }
    onFocus?.();
  };

  // Manejar blur (con delay para permitir clicks en dropdown)
  const handleBlur = () => {
    // Delay para permitir clicks en el dropdown
    blurTimeoutRef.current = setTimeout(() => {
      closeDropdown();
      onBlur?.();
    }, 200);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => updateQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          aria-label="Buscar productos"
        />

        {/* Icono de búsqueda */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Botón limpiar */}
        {query && (
          <button
            type="button"
            onClick={() => {
              updateQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      <SearchDropdown
        results={results}
        isLoading={isLoading}
        query={query}
        isOpen={isOpen}
        onClose={closeDropdown}
        onViewAll={() => navigateToSearch()}
      />
    </div>
  );
}

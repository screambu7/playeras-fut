/**
 * Hook personalizado para manejar búsqueda con debounce
 * Gestiona estado de búsqueda y resultados
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { searchProducts, SearchResult } from "@/lib/search";

interface UseSearchOptions {
  debounceMs?: number;
  minChars?: number;
  maxResults?: number;
}

export function useSearch(options: UseSearchOptions = {}) {
  const {
    debounceMs = 350,
    minChars = 2,
    maxResults = 8,
  } = options;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Función de búsqueda con debounce
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.trim().length < minChars) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await searchProducts(searchQuery, maxResults);
        setResults(searchResults);
      } catch (error) {
        console.error("Error searching products:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [minChars, maxResults]
  );

  // Actualizar query con debounce
  const updateQuery = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);

      // Limpiar timer anterior
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Si el query es muy corto, limpiar resultados inmediatamente
      if (newQuery.trim().length < minChars) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      // Mostrar dropdown si hay query válido
      if (newQuery.trim().length >= minChars) {
        setIsOpen(true);
      }

      // Programar búsqueda con debounce
      debounceTimerRef.current = setTimeout(() => {
        performSearch(newQuery);
      }, debounceMs);
    },
    [debounceMs, minChars, performSearch]
  );

  // Navegar a página de búsqueda
  const navigateToSearch = useCallback(
    (searchQuery?: string) => {
      const queryToUse = searchQuery || query;
      if (queryToUse.trim().length >= minChars) {
        router.push(`/buscar?q=${encodeURIComponent(queryToUse.trim())}`);
        setIsOpen(false);
        setQuery("");
      }
    },
    [query, minChars, router]
  );

  // Cerrar dropdown
  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Abrir dropdown
  const openDropdown = useCallback(() => {
    if (query.trim().length >= minChars && results.length > 0) {
      setIsOpen(true);
    }
  }, [query, results]);

  return {
    query,
    results,
    isLoading,
    isOpen,
    updateQuery,
    navigateToSearch,
    closeDropdown,
    openDropdown,
  };
}

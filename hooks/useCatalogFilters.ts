/**
 * Hook personalizado para manejar filtros del catálogo desde searchParams
 * La URL es la fuente de verdad
 */

"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import {
  parseFiltersFromSearchParams,
  buildSearchParamsFromFilters,
  FilterSearchParams,
} from "@/lib/filters";
import { Liga, Talla, Genero, Version, CatalogFilters } from "@/types";

/**
 * Hook para gestionar filtros del catálogo sincronizados con la URL
 */
export function useCatalogFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parsear filtros actuales desde URL
  const currentFilters = useMemo<CatalogFilters>(() => {
    const params: FilterSearchParams = {};
    
    // Convertir URLSearchParams a objeto
    // Next.js agrupa múltiples valores del mismo parámetro automáticamente
    searchParams.forEach((value, key) => {
      if (key === "liga" || key === "equipo" || key === "talla" || key === "genero" || key === "version") {
        // Parámetros que pueden ser arrays
        const paramKey = key as "liga" | "equipo" | "talla" | "genero" | "version";
        const existing = params[paramKey];
        if (existing) {
          // Si ya existe, convertir a array si no lo es
          if (Array.isArray(existing)) {
            params[paramKey] = [...existing, value];
          } else {
            params[paramKey] = [existing, value];
          }
        } else {
          params[paramKey] = value;
        }
      } else if (key === "precio_min" || key === "precio_max") {
        const paramKey = key as "precio_min" | "precio_max";
        params[paramKey] = value;
      }
    });

    return parseFiltersFromSearchParams(params);
  }, [searchParams]);

  /**
   * Actualiza la URL con nuevos filtros
   */
  const updateFilters = useCallback(
    (updater: (prev: CatalogFilters) => CatalogFilters) => {
      const newFilters = updater(currentFilters);
      const params = buildSearchParamsFromFilters(newFilters);

      // Construir nueva URL
      const newSearchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => newSearchParams.append(key, v));
        } else {
          newSearchParams.set(key, value);
        }
      });

      // Actualizar URL sin recargar página
      const queryString = newSearchParams.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      
      router.push(newUrl, { scroll: false });
    },
    [currentFilters, pathname, router]
  );

  /**
   * Toggle de liga (checkbox)
   */
  const toggleLeague = useCallback(
    (league: Liga) => {
      updateFilters((prev) => {
        const newFilters = { ...prev, leagues: new Set(prev.leagues) };
        if (newFilters.leagues.has(league)) {
          newFilters.leagues.delete(league);
        } else {
          newFilters.leagues.add(league);
        }
        return newFilters;
      });
    },
    [updateFilters]
  );

  /**
   * Toggle de equipo (checkbox)
   */
  const toggleTeam = useCallback(
    (team: string) => {
      updateFilters((prev) => {
        const newFilters = { ...prev, teams: new Set(prev.teams) };
        if (newFilters.teams.has(team)) {
          newFilters.teams.delete(team);
        } else {
          newFilters.teams.add(team);
        }
        return newFilters;
      });
    },
    [updateFilters]
  );

  /**
   * Toggle de talla (checkbox)
   */
  const toggleSize = useCallback(
    (size: Talla) => {
      updateFilters((prev) => {
        const newFilters = { ...prev, sizes: new Set(prev.sizes) };
        if (newFilters.sizes.has(size)) {
          newFilters.sizes.delete(size);
        } else {
          newFilters.sizes.add(size);
        }
        return newFilters;
      });
    },
    [updateFilters]
  );

  /**
   * Toggle de género (checkbox)
   */
  const toggleGenero = useCallback(
    (genero: Genero) => {
      updateFilters((prev) => {
        const newFilters = { ...prev, generos: new Set(prev.generos) };
        if (newFilters.generos.has(genero)) {
          newFilters.generos.delete(genero);
        } else {
          newFilters.generos.add(genero);
        }
        return newFilters;
      });
    },
    [updateFilters]
  );

  /**
   * Toggle de versión (checkbox)
   */
  const toggleVersion = useCallback(
    (version: Version) => {
      updateFilters((prev) => {
        const newFilters = { ...prev, versions: new Set(prev.versions) };
        if (newFilters.versions.has(version)) {
          newFilters.versions.delete(version);
        } else {
          newFilters.versions.add(version);
        }
        return newFilters;
      });
    },
    [updateFilters]
  );

  /**
   * Actualiza rango de precios
   */
  const updatePriceRange = useCallback(
    (min: number | null, max: number | null) => {
      updateFilters((prev) => ({
        ...prev,
        minPrice: min,
        maxPrice: max,
      }));
    },
    [updateFilters]
  );

  /**
   * Limpia todos los filtros
   */
  const clearFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  return {
    filters: currentFilters,
    toggleLeague,
    toggleTeam,
    toggleSize,
    toggleGenero,
    toggleVersion,
    updatePriceRange,
    clearFilters,
  };
}

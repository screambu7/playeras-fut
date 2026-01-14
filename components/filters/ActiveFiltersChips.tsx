/**
 * Componente para mostrar filtros activos como chips
 * Permite eliminar filtros individuales
 */

"use client";

import { Liga, Talla, CatalogFilters } from "@/types";

interface ActiveFiltersChipsProps {
  filters: CatalogFilters;
  onRemoveLeague: (league: Liga) => void;
  onRemoveTeam: (team: string) => void;
  onRemoveSize: (size: Talla) => void;
  onRemovePrice: () => void;
  onClearAll: () => void;
}

export default function ActiveFiltersChips({
  filters,
  onRemoveLeague,
  onRemoveTeam,
  onRemoveSize,
  onRemovePrice,
  onClearAll,
}: ActiveFiltersChipsProps) {
  const hasAnyFilter =
    filters.leagues.size > 0 ||
    filters.teams.size > 0 ||
    filters.sizes.size > 0 ||
    filters.minPrice !== null ||
    filters.maxPrice !== null;

  if (!hasAnyFilter) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm text-gray-600 font-medium">Filtros activos:</span>
      
      {/* Ligas */}
      {Array.from(filters.leagues).map((league) => (
        <button
          key={league}
          onClick={() => onRemoveLeague(league)}
          className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm hover:bg-primary-200 transition-colors"
          aria-label={`Eliminar filtro de liga: ${league}`}
        >
          {league}
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      ))}

      {/* Equipos */}
      {Array.from(filters.teams).map((team) => (
        <button
          key={team}
          onClick={() => onRemoveTeam(team)}
          className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm hover:bg-primary-200 transition-colors"
          aria-label={`Eliminar filtro de equipo: ${team}`}
        >
          {team}
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      ))}

      {/* Tallas */}
      {Array.from(filters.sizes).map((size) => (
        <button
          key={size}
          onClick={() => onRemoveSize(size)}
          className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm hover:bg-primary-200 transition-colors"
          aria-label={`Eliminar filtro de talla: ${size}`}
        >
          {size}
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      ))}

      {/* Precio */}
      {(filters.minPrice !== null || filters.maxPrice !== null) && (
        <button
          onClick={onRemovePrice}
          className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm hover:bg-primary-200 transition-colors"
          aria-label="Eliminar filtro de precio"
        >
          €{filters.minPrice ?? 0} - €{filters.maxPrice ?? "∞"}
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <button
        onClick={onClearAll}
        className="text-sm text-gray-600 hover:text-gray-900 underline ml-2"
        aria-label="Limpiar todos los filtros"
      >
        Limpiar todo
      </button>
    </div>
  );
}

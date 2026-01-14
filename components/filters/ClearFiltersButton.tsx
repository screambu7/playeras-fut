/**
 * Botón para limpiar todos los filtros activos
 */

"use client";

interface ClearFiltersButtonProps {
  onClear: () => void;
  hasActiveFilters: boolean;
  className?: string;
}

export default function ClearFiltersButton({
  onClear,
  hasActiveFilters,
  className = "",
}: ClearFiltersButtonProps) {
  if (!hasActiveFilters) {
    return null;
  }

  return (
    <button
      onClick={onClear}
      className={`text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors ${className}`}
      aria-label="Limpiar todos los filtros"
    >
      Limpiar filtros
    </button>
  );
}

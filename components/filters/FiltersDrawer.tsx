/**
 * Drawer de filtros para mobile
 * Se abre desde un botón y cubre la pantalla
 */

"use client";

import { useState, useEffect } from "react";
import { Liga, Talla, Genero, Version, CatalogFilters } from "@/types";
import FilterGroup, { FilterCheckbox } from "./FilterGroup";
import PriceRange from "./PriceRange";
import ClearFiltersButton from "./ClearFiltersButton";
import { hasActiveFilters } from "@/lib/filters";

interface FiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: CatalogFilters;
  leagues: Liga[];
  teams: string[];
  sizes: Talla[];
  generos: Genero[];
  versions: Version[];
  onToggleLeague: (league: Liga) => void;
  onToggleTeam: (team: string) => void;
  onToggleSize: (size: Talla) => void;
  onToggleGenero: (genero: Genero) => void;
  onToggleVersion: (version: Version) => void;
  onPriceChange: (min: number | null, max: number | null) => void;
  onClearFilters: () => void;
  getLeagueCount?: (league: Liga) => number;
  getTeamCount?: (team: string) => number;
  getSizeCount?: (size: Talla) => number;
  getGeneroCount?: (genero: Genero) => number;
  getVersionCount?: (version: Version) => number;
}

export default function FiltersDrawer({
  isOpen,
  onClose,
  filters,
  leagues,
  teams,
  sizes,
  generos,
  versions,
  onToggleLeague,
  onToggleTeam,
  onToggleSize,
  onToggleGenero,
  onToggleVersion,
  onPriceChange,
  onClearFilters,
  getLeagueCount,
  getTeamCount,
  getSizeCount,
  getGeneroCount,
  getVersionCount,
}: FiltersDrawerProps) {
  // Prevenir scroll del body cuando el drawer está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
            <div className="flex items-center gap-4">
              <ClearFiltersButton
                onClear={onClearFilters}
                hasActiveFilters={hasActiveFilters(filters)}
              />
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Cerrar filtros"
              >
                <svg
                  className="w-6 h-6"
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
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {/* Filtro de Ligas */}
              {leagues.length > 0 && (
                <FilterGroup title="Liga">
                  {leagues.map((league) => (
                    <FilterCheckbox
                      key={league}
                      id={`drawer-filter-league-${league}`}
                      label={league}
                      checked={filters.leagues.has(league)}
                      onChange={() => onToggleLeague(league)}
                      count={getLeagueCount?.(league)}
                    />
                  ))}
                </FilterGroup>
              )}

              {/* Filtro de Equipos */}
              {teams.length > 0 && (
                <FilterGroup title="Equipo">
                  {teams.map((team) => (
                    <FilterCheckbox
                      key={team}
                      id={`drawer-filter-team-${team}`}
                      label={team}
                      checked={filters.teams.has(team)}
                      onChange={() => onToggleTeam(team)}
                      count={getTeamCount?.(team)}
                    />
                  ))}
                </FilterGroup>
              )}

              {/* Filtro de Tallas */}
              {sizes.length > 0 && (
                <FilterGroup title="Talla">
                  {sizes.map((size) => (
                    <FilterCheckbox
                      key={size}
                      id={`drawer-filter-size-${size}`}
                      label={size}
                      checked={filters.sizes.has(size)}
                      onChange={() => onToggleSize(size)}
                      count={getSizeCount?.(size)}
                    />
                  ))}
                </FilterGroup>
              )}

              {/* Filtro de Género */}
              {generos.length > 0 && (
                <FilterGroup title="Género">
                  {generos.map((genero) => (
                    <FilterCheckbox
                      key={genero}
                      id={`drawer-filter-genero-${genero}`}
                      label={genero}
                      checked={filters.generos.has(genero)}
                      onChange={() => onToggleGenero(genero)}
                      count={getGeneroCount?.(genero)}
                    />
                  ))}
                </FilterGroup>
              )}

              {/* Filtro de Versión */}
              {versions.length > 0 && (
                <FilterGroup title="Versión">
                  {versions.map((version) => (
                    <FilterCheckbox
                      key={version}
                      id={`drawer-filter-version-${version}`}
                      label={version}
                      checked={filters.versions.has(version)}
                      onChange={() => onToggleVersion(version)}
                      count={getVersionCount?.(version)}
                    />
                  ))}
                </FilterGroup>
              )}

              {/* Filtro de Precio */}
              <PriceRange
                minPrice={filters.minPrice}
                maxPrice={filters.maxPrice}
                onPriceChange={onPriceChange}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

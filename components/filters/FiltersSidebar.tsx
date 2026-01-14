/**
 * Sidebar de filtros para desktop
 * Contiene todos los grupos de filtros
 */

"use client";

import { Liga, Talla, CatalogFilters } from "@/types";
import FilterGroup, { FilterCheckbox } from "./FilterGroup";
import PriceRange from "./PriceRange";
import ClearFiltersButton from "./ClearFiltersButton";
import { hasActiveFilters } from "@/lib/filters";

interface FiltersSidebarProps {
  filters: CatalogFilters;
  leagues: Liga[];
  teams: string[];
  sizes: Talla[];
  onToggleLeague: (league: Liga) => void;
  onToggleTeam: (team: string) => void;
  onToggleSize: (size: Talla) => void;
  onPriceChange: (min: number | null, max: number | null) => void;
  onClearFilters: () => void;
  getLeagueCount?: (league: Liga) => number;
  getTeamCount?: (team: string) => number;
  getSizeCount?: (size: Talla) => number;
}

export default function FiltersSidebar({
  filters,
  leagues,
  teams,
  sizes,
  onToggleLeague,
  onToggleTeam,
  onToggleSize,
  onPriceChange,
  onClearFilters,
  getLeagueCount,
  getTeamCount,
  getSizeCount,
}: FiltersSidebarProps) {
  return (
    <aside className="lg:w-64">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          <ClearFiltersButton
            onClear={onClearFilters}
            hasActiveFilters={hasActiveFilters(filters)}
          />
        </div>

        <div className="space-y-6">
          {/* Filtro de Ligas */}
          {leagues.length > 0 && (
            <FilterGroup title="Liga">
              {leagues.map((league) => (
                <FilterCheckbox
                  key={league}
                  id={`filter-league-${league}`}
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
                  id={`filter-team-${team}`}
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
                  id={`filter-size-${size}`}
                  label={size}
                  checked={filters.sizes.has(size)}
                  onChange={() => onToggleSize(size)}
                  count={getSizeCount?.(size)}
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
    </aside>
  );
}

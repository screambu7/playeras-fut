"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useCatalogFilters } from "@/hooks/useCatalogFilters";
import { applyFiltersToProducts, getAllSizesFromProducts } from "@/lib/filters";
import { getAllProducts, getAllLeagues, getAllTeams, getAllSizes } from "@/lib/products";
import ProductGrid from "@/components/ProductGrid";
import FiltersSidebar from "@/components/filters/FiltersSidebar";
import FiltersDrawer from "@/components/filters/FiltersDrawer";
import ActiveFiltersChips from "@/components/filters/ActiveFiltersChips";
import { SortOption, MedusaProductAdapted, Liga, Talla } from "@/types";

function CatalogoContent() {
  const {
    filters,
    toggleLeague,
    toggleTeam,
    toggleSize,
    updatePriceRange,
    clearFilters,
  } = useCatalogFilters();

  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);
  const [products, setProducts] = useState<MedusaProductAdapted[]>([]);
  const [leagues, setLeagues] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("popular");

  // Cargar datos iniciales
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [allProducts, allLeagues, allTeams, allSizes] = await Promise.all([
          getAllProducts(),
          getAllLeagues(),
          getAllTeams(),
          getAllSizes(),
        ]);

        setProducts(allProducts);
        setLeagues(allLeagues);
        setTeams(allTeams);
        setSizes(allSizes);
      } catch (error) {
        // Error loading products - handled by empty state
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Aplicar filtros y ordenamiento
  const filteredAndSortedProducts = useMemo(() => {
    // Aplicar filtros desde URL
    let filtered = applyFiltersToProducts(products, filters);

    // Aplicar ordenamiento
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "popular":
      default:
        filtered.sort((a, b) => {
          if (a.metadata.bestSeller && !b.metadata.bestSeller) return -1;
          if (!a.metadata.bestSeller && b.metadata.bestSeller) return 1;
          return 0;
        });
        break;
    }

    return filtered;
  }, [products, filters, sortBy]);

  // Calcular conteos para cada filtro (opcional, para mostrar cantidad de productos)
  const getLeagueCount = (league: string) => {
    return products.filter((p) => p.metadata.league === league).length;
  };

  const getTeamCount = (team: string) => {
    return products.filter((p) => p.metadata.team === team).length;
  };

  const getSizeCount = (size: string) => {
    return products.filter((p) =>
      p.variants.some(
        (v) => (v.options?.Size || v.title) === size
      )
    ).length;
  };

  // Handlers para eliminar filtros individuales desde chips
  const handleRemoveLeague = (league: string) => {
    toggleLeague(league as Liga);
  };

  const handleRemoveTeam = (team: string) => {
    toggleTeam(team);
  };

  const handleRemoveSize = (size: string) => {
    toggleSize(size as Talla);
  };

  const handleRemovePrice = () => {
    updatePriceRange(null, null);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg aspect-square"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Catálogo
        </h1>
        <p className="text-gray-600">
          Encuentra la playera perfecta para ti
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar - Desktop */}
        <div className="hidden lg:block">
          <FiltersSidebar
            filters={filters}
            leagues={leagues as Liga[]}
            teams={teams}
            sizes={sizes as Talla[]}
            onToggleLeague={toggleLeague}
            onToggleTeam={toggleTeam}
            onToggleSize={toggleSize}
            onPriceChange={updatePriceRange}
            onClearFilters={clearFilters}
            getLeagueCount={getLeagueCount}
            getTeamCount={getTeamCount}
            getSizeCount={getSizeCount}
          />
        </div>

        {/* Products Section */}
        <div className="flex-1">
          {/* Mobile Filter Button & Sort */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFiltersDrawer(true)}
                className="lg:hidden px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                aria-label="Abrir filtros"
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
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filtros
              </button>
              <p className="text-gray-600">
                {filteredAndSortedProducts.length} producto{filteredAndSortedProducts.length !== 1 ? "s" : ""}
              </p>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="popular">Más populares</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="name-asc">Nombre: A-Z</option>
              <option value="name-desc">Nombre: Z-A</option>
            </select>
          </div>

          {/* Active Filters Chips */}
          <ActiveFiltersChips
            filters={filters}
            onRemoveLeague={handleRemoveLeague}
            onRemoveTeam={handleRemoveTeam}
            onRemoveSize={handleRemoveSize}
            onRemovePrice={handleRemovePrice}
            onClearAll={clearFilters}
          />

          {/* Products Grid */}
          <ProductGrid products={filteredAndSortedProducts} />
        </div>
      </div>

      {/* Filters Drawer - Mobile */}
      <FiltersDrawer
        isOpen={showFiltersDrawer}
        onClose={() => setShowFiltersDrawer(false)}
        filters={filters}
        leagues={leagues as any[]}
        teams={teams}
        sizes={sizes as any[]}
        onToggleLeague={toggleLeague}
        onToggleTeam={toggleTeam}
        onToggleSize={toggleSize}
        onPriceChange={updatePriceRange}
        onClearFilters={clearFilters}
        getLeagueCount={getLeagueCount}
        getTeamCount={getTeamCount}
        getSizeCount={getSizeCount}
      />
    </div>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          </div>
        </div>
      }
    >
      <CatalogoContent />
    </Suspense>
  );
}

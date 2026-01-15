/**
 * Helpers para parsear y aplicar filtros desde searchParams
 * Preparado para migración futura a backend filtering
 */

import { Liga, Talla, Genero, Version, MedusaProductAdapted, CatalogFilters } from "@/types";

/**
 * Parámetros de URL para filtros
 */
export type FilterSearchParams = {
  liga?: string | string[];
  equipo?: string | string[];
  talla?: string | string[];
  genero?: string | string[];
  version?: string | string[];
  precio_min?: string;
  precio_max?: string;
};

/**
 * Parsea searchParams de Next.js a CatalogFilters
 */
export function parseFiltersFromSearchParams(
  searchParams: FilterSearchParams
): CatalogFilters {
  const filters: CatalogFilters = {
    leagues: new Set<Liga>(),
    teams: new Set<string>(),
    sizes: new Set<Talla>(),
    generos: new Set<Genero>(),
    versions: new Set<Version>(),
    minPrice: null,
    maxPrice: null,
  };

  // Parsear ligas (puede ser string o array)
  if (searchParams.liga) {
    const ligas = Array.isArray(searchParams.liga)
      ? searchParams.liga
      : [searchParams.liga];
    ligas.forEach((liga) => {
      const validLiga = liga as Liga;
      if (validLiga) {
        filters.leagues.add(validLiga);
      }
    });
  }

  // Parsear equipos (puede ser string o array)
  if (searchParams.equipo) {
    const equipos = Array.isArray(searchParams.equipo)
      ? searchParams.equipo
      : [searchParams.equipo];
    equipos.forEach((equipo) => {
      if (equipo) {
        filters.teams.add(equipo);
      }
    });
  }

  // Parsear tallas (puede ser string o array)
  if (searchParams.talla) {
    const tallas = Array.isArray(searchParams.talla)
      ? searchParams.talla
      : [searchParams.talla];
    tallas.forEach((talla) => {
      const validTalla = talla as Talla;
      if (validTalla) {
        filters.sizes.add(validTalla);
      }
    });
  }

  // Parsear géneros (puede ser string o array)
  if (searchParams.genero) {
    const generos = Array.isArray(searchParams.genero)
      ? searchParams.genero
      : [searchParams.genero];
    generos.forEach((genero) => {
      const validGenero = genero as Genero;
      if (validGenero) {
        filters.generos.add(validGenero);
      }
    });
  }

  // Parsear versiones (puede ser string o array)
  if (searchParams.version) {
    const versions = Array.isArray(searchParams.version)
      ? searchParams.version
      : [searchParams.version];
    versions.forEach((version) => {
      const validVersion = version as Version;
      if (validVersion) {
        filters.versions.add(validVersion);
      }
    });
  }

  // Parsear precios
  if (searchParams.precio_min) {
    const min = parseFloat(searchParams.precio_min);
    if (!isNaN(min) && min >= 0) {
      filters.minPrice = min;
    }
  }

  if (searchParams.precio_max) {
    const max = parseFloat(searchParams.precio_max);
    if (!isNaN(max) && max >= 0) {
      filters.maxPrice = max;
    }
  }

  return filters;
}

/**
 * Aplica filtros a un array de productos
 * Preparado para ser reemplazado por llamada al backend
 */
export function applyFiltersToProducts(
  products: MedusaProductAdapted[],
  filters: CatalogFilters
): MedusaProductAdapted[] {
  let filtered = [...products];

  // Filtrar por ligas
  if (filters.leagues.size > 0) {
    filtered = filtered.filter((product) => {
      return product.metadata.league && filters.leagues.has(product.metadata.league);
    });
  }

  // Filtrar por equipos
  if (filters.teams.size > 0) {
    filtered = filtered.filter((product) => {
      return product.metadata.team && filters.teams.has(product.metadata.team);
    });
  }

  // Filtrar por tallas (producto debe tener al menos una variante con la talla seleccionada)
  if (filters.sizes.size > 0) {
    filtered = filtered.filter((product) => {
      return product.variants.some((variant) => {
        // Las tallas están en variant.options.Size o variant.title
        const variantSize = variant.options?.Size || variant.title;
        return variantSize && filters.sizes.has(variantSize as Talla);
      });
    });
  }

  // Filtrar por géneros
  if (filters.generos.size > 0) {
    filtered = filtered.filter((product) => {
      const productGenero = product.metadata.genero as Genero | undefined;
      return productGenero && filters.generos.has(productGenero);
    });
  }

  // Filtrar por versiones
  if (filters.versions.size > 0) {
    filtered = filtered.filter((product) => {
      const productVersion = product.metadata.version as Version | undefined;
      return productVersion && filters.versions.has(productVersion);
    });
  }

  // Filtrar por precio mínimo
  if (filters.minPrice !== null) {
    filtered = filtered.filter((product) => product.price >= filters.minPrice!);
  }

  // Filtrar por precio máximo
  if (filters.maxPrice !== null) {
    filtered = filtered.filter((product) => product.price <= filters.maxPrice!);
  }

  return filtered;
}

/**
 * Construye searchParams para la URL desde CatalogFilters
 */
export function buildSearchParamsFromFilters(
  filters: CatalogFilters
): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {};

  if (filters.leagues.size > 0) {
    params.liga = Array.from(filters.leagues);
  }

  if (filters.teams.size > 0) {
    params.equipo = Array.from(filters.teams);
  }

  if (filters.sizes.size > 0) {
    params.talla = Array.from(filters.sizes);
  }

  if (filters.generos.size > 0) {
    params.genero = Array.from(filters.generos);
  }

  if (filters.versions.size > 0) {
    params.version = Array.from(filters.versions);
  }

  if (filters.minPrice !== null) {
    params.precio_min = filters.minPrice.toString();
  }

  if (filters.maxPrice !== null) {
    params.precio_max = filters.maxPrice.toString();
  }

  return params;
}

/**
 * Verifica si hay filtros activos
 */
export function hasActiveFilters(filters: CatalogFilters): boolean {
  return (
    filters.leagues.size > 0 ||
    filters.teams.size > 0 ||
    filters.sizes.size > 0 ||
    filters.generos.size > 0 ||
    filters.versions.size > 0 ||
    filters.minPrice !== null ||
    filters.maxPrice !== null
  );
}

/**
 * Obtiene todas las tallas disponibles de un array de productos
 */
export function getAllSizesFromProducts(
  products: MedusaProductAdapted[]
): Talla[] {
  const sizes = new Set<Talla>();

  products.forEach((product) => {
    product.variants.forEach((variant) => {
      const size = variant.options?.Size || variant.title;
      if (size) {
        sizes.add(size as Talla);
      }
    });
  });

  return Array.from(sizes).sort((a, b) => {
    const order: Talla[] = ["XS", "S", "M", "L", "XL", "XXL"];
    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

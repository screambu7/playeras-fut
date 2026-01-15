/**
 * Funciones para obtener productos desde Supabase
 * 
 * Separado de la lógica de adaptación para mantener SoC
 */

import { supabase, SupabaseProduct } from './supabase';
import { MedusaProductAdapted, MedusaProductVariant } from '@/types/medusa';
import { Liga, Talla, Genero, Version } from '@/types';

/**
 * Extrae el género del producto desde su nombre y descripción
 */
export function extractGenero(product: SupabaseProduct): Genero {
  const text = `${product.name} ${product.description || ''}`.toLowerCase();
  
  // Buscar indicadores de niño/kids
  if (text.includes('kids') || text.includes('kid') || text.includes('niño') || text.includes('niña')) {
    return 'Niño';
  }
  
  // Buscar indicadores de mujer
  if (text.includes('woman') || text.includes('women') || text.includes('mujer') || text.includes('ladies')) {
    return 'Mujer';
  }
  
  // Por defecto, asumir que es de hombre
  return 'Hombre';
}

/**
 * Extrae la versión del producto (Player o Fan) desde su nombre y descripción
 */
export function extractVersion(product: SupabaseProduct): Version {
  const text = `${product.name} ${product.description || ''}`.toLowerCase();
  
  // Buscar indicadores de Player Version
  if (text.includes('player') || text.includes('player version') || text.includes('player kit')) {
    return 'Player';
  }
  
  // Si no dice Player, asumir que es Fan
  return 'Fan';
}

/**
 * Obtener todos los productos desde Supabase
 */
export async function getAllSupabaseProducts(): Promise<SupabaseProduct[]> {
  try {
    const { data, error } = await supabase
      .from('scraped_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase] Error fetching products:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('[Supabase] Error fetching products:', error);
    return [];
  }
}

/**
 * Obtener un producto por ID desde Supabase
 */
export async function getSupabaseProductById(
  id: string
): Promise<SupabaseProduct | null> {
  try {
    const { data, error } = await supabase
      .from('scraped_products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`[Supabase] Error fetching product ${id}:`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`[Supabase] Error fetching product ${id}:`, error);
    return null;
  }
}

/**
 * Obtener todos los géneros únicos desde Supabase
 */
export async function getAllGenerosFromSupabase(): Promise<Genero[]> {
  try {
    const products = await getAllSupabaseProducts();
    const generos = new Set<Genero>();
    
    products.forEach((product) => {
      generos.add(extractGenero(product));
    });
    
    return Array.from(generos).sort();
  } catch (error) {
    console.error('[Supabase] Error fetching generos:', error);
    return [];
  }
}

/**
 * Obtener todas las versiones únicas desde Supabase
 */
export async function getAllVersionsFromSupabase(): Promise<Version[]> {
  try {
    const products = await getAllSupabaseProducts();
    const versions = new Set<Version>();
    
    products.forEach((product) => {
      versions.add(extractVersion(product));
    });
    
    return Array.from(versions).sort();
  } catch (error) {
    console.error('[Supabase] Error fetching versions:', error);
    return [];
  }
}

/**
 * Filtrar productos desde Supabase
 */
export async function filterSupabaseProducts(filters: {
  team?: string;
  league?: string;
  season?: string;
  type?: string;
  genero?: Genero;
  version?: Version;
  minPrice?: number;
  maxPrice?: number;
}): Promise<SupabaseProduct[]> {
  try {
    let query = supabase.from('scraped_products').select('*');

    if (filters.team) {
      query = query.eq('team', filters.team);
    }

    if (filters.league) {
      query = query.eq('league', filters.league);
    }

    if (filters.season) {
      query = query.eq('season', filters.season);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase] Error filtering products:', error);
      throw error;
    }

    // Filtrar por género y versión en memoria (ya que estos campos se extraen del nombre)
    let filtered = data || [];

    if (filters.genero) {
      filtered = filtered.filter((product) => extractGenero(product) === filters.genero);
    }

    if (filters.version) {
      filtered = filtered.filter((product) => extractVersion(product) === filters.version);
    }

    return filtered;

    if (error) {
      console.error('[Supabase] Error filtering products:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('[Supabase] Error filtering products:', error);
    return [];
  }
}

/**
 * Obtener todas las ligas únicas desde Supabase
 */
export async function getAllLeaguesFromSupabase(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('scraped_products')
      .select('league')
      .not('league', 'is', null);

    if (error) {
      console.error('[Supabase] Error fetching leagues:', error);
      return [];
    }

    const uniqueLeagues = Array.from(
      new Set(data.map((item) => item.league).filter(Boolean))
    );
    return uniqueLeagues.sort();
  } catch (error) {
    console.error('[Supabase] Error fetching leagues:', error);
    return [];
  }
}

/**
 * Obtener todos los equipos únicos desde Supabase
 */
export async function getAllTeamsFromSupabase(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('scraped_products')
      .select('team')
      .not('team', 'is', null);

    if (error) {
      console.error('[Supabase] Error fetching teams:', error);
      return [];
    }

    const uniqueTeams = Array.from(
      new Set(data.map((item) => item.team).filter(Boolean))
    );
    return uniqueTeams.sort();
  } catch (error) {
    console.error('[Supabase] Error fetching teams:', error);
    return [];
  }
}

/**
 * Obtener todas las tallas únicas desde Supabase
 */
export async function getAllSizesFromSupabase(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('scraped_products')
      .select('sizes')
      .not('sizes', 'is', null);

    if (error) {
      console.error('[Supabase] Error fetching sizes:', error);
      return [];
    }

    const allSizes = new Set<string>();
    data.forEach((item) => {
      if (Array.isArray(item.sizes)) {
        item.sizes.forEach((size) => allSizes.add(size));
      }
    });

    // Ordenar tallas en orden lógico
    const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL'];
    const sortedSizes = Array.from(allSizes).sort((a, b) => {
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    return sortedSizes;
  } catch (error) {
    console.error('[Supabase] Error fetching sizes:', error);
    return [];
  }
}

/**
 * Adapta un producto de Supabase al formato MedusaProductAdapted
 * que espera el frontend
 */
export function adaptSupabaseProduct(
  supabaseProduct: SupabaseProduct
): MedusaProductAdapted {
  // Generar handle desde el nombre (slug-friendly)
  const handle = supabaseProduct.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + `-${supabaseProduct.id.slice(0, 8)}`;

  // Obtener imágenes (usar array de images o image_url como fallback)
  const images =
    supabaseProduct.images && supabaseProduct.images.length > 0
      ? supabaseProduct.images
      : supabaseProduct.image_url
        ? [supabaseProduct.image_url]
        : [];

  // Precio (usar price o 0 si es null)
  const price = supabaseProduct.price || 0;
  const originalPrice = supabaseProduct.original_price || undefined;

  // Extraer género y versión
  const genero = extractGenero(supabaseProduct);
  const version = extractVersion(supabaseProduct);

  // Metadata
  const metadata = {
    team: supabaseProduct.team,
    league: supabaseProduct.league as Liga | undefined,
    season: supabaseProduct.season,
    genero,
    version,
    featured: false,
    bestSeller: false,
  };

  // Crear variantes desde las tallas disponibles
  const variants: MedusaProductVariant[] = (supabaseProduct.sizes || []).map(
    (size, index) => ({
      id: `${supabaseProduct.id}-${size}-${index}`,
      title: size,
      prices: [
        {
          id: `price-${supabaseProduct.id}-${size}`,
          amount: Math.round(price * 100), // Convertir a centavos
          currency_code: 'eur',
        },
      ],
      sku: `${supabaseProduct.id}-${size}`,
      inventory_quantity: undefined,
      options: {
        Size: size,
      },
    })
  );

  // Si no hay tallas, crear una variante por defecto
  if (variants.length === 0) {
    variants.push({
      id: `${supabaseProduct.id}-default`,
      title: 'Default',
      prices: [
        {
          id: `price-${supabaseProduct.id}-default`,
          amount: Math.round(price * 100),
          currency_code: 'eur',
        },
      ],
      sku: `${supabaseProduct.id}-default`,
      inventory_quantity: undefined,
      options: {},
    });
  }

  return {
    id: supabaseProduct.id,
    handle,
    title: supabaseProduct.name,
    description: supabaseProduct.description || '',
    price,
    originalPrice,
    images,
    metadata,
    variants,
  };
}

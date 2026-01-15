/**
 * Cliente de Supabase para el frontend
 * 
 * Usa la API Key pública (anon) para operaciones del cliente
 * Separado de la lógica de negocio para mantener SoC
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

/**
 * Cliente de Supabase para uso en el frontend
 * Usa la API Key anon (pública) para operaciones del cliente
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Tipo para productos desde Supabase (scraped_products)
 */
export interface SupabaseProduct {
  id: string;
  name: string;
  team: string;
  league: string;
  season: string;
  type: string;
  product_type: string | null;
  price: number | null;
  original_price: number | null;
  images: string[];
  image_url: string | null;
  description: string | null;
  url: string;
  source: string;
  sizes: string[];
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

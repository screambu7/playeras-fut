/**
 * Script de seed para crear productos de ejemplo en Medusa
 * Ejecutar con: npm run seed
 */

import { ProductService, RegionService } from "@medusajs/medusa";

interface SeedProduct {
  title: string;
  handle: string;
  description: string;
  price: number;
  images: string[];
  metadata: {
    team: string;
    league: string;
    season: string;
    featured?: boolean;
    bestSeller?: boolean;
  };
  variants: {
    title: string;
    prices: { amount: number; currency_code: string }[];
    options: { option_id: string; value: string }[];
  }[];
}

const products: SeedProduct[] = [
  {
    title: "Real Madrid Home 2024/25",
    handle: "real-madrid-2024-home",
    description: "Camiseta oficial del Real Madrid temporada 2024/25. Diseño clásico blanco con detalles en dorado. Tecnología de secado rápido y tejido transpirable.",
    price: 8999, // en centavos
    images: [
      "/images/real-madrid-1.jpg",
      "/images/real-madrid-2.jpg",
      "/images/real-madrid-3.jpg",
    ],
    metadata: {
      team: "Real Madrid",
      league: "La Liga",
      season: "2024/25",
      featured: true,
      bestSeller: true,
    },
    variants: [
      { title: "S", prices: [{ amount: 8999, currency_code: "EUR" }], options: [] },
      { title: "M", prices: [{ amount: 8999, currency_code: "EUR" }], options: [] },
      { title: "L", prices: [{ amount: 8999, currency_code: "EUR" }], options: [] },
      { title: "XL", prices: [{ amount: 8999, currency_code: "EUR" }], options: [] },
      { title: "XXL", prices: [{ amount: 8999, currency_code: "EUR" }], options: [] },
    ],
  },
  {
    title: "FC Barcelona Home 2024/25",
    handle: "barcelona-2024-home",
    description: "Camiseta oficial del FC Barcelona temporada 2024/25. Diseño tradicional azul y grana con detalles modernos.",
    price: 8999,
    images: [
      "/images/barcelona-1.jpg",
      "/images/barcelona-2.jpg",
      "/images/barcelona-3.jpg",
    ],
    metadata: {
      team: "FC Barcelona",
      league: "La Liga",
      season: "2024/25",
      featured: true,
      bestSeller: true,
    },
    variants: [
      { title: "S", prices: [{ amount: 8999, currency_code: "EUR" }], options: [] },
      { title: "M", prices: [{ amount: 8999, currency_code: "EUR" }], options: [] },
      { title: "L", prices: [{ amount: 8999, currency_code: "EUR" }], options: [] },
      { title: "XL", prices: [{ amount: 8999, currency_code: "EUR" }], options: [] },
    ],
  },
  {
    title: "Manchester City Home 2024/25",
    handle: "manchester-city-2024-home",
    description: "Camiseta oficial del Manchester City temporada 2024/25. Diseño elegante en azul cielo con detalles en blanco.",
    price: 9499,
    images: [
      "/images/man-city-1.jpg",
      "/images/man-city-2.jpg",
    ],
    metadata: {
      team: "Manchester City",
      league: "Premier League",
      season: "2024/25",
      featured: false,
      bestSeller: true,
    },
    variants: [
      { title: "S", prices: [{ amount: 9499, currency_code: "EUR" }], options: [] },
      { title: "M", prices: [{ amount: 9499, currency_code: "EUR" }], options: [] },
      { title: "L", prices: [{ amount: 9499, currency_code: "EUR" }], options: [] },
      { title: "XL", prices: [{ amount: 9499, currency_code: "EUR" }], options: [] },
      { title: "XXL", prices: [{ amount: 9499, currency_code: "EUR" }], options: [] },
    ],
  },
  {
    title: "Liverpool Home 2024/25",
    handle: "liverpool-2024-home",
    description: "Camiseta oficial del Liverpool temporada 2024/25. Rojo característico con detalles en dorado.",
    price: 9499,
    images: [
      "/images/liverpool-1.jpg",
      "/images/liverpool-2.jpg",
    ],
    metadata: {
      team: "Liverpool",
      league: "Premier League",
      season: "2024/25",
      featured: false,
      bestSeller: false,
    },
    variants: [
      { title: "S", prices: [{ amount: 9499, currency_code: "EUR" }], options: [] },
      { title: "M", prices: [{ amount: 9499, currency_code: "EUR" }], options: [] },
      { title: "L", prices: [{ amount: 9499, currency_code: "EUR" }], options: [] },
      { title: "XL", prices: [{ amount: 9499, currency_code: "EUR" }], options: [] },
    ],
  },
  {
    title: "Juventus Home 2024/25",
    handle: "juventus-2024-home",
    description: "Camiseta oficial de la Juventus temporada 2024/25. Diseño clásico en blanco y negro con rayas verticales.",
    price: 8999,
    images: [
      "/images/juventus-1.jpg",
      "/images/juventus-2.jpg",
    ],
    metadata: {
      team: "Juventus",
      league: "Serie A",
      season: "2024/25",
      featured: true,
      bestSeller: false,
    },
    variants: [
      { title: "S", prices: [{ amount: 8999, currency_code: "EUR" }], options: [] },
      { title: "M", prices: [{ amount: 8999, currency_code: "EUR" }], options: [] },
      { title: "L", prices: [{ amount: 8999, currency_code: "EUR" }], options: [] },
      { title: "XL", prices: [{ amount: 8999, currency_code: "EUR" }], options: [] },
      { title: "XXL", prices: [{ amount: 8999, currency_code: "EUR" }], options: [] },
    ],
  },
  {
    title: "Bayern Munich Home 2024/25",
    handle: "bayern-munich-2024-home",
    description: "Camiseta oficial del Bayern Munich temporada 2024/25. Rojo característico con detalles en blanco.",
    price: 8999,
    images: [
      "/images/bayern-1.jpg",
      "/images/bayern-2.jpg",
    ],
    metadata: {
      team: "Bayern Munich",
      league: "Bundesliga",
      season: "2024/25",
      featured: false,
      bestSeller: false,
    },
    variants: [
      { title: "S", prices: [{ amount: 8999, currency_code: "EUR" }], options: [] },
      { title: "M", prices: [{ amount: 8999, currency_code: "EUR" }], options: [] },
      { title: "L", prices: [{ amount: 8999, currency_code: "EUR" }], options: [] },
      { title: "XL", prices: [{ amount: 8999, currency_code: "EUR" }], options: [] },
    ],
  },
  {
    title: "PSG Home 2024/25",
    handle: "psg-2024-home",
    description: "Camiseta oficial del PSG temporada 2024/25. Diseño elegante en azul marino con detalles en rojo y blanco.",
    price: 9499,
    images: [
      "/images/psg-1.jpg",
      "/images/psg-2.jpg",
    ],
    metadata: {
      team: "Paris Saint-Germain",
      league: "Ligue 1",
      season: "2024/25",
      featured: false,
      bestSeller: true,
    },
    variants: [
      { title: "S", prices: [{ amount: 9499, currency_code: "EUR" }], options: [] },
      { title: "M", prices: [{ amount: 9499, currency_code: "EUR" }], options: [] },
      { title: "L", prices: [{ amount: 9499, currency_code: "EUR" }], options: [] },
      { title: "XL", prices: [{ amount: 9499, currency_code: "EUR" }], options: [] },
      { title: "XXL", prices: [{ amount: 9499, currency_code: "EUR" }], options: [] },
    ],
  },
  {
    title: "Chelsea Home 2024/25",
    handle: "chelsea-2024-home",
    description: "Camiseta oficial del Chelsea temporada 2024/25. Azul real característico con detalles en blanco.",
    price: 9499,
    images: [
      "/images/chelsea-1.jpg",
      "/images/chelsea-2.jpg",
    ],
    metadata: {
      team: "Chelsea",
      league: "Premier League",
      season: "2024/25",
      featured: false,
      bestSeller: false,
    },
    variants: [
      { title: "S", prices: [{ amount: 9499, currency_code: "EUR" }], options: [] },
      { title: "M", prices: [{ amount: 9499, currency_code: "EUR" }], options: [] },
      { title: "L", prices: [{ amount: 9499, currency_code: "EUR" }], options: [] },
      { title: "XL", prices: [{ amount: 9499, currency_code: "EUR" }], options: [] },
    ],
  },
  {
    title: "Atlético Madrid Home 2024/25",
    handle: "atletico-madrid-2024-home",
    description: "Camiseta oficial del Atlético Madrid temporada 2024/25. Rojo y blanco con rayas verticales características.",
    price: 8499,
    images: [
      "/images/atletico-1.jpg",
      "/images/atletico-2.jpg",
    ],
    metadata: {
      team: "Atlético Madrid",
      league: "La Liga",
      season: "2024/25",
      featured: false,
      bestSeller: false,
    },
    variants: [
      { title: "S", prices: [{ amount: 8499, currency_code: "EUR" }], options: [] },
      { title: "M", prices: [{ amount: 8499, currency_code: "EUR" }], options: [] },
      { title: "L", prices: [{ amount: 8499, currency_code: "EUR" }], options: [] },
      { title: "XL", prices: [{ amount: 8499, currency_code: "EUR" }], options: [] },
      { title: "XXL", prices: [{ amount: 8499, currency_code: "EUR" }], options: [] },
    ],
  },
  {
    title: "AC Milan Home 2024/25",
    handle: "ac-milan-2024-home",
    description: "Camiseta oficial del AC Milan temporada 2024/25. Rojo y negro con rayas verticales características.",
    price: 8999,
    images: [
      "/images/milan-1.jpg",
      "/images/milan-2.jpg",
    ],
    metadata: {
      team: "AC Milan",
      league: "Serie A",
      season: "2024/25",
      featured: true,
      bestSeller: false,
    },
    variants: [
      { title: "S", prices: [{ amount: 8999, currency_code: "EUR" }], options: [] },
      { title: "M", prices: [{ amount: 8999, currency_code: "EUR" }], options: [] },
      { title: "L", prices: [{ amount: 8999, currency_code: "EUR" }], options: [] },
      { title: "XL", prices: [{ amount: 8999, currency_code: "EUR" }], options: [] },
    ],
  },
];

export default products;

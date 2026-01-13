import { Product, Liga } from "@/types";

export const products: Product[] = [
  {
    id: "1",
    slug: "real-madrid-2024-home",
    name: "Real Madrid Home 2024/25",
    team: "Real Madrid",
    league: "La Liga",
    season: "2024/25",
    price: 89.99,
    originalPrice: 109.99,
    images: [
      "/images/real-madrid-1.jpg",
      "/images/real-madrid-2.jpg",
      "/images/real-madrid-3.jpg",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Camiseta oficial del Real Madrid temporada 2024/25. Diseño clásico blanco con detalles en dorado. Tecnología de secado rápido y tejido transpirable.",
    featured: true,
    bestSeller: true,
  },
  {
    id: "2",
    slug: "barcelona-2024-home",
    name: "FC Barcelona Home 2024/25",
    team: "FC Barcelona",
    league: "La Liga",
    season: "2024/25",
    price: 89.99,
    originalPrice: 109.99,
    images: [
      "/images/barcelona-1.jpg",
      "/images/barcelona-2.jpg",
      "/images/barcelona-3.jpg",
    ],
    sizes: ["S", "M", "L", "XL"],
    description: "Camiseta oficial del FC Barcelona temporada 2024/25. Diseño tradicional azul y grana con detalles modernos.",
    featured: true,
    bestSeller: true,
  },
  {
    id: "3",
    slug: "manchester-city-2024-home",
    name: "Manchester City Home 2024/25",
    team: "Manchester City",
    league: "Premier League",
    season: "2024/25",
    price: 94.99,
    images: [
      "/images/man-city-1.jpg",
      "/images/man-city-2.jpg",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Camiseta oficial del Manchester City temporada 2024/25. Diseño elegante en azul cielo con detalles en blanco.",
    featured: false,
    bestSeller: true,
  },
  {
    id: "4",
    slug: "liverpool-2024-home",
    name: "Liverpool Home 2024/25",
    team: "Liverpool",
    league: "Premier League",
    season: "2024/25",
    price: 94.99,
    images: [
      "/images/liverpool-1.jpg",
      "/images/liverpool-2.jpg",
    ],
    sizes: ["S", "M", "L", "XL"],
    description: "Camiseta oficial del Liverpool temporada 2024/25. Rojo característico con detalles en dorado.",
    featured: false,
    bestSeller: false,
  },
  {
    id: "5",
    slug: "juventus-2024-home",
    name: "Juventus Home 2024/25",
    team: "Juventus",
    league: "Serie A",
    season: "2024/25",
    price: 89.99,
    images: [
      "/images/juventus-1.jpg",
      "/images/juventus-2.jpg",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Camiseta oficial de la Juventus temporada 2024/25. Diseño clásico en blanco y negro con rayas verticales.",
    featured: true,
    bestSeller: false,
  },
  {
    id: "6",
    slug: "bayern-munich-2024-home",
    name: "Bayern Munich Home 2024/25",
    team: "Bayern Munich",
    league: "Bundesliga",
    season: "2024/25",
    price: 89.99,
    images: [
      "/images/bayern-1.jpg",
      "/images/bayern-2.jpg",
    ],
    sizes: ["S", "M", "L", "XL"],
    description: "Camiseta oficial del Bayern Munich temporada 2024/25. Rojo característico con detalles en blanco.",
    featured: false,
    bestSeller: false,
  },
  {
    id: "7",
    slug: "psg-2024-home",
    name: "PSG Home 2024/25",
    team: "Paris Saint-Germain",
    league: "Ligue 1",
    season: "2024/25",
    price: 94.99,
    images: [
      "/images/psg-1.jpg",
      "/images/psg-2.jpg",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Camiseta oficial del PSG temporada 2024/25. Diseño elegante en azul marino con detalles en rojo y blanco.",
    featured: false,
    bestSeller: true,
  },
  {
    id: "8",
    slug: "chelsea-2024-home",
    name: "Chelsea Home 2024/25",
    team: "Chelsea",
    league: "Premier League",
    season: "2024/25",
    price: 94.99,
    images: [
      "/images/chelsea-1.jpg",
      "/images/chelsea-2.jpg",
    ],
    sizes: ["S", "M", "L", "XL"],
    description: "Camiseta oficial del Chelsea temporada 2024/25. Azul real característico con detalles en blanco.",
    featured: false,
    bestSeller: false,
  },
  {
    id: "9",
    slug: "atletico-madrid-2024-home",
    name: "Atlético Madrid Home 2024/25",
    team: "Atlético Madrid",
    league: "La Liga",
    season: "2024/25",
    price: 84.99,
    images: [
      "/images/atletico-1.jpg",
      "/images/atletico-2.jpg",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Camiseta oficial del Atlético Madrid temporada 2024/25. Rojo y blanco con rayas verticales características.",
    featured: false,
    bestSeller: false,
  },
  {
    id: "10",
    slug: "ac-milan-2024-home",
    name: "AC Milan Home 2024/25",
    team: "AC Milan",
    league: "Serie A",
    season: "2024/25",
    price: 89.99,
    images: [
      "/images/milan-1.jpg",
      "/images/milan-2.jpg",
    ],
    sizes: ["S", "M", "L", "XL"],
    description: "Camiseta oficial del AC Milan temporada 2024/25. Rojo y negro con rayas verticales características.",
    featured: true,
    bestSeller: false,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.featured);
}

export function getBestSellerProducts(): Product[] {
  return products.filter((product) => product.bestSeller);
}

export function getAllLeagues(): Liga[] {
  const leagues = new Set<Liga>();
  products.forEach((product) => leagues.add(product.league));
  return Array.from(leagues).sort();
}

export function getAllTeams(): string[] {
  const teams = new Set<string>();
  products.forEach((product) => teams.add(product.team));
  return Array.from(teams).sort();
}

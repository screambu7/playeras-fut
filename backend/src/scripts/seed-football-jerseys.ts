import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows";

interface FootballJersey {
  title: string;
  handle: string;
  team: string;
  league: string;
  season: string;
  price: number;
  originalPrice?: number;
  description: string;
  featured?: boolean;
  bestSeller?: boolean;
  sizes: string[];
  imageUrl: string;
}

const footballJerseys: FootballJersey[] = [
  {
    title: "Real Madrid Home 2024/25",
    handle: "real-madrid-2024-home",
    team: "Real Madrid",
    league: "La Liga",
    season: "2024/25",
    price: 8999, // en centavos (89.99 EUR)
    originalPrice: 10999,
    description:
      "Camiseta oficial del Real Madrid temporada 2024/25. Diseño clásico blanco con detalles en dorado. Tecnología de secado rápido y tejido transpirable.",
    featured: true,
    bestSeller: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    imageUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
  },
  {
    title: "FC Barcelona Home 2024/25",
    handle: "barcelona-2024-home",
    team: "FC Barcelona",
    league: "La Liga",
    season: "2024/25",
    price: 8999,
    originalPrice: 10999,
    description:
      "Camiseta oficial del FC Barcelona temporada 2024/25. Diseño tradicional azul y grana con detalles modernos.",
    featured: true,
    bestSeller: true,
    sizes: ["S", "M", "L", "XL"],
    imageUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
  },
  {
    title: "Manchester City Home 2024/25",
    handle: "manchester-city-2024-home",
    team: "Manchester City",
    league: "Premier League",
    season: "2024/25",
    price: 9499,
    description:
      "Camiseta oficial del Manchester City temporada 2024/25. Diseño elegante en azul cielo con detalles en blanco.",
    featured: false,
    bestSeller: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    imageUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
  },
  {
    title: "Liverpool Home 2024/25",
    handle: "liverpool-2024-home",
    team: "Liverpool",
    league: "Premier League",
    season: "2024/25",
    price: 9499,
    description:
      "Camiseta oficial del Liverpool temporada 2024/25. Rojo característico con detalles en dorado.",
    featured: false,
    bestSeller: false,
    sizes: ["S", "M", "L", "XL"],
    imageUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
  },
  {
    title: "Juventus Home 2024/25",
    handle: "juventus-2024-home",
    team: "Juventus",
    league: "Serie A",
    season: "2024/25",
    price: 8999,
    description:
      "Camiseta oficial de la Juventus temporada 2024/25. Diseño clásico en blanco y negro con rayas verticales.",
    featured: true,
    bestSeller: false,
    sizes: ["S", "M", "L", "XL", "XXL"],
    imageUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
  },
  {
    title: "Bayern Munich Home 2024/25",
    handle: "bayern-munich-2024-home",
    team: "Bayern Munich",
    league: "Bundesliga",
    season: "2024/25",
    price: 8999,
    description:
      "Camiseta oficial del Bayern Munich temporada 2024/25. Rojo característico con detalles en blanco.",
    featured: false,
    bestSeller: false,
    sizes: ["S", "M", "L", "XL"],
    imageUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
  },
  {
    title: "PSG Home 2024/25",
    handle: "psg-2024-home",
    team: "Paris Saint-Germain",
    league: "Ligue 1",
    season: "2024/25",
    price: 9499,
    description:
      "Camiseta oficial del PSG temporada 2024/25. Diseño elegante en azul marino con detalles en rojo y blanco.",
    featured: false,
    bestSeller: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    imageUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
  },
  {
    title: "Chelsea Home 2024/25",
    handle: "chelsea-2024-home",
    team: "Chelsea",
    league: "Premier League",
    season: "2024/25",
    price: 9499,
    description:
      "Camiseta oficial del Chelsea temporada 2024/25. Azul real característico con detalles en blanco.",
    featured: false,
    bestSeller: false,
    sizes: ["S", "M", "L", "XL"],
    imageUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
  },
  {
    title: "Atlético Madrid Home 2024/25",
    handle: "atletico-madrid-2024-home",
    team: "Atlético Madrid",
    league: "La Liga",
    season: "2024/25",
    price: 8499,
    description:
      "Camiseta oficial del Atlético Madrid temporada 2024/25. Rojo y blanco con rayas verticales características.",
    featured: false,
    bestSeller: false,
    sizes: ["S", "M", "L", "XL", "XXL"],
    imageUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
  },
  {
    title: "AC Milan Home 2024/25",
    handle: "ac-milan-2024-home",
    team: "AC Milan",
    league: "Serie A",
    season: "2024/25",
    price: 8999,
    description:
      "Camiseta oficial del AC Milan temporada 2024/25. Rojo y negro con rayas verticales características.",
    featured: true,
    bestSeller: false,
    sizes: ["S", "M", "L", "XL"],
    imageUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
  },
];

export default async function seedFootballJerseys({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);

  logger.info("Seeding football jerseys data...");

  // Obtener el sales channel por defecto
  const defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    logger.error("Default Sales Channel not found. Please run the main seed script first.");
    return;
  }

  // Obtener shipping profile
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });

  if (!shippingProfiles.length) {
    logger.error("Shipping profile not found. Please run the main seed script first.");
    return;
  }

  const shippingProfile = shippingProfiles[0];

  // Crear categoría de playeras de fútbol
  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "Football Jerseys",
          is_active: true,
        },
      ],
    },
  });

  const footballCategory = categoryResult[0];

  // Crear productos con variantes por talla
  const productsToCreate = footballJerseys.map((jersey) => {
    const variants = jersey.sizes.map((size) => ({
      title: `${size}`,
      sku: `${jersey.handle.toUpperCase().replace(/-/g, "_")}_${size}`,
      options: {
        Size: size,
      },
      prices: [
        {
          amount: jersey.price,
          currency_code: "eur",
        },
        {
          amount: Math.round(jersey.price * 1.1), // Aproximadamente 10% más en USD
          currency_code: "usd",
        },
      ],
    }));

    return {
      title: jersey.title,
      category_ids: [footballCategory.id],
      description: jersey.description,
      handle: jersey.handle,
      weight: 200, // gramos
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      images: [
        {
          url: jersey.imageUrl,
        },
      ],
      options: [
        {
          title: "Size",
          values: jersey.sizes,
        },
      ],
      variants,
      sales_channels: [
        {
          id: defaultSalesChannel[0].id,
        },
      ],
      metadata: {
        team: jersey.team,
        league: jersey.league,
        season: jersey.season,
        featured: jersey.featured ? "true" : "false",
        bestSeller: jersey.bestSeller ? "true" : "false",
        originalPrice: jersey.originalPrice?.toString() || "",
      },
    };
  });

  await createProductsWorkflow(container).run({
    input: {
      products: productsToCreate,
    },
  });

  logger.info("Finished seeding football jerseys data.");

  // Crear niveles de inventario
  logger.info("Seeding inventory levels for football jerseys...");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
  });

  if (stockLocations.length === 0) {
    logger.warn("No stock locations found. Skipping inventory levels.");
    return;
  }

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    const inventoryLevel = {
      location_id: stockLocations[0].id,
      stocked_quantity: 1000,
      inventory_item_id: inventoryItem.id,
    };
    inventoryLevels.push(inventoryLevel);
  }

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryLevels,
    },
  });

  logger.info("Finished seeding inventory levels for football jerseys.");
}

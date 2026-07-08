import { prisma } from "../lib/prisma";

async function main() {
  console.log("Iniciando seed de la tienda...");

  // Mantener rol ADMIN del dueño
  await prisma.user.upsert({
    where: { email: "axelinm11@gmail.com" },
    update: { role: "ADMIN" },
    create: {
      email: "axelinm11@gmail.com",
      name: "Axel Murillo",
      role: "ADMIN",
    },
  });

  // ─── Marcas ───
  const brandsData = [
    { slug: "elfbar", name: "ELFBAR", sortOrder: 1 },
    { slug: "lost-mary", name: "Lost Mary", sortOrder: 2 },
    { slug: "geek-bar", name: "Geek Bar", sortOrder: 3 },
    { slug: "waka", name: "WAKA", sortOrder: 4 },
    { slug: "vaporesso", name: "Vaporesso", sortOrder: 5 },
  ];
  const brands: Record<string, string> = {};
  for (const b of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name, sortOrder: b.sortOrder },
      create: b,
    });
    brands[b.slug] = brand.id;
  }

  // ─── Categorías ───
  const categoriesData = [
    {
      slug: "desechables",
      name: "Desechables",
      description: "Listos para usar, sin recargas ni mantenimiento.",
      sortOrder: 1,
    },
    {
      slug: "pods-recargables",
      name: "Pods recargables",
      description: "Sistemas de pod con batería recargable y cartuchos.",
      sortOrder: 2,
    },
  ];
  const categories: Record<string, string> = {};
  for (const c of categoriesData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, sortOrder: c.sortOrder },
      create: c,
    });
    categories[c.slug] = cat.id;
  }

  // ─── Productos ───
  const productsData = [
    {
      slug: "elfbar-bc10000",
      name: "ELFBAR BC10000",
      brand: "elfbar",
      category: "desechables",
      priceCents: 34900,
      compareAtCents: 39900,
      puffs: 10000,
      nicotineMg: 50,
      volumeMl: 18,
      featured: true,
      image: "/products/vape-1.svg",
      description:
        "El clásico que definió la categoría. Pantalla de batería y líquido, carga USB-C y sabor consistente hasta el último puff.",
      flavors: ["Blue Razz Ice", "Watermelon Ice", "Strawberry Kiwi", "Mango Peach"],
    },
    {
      slug: "lost-mary-mo20000-pro",
      name: "Lost Mary MO20000 Pro",
      brand: "lost-mary",
      category: "desechables",
      priceCents: 44900,
      puffs: 20000,
      nicotineMg: 50,
      volumeMl: 18,
      featured: true,
      image: "/products/vape-2.svg",
      description:
        "Doble malla, modo boost y pantalla inteligente. Uno de los desechables más completos del mercado.",
      flavors: ["Grape Jelly", "Blueberry Ice", "Miami Mint", "Cherry Bomb"],
    },
    {
      slug: "geek-bar-pulse-x",
      name: "Geek Bar Pulse X",
      brand: "geek-bar",
      category: "desechables",
      priceCents: 47900,
      puffs: 25000,
      nicotineMg: 50,
      volumeMl: 18,
      featured: true,
      image: "/products/vape-3.svg",
      description:
        "Pantalla 3D full-view, doble núcleo de malla y modos de potencia ajustables. La experiencia más premium en desechables.",
      flavors: ["Sour Apple Ice", "Tropical Rainbow", "White Gummy", "Frozen Pina Colada"],
    },
    {
      slug: "waka-sopro-pa10000",
      name: "WAKA soPro PA10000",
      brand: "waka",
      category: "desechables",
      priceCents: 38900,
      puffs: 10000,
      nicotineMg: 45,
      volumeMl: 16,
      image: "/products/vape-4.svg",
      description:
        "De los creadores de RELX. Sabor limpio, diseño compacto y flujo de aire ajustable.",
      flavors: ["Fresh Mint", "Strawberry Burst", "Grape Ice"],
    },
    {
      slug: "elfbar-ice-king-40k",
      name: "ELFBAR ICE KING 40K",
      brand: "elfbar",
      category: "desechables",
      priceCents: 54900,
      puffs: 40000,
      nicotineMg: 50,
      volumeMl: 20,
      featured: true,
      image: "/products/vape-5.svg",
      description:
        "El rey de la duración: 40,000 puffs, doble pantalla y sistema de enfriamiento de sabor ICE.",
      flavors: ["Icy Mint", "Blue Razz Blast", "Peach Berry Ice"],
    },
    {
      slug: "lost-mary-os5000",
      name: "Lost Mary OS5000",
      brand: "lost-mary",
      category: "desechables",
      priceCents: 25900,
      puffs: 5000,
      nicotineMg: 50,
      volumeMl: 13,
      image: "/products/vape-6.svg",
      description:
        "Compacto, discreto y con el sabor característico de Lost Mary. Ideal para empezar.",
      flavors: ["Blue Cotton Candy", "Kiwi Passion Guava", "Watermelon"],
    },
    {
      slug: "vaporesso-xros-4",
      name: "Vaporesso XROS 4",
      brand: "vaporesso",
      category: "pods-recargables",
      priceCents: 49900,
      batteryMah: 1000,
      volumeMl: 3,
      featured: true,
      image: "/products/vape-7.svg",
      description:
        "El pod recargable mejor valorado de su generación: batería de 1000 mAh, carga rápida y cartuchos de larga vida.",
      flavors: ["Negro", "Plata", "Azul marino", "Rosa"],
    },
    {
      slug: "vaporesso-eco-nano-2",
      name: "Vaporesso ECO Nano 2",
      brand: "vaporesso",
      category: "pods-recargables",
      priceCents: 32900,
      batteryMah: 1000,
      volumeMl: 6,
      image: "/products/vape-8.svg",
      description:
        "Tanque de 6 ml recargable con líquido, batería para todo el día y costo por puff bajísimo.",
      flavors: ["Negro", "Verde", "Morado"],
    },
    {
      slug: "geek-bar-skyview-25k",
      name: "Geek Bar Skyview 25K",
      brand: "geek-bar",
      category: "desechables",
      priceCents: 49900,
      puffs: 25000,
      nicotineMg: 50,
      volumeMl: 18,
      image: "/products/vape-9.svg",
      description:
        "Pantalla panorámica, batería visible en tiempo real y golpe de sabor intenso.",
      flavors: ["Strawberry Banana", "Blackberry Ice", "Lush Ice"],
    },
    {
      slug: "elfbar-gh23000",
      name: "ELFBAR GH23000",
      brand: "elfbar",
      category: "desechables",
      priceCents: 42900,
      puffs: 23000,
      nicotineMg: 50,
      volumeMl: 18,
      image: "/products/vape-10.svg",
      description:
        "Nueva generación con núcleo dual y modo eco para estirar cada ml. Diseño ergonómico premium.",
      flavors: ["Raspberry Watermelon", "Lemon Lime", "Cool Mint"],
    },
  ];

  for (const [i, p] of productsData.entries()) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        brandId: brands[p.brand],
        categoryId: categories[p.category],
        priceCents: p.priceCents,
        compareAtCents: p.compareAtCents ?? null,
        images: [p.image],
        puffs: p.puffs ?? null,
        nicotineMg: p.nicotineMg ?? null,
        volumeMl: p.volumeMl ?? null,
        batteryMah: p.batteryMah ?? null,
        featured: p.featured ?? false,
        sortOrder: i + 1,
      },
    });

    for (const [j, flavor] of p.flavors.entries()) {
      const existing = await prisma.productVariant.findFirst({
        where: { productId: product.id, name: flavor },
      });
      if (!existing) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            name: flavor,
            stock: 25,
            sortOrder: j + 1,
          },
        });
      }
    }
  }

  console.log(
    `Seed completado: ${brandsData.length} marcas, ${categoriesData.length} categorías, ${productsData.length} productos.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

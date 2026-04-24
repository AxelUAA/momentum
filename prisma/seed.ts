import { prisma } from "../lib/prisma";

async function main() {
  console.log("Iniciando seed de datos...");

  // Asignar rol ADMIN a axelinm11@gmail.com
  await prisma.user.upsert({
    where: { email: "axelinm11@gmail.com" },
    update: { role: "ADMIN" },
    create: {
      email: "axelinm11@gmail.com",
      name: "Axel Murillo",
      role: "ADMIN",
    },
  });

  // Buscar el primer User existente
  const user = await prisma.user.findFirst();

  if (!user) {
    throw new Error("No se encontró ningún usuario en la base de datos. Por favor haz login con Google primero para crear un usuario.");
  }

  console.log(`Usuario encontrado: ${user.name} (${user.email})`);

  // Crear o actualizar el Template Aurora
  const template = await prisma.template.upsert({
    where: { slug: "aurora" },
    update: {
      name: "Aurora",
      type: "WEDDING",
      description: "Elegancia atemporal para bodas modernas",
      isActive: true,
      isPremium: false,
      sortOrder: 1,
      config: {}
    },
    create: {
      slug: "aurora",
      name: "Aurora",
      type: "WEDDING",
      description: "Elegancia atemporal para bodas modernas",
      isActive: true,
      isPremium: false,
      sortOrder: 1,
      config: {}
    }
  });

  console.log(`Template creado/actualizado: ${template.name}`);

  // Configuración del evento (settings JSON)
  const eventSettings = {
    story: "Una historia que comenzó con una mirada...",
    timeline: [
      { year: "2018", title: "Nos conocimos", desc: "En una tarde de verano...", image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80" },
      { year: "2020", title: "Primer viaje", desc: "A las playas de Tulum...", image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80" },
      { year: "2024", title: "La propuesta", desc: "En París, bajo la Torre Eiffel...", image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80" }
    ],
    dressCode: {
      name: "Elegante Playero",
      description: "Hemos preparado un pequeño moodboard de inspiración para ayudarte a elegir tu atuendo.",
      images: [
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80",
        "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&q=80",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
        "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80"
      ]
    },
    gallery: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80",
      "https://images.unsplash.com/photo-1525772764200-be829a350797?w=800&q=80",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80"
    ],
    ceremony: { time: "17:00", name: "Parroquia de San Miguel", address: "Av. Principal 123, Centro" },
    reception: { time: "19:30", name: "Hacienda San Juan", address: "Av. Reforma 123, CDMX" },
    rsvpDeadline: "2026-06-01",
    colors: { primary: "#0F1B2D", accent: "#D4AF7A", secondary: "#C9A8A0" },
    musicUrl: null,
    giftRegistry: {
      digitalEnvelope: { enabled: true, suggestedAmount: 1000 },
      liverpool: { enabled: true, eventCode: "12345678" }
    },
    client: {
      name: "María González",
      email: "maria.gonzalez@example.com",
      phone: "+52 555 123 4567",
    },
  };

  // Crear o actualizar el Evento
  const event = await prisma.event.upsert({
    where: { slug: "boda-maria-juan" },
    update: {
      userId: user.id,
      templateId: template.id,
      type: "WEDDING",
      tier: "COMPLETE",
      title: "María & Juan",
      eventDate: new Date("2026-06-14T17:00:00Z"),
      timezone: "America/Mexico_City",
      locationName: "Hacienda San Juan",
      locationAddress: "Av. Reforma 123, CDMX",
      location: "Av. Reforma 123, CDMX",
      locationLat: 19.4326,
      locationLng: -99.1332,
      locationUrl: "https://maps.google.com/?q=19.4326,-99.1332",
      privacyMode: "UNIQUE_LINK",
      status: "ACTIVE",
      publishedAt: new Date(),
      activeSections: {
        welcomeEnvelope: true,
        hero: true,
        story: true,
        timeline: true,
        ceremony: true,
        reception: true,
        dressCode: true,
        gallery: true,
        rsvp: true,
        giftRegistry: true,
      },
      settings: eventSettings
    },
    create: {
      slug: "boda-maria-juan",
      userId: user.id,
      templateId: template.id,
      type: "WEDDING",
      tier: "COMPLETE",
      title: "María & Juan",
      eventDate: new Date("2026-06-14T17:00:00Z"),
      timezone: "America/Mexico_City",
      locationName: "Hacienda San Juan",
      locationAddress: "Av. Reforma 123, CDMX",
      location: "Av. Reforma 123, CDMX",
      locationLat: 19.4326,
      locationLng: -99.1332,
      locationUrl: "https://maps.google.com/?q=19.4326,-99.1332",
      privacyMode: "UNIQUE_LINK",
      status: "ACTIVE",
      publishedAt: new Date(),
      activeSections: {
        welcomeEnvelope: true,
        hero: true,
        story: true,
        timeline: true,
        ceremony: true,
        reception: true,
        dressCode: true,
        gallery: true,
        rsvp: true,
        giftRegistry: true,
      },
      settings: eventSettings
    }
  });

  console.log(`Evento creado/actualizado: ${event.title} (${event.slug})`);

  // Crear invitados
  const guestsData = [
    { 
      name: "Juanito Pérez", 
      uniqueToken: "abc123", 
      allowedGuests: 1, 
      phone: "+52 555 111 2222", 
      relationship: "FRIEND" as const, 
      invitedBy: "GROOM" as const 
    },
    { 
      name: "Ana López", 
      uniqueToken: "def456", 
      allowedGuests: 2, 
      phone: "+52 555 333 4444", 
      relationship: "FAMILY_BRIDE" as const, 
      invitedBy: "BRIDE" as const 
    },
    { 
      name: "Carlos Ramírez", 
      uniqueToken: "ghi789", 
      allowedGuests: 0, 
      phone: "+52 555 555 6666", 
      relationship: "FRIEND" as const, 
      invitedBy: "BRIDE" as const 
    }
  ];

  for (const g of guestsData) {
    const guest = await prisma.guest.upsert({
      where: { uniqueToken: g.uniqueToken },
      update: {
        eventId: event.id,
        name: g.name,
        allowedGuests: g.allowedGuests,
        phone: g.phone,
        relationship: g.relationship,
        invitedBy: g.invitedBy
      },
      create: {
        uniqueToken: g.uniqueToken,
        eventId: event.id,
        name: g.name,
        allowedGuests: g.allowedGuests,
        phone: g.phone,
        relationship: g.relationship,
        invitedBy: g.invitedBy
      }
    });

    // Crear RSVP para Juanito
    if (g.name === "Juanito Pérez") {
      await prisma.rsvp.upsert({
        where: { guestId: guest.id },
        update: {
          status: "CONFIRMED",
          confirmedGuests: 1,
          respondedAt: new Date()
        },
        create: {
          guestId: guest.id,
          status: "CONFIRMED",
          confirmedGuests: 1,
          respondedAt: new Date()
        }
      });
    }
  }

  console.log(`Se crearon/actualizaron ${guestsData.length} invitados.`);
  
  console.log("\nURLs DE PRUEBA:");
  for (const g of guestsData) {
    console.log(`http://localhost:3000/e/${event.slug}/${g.uniqueToken}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

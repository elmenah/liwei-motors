import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.adminUser.upsert({
    where: { email: "admin@liweimotors.com" },
    update: {},
    create: {
      email: "admin@liweimotors.com",
      password: hashedPassword,
      name: "Administrador",
    },
  });

  // Categories
  const scooters = await prisma.category.upsert({
    where: { slug: "scooters" },
    update: {},
    create: {
      name: "Scooters Eléctricos",
      slug: "scooters",
      description: "Scooters eléctricos para uso urbano y recreativo",
      order: 1,
    },
  });

  const tricycles = await prisma.category.upsert({
    where: { slug: "triciclos-electricos" },
    update: {},
    create: {
      name: "Triciclos Eléctricos",
      slug: "triciclos-electricos",
      description: "Triciclos eléctricos para carga y uso comercial",
      order: 2,
    },
  });

  // FAQs
  const faqs = [
    {
      question: "¿Cuál es la autonomía de los scooters eléctricos?",
      answer: "Nuestros scooters eléctricos tienen una autonomía de entre 20 y 50 km por carga, dependiendo del modelo, peso del usuario, modo de manejo y desniveles del terreno.",
      order: 1,
    },
    {
      question: "¿Cuánto tiempo tarda en cargarse la batería?",
      answer: "El tiempo de carga varía entre 4 y 8 horas según el modelo. Recomendamos cargar durante la noche para tener el vehículo listo al día siguiente. Cuando la carga esta completa, se enciende una luz verde.",
      order: 2,
    },
    {
      question: "¿Los vehículos requieren licencia de conducir?",
      answer: "Según la nueva ley de movilidad vigente, todo vehículo electrónico que supere una velocidad de 25 k/h o que posean un motor mayor a 250W requieren documentación exigida en Chile, así como la respectiva licencia de conducir",
      order: 3,
    },
    {
      question: "¿Ofrecen garantía en sus productos?",
      answer: "Se ofrece la garantía legal exigida de 6 meses de garantía por desperfectos de fábrica. Para que la garantía se haga efectiva, el vehículo debe ser ingresado a servicio técnico en el local presentando el certificado de garantía o factura de compra. No contamos con servicio técnico a domicilio.",
      order: 4,
    },
    {
      question: "¿Realizan envíos a todo el país?",
      answer: "Sí, hacemos envíos a todo el territorio nacional. El costo y tiempo de entrega varía según la ubicación. Consulta con nuestro equipo.",
      order: 5,
    },
    
    {
      question: "¿Los triciclos eléctricos son adecuados para uso comercial?",
      answer: "Absolutamente. Nuestros triciclos eléctricos están diseñados para uso comercial e industrial, con capacidades de carga de hasta 500 kg según el modelo.",
      order: 6,
    },
    {
      question: "¿Cuentan con servicio técnico post-venta?",
      answer: "Si contamos con Servicio técnico en el local, sin embargo no contamos con servicio técnico a domicilio",
      order: 7,
    },
  ];

  for (const faq of faqs) {
    await prisma.fAQ.upsert({
      where: { id: `faq-${faq.order}` },
      update: {},
      create: { id: `faq-${faq.order}`, ...faq },
    });
  }

  // Products - Scooters
  await prisma.product.upsert({
    where: { slug: "liwei-s1-pro" },
    update: {},
    create: {
      name: "Liwei S1 Pro",
      slug: "liwei-s1-pro",
      description: "Scooter eléctrico de alto rendimiento para uso urbano. Motor de 1500W, batería de litio de 72V 20Ah y autonomía de hasta 70 km.",
      price: 1899,
      featured: true,
      available: true,
      categoryId: scooters.id,
      images: {
        create: [
          { url: "/images/placeholder-scooter-1.jpg", alt: "Liwei S1 Pro", order: 0 },
        ],
      },
      colors: {
        create: [
          { name: "Negro", hex: "#1a1a1a" },
          { name: "Azul", hex: "#1e40af" },
          { name: "Blanco", hex: "#f5f5f5" },
        ],
      },
      specs: {
        create: [
          { label: "Motor", value: "1500W BLDC" },
          { label: "Batería", value: "72V 20Ah Litio" },
          { label: "Autonomía", value: "70 km" },
          { label: "Velocidad máx.", value: "60 km/h" },
          { label: "Carga máx.", value: "150 kg" },
          { label: "Peso", value: "45 kg" },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: "liwei-s2-urban" },
    update: {},
    create: {
      name: "Liwei S2 Urban",
      slug: "liwei-s2-urban",
      description: "Scooter eléctrico compacto ideal para desplazamientos diarios en la ciudad. Ligero, ágil y con gran autonomía.",
      price: 1299,
      featured: true,
      available: true,
      categoryId: scooters.id,
      images: {
        create: [
          { url: "/images/placeholder-scooter-2.jpg", alt: "Liwei S2 Urban", order: 0 },
        ],
      },
      colors: {
        create: [
          { name: "Negro", hex: "#1a1a1a" },
          { name: "Azul marino", hex: "#172554" },
        ],
      },
      specs: {
        create: [
          { label: "Motor", value: "1000W BLDC" },
          { label: "Batería", value: "60V 18Ah Litio" },
          { label: "Autonomía", value: "55 km" },
          { label: "Velocidad máx.", value: "50 km/h" },
          { label: "Carga máx.", value: "120 kg" },
          { label: "Peso", value: "38 kg" },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: "liwei-s3-cargo" },
    update: {},
    create: {
      name: "Liwei S3 Cargo",
      slug: "liwei-s3-cargo",
      description: "Scooter eléctrico con porta-equipaje trasero reforzado. Ideal para delivery y reparto de última milla.",
      price: 1599,
      featured: false,
      available: true,
      categoryId: scooters.id,
      images: {
        create: [
          { url: "/images/placeholder-scooter-3.jpg", alt: "Liwei S3 Cargo", order: 0 },
        ],
      },
      colors: {
        create: [
          { name: "Negro", hex: "#1a1a1a" },
          { name: "Blanco", hex: "#f5f5f5" },
        ],
      },
      specs: {
        create: [
          { label: "Motor", value: "1200W BLDC" },
          { label: "Batería", value: "72V 22Ah Litio" },
          { label: "Autonomía", value: "60 km" },
          { label: "Velocidad máx.", value: "55 km/h" },
          { label: "Carga máx.", value: "200 kg" },
          { label: "Peso", value: "52 kg" },
        ],
      },
    },
  });

  // Products - Tricycles
  await prisma.product.upsert({
    where: { slug: "liwei-t1-cargo" },
    update: {},
    create: {
      name: "Liwei T1 Cargo",
      slug: "liwei-t1-cargo",
      description: "Triciclo eléctrico de carga para uso comercial. Plataforma de carga trasera amplia, ideal para pymes y reparto urbano.",
      price: 3499,
      featured: true,
      available: true,
      categoryId: tricycles.id,
      images: {
        create: [
          { url: "/images/placeholder-trike-1.jpg", alt: "Liwei T1 Cargo", order: 0 },
        ],
      },
      colors: {
        create: [
          { name: "Azul", hex: "#1e40af" },
          { name: "Blanco", hex: "#f5f5f5" },
          { name: "Naranja", hex: "#ea580c" },
        ],
      },
      specs: {
        create: [
          { label: "Motor", value: "2000W BLDC" },
          { label: "Batería", value: "72V 30Ah Litio" },
          { label: "Autonomía", value: "80 km" },
          { label: "Velocidad máx.", value: "40 km/h" },
          { label: "Carga máx.", value: "500 kg" },
          { label: "Dimensión caja", value: "120 x 80 cm" },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: "liwei-t2-passenger" },
    update: {},
    create: {
      name: "Liwei T2 Passenger",
      slug: "liwei-t2-passenger",
      description: "Triciclo eléctrico con cabina para pasajero. Ideal para servicios de transporte corto, turismo o movilidad de personas mayores.",
      price: 4299,
      featured: true,
      available: true,
      categoryId: tricycles.id,
      images: {
        create: [
          { url: "/images/placeholder-trike-2.jpg", alt: "Liwei T2 Passenger", order: 0 },
        ],
      },
      colors: {
        create: [
          { name: "Blanco", hex: "#f5f5f5" },
          { name: "Azul", hex: "#1e40af" },
        ],
      },
      specs: {
        create: [
          { label: "Motor", value: "2500W BLDC" },
          { label: "Batería", value: "72V 40Ah Litio" },
          { label: "Autonomía", value: "100 km" },
          { label: "Velocidad máx.", value: "45 km/h" },
          { label: "Pasajeros", value: "1-2 personas" },
          { label: "Techo", value: "Incluido" },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: "liwei-t3-flatbed" },
    update: {},
    create: {
      name: "Liwei T3 Flatbed",
      slug: "liwei-t3-flatbed",
      description: "Triciclo de plataforma plana para transporte de materiales de construcción, agricultura o logística industrial.",
      price: 3999,
      featured: false,
      available: true,
      categoryId: tricycles.id,
      images: {
        create: [
          { url: "/images/placeholder-trike-3.jpg", alt: "Liwei T3 Flatbed", order: 0 },
        ],
      },
      colors: {
        create: [
          { name: "Gris", hex: "#6b7280" },
          { name: "Amarillo", hex: "#eab308" },
        ],
      },
      specs: {
        create: [
          { label: "Motor", value: "3000W BLDC" },
          { label: "Batería", value: "72V 50Ah Litio" },
          { label: "Autonomía", value: "70 km" },
          { label: "Velocidad máx.", value: "35 km/h" },
          { label: "Carga máx.", value: "800 kg" },
          { label: "Plataforma", value: "160 x 100 cm" },
        ],
      },
    },
  });

  console.log("✅ Seed completado exitosamente");
  console.log("📧 Admin: admin@liweimotors.com");
  console.log("🔑 Password: admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

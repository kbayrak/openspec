import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create or reuse demo business
  const existingBusiness = await prisma.business.findUnique({
    where: { slug: 'demo-cafe' },
  });

  const demoBusiness = existingBusiness
    ? existingBusiness
    : await prisma.business.create({
        data: {
          name: 'Demo Café',
          slug: 'demo-cafe',
          defaultLanguage: 'en',
          logo: null,
          qrCodeSvg: null,
        },
      });

  console.log('Demo business ready:', demoBusiness.name);

  // Create or update demo user (owner)
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const existingUser = await prisma.user.findUnique({
    where: { email: 'owner@democafe.com' },
  });

  const demoUser = existingUser
    ? await prisma.user.update({
        where: { email: 'owner@democafe.com' },
        data: {
          passwordHash,
          businessId: demoBusiness.id,
          role: 'owner',
          emailVerified: new Date(),
        },
      })
    : await prisma.user.create({
        data: {
          email: 'owner@democafe.com',
          passwordHash,
          role: 'owner',
          businessId: demoBusiness.id,
          emailVerified: new Date(),
        },
      });

  console.log('Demo user ready:', demoUser.email);

  // Create demo categories
  const beveragesCategory =
    (await prisma.category.findFirst({
      where: { businessId: demoBusiness.id, name: 'Beverages' },
    })) ??
    (await prisma.category.create({
      data: {
        name: 'Beverages',
        order: 1,
        businessId: demoBusiness.id,
        translations: {
          en: { name: 'Beverages' },
          tr: { name: 'İçecekler' },
        },
      },
    }));

  const foodCategory =
    (await prisma.category.findFirst({
      where: { businessId: demoBusiness.id, name: 'Food' },
    })) ??
    (await prisma.category.create({
      data: {
        name: 'Food',
        order: 2,
        businessId: demoBusiness.id,
        translations: {
          en: { name: 'Food' },
          tr: { name: 'Yemekler' },
        },
      },
    }));

  const dessertsCategory =
    (await prisma.category.findFirst({
      where: { businessId: demoBusiness.id, name: 'Desserts' },
    })) ??
    (await prisma.category.create({
      data: {
        name: 'Desserts',
        order: 3,
        businessId: demoBusiness.id,
        translations: {
          en: { name: 'Desserts' },
          tr: { name: 'Tatlılar' },
        },
      },
    }));

  console.log('Created demo categories');

  // Create demo products
  const productSeeds = [
    {
      name: 'Espresso',
      description: 'Rich and bold espresso shot',
      price: 3.5,
      categoryId: beveragesCategory.id,
      isActive: true,
    },
    {
      name: 'Cappuccino',
      description: 'Espresso with steamed milk and foam',
      price: 4.5,
      categoryId: beveragesCategory.id,
      isActive: true,
    },
    {
      name: 'Croissant',
      description: 'Buttery and flaky French pastry',
      price: 3.0,
      categoryId: foodCategory.id,
      isActive: true,
    },
    {
      name: 'Chocolate Cake',
      description: 'Rich chocolate cake with ganache',
      price: 5.5,
      categoryId: dessertsCategory.id,
      isActive: true,
    },
  ];

  for (const product of productSeeds) {
    const exists = await prisma.product.findFirst({
      where: {
        name: product.name,
        categoryId: product.categoryId,
      },
    });

    if (!exists) {
      await prisma.product.create({ data: product });
    }
  }

  console.log('Demo products ready');
  console.log('Demo login: owner@democafe.com / Password123!');
  console.log('Menu URL: http://localhost:3000/menu/demo-cafe');
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

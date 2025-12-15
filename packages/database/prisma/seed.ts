import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Utility: Simple password hashing using SHA-256 (bcrypt would be used in the
// real auth service, but we avoid the native dependency here for seeding).
// In production the API layer hashes passwords with bcrypt/argon2 before
// storing them.  The seed password below is only for initial super-admin
// access and MUST be changed on first login.
// ---------------------------------------------------------------------------
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// ---------------------------------------------------------------------------
// Seed: Super Admin User
// ---------------------------------------------------------------------------
async function seedAdminUser() {
  console.log('Seeding super admin user...');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@shopbd.com' },
    update: {},
    create: {
      email: 'admin@shopbd.com',
      password: hashPassword('Admin@ShopBD2025!'),
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+8801700000000',
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
    },
  });

  console.log(`  Created admin: ${admin.email} (${admin.id})`);
  return admin;
}

// ---------------------------------------------------------------------------
// Seed: Categories with Bengali names and hierarchy
// ---------------------------------------------------------------------------
interface CategorySeed {
  name: string;
  nameBn: string;
  slug: string;
  icon?: string;
  description?: string;
  descriptionBn?: string;
  children?: Omit<CategorySeed, 'children'>[];
}

const CATEGORIES: CategorySeed[] = [
  {
    name: 'Electronics',
    nameBn: 'ইলেকট্রনিক্স',
    slug: 'electronics',
    icon: 'Cpu',
    description: 'Gadgets, devices & accessories',
    descriptionBn: 'গ্যাজেট, ডিভাইস ও আনুষাঙ্গিক',
    children: [
      { name: 'Smartphones', nameBn: 'স্মার্টফোন', slug: 'smartphones', icon: 'Smartphone' },
      { name: 'Laptops', nameBn: 'ল্যাপটপ', slug: 'laptops', icon: 'Laptop' },
      { name: 'Tablets', nameBn: 'ট্যাবলেট', slug: 'tablets', icon: 'Tablet' },
      { name: 'Headphones', nameBn: 'হেডফোন', slug: 'headphones', icon: 'Headphones' },
      { name: 'Smart Watches', nameBn: 'স্মার্ট ওয়াচ', slug: 'smart-watches', icon: 'Watch' },
      { name: 'Cameras', nameBn: 'ক্যামেরা', slug: 'cameras', icon: 'Camera' },
    ],
  },
  {
    name: 'Fashion',
    nameBn: 'ফ্যাশন',
    slug: 'fashion',
    icon: 'Shirt',
    description: 'Clothing, shoes & accessories for men and women',
    descriptionBn: 'পুরুষ ও নারীদের জন্য পোশাক, জুতা ও আনুষাঙ্গিক',
    children: [
      { name: "Men's Clothing", nameBn: 'পুরুষদের পোশাক', slug: 'mens-clothing' },
      { name: "Women's Clothing", nameBn: 'নারীদের পোশাক', slug: 'womens-clothing' },
      { name: 'Shoes', nameBn: 'জুতা', slug: 'shoes' },
      { name: 'Bags', nameBn: 'ব্যাগ', slug: 'bags' },
      { name: 'Jewelry', nameBn: 'গহনা', slug: 'jewelry' },
    ],
  },
  {
    name: 'Home & Living',
    nameBn: 'হোম ও লিভিং',
    slug: 'home-living',
    icon: 'Home',
    description: 'Furniture, decor & household essentials',
    descriptionBn: 'আসবাবপত্র, সাজসজ্জা ও গৃহস্থালি প্রয়োজনীয়তা',
    children: [
      { name: 'Furniture', nameBn: 'আসবাবপত্র', slug: 'furniture' },
      { name: 'Home Decor', nameBn: 'হোম ডেকর', slug: 'home-decor' },
      { name: 'Kitchen & Dining', nameBn: 'রান্নাঘর ও ডাইনিং', slug: 'kitchen-dining' },
      { name: 'Bedding', nameBn: 'বিছানাপত্র', slug: 'bedding' },
    ],
  },
  {
    name: 'Beauty & Health',
    nameBn: 'বিউটি ও হেলথ',
    slug: 'beauty-health',
    icon: 'Heart',
    description: 'Skincare, makeup & wellness products',
    descriptionBn: 'স্কিনকেয়ার, মেকআপ ও সুস্থতা পণ্য',
    children: [
      { name: 'Skincare', nameBn: 'স্কিনকেয়ার', slug: 'skincare' },
      { name: 'Makeup', nameBn: 'মেকআপ', slug: 'makeup' },
      { name: 'Hair Care', nameBn: 'হেয়ার কেয়ার', slug: 'hair-care' },
      { name: 'Personal Care', nameBn: 'পার্সোনাল কেয়ার', slug: 'personal-care' },
    ],
  },
  {
    name: 'Groceries',
    nameBn: 'মুদি দোকান',
    slug: 'groceries',
    icon: 'ShoppingBasket',
    description: 'Daily essentials, food & beverages',
    descriptionBn: 'দৈনন্দিন প্রয়োজনীয়তা, খাদ্য ও পানীয়',
    children: [
      { name: 'Rice & Flour', nameBn: 'চাল ও আটা', slug: 'rice-flour' },
      { name: 'Spices', nameBn: 'মশলা', slug: 'spices' },
      { name: 'Snacks', nameBn: 'স্ন্যাকস', slug: 'snacks' },
      { name: 'Beverages', nameBn: 'পানীয়', slug: 'beverages' },
    ],
  },
  {
    name: 'Baby & Kids',
    nameBn: 'বেবি ও কিডস',
    slug: 'baby-kids',
    icon: 'Baby',
    description: 'Everything for babies, toddlers & children',
    descriptionBn: 'শিশু, ছোটদের ও বাচ্চাদের জন্য সবকিছু',
    children: [
      { name: 'Diapers & Wipes', nameBn: 'ডায়াপার ও ওয়াইপস', slug: 'diapers-wipes' },
      { name: 'Baby Food', nameBn: 'বেবি ফুড', slug: 'baby-food' },
      { name: 'Toys', nameBn: 'খেলনা', slug: 'toys' },
    ],
  },
  {
    name: 'Sports & Outdoors',
    nameBn: 'স্পোর্টস ও আউটডোর',
    slug: 'sports-outdoors',
    icon: 'Dumbbell',
    description: 'Fitness equipment, sportswear & outdoor gear',
    descriptionBn: 'ফিটনেস সরঞ্জাম, স্পোর্টসওয়্যার ও আউটডোর গিয়ার',
  },
  {
    name: 'Books & Stationery',
    nameBn: 'বই ও স্টেশনারি',
    slug: 'books-stationery',
    icon: 'BookOpen',
    description: 'Books, notebooks, pens & office supplies',
    descriptionBn: 'বই, নোটবুক, কলম ও অফিস সরবরাহ',
  },
  {
    name: 'Automotive',
    nameBn: 'অটোমোটিভ',
    slug: 'automotive',
    icon: 'Car',
    description: 'Car & motorcycle parts, accessories & care',
    descriptionBn: 'গাড়ি ও মোটরসাইকেল যন্ত্রাংশ, আনুষাঙ্গিক ও যত্ন',
  },
  {
    name: 'Pets',
    nameBn: 'পোষা প্রাণী',
    slug: 'pets',
    icon: 'PawPrint',
    description: 'Pet food, accessories & supplies',
    descriptionBn: 'পোষা প্রাণীর খাবার, আনুষাঙ্গিক ও সরবরাহ',
  },
];

async function seedCategories() {
  console.log('Seeding categories...');
  let count = 0;

  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];

    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        nameBn: cat.nameBn,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
        descriptionBn: cat.descriptionBn,
        sortOrder: i,
        isActive: true,
      },
    });
    count++;

    if (cat.children) {
      for (let j = 0; j < cat.children.length; j++) {
        const child = cat.children[j];
        await prisma.category.upsert({
          where: { slug: child.slug },
          update: {},
          create: {
            name: child.name,
            nameBn: child.nameBn,
            slug: child.slug,
            icon: child.icon,
            parentId: parent.id,
            sortOrder: j,
            isActive: true,
          },
        });
        count++;
      }
    }
  }

  console.log(`  Seeded ${count} categories`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('Starting database seed...\n');

  await seedAdminUser();
  await seedCategories();

  console.log('\nSeed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

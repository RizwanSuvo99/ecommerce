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

// ---------------------------------------------------------------------------
// Seed: Brands
// ---------------------------------------------------------------------------
interface BrandSeed {
  name: string;
  nameBn?: string;
  slug: string;
  logo?: string;
  website?: string;
}

const BRANDS: BrandSeed[] = [
  { name: 'Samsung', nameBn: 'স্যামসাং', slug: 'samsung', website: 'https://samsung.com/bd' },
  { name: 'Walton', nameBn: 'ওয়ালটন', slug: 'walton', website: 'https://waltonbd.com' },
  { name: 'Symphony', nameBn: 'সিম্ফনি', slug: 'symphony', website: 'https://symphony-mobile.com' },
  { name: 'Xiaomi', nameBn: 'শাওমি', slug: 'xiaomi', website: 'https://mi.com/bd' },
  { name: 'Apple', nameBn: 'অ্যাপল', slug: 'apple', website: 'https://apple.com' },
  { name: 'Realme', nameBn: 'রিয়েলমি', slug: 'realme', website: 'https://realme.com/bd' },
  { name: 'HP', slug: 'hp', website: 'https://hp.com' },
  { name: 'Lenovo', nameBn: 'লেনোভো', slug: 'lenovo', website: 'https://lenovo.com' },
  { name: 'Apex', nameBn: 'এপেক্স', slug: 'apex', website: 'https://apexadelchi.com' },
  { name: 'Bata', nameBn: 'বাটা', slug: 'bata', website: 'https://bata.com.bd' },
  { name: 'Aarong', nameBn: 'আড়ং', slug: 'aarong', website: 'https://aarong.com' },
  { name: 'Yellow', nameBn: 'ইয়েলো', slug: 'yellow', website: 'https://yellowclothing.com' },
  { name: 'RFL', nameBn: 'আরএফএল', slug: 'rfl', website: 'https://rfleshop.com' },
  { name: 'Pran', nameBn: 'প্রাণ', slug: 'pran', website: 'https://pranfoods.net' },
  { name: 'ACI', nameBn: 'এসিআই', slug: 'aci', website: 'https://aci-bd.com' },
  { name: 'Unilever', nameBn: 'ইউনিলিভার', slug: 'unilever', website: 'https://unilever.com.bd' },
  { name: 'JBL', slug: 'jbl', website: 'https://jbl.com' },
  { name: 'Sony', nameBn: 'সনি', slug: 'sony', website: 'https://sony.com.bd' },
  { name: 'Vivo', nameBn: 'ভিভো', slug: 'vivo', website: 'https://vivo.com/bd' },
  { name: 'OPPO', nameBn: 'অপো', slug: 'oppo', website: 'https://oppo.com/bd' },
];

async function seedBrands() {
  console.log('Seeding brands...');
  const brandMap: Record<string, string> = {};

  for (const b of BRANDS) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: {
        name: b.name,
        nameBn: b.nameBn,
        slug: b.slug,
        logo: b.logo ?? `https://cdn.shopbd.com/brands/${b.slug}.png`,
        website: b.website,
        isActive: true,
      },
    });
    brandMap[b.slug] = brand.id;
  }

  console.log(`  Seeded ${BRANDS.length} brands`);
  return brandMap;
}

// ---------------------------------------------------------------------------
// Seed: Sample Products
// ---------------------------------------------------------------------------
interface ProductSeed {
  name: string;
  nameBn?: string;
  slug: string;
  description: string;
  descriptionBn?: string;
  shortDescription?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  quantity: number;
  categorySlug: string;
  brandSlug?: string;
  tags: string[];
  isFeatured: boolean;
  weight?: number;
  images: string[];
  variants?: Array<{
    name: string;
    sku: string;
    price: number;
    quantity: number;
  }>;
}

const PRODUCTS: ProductSeed[] = [
  {
    name: 'Samsung Galaxy A55 5G',
    nameBn: 'স্যামসাং গ্যালাক্সি এ৫৫ ৫জি',
    slug: 'samsung-galaxy-a55-5g',
    description: 'Samsung Galaxy A55 5G features a 6.6" Super AMOLED display, Exynos 1480 processor, 50MP triple camera system, 5000mAh battery with 25W fast charging. Water resistant with IP67 rating.',
    descriptionBn: 'স্যামসাং গ্যালাক্সি এ৫৫ ৫জি-তে রয়েছে ৬.৬" সুপার অ্যামোলেড ডিসপ্লে, এক্সিনোস ১৪৮০ প্রসেসর, ৫০MP ট্রিপল ক্যামেরা সিস্টেম, ৫০০০mAh ব্যাটারি।',
    shortDescription: '6.6" AMOLED, Exynos 1480, 50MP Camera, 5000mAh',
    sku: 'SAM-A55-5G-001',
    price: 42999,
    compareAtPrice: 47999,
    costPrice: 36000,
    quantity: 150,
    categorySlug: 'smartphones',
    brandSlug: 'samsung',
    tags: ['5g', 'samsung', 'galaxy', 'smartphone', 'amoled'],
    isFeatured: true,
    weight: 0.213,
    images: [
      'https://cdn.shopbd.com/products/samsung-a55-1.jpg',
      'https://cdn.shopbd.com/products/samsung-a55-2.jpg',
      'https://cdn.shopbd.com/products/samsung-a55-3.jpg',
    ],
    variants: [
      { name: '8GB/128GB - Awesome Iceblue', sku: 'SAM-A55-128-ICE', price: 42999, quantity: 50 },
      { name: '8GB/256GB - Awesome Lilac', sku: 'SAM-A55-256-LIL', price: 46999, quantity: 40 },
      { name: '8GB/256GB - Awesome Navy', sku: 'SAM-A55-256-NAV', price: 46999, quantity: 60 },
    ],
  },
  {
    name: 'Xiaomi Redmi Note 13 Pro',
    nameBn: 'শাওমি রেডমি নোট ১৩ প্রো',
    slug: 'xiaomi-redmi-note-13-pro',
    description: 'Redmi Note 13 Pro with 200MP main camera, 6.67" AMOLED 120Hz display, Snapdragon 7s Gen 2 chipset, 5100mAh battery with 67W turbo charging.',
    shortDescription: '200MP Camera, 120Hz AMOLED, Snapdragon 7s Gen 2',
    sku: 'XIA-RN13P-001',
    price: 31999,
    compareAtPrice: 35999,
    costPrice: 26000,
    quantity: 200,
    categorySlug: 'smartphones',
    brandSlug: 'xiaomi',
    tags: ['xiaomi', 'redmi', 'smartphone', '200mp', 'amoled'],
    isFeatured: true,
    weight: 0.187,
    images: [
      'https://cdn.shopbd.com/products/redmi-note13pro-1.jpg',
      'https://cdn.shopbd.com/products/redmi-note13pro-2.jpg',
    ],
  },
  {
    name: 'Walton Primo R9 Max',
    nameBn: 'ওয়ালটন প্রিমো আর৯ ম্যাক্স',
    slug: 'walton-primo-r9-max',
    description: 'Walton Primo R9 Max — made in Bangladesh. 6.78" IPS display, 108MP AI camera, 6000mAh massive battery, 8GB RAM + 128GB storage. Dual SIM with dedicated SD card slot.',
    descriptionBn: 'ওয়ালটন প্রিমো আর৯ ম্যাক্স — বাংলাদেশে তৈরি। ৬.৭৮" আইপিএস ডিসপ্লে, ১০৮MP এআই ক্যামেরা, ৬০০০mAh ব্যাটারি।',
    shortDescription: 'Made in BD, 108MP, 6000mAh, 8GB RAM',
    sku: 'WAL-PR9M-001',
    price: 17999,
    compareAtPrice: 19999,
    costPrice: 14500,
    quantity: 300,
    categorySlug: 'smartphones',
    brandSlug: 'walton',
    tags: ['walton', 'smartphone', 'made-in-bangladesh', 'budget'],
    isFeatured: true,
    weight: 0.210,
    images: [
      'https://cdn.shopbd.com/products/walton-primo-r9-1.jpg',
    ],
  },
  {
    name: 'HP Pavilion 15 Laptop',
    nameBn: 'এইচপি প্যাভিলিয়ন ১৫ ল্যাপটপ',
    slug: 'hp-pavilion-15-laptop',
    description: 'HP Pavilion 15 with 13th Gen Intel Core i5-1335U, 15.6" FHD IPS display, 8GB DDR4, 512GB NVMe SSD, Intel Iris Xe Graphics. Windows 11 Home. Ideal for work and study.',
    shortDescription: 'i5-13th Gen, 8GB RAM, 512GB SSD, 15.6" FHD',
    sku: 'HP-PAV15-I5-001',
    price: 68999,
    compareAtPrice: 75999,
    costPrice: 58000,
    quantity: 45,
    categorySlug: 'laptops',
    brandSlug: 'hp',
    tags: ['hp', 'laptop', 'intel', 'i5', 'pavilion'],
    isFeatured: true,
    weight: 1.74,
    images: [
      'https://cdn.shopbd.com/products/hp-pavilion15-1.jpg',
      'https://cdn.shopbd.com/products/hp-pavilion15-2.jpg',
    ],
    variants: [
      { name: 'i5/8GB/512GB SSD', sku: 'HP-PAV15-I5-8-512', price: 68999, quantity: 25 },
      { name: 'i7/16GB/512GB SSD', sku: 'HP-PAV15-I7-16-512', price: 89999, quantity: 20 },
    ],
  },
  {
    name: 'Lenovo IdeaPad Slim 3',
    nameBn: 'লেনোভো আইডিয়াপ্যাড স্লিম ৩',
    slug: 'lenovo-ideapad-slim-3',
    description: 'Lenovo IdeaPad Slim 3 with AMD Ryzen 5 7520U, 15.6" FHD display, 8GB RAM, 512GB SSD, integrated Radeon graphics. Lightweight at 1.63kg with up to 10 hours battery life.',
    shortDescription: 'Ryzen 5, 8GB, 512GB SSD, Ultra-light 1.63kg',
    sku: 'LEN-IPS3-R5-001',
    price: 56999,
    compareAtPrice: 62000,
    costPrice: 47000,
    quantity: 60,
    categorySlug: 'laptops',
    brandSlug: 'lenovo',
    tags: ['lenovo', 'laptop', 'amd', 'ryzen5', 'lightweight'],
    isFeatured: false,
    weight: 1.63,
    images: [
      'https://cdn.shopbd.com/products/lenovo-slim3-1.jpg',
    ],
  },
  {
    name: 'JBL Tune 760NC Headphones',
    nameBn: 'জেবিএল টিউন ৭৬০এনসি হেডফোন',
    slug: 'jbl-tune-760nc-headphones',
    description: 'JBL Tune 760NC wireless over-ear headphones with Active Noise Cancelling, JBL Pure Bass Sound, 50 hours of battery life, multi-point connection, lightweight and foldable design.',
    shortDescription: 'ANC, 50hr Battery, JBL Pure Bass, Foldable',
    sku: 'JBL-T760NC-001',
    price: 8999,
    compareAtPrice: 11999,
    costPrice: 6500,
    quantity: 120,
    categorySlug: 'headphones',
    brandSlug: 'jbl',
    tags: ['jbl', 'headphones', 'anc', 'wireless', 'bluetooth'],
    isFeatured: true,
    weight: 0.250,
    images: [
      'https://cdn.shopbd.com/products/jbl-tune760nc-1.jpg',
      'https://cdn.shopbd.com/products/jbl-tune760nc-2.jpg',
    ],
    variants: [
      { name: 'Black', sku: 'JBL-T760NC-BLK', price: 8999, quantity: 40 },
      { name: 'Blue', sku: 'JBL-T760NC-BLU', price: 8999, quantity: 40 },
      { name: 'White', sku: 'JBL-T760NC-WHT', price: 8999, quantity: 40 },
    ],
  },
  {
    name: 'Aarong Handloom Cotton Saree',
    nameBn: 'আড়ং হ্যান্ডলুম কটন শাড়ি',
    slug: 'aarong-handloom-cotton-saree',
    description: 'Authentic Bangladeshi handloom cotton saree from Aarong. Traditional jamdani-inspired weave with contemporary design. 6.5 yards with blouse piece. Perfect for everyday elegance.',
    descriptionBn: 'আড়ং-এর খাঁটি বাংলাদেশী হ্যান্ডলুম কটন শাড়ি। ঐতিহ্যবাহী জামদানি-অনুপ্রাণিত বুনন সমসাময়িক ডিজাইনে।',
    shortDescription: 'Handloom cotton, jamdani weave, 6.5 yards',
    sku: 'ARG-SAREE-HLC-001',
    price: 3500,
    compareAtPrice: 4200,
    costPrice: 2200,
    quantity: 80,
    categorySlug: 'womens-clothing',
    brandSlug: 'aarong',
    tags: ['aarong', 'saree', 'handloom', 'cotton', 'jamdani', 'traditional'],
    isFeatured: true,
    weight: 0.450,
    images: [
      'https://cdn.shopbd.com/products/aarong-saree-1.jpg',
      'https://cdn.shopbd.com/products/aarong-saree-2.jpg',
    ],
  },
  {
    name: 'Bata Comfit Formal Shoes',
    nameBn: 'বাটা কমফিট ফর্মাল শু',
    slug: 'bata-comfit-formal-shoes',
    description: 'Bata Comfit formal leather shoes for men. Genuine leather upper with memory foam insole for all-day comfort. Anti-slip rubber sole. Perfect for office and formal events.',
    shortDescription: 'Genuine leather, memory foam, anti-slip sole',
    sku: 'BAT-CMF-FORM-001',
    price: 4599,
    compareAtPrice: 5499,
    costPrice: 3200,
    quantity: 100,
    categorySlug: 'shoes',
    brandSlug: 'bata',
    tags: ['bata', 'shoes', 'formal', 'leather', 'mens'],
    isFeatured: false,
    weight: 0.800,
    images: [
      'https://cdn.shopbd.com/products/bata-comfit-1.jpg',
    ],
    variants: [
      { name: 'Size 40 - Black', sku: 'BAT-CMF-40-BLK', price: 4599, quantity: 20 },
      { name: 'Size 41 - Black', sku: 'BAT-CMF-41-BLK', price: 4599, quantity: 25 },
      { name: 'Size 42 - Black', sku: 'BAT-CMF-42-BLK', price: 4599, quantity: 30 },
      { name: 'Size 43 - Brown', sku: 'BAT-CMF-43-BRN', price: 4599, quantity: 25 },
    ],
  },
  {
    name: 'Yellow Premium Panjabi',
    nameBn: 'ইয়েলো প্রিমিয়াম পাঞ্জাবি',
    slug: 'yellow-premium-panjabi',
    description: 'Premium cotton panjabi from Yellow. Intricate embroidery on collar and cuffs, slim fit design. Available in multiple colors. Perfect for Eid, weddings, and festive occasions.',
    descriptionBn: 'ইয়েলো-এর প্রিমিয়াম কটন পাঞ্জাবি। কলার ও কাফে সূক্ষ্ম এমব্রয়ডারি, স্লিম ফিট ডিজাইন।',
    shortDescription: 'Premium cotton, embroidered, slim fit',
    sku: 'YLW-PNJ-PRM-001',
    price: 2800,
    compareAtPrice: 3500,
    costPrice: 1600,
    quantity: 150,
    categorySlug: 'mens-clothing',
    brandSlug: 'yellow',
    tags: ['yellow', 'panjabi', 'eid', 'traditional', 'cotton'],
    isFeatured: true,
    weight: 0.350,
    images: [
      'https://cdn.shopbd.com/products/yellow-panjabi-1.jpg',
      'https://cdn.shopbd.com/products/yellow-panjabi-2.jpg',
    ],
    variants: [
      { name: 'M - White', sku: 'YLW-PNJ-M-WHT', price: 2800, quantity: 30 },
      { name: 'L - White', sku: 'YLW-PNJ-L-WHT', price: 2800, quantity: 40 },
      { name: 'XL - Off-White', sku: 'YLW-PNJ-XL-OWH', price: 2800, quantity: 40 },
      { name: 'XXL - Navy', sku: 'YLW-PNJ-XXL-NAV', price: 2800, quantity: 40 },
    ],
  },
  {
    name: 'RFL Premium Dinner Set 36 Pcs',
    nameBn: 'আরএফএল প্রিমিয়াম ডিনার সেট ৩৬ পিস',
    slug: 'rfl-premium-dinner-set-36pcs',
    description: 'RFL Premium melamine dinner set, 36 pieces. Includes dinner plates, side plates, bowls, serving bowls, serving spoons, and platter. Microwave safe, BPA free. Elegant floral design.',
    shortDescription: '36 pcs melamine, microwave safe, BPA free',
    sku: 'RFL-DNS-36-001',
    price: 2999,
    compareAtPrice: 3699,
    costPrice: 2100,
    quantity: 75,
    categorySlug: 'kitchen-dining',
    brandSlug: 'rfl',
    tags: ['rfl', 'dinner-set', 'melamine', 'kitchen', 'dining'],
    isFeatured: false,
    weight: 3.5,
    images: [
      'https://cdn.shopbd.com/products/rfl-dinner-set-1.jpg',
    ],
  },
  {
    name: 'Apex Cotton Bedsheet King Size',
    nameBn: 'এপেক্স কটন বেডশিট কিং সাইজ',
    slug: 'apex-cotton-bedsheet-king',
    description: 'Apex 100% cotton bedsheet set for king-size beds. Includes 1 fitted sheet, 1 flat sheet, and 2 pillow covers. 300 thread count, wrinkle-resistant, soft & breathable.',
    shortDescription: '100% cotton, 300TC, king size, 4 pcs set',
    sku: 'APX-BED-KING-001',
    price: 2200,
    compareAtPrice: 2800,
    costPrice: 1400,
    quantity: 90,
    categorySlug: 'bedding',
    brandSlug: 'apex',
    tags: ['apex', 'bedsheet', 'cotton', 'king-size', 'bedding'],
    isFeatured: false,
    weight: 1.2,
    images: [
      'https://cdn.shopbd.com/products/apex-bedsheet-king-1.jpg',
    ],
  },
  {
    name: 'Unilever Dove Skincare Gift Set',
    nameBn: 'ইউনিলিভার ডাভ স্কিনকেয়ার গিফট সেট',
    slug: 'dove-skincare-gift-set',
    description: 'Dove skincare gift set with body wash 250ml, body lotion 250ml, beauty bar 100g x2, and deodorant 150ml. Gentle formula with 1/4 moisturizing cream. Perfect gift for her.',
    shortDescription: '5-piece set: body wash, lotion, soap, deo',
    sku: 'UNI-DOVE-GFT-001',
    price: 1599,
    compareAtPrice: 2100,
    costPrice: 1050,
    quantity: 200,
    categorySlug: 'skincare',
    brandSlug: 'unilever',
    tags: ['dove', 'skincare', 'gift-set', 'moisturizing', 'beauty'],
    isFeatured: false,
    weight: 0.950,
    images: [
      'https://cdn.shopbd.com/products/dove-gift-set-1.jpg',
    ],
  },
  {
    name: 'Pran Aromatic Chinigura Rice 5kg',
    nameBn: 'প্রাণ অ্যারোমেটিক চিনিগুড়া চাল ৫কেজি',
    slug: 'pran-chinigura-rice-5kg',
    description: 'Premium aromatic Chinigura rice from Pran. Sourced from the finest paddies of Bangladesh. Small grain, naturally fragrant. Perfect for special rice dishes like polao and biriyani.',
    descriptionBn: 'প্রাণ-এর প্রিমিয়াম সুগন্ধি চিনিগুড়া চাল। বাংলাদেশের সেরা ধান থেকে সংগৃহীত। পোলাও ও বিরিয়ানির জন্য আদর্শ।',
    shortDescription: 'Premium chinigura, 5kg, naturally aromatic',
    sku: 'PRN-RICE-CG-5KG',
    price: 850,
    compareAtPrice: 950,
    costPrice: 650,
    quantity: 500,
    categorySlug: 'rice-flour',
    brandSlug: 'pran',
    tags: ['pran', 'rice', 'chinigura', 'aromatic', 'premium'],
    isFeatured: false,
    weight: 5.0,
    images: [
      'https://cdn.shopbd.com/products/pran-chinigura-5kg-1.jpg',
    ],
  },
  {
    name: 'ACI Pure Turmeric Powder 200g',
    nameBn: 'এসিআই পিওর হলুদ গুঁড়া ২০০গ্রাম',
    slug: 'aci-pure-turmeric-200g',
    description: 'ACI Pure turmeric powder, 100% natural with no artificial colors or preservatives. Lab tested for quality and purity. Essential spice for Bangladeshi cooking.',
    descriptionBn: 'এসিআই পিওর হলুদ গুঁড়া, ১০০% প্রাকৃতিক। কোনো কৃত্রিম রঙ বা প্রিজারভেটিভ নেই। বাংলাদেশী রান্নার অপরিহার্য মশলা।',
    shortDescription: '100% natural, no preservatives, 200g',
    sku: 'ACI-TRM-200G',
    price: 95,
    costPrice: 60,
    quantity: 1000,
    categorySlug: 'spices',
    brandSlug: 'aci',
    tags: ['aci', 'spice', 'turmeric', 'pure', 'cooking'],
    isFeatured: false,
    weight: 0.200,
    images: [
      'https://cdn.shopbd.com/products/aci-turmeric-200g-1.jpg',
    ],
  },
  {
    name: 'Apple iPhone 15 Pro',
    nameBn: 'অ্যাপল আইফোন ১৫ প্রো',
    slug: 'apple-iphone-15-pro',
    description: 'iPhone 15 Pro with A17 Pro chip, titanium design, 48MP main camera with 5x optical zoom, Action button, USB-C with USB 3. Super Retina XDR 6.1" ProMotion display.',
    shortDescription: 'A17 Pro, Titanium, 48MP, USB-C, 6.1" ProMotion',
    sku: 'APL-IP15P-001',
    price: 159999,
    compareAtPrice: 169999,
    costPrice: 140000,
    quantity: 30,
    categorySlug: 'smartphones',
    brandSlug: 'apple',
    tags: ['apple', 'iphone', 'pro', 'titanium', 'flagship'],
    isFeatured: true,
    weight: 0.187,
    images: [
      'https://cdn.shopbd.com/products/iphone15pro-1.jpg',
      'https://cdn.shopbd.com/products/iphone15pro-2.jpg',
      'https://cdn.shopbd.com/products/iphone15pro-3.jpg',
    ],
    variants: [
      { name: '128GB - Natural Titanium', sku: 'APL-IP15P-128-NAT', price: 159999, quantity: 10 },
      { name: '256GB - Blue Titanium', sku: 'APL-IP15P-256-BLU', price: 179999, quantity: 10 },
      { name: '512GB - Black Titanium', sku: 'APL-IP15P-512-BLK', price: 209999, quantity: 10 },
    ],
  },
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    nameBn: 'সনি ডাব্লিউএইচ-১০০০এক্সএম৫ ওয়্যারলেস হেডফোন',
    slug: 'sony-wh-1000xm5',
    description: 'Sony WH-1000XM5 — industry-leading noise cancellation with Auto NC Optimizer. 30-hour battery, quick charging (3 min = 3 hours). Multipoint connection, Speak-to-Chat, LDAC Hi-Res Audio.',
    shortDescription: 'Best-in-class ANC, 30hr battery, Hi-Res Audio',
    sku: 'SNY-WH1000XM5-001',
    price: 32999,
    compareAtPrice: 39999,
    costPrice: 27000,
    quantity: 40,
    categorySlug: 'headphones',
    brandSlug: 'sony',
    tags: ['sony', 'headphones', 'anc', 'wireless', 'hi-res', 'premium'],
    isFeatured: true,
    weight: 0.250,
    images: [
      'https://cdn.shopbd.com/products/sony-xm5-1.jpg',
      'https://cdn.shopbd.com/products/sony-xm5-2.jpg',
    ],
    variants: [
      { name: 'Black', sku: 'SNY-XM5-BLK', price: 32999, quantity: 20 },
      { name: 'Silver', sku: 'SNY-XM5-SLV', price: 32999, quantity: 20 },
    ],
  },
  {
    name: 'Samsung 43" Crystal UHD 4K Smart TV',
    nameBn: 'স্যামসাং ৪৩" ক্রিস্টাল ইউএইচডি ৪কে স্মার্ট টিভি',
    slug: 'samsung-43-crystal-uhd-4k-tv',
    description: 'Samsung 43" Crystal UHD 4K Smart TV with Crystal Processor 4K, HDR, PurColor technology, Smart Hub with Tizen OS. Built-in voice assistant, screen mirroring, and multiple HDMI ports.',
    shortDescription: '43" 4K UHD, Crystal Processor, Smart Hub, HDR',
    sku: 'SAM-TV43-CU-001',
    price: 41999,
    compareAtPrice: 48999,
    costPrice: 35000,
    quantity: 25,
    categorySlug: 'electronics',
    brandSlug: 'samsung',
    tags: ['samsung', 'tv', '4k', 'smart-tv', 'uhd'],
    isFeatured: true,
    weight: 8.3,
    images: [
      'https://cdn.shopbd.com/products/samsung-tv43-1.jpg',
    ],
  },
  {
    name: 'Realme C67 4G',
    nameBn: 'রিয়েলমি সি৬৭ ৪জি',
    slug: 'realme-c67-4g',
    description: 'Realme C67 4G with 108MP main camera, Snapdragon 685 processor, 6.72" 90Hz display, 5000mAh battery with 33W SUPERVOOC charging. Ultra-slim 7.89mm design.',
    shortDescription: '108MP, Snapdragon 685, 90Hz, 33W charging',
    sku: 'RLM-C67-001',
    price: 16999,
    compareAtPrice: 18999,
    costPrice: 13500,
    quantity: 180,
    categorySlug: 'smartphones',
    brandSlug: 'realme',
    tags: ['realme', 'budget', 'smartphone', '108mp'],
    isFeatured: false,
    weight: 0.192,
    images: [
      'https://cdn.shopbd.com/products/realme-c67-1.jpg',
    ],
  },
  {
    name: 'Walton WFA-2F6-RXXX Refrigerator',
    nameBn: 'ওয়ালটন ফ্রিজ ডাবল ডোর',
    slug: 'walton-refrigerator-double-door',
    description: 'Walton double door frost-free refrigerator, 260L capacity. Inverter compressor for energy efficiency. Vegetable crisper, egg tray, door pockets. Made in Bangladesh with 12-year compressor warranty.',
    descriptionBn: 'ওয়ালটন ডাবল ডোর ফ্রস্ট-ফ্রি রেফ্রিজারেটর, ২৬০ লিটার ক্যাপাসিটি। ইনভার্টার কম্প্রেসর। বাংলাদেশে তৈরি।',
    shortDescription: '260L, Frost-free, Inverter, 12yr warranty',
    sku: 'WAL-REF-260-001',
    price: 32999,
    compareAtPrice: 37999,
    costPrice: 27000,
    quantity: 35,
    categorySlug: 'electronics',
    brandSlug: 'walton',
    tags: ['walton', 'refrigerator', 'inverter', 'made-in-bangladesh', 'appliance'],
    isFeatured: false,
    weight: 52.0,
    images: [
      'https://cdn.shopbd.com/products/walton-fridge-1.jpg',
    ],
  },
  {
    name: 'Aarong Leather Messenger Bag',
    nameBn: 'আড়ং লেদার মেসেঞ্জার ব্যাগ',
    slug: 'aarong-leather-messenger-bag',
    description: 'Handcrafted genuine leather messenger bag from Aarong. Features adjustable strap, multiple compartments, laptop sleeve (fits up to 14"), magnetic clasp closure. Artisan-made in Bangladesh.',
    shortDescription: 'Genuine leather, handcrafted, fits 14" laptop',
    sku: 'ARG-BAG-MSG-001',
    price: 5800,
    compareAtPrice: 6500,
    costPrice: 3800,
    quantity: 45,
    categorySlug: 'bags',
    brandSlug: 'aarong',
    tags: ['aarong', 'bag', 'leather', 'messenger', 'handcrafted'],
    isFeatured: false,
    weight: 0.900,
    images: [
      'https://cdn.shopbd.com/products/aarong-messenger-1.jpg',
      'https://cdn.shopbd.com/products/aarong-messenger-2.jpg',
    ],
    variants: [
      { name: 'Brown', sku: 'ARG-BAG-MSG-BRN', price: 5800, quantity: 25 },
      { name: 'Black', sku: 'ARG-BAG-MSG-BLK', price: 5800, quantity: 20 },
    ],
  },
  {
    name: 'Vivo Y28 5G',
    nameBn: 'ভিভো ওয়াই২৮ ৫জি',
    slug: 'vivo-y28-5g',
    description: 'Vivo Y28 5G with Dimensity 6020, 6.56" HD+ display, 50MP main camera, 5000mAh battery with 15W charging. 5G ready, IP54 water resistant.',
    shortDescription: '5G, Dimensity 6020, 50MP, 5000mAh',
    sku: 'VIV-Y28-5G-001',
    price: 18999,
    compareAtPrice: 20999,
    costPrice: 15000,
    quantity: 100,
    categorySlug: 'smartphones',
    brandSlug: 'vivo',
    tags: ['vivo', '5g', 'budget', 'smartphone'],
    isFeatured: false,
    weight: 0.190,
    images: [
      'https://cdn.shopbd.com/products/vivo-y28-1.jpg',
    ],
  },
];

async function seedProducts(brandMap: Record<string, string>) {
  console.log('Seeding products...');
  let count = 0;

  for (const p of PRODUCTS) {
    // Resolve category
    const category = await prisma.category.findUnique({
      where: { slug: p.categorySlug },
    });
    if (!category) {
      console.warn(`  Skipping "${p.name}" — category "${p.categorySlug}" not found`);
      continue;
    }

    const brandId = p.brandSlug ? brandMap[p.brandSlug] ?? null : null;

    // Upsert product
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        nameBn: p.nameBn,
        slug: p.slug,
        description: p.description,
        descriptionBn: p.descriptionBn,
        shortDescription: p.shortDescription,
        sku: p.sku,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        costPrice: p.costPrice,
        quantity: p.quantity,
        status: 'ACTIVE',
        categoryId: category.id,
        brandId,
        tags: p.tags,
        isFeatured: p.isFeatured,
        weight: p.weight,
        weightUnit: 'kg',
        averageRating: 0,
        totalReviews: 0,
      },
    });

    // Seed images
    for (let i = 0; i < p.images.length; i++) {
      await prisma.productImage.upsert({
        where: {
          id: `seed-img-${p.slug}-${i}`, // Use deterministic ID for upsert
        },
        update: {},
        create: {
          id: `seed-img-${p.slug}-${i}`,
          productId: product.id,
          url: p.images[i],
          thumbnailUrl: p.images[i].replace('.jpg', '-thumb.jpg'),
          alt: p.name,
          isPrimary: i === 0,
          sortOrder: i,
        },
      });
    }

    // Seed variants
    if (p.variants) {
      for (let v = 0; v < p.variants.length; v++) {
        const variant = p.variants[v];
        await prisma.productVariant.upsert({
          where: { sku: variant.sku },
          update: {},
          create: {
            productId: product.id,
            name: variant.name,
            sku: variant.sku,
            price: variant.price,
            quantity: variant.quantity,
            isActive: true,
            sortOrder: v,
          },
        });
      }
    }

    // Seed inventory
    await prisma.inventory.upsert({
      where: { productId: product.id },
      update: {},
      create: {
        productId: product.id,
        quantity: p.quantity,
        reservedQuantity: 0,
        lowStockThreshold: p.quantity > 100 ? 20 : 5,
        trackInventory: true,
        allowBackorder: false,
      },
    });

    count++;
  }

  console.log(`  Seeded ${count} products with images, variants & inventory`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('Starting database seed...\n');

  await seedAdminUser();
  await seedCategories();
  const brandMap = await seedBrands();
  await seedProducts(brandMap);

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

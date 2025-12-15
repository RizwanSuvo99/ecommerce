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
// Seed: CMS Pages
// ---------------------------------------------------------------------------
async function seedPages() {
  console.log('Seeding CMS pages...');

  const pages = [
    {
      title: 'About Us',
      titleBn: 'আমাদের সম্পর্কে',
      slug: 'about-us',
      content: `<h1>About ShopBD</h1>
<p>ShopBD is Bangladesh's leading e-commerce platform, connecting millions of buyers with trusted sellers across the country. Founded with a mission to make quality products accessible to every Bangladeshi household, we offer an extensive range of products from electronics and fashion to groceries and home essentials.</p>
<h2>Our Mission</h2>
<p>To empower Bangladeshi consumers and businesses by providing a reliable, affordable, and convenient online shopping experience with support for both Bengali and English.</p>
<h2>Why Choose Us?</h2>
<ul>
  <li>100% authentic products from verified sellers</li>
  <li>Cash on Delivery across Bangladesh</li>
  <li>bKash, Nagad & Rocket payment support</li>
  <li>Fast delivery inside Dhaka (24-48 hours)</li>
  <li>Bilingual support in Bengali and English</li>
  <li>Easy returns within 7 days</li>
</ul>`,
      contentBn: `<h1>শপবিডি সম্পর্কে</h1>
<p>শপবিডি বাংলাদেশের শীর্ষস্থানীয় ই-কমার্স প্ল্যাটফর্ম। লক্ষ লক্ষ ক্রেতাকে বিশ্বস্ত বিক্রেতাদের সাথে সংযুক্ত করে সারাদেশে মানসম্মত পণ্য সহজলভ্য করাই আমাদের লক্ষ্য।</p>`,
      excerpt: "Bangladesh's leading e-commerce platform for quality products at the best prices.",
      status: 'PUBLISHED' as const,
      metaTitle: 'About ShopBD | Trusted E-commerce in Bangladesh',
      metaDescription: "Learn about ShopBD — Bangladesh's leading e-commerce platform offering authentic products with fast delivery and bilingual support.",
    },
    {
      title: 'Contact Us',
      titleBn: 'যোগাযোগ করুন',
      slug: 'contact-us',
      content: `<h1>Contact Us</h1>
<p>We'd love to hear from you! Reach out to our customer support team for any queries, feedback, or assistance.</p>
<h2>Customer Support</h2>
<ul>
  <li><strong>Phone:</strong> +880-2-1234-5678 (9 AM - 10 PM, Saturday - Thursday)</li>
  <li><strong>Email:</strong> support@shopbd.com</li>
  <li><strong>WhatsApp:</strong> +880-1700-000-000</li>
</ul>
<h2>Office Address</h2>
<p>ShopBD Technologies Ltd.<br>
Level 12, Rangs Babylon Tower<br>
246 Bir Uttam Mir Shawkat Road<br>
Tejgaon, Dhaka 1208, Bangladesh</p>
<h2>Business Hours</h2>
<p>Saturday — Thursday: 9:00 AM — 6:00 PM<br>Friday: Closed</p>`,
      contentBn: `<h1>যোগাযোগ করুন</h1>
<p>আমরা আপনার কাছ থেকে শুনতে চাই! যেকোনো প্রশ্ন, মতামত বা সহায়তার জন্য আমাদের কাস্টমার সাপোর্ট টিমের সাথে যোগাযোগ করুন।</p>`,
      excerpt: 'Get in touch with ShopBD customer support team.',
      status: 'PUBLISHED' as const,
      metaTitle: 'Contact Us | ShopBD Customer Support',
      metaDescription: 'Contact ShopBD customer support via phone, email, or WhatsApp. We are here to help with your orders and queries.',
    },
    {
      title: 'Privacy Policy',
      titleBn: 'গোপনীয়তা নীতি',
      slug: 'privacy-policy',
      content: `<h1>Privacy Policy</h1>
<p>Last updated: December 15, 2025</p>
<p>ShopBD Technologies Ltd. ("we", "our", or "us") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.</p>
<h2>1. Information We Collect</h2>
<p>We collect personal information that you voluntarily provide when you register, place an order, subscribe to our newsletter, or contact us. This includes: name, email address, phone number, shipping and billing addresses, payment information, and order history.</p>
<h2>2. How We Use Your Information</h2>
<p>We use your information to: process orders, send order updates, provide customer support, personalize your shopping experience, send promotional offers (with your consent), prevent fraud, and comply with legal obligations.</p>
<h2>3. Data Security</h2>
<p>We implement industry-standard security measures including SSL encryption, secure payment gateways, and regular security audits to protect your data.</p>
<h2>4. Third-Party Sharing</h2>
<p>We do not sell your personal data. We share information only with: payment processors (bKash, Nagad, Stripe), delivery partners, and as required by Bangladeshi law.</p>
<h2>5. Your Rights</h2>
<p>You may request access to, correction of, or deletion of your personal data by contacting us at privacy@shopbd.com.</p>`,
      excerpt: 'How we collect, use, and protect your personal information.',
      status: 'PUBLISHED' as const,
      metaTitle: 'Privacy Policy | ShopBD',
      metaDescription: 'Read the ShopBD Privacy Policy to understand how we collect, use, and protect your personal information.',
    },
    {
      title: 'Terms & Conditions',
      titleBn: 'শর্তাবলী',
      slug: 'terms-conditions',
      content: `<h1>Terms & Conditions</h1>
<p>Last updated: December 15, 2025</p>
<p>Welcome to ShopBD. By accessing and using our website and services, you agree to be bound by these Terms & Conditions. Please read them carefully.</p>
<h2>1. Account Registration</h2>
<p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account.</p>
<h2>2. Orders & Payments</h2>
<p>All prices are displayed in Bangladeshi Taka (BDT) and include applicable taxes unless stated otherwise. We reserve the right to refuse or cancel any order for reasons including pricing errors, stock unavailability, or suspected fraud.</p>
<h2>3. Shipping & Delivery</h2>
<p>Delivery timelines are estimates and may vary based on location and circumstances. Inside Dhaka: 24-48 hours. Outside Dhaka: 3-5 business days. Remote areas may take longer.</p>
<h2>4. Returns & Refunds</h2>
<p>Products may be returned within 7 days of delivery if they are unused, in original packaging, and accompanied by the invoice. Refunds will be processed within 5-7 business days.</p>
<h2>5. Limitation of Liability</h2>
<p>ShopBD shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services.</p>`,
      excerpt: 'Terms governing the use of ShopBD services.',
      status: 'PUBLISHED' as const,
      metaTitle: 'Terms & Conditions | ShopBD',
      metaDescription: 'Read the Terms & Conditions for using ShopBD e-commerce platform.',
    },
    {
      title: 'Refund Policy',
      titleBn: 'ফেরত নীতি',
      slug: 'refund-policy',
      content: `<h1>Refund & Return Policy</h1>
<p>Last updated: December 15, 2025</p>
<p>At ShopBD, we want you to be completely satisfied with your purchase. If you are not happy with your order, we offer a hassle-free return and refund policy.</p>
<h2>Return Window</h2>
<p>You may return most items within 7 days of delivery. Some categories (underwear, perishable goods, digital products) are non-returnable.</p>
<h2>Return Conditions</h2>
<ul>
  <li>Item must be unused and in its original packaging</li>
  <li>All tags and labels must be intact</li>
  <li>Original invoice or order confirmation must be provided</li>
  <li>Item must not be damaged by the customer</li>
</ul>
<h2>Refund Process</h2>
<p>Once we receive and inspect the returned item, refunds will be processed to the original payment method within 5-7 business days. For Cash on Delivery orders, refunds will be sent via bKash or bank transfer.</p>
<h2>Exchange</h2>
<p>We offer free exchanges for size/color changes subject to availability. Contact our support team to initiate an exchange.</p>`,
      contentBn: `<h1>ফেরত ও রিটার্ন নীতি</h1>
<p>শপবিডি-তে আমরা চাই আপনি আপনার ক্রয়ে সম্পূর্ণ সন্তুষ্ট থাকুন। ৭ দিনের মধ্যে বেশিরভাগ পণ্য ফেরত দেওয়া যাবে।</p>`,
      excerpt: 'Our hassle-free return and refund policy for your peace of mind.',
      status: 'PUBLISHED' as const,
      metaTitle: 'Refund & Return Policy | ShopBD',
      metaDescription: 'Learn about the ShopBD refund and return policy. Easy returns within 7 days with hassle-free refunds.',
    },
  ];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: {
        ...page,
        sortOrder: i,
      },
    });
  }

  console.log(`  Seeded ${pages.length} CMS pages`);
}

// ---------------------------------------------------------------------------
// Seed: Banners
// ---------------------------------------------------------------------------
async function seedBanners() {
  console.log('Seeding banners...');

  const banners = [
    {
      title: 'Eid Collection 2025',
      titleBn: 'ঈদ কালেকশন ২০২৫',
      image: 'https://cdn.shopbd.com/banners/eid-collection-2025.jpg',
      mobileImage: 'https://cdn.shopbd.com/banners/eid-collection-2025-mobile.jpg',
      link: '/collections/eid-2025',
      position: 'HERO' as const,
      isActive: true,
      sortOrder: 0,
    },
    {
      title: 'Electronics Mega Sale',
      titleBn: 'ইলেকট্রনিক্স মেগা সেল',
      image: 'https://cdn.shopbd.com/banners/electronics-mega-sale.jpg',
      mobileImage: 'https://cdn.shopbd.com/banners/electronics-mega-sale-mobile.jpg',
      link: '/category/electronics?sale=true',
      position: 'HERO' as const,
      isActive: true,
      sortOrder: 1,
    },
    {
      title: 'Free Delivery Inside Dhaka',
      titleBn: 'ঢাকায় ফ্রি ডেলিভারি',
      image: 'https://cdn.shopbd.com/banners/free-delivery-dhaka.jpg',
      mobileImage: 'https://cdn.shopbd.com/banners/free-delivery-dhaka-mobile.jpg',
      link: '/offers/free-delivery',
      position: 'HERO' as const,
      isActive: true,
      sortOrder: 2,
    },
    {
      title: 'Smartphone Deals',
      titleBn: 'স্মার্টফোন অফার',
      image: 'https://cdn.shopbd.com/banners/smartphone-deals-sidebar.jpg',
      link: '/category/smartphones',
      position: 'SIDEBAR' as const,
      isActive: true,
      sortOrder: 0,
    },
    {
      title: 'Download Our App',
      titleBn: 'আমাদের অ্যাপ ডাউনলোড করুন',
      image: 'https://cdn.shopbd.com/banners/app-download-footer.jpg',
      link: '/app',
      position: 'FOOTER' as const,
      isActive: true,
      sortOrder: 0,
    },
  ];

  for (const banner of banners) {
    // Use deterministic ID for idempotent seeding
    const id = `seed-banner-${banner.position.toLowerCase()}-${banner.sortOrder}`;
    await prisma.banner.upsert({
      where: { id },
      update: {},
      create: { id, ...banner },
    });
  }

  console.log(`  Seeded ${banners.length} banners`);
}

// ---------------------------------------------------------------------------
// Seed: Navigation Menus
// ---------------------------------------------------------------------------
async function seedNavigationMenus() {
  console.log('Seeding navigation menus...');

  const headerMenuId = 'seed-nav-header';
  await prisma.navigationMenu.upsert({
    where: { id: headerMenuId },
    update: {},
    create: {
      id: headerMenuId,
      name: 'Main Navigation',
      nameBn: 'প্রধান নেভিগেশন',
      location: 'HEADER',
      isActive: true,
      items: [
        { label: 'Home', labelBn: 'হোম', href: '/', icon: 'Home' },
        {
          label: 'Categories',
          labelBn: 'ক্যাটেগরি',
          href: '/categories',
          icon: 'Grid',
          children: [
            { label: 'Electronics', labelBn: 'ইলেকট্রনিক্স', href: '/category/electronics' },
            { label: 'Fashion', labelBn: 'ফ্যাশন', href: '/category/fashion' },
            { label: 'Home & Living', labelBn: 'হোম ও লিভিং', href: '/category/home-living' },
            { label: 'Beauty & Health', labelBn: 'বিউটি ও হেলথ', href: '/category/beauty-health' },
            { label: 'Groceries', labelBn: 'মুদি দোকান', href: '/category/groceries' },
          ],
        },
        { label: 'Deals', labelBn: 'ডিলস', href: '/deals', icon: 'Percent', highlight: true },
        { label: 'Brands', labelBn: 'ব্র্যান্ড', href: '/brands', icon: 'Award' },
        { label: 'New Arrivals', labelBn: 'নতুন পণ্য', href: '/new-arrivals', icon: 'Sparkles' },
      ],
    },
  });

  const footerMenuId = 'seed-nav-footer';
  await prisma.navigationMenu.upsert({
    where: { id: footerMenuId },
    update: {},
    create: {
      id: footerMenuId,
      name: 'Footer Navigation',
      nameBn: 'ফুটার নেভিগেশন',
      location: 'FOOTER',
      isActive: true,
      items: [
        {
          heading: 'Customer Service',
          headingBn: 'কাস্টমার সার্ভিস',
          links: [
            { label: 'Contact Us', labelBn: 'যোগাযোগ', href: '/page/contact-us' },
            { label: 'FAQs', labelBn: 'প্রশ্নোত্তর', href: '/faqs' },
            { label: 'Track Order', labelBn: 'অর্ডার ট্র্যাক', href: '/track-order' },
            { label: 'Returns & Refunds', labelBn: 'ফেরত ও রিফান্ড', href: '/page/refund-policy' },
          ],
        },
        {
          heading: 'About ShopBD',
          headingBn: 'শপবিডি সম্পর্কে',
          links: [
            { label: 'About Us', labelBn: 'আমাদের সম্পর্কে', href: '/page/about-us' },
            { label: 'Careers', labelBn: 'ক্যারিয়ার', href: '/careers' },
            { label: 'Privacy Policy', labelBn: 'গোপনীয়তা নীতি', href: '/page/privacy-policy' },
            { label: 'Terms & Conditions', labelBn: 'শর্তাবলী', href: '/page/terms-conditions' },
          ],
        },
        {
          heading: 'Payment Methods',
          headingBn: 'পেমেন্ট পদ্ধতি',
          links: [
            { label: 'bKash', href: '/payment/bkash', icon: 'bkash' },
            { label: 'Nagad', href: '/payment/nagad', icon: 'nagad' },
            { label: 'Rocket', href: '/payment/rocket', icon: 'rocket' },
            { label: 'Visa / Mastercard', href: '/payment/cards', icon: 'credit-card' },
            { label: 'Cash on Delivery', labelBn: 'ক্যাশ অন ডেলিভারি', href: '/payment/cod' },
          ],
        },
      ],
    },
  });

  const mobileMenuId = 'seed-nav-mobile';
  await prisma.navigationMenu.upsert({
    where: { id: mobileMenuId },
    update: {},
    create: {
      id: mobileMenuId,
      name: 'Mobile Navigation',
      nameBn: 'মোবাইল নেভিগেশন',
      location: 'MOBILE',
      isActive: true,
      items: [
        { label: 'Home', labelBn: 'হোম', href: '/', icon: 'Home' },
        { label: 'Categories', labelBn: 'ক্যাটেগরি', href: '/categories', icon: 'Grid' },
        { label: 'Cart', labelBn: 'কার্ট', href: '/cart', icon: 'ShoppingCart' },
        { label: 'Wishlist', labelBn: 'পছন্দ', href: '/wishlist', icon: 'Heart' },
        { label: 'Account', labelBn: 'অ্যাকাউন্ট', href: '/account', icon: 'User' },
      ],
    },
  });

  console.log('  Seeded 3 navigation menus (header, footer, mobile)');
}

// ---------------------------------------------------------------------------
// Seed: Shipping Methods
// ---------------------------------------------------------------------------
async function seedShippingMethods() {
  console.log('Seeding shipping methods...');

  const methods = [
    {
      id: 'seed-ship-dhaka',
      name: 'Inside Dhaka',
      nameBn: 'ঢাকার ভিতরে',
      description: 'Standard delivery within Dhaka city (24-48 hours)',
      price: 60,
      freeAbove: 1000,
      estimatedDays: '1-2 days',
      zones: ['Dhaka'],
      isActive: true,
      sortOrder: 0,
    },
    {
      id: 'seed-ship-outside',
      name: 'Outside Dhaka',
      nameBn: 'ঢাকার বাইরে',
      description: 'Standard delivery outside Dhaka (3-5 business days)',
      price: 120,
      freeAbove: 2000,
      estimatedDays: '3-5 days',
      zones: [
        'Chattogram', 'Rajshahi', 'Khulna', 'Sylhet',
        'Rangpur', 'Barishal', 'Mymensingh',
      ],
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'seed-ship-express',
      name: 'Express Delivery (Dhaka)',
      nameBn: 'এক্সপ্রেস ডেলিভারি (ঢাকা)',
      description: 'Same-day or next-day delivery within Dhaka',
      price: 150,
      estimatedDays: 'Same day / Next day',
      zones: ['Dhaka'],
      isActive: true,
      sortOrder: 2,
    },
  ];

  for (const method of methods) {
    await prisma.shippingMethod.upsert({
      where: { id: method.id },
      update: {},
      create: method,
    });
  }

  console.log(`  Seeded ${methods.length} shipping methods`);
}

// ---------------------------------------------------------------------------
// Seed: Default Settings
// ---------------------------------------------------------------------------
async function seedSettings() {
  console.log('Seeding default settings...');

  const settings: Array<{
    group: 'GENERAL' | 'EMAIL' | 'SHIPPING' | 'TAX' | 'PAYMENT' | 'SEO' | 'SOCIAL';
    key: string;
    value: string;
    type?: string;
  }> = [
    // General
    { group: 'GENERAL', key: 'site_name', value: 'ShopBD' },
    { group: 'GENERAL', key: 'site_name_bn', value: 'শপবিডি' },
    { group: 'GENERAL', key: 'site_tagline', value: "Bangladesh's Trusted Online Shop" },
    { group: 'GENERAL', key: 'site_tagline_bn', value: 'বাংলাদেশের বিশ্বস্ত অনলাইন শপ' },
    { group: 'GENERAL', key: 'currency', value: 'BDT' },
    { group: 'GENERAL', key: 'currency_symbol', value: '৳' },
    { group: 'GENERAL', key: 'currency_position', value: 'before' },
    { group: 'GENERAL', key: 'default_language', value: 'en' },
    { group: 'GENERAL', key: 'supported_languages', value: 'en,bn', type: 'array' },
    { group: 'GENERAL', key: 'timezone', value: 'Asia/Dhaka' },
    { group: 'GENERAL', key: 'date_format', value: 'DD/MM/YYYY' },
    { group: 'GENERAL', key: 'phone', value: '+880-2-1234-5678' },
    { group: 'GENERAL', key: 'support_email', value: 'support@shopbd.com' },
    { group: 'GENERAL', key: 'address', value: 'Level 12, Rangs Babylon Tower, 246 Bir Uttam Mir Shawkat Road, Tejgaon, Dhaka 1208' },

    // Email
    { group: 'EMAIL', key: 'from_name', value: 'ShopBD' },
    { group: 'EMAIL', key: 'from_email', value: 'noreply@shopbd.com' },
    { group: 'EMAIL', key: 'smtp_host', value: 'smtp.sendgrid.net' },
    { group: 'EMAIL', key: 'smtp_port', value: '587', type: 'number' },
    { group: 'EMAIL', key: 'smtp_secure', value: 'true', type: 'boolean' },

    // Shipping
    { group: 'SHIPPING', key: 'free_shipping_threshold', value: '2000', type: 'number' },
    { group: 'SHIPPING', key: 'default_weight_unit', value: 'kg' },
    { group: 'SHIPPING', key: 'enable_free_shipping', value: 'true', type: 'boolean' },

    // Tax
    { group: 'TAX', key: 'vat_percentage', value: '15', type: 'number' },
    { group: 'TAX', key: 'vat_included_in_price', value: 'true', type: 'boolean' },
    { group: 'TAX', key: 'vat_registration_number', value: '' },
    { group: 'TAX', key: 'enable_tax', value: 'true', type: 'boolean' },

    // Payment
    { group: 'PAYMENT', key: 'enable_cod', value: 'true', type: 'boolean' },
    { group: 'PAYMENT', key: 'enable_bkash', value: 'true', type: 'boolean' },
    { group: 'PAYMENT', key: 'enable_nagad', value: 'true', type: 'boolean' },
    { group: 'PAYMENT', key: 'enable_rocket', value: 'true', type: 'boolean' },
    { group: 'PAYMENT', key: 'enable_stripe', value: 'false', type: 'boolean' },
    { group: 'PAYMENT', key: 'cod_extra_charge', value: '0', type: 'number' },
    { group: 'PAYMENT', key: 'min_order_amount', value: '100', type: 'number' },
    { group: 'PAYMENT', key: 'max_cod_amount', value: '50000', type: 'number' },

    // SEO
    { group: 'SEO', key: 'meta_title', value: "ShopBD — Bangladesh's #1 Online Shopping Destination" },
    { group: 'SEO', key: 'meta_description', value: 'Shop online at ShopBD for electronics, fashion, groceries & more. Free delivery in Dhaka, Cash on Delivery, bKash & Nagad payment. Trusted by millions.' },
    { group: 'SEO', key: 'meta_keywords', value: 'online shopping bangladesh, e-commerce bd, buy online dhaka, shopbd', type: 'array' },
    { group: 'SEO', key: 'google_analytics_id', value: '' },
    { group: 'SEO', key: 'facebook_pixel_id', value: '' },
    { group: 'SEO', key: 'og_image', value: 'https://cdn.shopbd.com/og-image.jpg' },

    // Social
    { group: 'SOCIAL', key: 'facebook_url', value: 'https://facebook.com/shopbd' },
    { group: 'SOCIAL', key: 'instagram_url', value: 'https://instagram.com/shopbd' },
    { group: 'SOCIAL', key: 'youtube_url', value: 'https://youtube.com/@shopbd' },
    { group: 'SOCIAL', key: 'twitter_url', value: '' },
    { group: 'SOCIAL', key: 'tiktok_url', value: '' },
    { group: 'SOCIAL', key: 'whatsapp_number', value: '+8801700000000' },
  ];

  for (const s of settings) {
    await prisma.settings.upsert({
      where: {
        group_key: { group: s.group, key: s.key },
      },
      update: {},
      create: {
        group: s.group,
        key: s.key,
        value: s.value,
        type: s.type ?? 'string',
      },
    });
  }

  console.log(`  Seeded ${settings.length} settings`);
}

// ---------------------------------------------------------------------------
// Seed: Email Templates
// ---------------------------------------------------------------------------
async function seedEmailTemplates() {
  console.log('Seeding email templates...');

  const templates = [
    {
      name: 'welcome',
      subject: 'Welcome to ShopBD! 🎉',
      subjectBn: 'শপবিডি-তে স্বাগতম! 🎉',
      body: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: #0f766e; color: #fff; padding: 32px 24px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px;">Welcome to ShopBD!</h1>
    </div>
    <div style="padding: 32px 24px;">
      <p style="font-size: 16px; color: #334155;">Hi {{firstName}},</p>
      <p style="font-size: 16px; color: #334155;">Thank you for creating your ShopBD account! You are now ready to explore thousands of products at the best prices.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{shopUrl}}" style="background: #0f766e; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">Start Shopping</a>
      </div>
      <p style="font-size: 14px; color: #64748b;">If you have any questions, reply to this email or contact us at support@shopbd.com.</p>
    </div>
    <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
      <p>&copy; {{year}} ShopBD Technologies Ltd. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
      bodyBn: null,
      variables: ['firstName', 'shopUrl', 'year'],
    },
    {
      name: 'order_confirmation',
      subject: 'Order Confirmed — #{{orderNumber}}',
      subjectBn: 'অর্ডার নিশ্চিত হয়েছে — #{{orderNumber}}',
      body: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: #0f766e; color: #fff; padding: 32px 24px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Order Confirmed! ✓</h1>
      <p style="margin: 8px 0 0; opacity: 0.9;">Order #{{orderNumber}}</p>
    </div>
    <div style="padding: 32px 24px;">
      <p style="font-size: 16px; color: #334155;">Hi {{firstName}},</p>
      <p style="font-size: 16px; color: #334155;">Your order has been confirmed and is being processed. Here is a summary:</p>
      <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #64748b;">Items:</td><td style="text-align: right; font-weight: 600;">{{itemCount}} items</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Subtotal:</td><td style="text-align: right;">৳{{subtotal}}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Shipping:</td><td style="text-align: right;">৳{{shippingCost}}</td></tr>
          <tr style="border-top: 2px solid #e2e8f0;"><td style="padding: 12px 0; font-weight: 700; font-size: 18px;">Total:</td><td style="text-align: right; font-weight: 700; font-size: 18px; color: #0f766e;">৳{{totalAmount}}</td></tr>
        </table>
      </div>
      <p style="font-size: 14px; color: #64748b;"><strong>Delivery Address:</strong> {{shippingAddress}}</p>
      <p style="font-size: 14px; color: #64748b;"><strong>Payment Method:</strong> {{paymentMethod}}</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{trackingUrl}}" style="background: #0f766e; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">Track Your Order</a>
      </div>
    </div>
    <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
      <p>&copy; {{year}} ShopBD Technologies Ltd. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
      bodyBn: null,
      variables: ['firstName', 'orderNumber', 'itemCount', 'subtotal', 'shippingCost', 'totalAmount', 'shippingAddress', 'paymentMethod', 'trackingUrl', 'year'],
    },
    {
      name: 'order_shipped',
      subject: 'Your Order #{{orderNumber}} Has Been Shipped!',
      subjectBn: 'আপনার অর্ডার #{{orderNumber}} শিপ করা হয়েছে!',
      body: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: #0f766e; color: #fff; padding: 32px 24px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Your Order is On Its Way! 🚚</h1>
    </div>
    <div style="padding: 32px 24px;">
      <p style="font-size: 16px; color: #334155;">Hi {{firstName}},</p>
      <p style="font-size: 16px; color: #334155;">Great news! Your order #{{orderNumber}} has been shipped and is on its way to you.</p>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px; font-weight: 600; color: #166534;">Tracking Information</p>
        <p style="margin: 0; color: #334155;">Carrier: {{carrier}}</p>
        <p style="margin: 4px 0 0; color: #334155;">Tracking Number: {{trackingNumber}}</p>
        <p style="margin: 4px 0 0; color: #334155;">Estimated Delivery: {{estimatedDelivery}}</p>
      </div>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{trackingUrl}}" style="background: #0f766e; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">Track Your Package</a>
      </div>
    </div>
    <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
      <p>&copy; {{year}} ShopBD Technologies Ltd. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
      bodyBn: null,
      variables: ['firstName', 'orderNumber', 'carrier', 'trackingNumber', 'estimatedDelivery', 'trackingUrl', 'year'],
    },
    {
      name: 'password_reset',
      subject: 'Reset Your ShopBD Password',
      subjectBn: 'আপনার শপবিডি পাসওয়ার্ড রিসেট করুন',
      body: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: #0f766e; color: #fff; padding: 32px 24px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Password Reset Request</h1>
    </div>
    <div style="padding: 32px 24px;">
      <p style="font-size: 16px; color: #334155;">Hi {{firstName}},</p>
      <p style="font-size: 16px; color: #334155;">We received a request to reset your ShopBD password. Click the button below to create a new password:</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{resetUrl}}" style="background: #0f766e; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #64748b;">This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
    </div>
    <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
      <p>&copy; {{year}} ShopBD Technologies Ltd. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
      bodyBn: null,
      variables: ['firstName', 'resetUrl', 'year'],
    },
    {
      name: 'email_verification',
      subject: 'Verify Your Email Address — ShopBD',
      subjectBn: 'আপনার ইমেল যাচাই করুন — শপবিডি',
      body: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: #0f766e; color: #fff; padding: 32px 24px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Verify Your Email</h1>
    </div>
    <div style="padding: 32px 24px;">
      <p style="font-size: 16px; color: #334155;">Hi {{firstName}},</p>
      <p style="font-size: 16px; color: #334155;">Please verify your email address to complete your ShopBD registration:</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{verificationUrl}}" style="background: #0f766e; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">Verify Email</a>
      </div>
      <p style="font-size: 14px; color: #64748b;">This link will expire in 24 hours.</p>
    </div>
    <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
      <p>&copy; {{year}} ShopBD Technologies Ltd. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
      bodyBn: null,
      variables: ['firstName', 'verificationUrl', 'year'],
    },
    {
      name: 'order_delivered',
      subject: 'Your Order #{{orderNumber}} Has Been Delivered!',
      subjectBn: 'আপনার অর্ডার #{{orderNumber}} ডেলিভারি হয়েছে!',
      body: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: #0f766e; color: #fff; padding: 32px 24px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Order Delivered! 🎉</h1>
    </div>
    <div style="padding: 32px 24px;">
      <p style="font-size: 16px; color: #334155;">Hi {{firstName}},</p>
      <p style="font-size: 16px; color: #334155;">Your order #{{orderNumber}} has been delivered. We hope you love your purchase!</p>
      <p style="font-size: 16px; color: #334155;">Please take a moment to leave a review — your feedback helps other shoppers and our sellers.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{reviewUrl}}" style="background: #f59e0b; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">Write a Review</a>
      </div>
    </div>
    <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
      <p>&copy; {{year}} ShopBD Technologies Ltd. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
      bodyBn: null,
      variables: ['firstName', 'orderNumber', 'reviewUrl', 'year'],
    },
  ];

  for (const tmpl of templates) {
    await prisma.emailTemplate.upsert({
      where: { name: tmpl.name },
      update: {},
      create: {
        name: tmpl.name,
        subject: tmpl.subject,
        subjectBn: tmpl.subjectBn,
        body: tmpl.body,
        bodyBn: tmpl.bodyBn,
        variables: tmpl.variables,
        isActive: true,
      },
    });
  }

  console.log(`  Seeded ${templates.length} email templates`);
}

// ---------------------------------------------------------------------------
// Seed: Theme Settings
// ---------------------------------------------------------------------------
async function seedThemeSettings() {
  console.log('Seeding theme settings...');

  const themeId = 'seed-theme-default';
  await prisma.themeSettings.upsert({
    where: { id: themeId },
    update: {},
    create: {
      id: themeId,
      primaryColor: '#0f766e',
      secondaryColor: '#64748b',
      accentColor: '#f59e0b',
      backgroundColor: '#ffffff',
      textColor: '#0f172a',
      fontFamily: 'Inter',
      fontFamilyBn: 'Noto Sans Bengali',
      borderRadius: '0.5rem',
      heroStyle: 'carousel',
      productCardStyle: 'standard',
      headerStyle: 'sticky-transparent',
      footerStyle: 'multi-column',
      customCss: null,
      logoUrl: 'https://cdn.shopbd.com/logo.svg',
      faviconUrl: 'https://cdn.shopbd.com/favicon.ico',
    },
  });

  console.log('  Seeded default theme settings');
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
  await seedPages();
  await seedBanners();
  await seedNavigationMenus();
  await seedShippingMethods();
  await seedSettings();
  await seedEmailTemplates();
  await seedThemeSettings();

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

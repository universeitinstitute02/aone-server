require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

// Import Mongoose Models
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
const Order = require('../models/Order');

// Seed Data definition matching local DB fallback
const categoriesData = [
  { name: 'Fully Synthetic Oil', slug: 'fully-synthetic', description: 'Maximum performance for modern engines', image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=300', active: true },
  { name: 'Semi Synthetic Oil', slug: 'semi-synthetic', description: 'Excellent balance of protection and value', image: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=300', active: true },
  { name: 'Mineral Engine Oil', slug: 'mineral-oil', description: 'Traditional protection for older engines', image: 'https://images.unsplash.com/photo-1552802640-192a5438a2e2?auto=format&fit=crop&q=80&w=300', active: true },
  { name: 'Premium Coolants', slug: 'coolants', description: 'Optimized thermal management for radiators', image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=300', active: true },
  { name: 'Additives & Gear Oils', slug: 'additives', description: 'Transmission, steering, and fuel additives', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=300', active: true }
];

const brandsData = [
  { name: 'A One Pro', slug: 'aone-pro', logo: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=150', description: 'Our premium in-house high-performance brand', active: true },
  { name: 'Mobil 1', slug: 'mobil-1', logo: 'https://images.unsplash.com/photo-1518384401463-d387de1b827a?auto=format&fit=crop&q=80&w=150', description: 'World leader in synthetic engine oils', active: true },
  { name: 'Motul', slug: 'motul', logo: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=150', description: 'Premium racing-grade lubricants and specialty oils', active: true },
  { name: 'Castrol Edge', slug: 'castrol', logo: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=150', description: 'Fluid titanium technology engine oil', active: true }
];

const couponsData = [
  { code: 'LUBRICANT10', discountType: 'percentage', discountValue: 10, minPurchase: 50, expiryDate: new Date('2027-12-31'), active: true },
  { code: 'AONEFREE', discountType: 'flat', discountValue: 15, minPurchase: 100, expiryDate: new Date('2027-12-31'), active: true }
];

const seedDB = async () => {
  try {
    const isLive = await connectDB();
    if (!isLive) {
      console.warn('\n⚠️  Could not seed MongoDB: Connection unavailable.');
      console.warn('⚠️  Note: Local JSON Fallback DB is already pre-seeded and self-initializes out-of-the-box.');
      process.exit(0);
    }

    console.log('\n🧹 Clearing existing database collections...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Coupon.deleteMany({});
    await Review.deleteMany({});
    await Order.deleteMany({});
    console.log('✓ Collections cleared successfully.');

    console.log('\n👤 Seeding user accounts (password: "123456")...');
    const users = await User.create([
      {
        name: 'A One Admin',
        email: 'admin@aonelub.com',
        password: '123456',
        role: 'admin',
        phone: '+1 (555) 019-9000',
        address: { street: '100 Automotive Blvd', city: 'Detroit', postalCode: '48201', country: 'USA' },
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        investmentAmount: 50000
      },
      {
        name: 'John Crew',
        email: 'employee@aonelub.com',
        password: '123456',
        role: 'employee',
        phone: '+1 (555) 019-9001',
        address: { street: '200 Logistics Road', city: 'Chicago', postalCode: '60601', country: 'USA' },
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
        investmentAmount: 0
      },
      {
        name: 'Robert Lubricity',
        email: 'customer@aonelub.com',
        password: '123456',
        role: 'customer',
        phone: '+1 (555) 019-9002',
        address: { street: '456 Gearhead Lane', city: 'Los Angeles', postalCode: '90001', country: 'USA' },
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        investmentAmount: 12500
      }
    ]);
    console.log(`✓ Seeded ${users.length} user roles.`);

    console.log('\n🏷️  Seeding categories & brands...');
    const categories = await Category.create(categoriesData);
    const brands = await Brand.create(brandsData);
    console.log(`✓ Seeded ${categories.length} categories.`);
    console.log(`✓ Seeded ${brands.length} brands.`);

    // Map names to ObjectIds for products seeding
    const catMap = {};
    categories.forEach(c => { catMap[c.slug] = c._id; });

    const brandMap = {};
    brands.forEach(b => { brandMap[b.slug] = b._id; });

    console.log('\n🛍️  Seeding product catalog...');
    const products = await Product.create([
      {
        name: 'A One Pro Synthetic 5W-30',
        slug: 'aone-pro-synthetic-5w30',
        sku: 'AOP-5W30-4L',
        description: 'Ultra-premium fully synthetic engine oil engineered to provide outstanding engine wear protection and thermal stability under extreme race track and heavy traffic driving conditions.',
        specifications: [
          { key: 'Viscosity', value: '5W-30' },
          { key: 'Volume', value: '4 Liters' },
          { key: 'API Standard', value: 'SP / SN Plus' },
          { key: 'ACEA Standard', value: 'C3 / C2' },
          { key: 'Base Oil', value: '100% Fully Synthetic' },
          { key: 'Pour Point', value: '-42°C' },
          { key: 'Flash Point', value: '230°C' }
        ],
        benefits: [
          'Superior engine wear protection and extended engine life.',
          'Enhanced viscosity stability for better fuel economy.',
          'Outstanding resistance to thermal breakdown.',
          'Excellent low-temperature flow properties for cold starts.'
        ],
        category: catMap['fully-synthetic'],
        brand: brandMap['aone-pro'],
        price: 49.99,
        discountPrice: 42.49,
        stock: 120,
        images: [
          'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1552802640-192a5438a2e2?auto=format&fit=crop&q=80&w=600'
        ],
        ratingsAverage: 4.8,
        ratingsCount: 15,
        active: true
      },
      {
        name: 'Mobil 1 Triple Action 0W-20',
        slug: 'mobil-1-0w20',
        sku: 'MOB-0W20-4L',
        description: 'Advanced full synthetic engine oil designed to keep your engine running like new by providing exceptional wear protection, cleaning power, and overall performance.',
        specifications: [
          { key: 'Viscosity', value: '0W-20' },
          { key: 'Volume', value: '4 Liters' },
          { key: 'API Standard', value: 'SP / Resource Conserving' },
          { key: 'ILSAC', value: 'GF-6A' },
          { key: 'Pour Point', value: '-48°C' },
          { key: 'Flash Point', value: '224°C' }
        ],
        benefits: [
          'Meets or exceeds the latest industry standards.',
          'Helps improve fuel economy and performance.',
          'Outstanding cold weather starting.'
        ],
        category: catMap['fully-synthetic'],
        brand: brandMap['mobil-1'],
        price: 59.99,
        discountPrice: 54.99,
        stock: 85,
        images: [
          'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1552802640-192a5438a2e2?auto=format&fit=crop&q=80&w=600'
        ],
        ratingsAverage: 4.9,
        ratingsCount: 22,
        active: true
      },
      {
        name: 'Motul 8100 X-cess 5W-40',
        slug: 'motul-5w40',
        sku: 'MOT-5W40-5L',
        description: 'High performance 100% synthetic lubricant specially designed for powerful and modern cars fitted with large displacement engines, gasoline, and direct injection diesel turbo engines.',
        specifications: [
          { key: 'Viscosity', value: '5W-40' },
          { key: 'Volume', value: '5 Liters' },
          { key: 'API Standard', value: 'SN / CF' },
          { key: 'OEM Approvals', value: 'MB 229.5, Porsche A40, VW 502 00' },
          { key: 'Flash Point', value: '232°C' }
        ],
        benefits: [
          'Optimized performance under high stress.',
          'High shear resistance and thick oil film protection.',
          'Compatible with catalytic converters.'
        ],
        category: catMap['fully-synthetic'],
        brand: brandMap['motul'],
        price: 64.99,
        discountPrice: null,
        stock: 50,
        images: [
          'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=600'
        ],
        ratingsAverage: 4.7,
        ratingsCount: 8,
        active: true
      },
      {
        name: 'A One Semi-Synth 10W-40',
        slug: 'aone-semi-synthetic-10w40',
        sku: 'AOP-10W40-4L',
        description: 'Premium semi-synthetic lubricant engineered for excellent year-round wear protection. Prevents sludge build-up and maintains optimal fuel economy.',
        specifications: [
          { key: 'Viscosity', value: '10W-40' },
          { key: 'Volume', value: '4 Liters' },
          { key: 'API Standard', value: 'SN / CF' },
          { key: 'Base Oil', value: 'Semi-Synthetic' }
        ],
        benefits: [
          'Active clean agents prevent carbon deposits.',
          'High viscosity stability.',
          'Superb value-to-performance ratio.'
        ],
        category: catMap['semi-synthetic'],
        brand: brandMap['aone-pro'],
        price: 34.99,
        discountPrice: 29.99,
        stock: 200,
        images: [
          'https://images.unsplash.com/photo-1552802640-192a5438a2e2?auto=format&fit=crop&q=80&w=600'
        ],
        ratingsAverage: 4.5,
        ratingsCount: 14,
        active: true
      },
      {
        name: 'Castrol Edge Titanium 5W-30',
        slug: 'castrol-edge-5w30',
        sku: 'CAS-5W30-4L',
        description: 'Castrol Edge is fluid-engineered with patented fluid titanium technology that physically transforms how the oil behaves under extreme pressure, doubling its film strength.',
        specifications: [
          { key: 'Viscosity', value: '5W-30' },
          { key: 'Volume', value: '4 Liters' },
          { key: 'API Standard', value: 'SP / SN' }
        ],
        benefits: [
          'Stronger oil film protection under heavy pressures.',
          'Reduces power-robbing friction by 20%.',
          'Protects the engine for the entire drain interval.'
        ],
        category: catMap['fully-synthetic'],
        brand: brandMap['castrol'],
        price: 52.99,
        discountPrice: 47.99,
        stock: 95,
        images: [
          'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=600'
        ],
        ratingsAverage: 4.6,
        ratingsCount: 18,
        active: true
      },
      {
        name: 'A One Extreme Cooling Coolant Red',
        slug: 'aone-coolant-red',
        sku: 'AOP-CLNT-R-4L',
        description: 'High-performance carboxylate-based organic acid technology (OAT) coolant/antifreeze. Formulated to provide long-lasting corrosion protection for all engine metals.',
        specifications: [
          { key: 'Type', value: 'OAT Organic Coolant' },
          { key: 'Volume', value: '4 Liters' },
          { key: 'Color', value: 'Crimson Red' },
          { key: 'Freezing Point', value: '-37°C' },
          { key: 'Boiling Point', value: '110°C' }
        ],
        benefits: [
          'Protects cooling system up to 5 years or 250,000 km.',
          'Silicate, phosphate, and amine free formula.',
          'Prevents cavitation corrosion and scale build-up.'
        ],
        category: catMap['coolants'],
        brand: brandMap['aone-pro'],
        price: 24.99,
        discountPrice: 19.99,
        stock: 150,
        images: [
          'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=600'
        ],
        ratingsAverage: 4.9,
        ratingsCount: 10,
        active: true
      }
    ]);
    console.log(`✓ Seeded ${products.length} catalog products.`);

    console.log('\n🎟️  Seeding discount coupons...');
    await Coupon.create(couponsData);
    console.log('✓ Seeded discount coupons.');

    console.log('\n🏆 Database Seeding Completed Successfully! All collections populated.');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding MongoDB:', error);
    process.exit(1);
  }
};

seedDB();

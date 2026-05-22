const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_DIR = path.join(__dirname, '..', 'data', 'db');

// Ensure directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const getFilePath = (collection) => path.join(DB_DIR, `${collection}.json`);

const readCollection = (collection) => {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    // If file doesn't exist, try to load default initial seed data or empty array
    const defaultData = getInitialSeedData(collection);
    writeCollection(collection, defaultData);
    return defaultData;
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading collection ${collection}:`, err);
    return [];
  }
};

const writeCollection = (collection, data) => {
  try {
    const filePath = getFilePath(collection);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing collection ${collection}:`, err);
  }
};

// Initial seeds for local database in case MongoDB is not connected
const getInitialSeedData = (collection) => {
  const initialData = {
    categories: [
      { id: 'cat-1', name: 'Fully Synthetic Oil', slug: 'fully-synthetic', description: 'Maximum performance for modern engines', image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=300', active: true },
      { id: 'cat-2', name: 'Semi Synthetic Oil', slug: 'semi-synthetic', description: 'Excellent balance of protection and value', image: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=300', active: true },
      { id: 'cat-3', name: 'Mineral Engine Oil', slug: 'mineral-oil', description: 'Traditional protection for older engines', image: 'https://images.unsplash.com/photo-1552802640-192a5438a2e2?auto=format&fit=crop&q=80&w=300', active: true },
      { id: 'cat-4', name: 'Premium Coolants', slug: 'coolants', description: 'Optimized thermal management for radiators', image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=300', active: true },
      { id: 'cat-5', name: 'Additives & Gear Oils', slug: 'additives', description: 'Transmission, steering, and fuel additives', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=300', active: true }
    ],
    brands: [
      { id: 'br-1', name: 'A One Pro', slug: 'aone-pro', logo: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=150', description: 'Our premium in-house high-performance brand', active: true },
      { id: 'br-2', name: 'Mobil 1', slug: 'mobil-1', logo: 'https://images.unsplash.com/photo-1518384401463-d387de1b827a?auto=format&fit=crop&q=80&w=150', description: 'World leader in synthetic engine oils', active: true },
      { id: 'br-3', name: 'Motul', slug: 'motul', logo: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=150', description: 'Premium racing-grade lubricants and specialty oils', active: true },
      { id: 'br-4', name: 'Castrol Edge', slug: 'castrol', logo: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=150', description: 'Fluid titanium technology engine oil', active: true }
    ],
    coupons: [
      { id: 'cp-1', code: 'LUBRICANT10', discountType: 'percentage', discountValue: 10, minPurchase: 50, expiryDate: '2027-12-31', active: true },
      { id: 'cp-2', code: 'AONEFREE', discountType: 'flat', discountValue: 15, minPurchase: 100, expiryDate: '2027-12-31', active: true }
    ],
    users: [
      // Password hashes correspond to '123456'
      {
        id: 'usr-admin',
        name: 'A One Admin',
        email: 'admin@aonelub.com',
        password: '$2a$10$tMhI6TqD0N8qM6XfB51.nuxR0wHh44/wI14ZfXW8p.b1Wp7aF27xS',
        role: 'admin',
        phone: '+1 (555) 019-9000',
        address: { street: '100 Automotive Blvd', city: 'Detroit', postalCode: '48201', country: 'USA' },
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        investmentAmount: 50000
      },
      {
        id: 'usr-employee',
        name: 'John Crew',
        email: 'employee@aonelub.com',
        password: '$2a$10$tMhI6TqD0N8qM6XfB51.nuxR0wHh44/wI14ZfXW8p.b1Wp7aF27xS',
        role: 'employee',
        phone: '+1 (555) 019-9001',
        address: { street: '200 Logistics Road', city: 'Chicago', postalCode: '60601', country: 'USA' },
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
        investmentAmount: 0
      },
      {
        id: 'usr-customer',
        name: 'Robert Lubricity',
        email: 'customer@aonelub.com',
        password: '$2a$10$tMhI6TqD0N8qM6XfB51.nuxR0wHh44/wI14ZfXW8p.b1Wp7aF27xS',
        role: 'customer',
        phone: '+1 (555) 019-9002',
        address: { street: '456 Gearhead Lane', city: 'Los Angeles', postalCode: '90001', country: 'USA' },
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        investmentAmount: 12500
      }
    ],
    products: [
      {
        id: 'prod-1',
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
        category: 'cat-1',
        brand: 'br-1',
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
        id: 'prod-2',
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
        category: 'cat-1',
        brand: 'br-2',
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
        id: 'prod-3',
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
        category: 'cat-1',
        brand: 'br-3',
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
        id: 'prod-4',
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
        category: 'cat-2',
        brand: 'br-1',
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
        id: 'prod-5',
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
        category: 'cat-1',
        brand: 'br-4',
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
        id: 'prod-6',
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
        category: 'cat-4',
        brand: 'br-1',
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
    ],
    orders: [],
    reviews: []
  };

  return initialData[collection] || [];
};

// Local DB Actions Object to replicate Mongoose model actions
const localDb = {
  find: (collection, filter = {}) => {
    let items = readCollection(collection);
    
    // Apply filters
    return items.filter(item => {
      for (let key in filter) {
        // Simple search logic
        if (filter[key] !== undefined && item[key] !== filter[key]) {
          // Check for sub-arrays or object matching (like Category matching)
          if (typeof filter[key] === 'object' && filter[key] !== null) {
            // E.g., $in or other simple filters
            if (filter[key].$in && Array.isArray(filter[key].$in)) {
              if (!filter[key].$in.includes(item[key])) return false;
            }
          } else {
            return false;
          }
        }
      }
      return true;
    });
  },

  findOne: (collection, filter = {}) => {
    const items = localDb.find(collection, filter);
    return items.length > 0 ? items[0] : null;
  },

  findById: (collection, id) => {
    const items = readCollection(collection);
    return items.find(item => item.id === id || item._id === id) || null;
  },

  create: (collection, data) => {
    const items = readCollection(collection);
    const newItem = {
      id: uuidv4(),
      _id: uuidv4(), // dual support
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    items.push(newItem);
    writeCollection(collection, items);
    return newItem;
  },

  findByIdAndUpdate: (collection, id, updateData) => {
    const items = readCollection(collection);
    const idx = items.findIndex(item => item.id === id || item._id === id);
    if (idx === -1) return null;
    
    items[idx] = {
      ...items[idx],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    writeCollection(collection, items);
    return items[idx];
  },

  findByIdAndDelete: (collection, id) => {
    const items = readCollection(collection);
    const idx = items.findIndex(item => item.id === id || item._id === id);
    if (idx === -1) return null;
    
    const deletedItem = items[idx];
    items.splice(idx, 1);
    writeCollection(collection, items);
    return deletedItem;
  },
  
  // Custom join logic to mimic Mongoose "populate"
  populate: (item, collection, foreignKey, targetCollection) => {
    if (!item) return null;
    const foreignId = item[foreignKey];
    if (!foreignId) return item;
    
    const targetItem = localDb.findById(targetCollection, foreignId);
    return {
      ...item,
      [foreignKey]: targetItem || foreignId
    };
  }
};

module.exports = { localDb, readCollection, writeCollection };

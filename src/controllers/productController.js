const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const { getDBStatus } = require('../config/db');
const { localDb, readCollection } = require('../utils/localDb');

// Helper to filter/sort array for local DB
const filterLocalProducts = (query) => {
  let products = readCollection('products');

  // Active only by default unless specified
  if (query.active !== 'false') {
    products = products.filter(p => p.active !== false);
  }

  // Search filter
  if (query.search) {
    const s = query.search.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(s) || 
      p.description.toLowerCase().includes(s) ||
      p.sku.toLowerCase().includes(s)
    );
  }

  // Category filter
  if (query.category) {
    const category = localDb.findOne('categories', { slug: query.category });
    if (category) {
      products = products.filter(p => p.category === category.id || p.category === category._id);
    } else {
      products = products.filter(p => p.category === query.category);
    }
  }

  // Brand filter
  if (query.brand) {
    const brand = localDb.findOne('brands', { slug: query.brand });
    if (brand) {
      products = products.filter(p => p.brand === brand.id || p.brand === brand._id);
    } else {
      products = products.filter(p => p.brand === query.brand);
    }
  }

  // Price range filter
  if (query.minPrice) {
    products = products.filter(p => p.price >= parseFloat(query.minPrice));
  }
  if (query.maxPrice) {
    products = products.filter(p => p.price <= parseFloat(query.maxPrice));
  }

  // Populate categories and brands for each product
  products = products.map(p => {
    let populated = localDb.populate(p, 'products', 'category', 'categories');
    populated = localDb.populate(populated, 'products', 'brand', 'brands');
    return populated;
  });

  // Sort
  if (query.sort) {
    if (query.sort === 'priceAsc') {
      products.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (query.sort === 'priceDesc') {
      products.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (query.sort === 'nameAsc') {
      products.sort((a, b) => a.name.localeCompare(b.name));
    } else if (query.sort === 'nameDesc') {
      products.sort((a, b) => b.name.localeCompare(a.name));
    } else if (query.sort === 'ratingDesc') {
      products.sort((a, b) => (b.ratingsAverage || 0) - (a.ratingsAverage || 0));
    }
  } else {
    // Default sort: newest
    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Pagination
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 12;
  const skip = (page - 1) * limit;

  const total = products.length;
  const paginatedProducts = products.slice(skip, skip + limit);

  return {
    products: paginatedProducts,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
};

// @desc    Get all products (with search, filter, sort, paginate)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const { search, category, brand, minPrice, maxPrice, sort, page, limit } = req.query;

      // Build query
      let queryObj = { active: true };

      if (search) {
        queryObj.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } }
        ];
      }

      if (category) {
        // Check if query is category slug
        const foundCat = await Category.findOne({ slug: category });
        if (foundCat) {
          queryObj.category = foundCat._id;
        } else {
          queryObj.category = category;
        }
      }

      if (brand) {
        const foundBrand = await Brand.findOne({ slug: brand });
        if (foundBrand) {
          queryObj.brand = foundBrand._id;
        } else {
          queryObj.brand = brand;
        }
      }

      if (minPrice || maxPrice) {
        queryObj.price = {};
        if (minPrice) queryObj.price.$gte = parseFloat(minPrice);
        if (maxPrice) queryObj.price.$lte = parseFloat(maxPrice);
      }

      // Pagination
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 12;
      const skipNum = (pageNum - 1) * limitNum;

      // Create mongoose query
      let mongooseQuery = Product.find(queryObj).populate('category').populate('brand');

      // Sort
      if (sort) {
        if (sort === 'priceAsc') mongooseQuery = mongooseQuery.sort('price');
        else if (sort === 'priceDesc') mongooseQuery = mongooseQuery.sort('-price');
        else if (sort === 'nameAsc') mongooseQuery = mongooseQuery.sort('name');
        else if (sort === 'nameDesc') mongooseQuery = mongooseQuery.sort('-name');
        else if (sort === 'ratingDesc') mongooseQuery = mongooseQuery.sort('-ratingsAverage');
      } else {
        mongooseQuery = mongooseQuery.sort('-createdAt');
      }

      const total = await Product.countDocuments(queryObj);
      const products = await mongooseQuery.skip(skipNum).limit(limitNum);

      return res.status(200).json({
        success: true,
        count: products.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        products
      });
    } else {
      // Return offline results
      const results = filterLocalProducts(req.query);
      return res.status(200).json({
        success: true,
        count: results.products.length,
        total: results.total,
        page: results.page,
        pages: results.pages,
        products: results.products
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id_or_slug
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const { id_or_slug } = req.params;

    if (getDBStatus()) {
      let product;
      // Try fetching by ID first, then by slug
      if (id_or_slug.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(id_or_slug).populate('category').populate('brand');
      } else {
        product = await Product.findOne({ slug: id_or_slug }).populate('category').populate('brand');
      }

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      return res.status(200).json({ success: true, product });
    } else {
      let product = localDb.findById('products', id_or_slug) || localDb.findOne('products', { slug: id_or_slug });
      
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      product = localDb.populate(product, 'products', 'category', 'categories');
      product = localDb.populate(product, 'products', 'brand', 'brands');

      return res.status(200).json({ success: true, product });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private (Admin/Employee only)
exports.createProduct = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const product = await Product.create(req.body);
      const populatedProduct = await Product.findById(product._id).populate('category').populate('brand');
      return res.status(201).json({ success: true, product: populatedProduct });
    } else {
      const product = localDb.create('products', {
        ...req.body,
        ratingsAverage: 0,
        ratingsCount: 0,
        active: true
      });
      const populated = localDb.populate(localDb.populate(product, 'products', 'category', 'categories'), 'products', 'brand', 'brands');
      return res.status(201).json({ success: true, product: populated });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin/Employee only)
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      const product = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).populate('category').populate('brand');
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.status(200).json({ success: true, product });
    } else {
      const product = localDb.findByIdAndUpdate('products', id, req.body);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      const populated = localDb.populate(localDb.populate(product, 'products', 'category', 'categories'), 'products', 'brand', 'brands');
      return res.status(200).json({ success: true, product: populated });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin/Employee only)
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      // Perform a soft delete by marking it inactive
      const product = await Product.findByIdAndUpdate(id, { active: false }, { new: true });
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } else {
      const product = localDb.findByIdAndUpdate('products', id, { active: false });
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.status(200).json({ success: true, message: 'Product deleted successfully' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const categories = await Category.find({ active: true });
      return res.status(200).json({ success: true, categories });
    } else {
      const categories = localDb.find('categories', { active: true });
      return res.status(200).json({ success: true, categories });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get all brands
// @route   GET /api/products/brands
// @access  Public
exports.getBrands = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const brands = await Brand.find({ active: true });
      return res.status(200).json({ success: true, brands });
    } else {
      const brands = localDb.find('brands', { active: true });
      return res.status(200).json({ success: true, brands });
    }
  } catch (err) {
    next(err);
  }
};

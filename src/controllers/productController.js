const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');

// @desc    Get all products (with search, filter, sort, paginate)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const { search, category, brand, minPrice, maxPrice, sort, page, limit } = req.query;

    const queryObj = { active: true };

    if (search) {
      queryObj.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      const foundCat = await Category.findOne({ slug: category });
      queryObj.category = foundCat ? foundCat._id : category;
    }

    if (brand) {
      const foundBrand = await Brand.findOne({ slug: brand });
      queryObj.brand = foundBrand ? foundBrand._id : brand;
    }

    if (minPrice || maxPrice) {
      queryObj.price = {};
      if (minPrice) queryObj.price.$gte = parseFloat(minPrice);
      if (maxPrice) queryObj.price.$lte = parseFloat(maxPrice);
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skipNum = (pageNum - 1) * limitNum;

    let mongooseQuery = Product.find(queryObj).populate('category').populate('brand');

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
    let product;

    if (id_or_slug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id_or_slug).populate('category').populate('brand');
    } else {
      product = await Product.findOne({ slug: id_or_slug }).populate('category').populate('brand');
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private (Admin/Employee only)
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    const populatedProduct = await Product.findById(product._id).populate('category').populate('brand');
    return res.status(201).json({ success: true, product: populatedProduct });
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

    const product = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).populate('category').populate('brand');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.status(200).json({ success: true, product });
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

    const product = await Product.findByIdAndUpdate(id, { active: false }, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ active: true });
    return res.status(200).json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all brands
// @route   GET /api/products/brands
// @access  Public
exports.getBrands = async (req, res, next) => {
  try {
    const brands = await Brand.find({ active: true });
    return res.status(200).json({ success: true, brands });
  } catch (err) {
    next(err);
  }
};

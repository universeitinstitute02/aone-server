const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBrands
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/:id_or_slug', getProduct);

// Privileged Inventory Modifier Guards (Employee & Admin)
router.post('/', protect, authorize('admin', 'employee'), createProduct);
router.put('/:id', protect, authorize('admin', 'employee'), updateProduct);
router.delete('/:id', protect, authorize('admin', 'employee'), deleteProduct);

module.exports = router;

// backend/routes/product.routes.js
const express = require('express');
const router = express.Router();

const {
  getProducts,
  newProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// ----------------------------------------------
// Routes publiques
// ----------------------------------------------
router.route('/products').get(getProducts);            // GET tous les produits
router.route('/product/:id').get(getSingleProduct);    // GET un produit par ID

// ----------------------------------------------
// Routes protégées - Admin seulement
// ----------------------------------------------
router
  .route('/admin/product/new')
  .post(isAuthenticatedUser, authorizeRoles('admin'), newProduct);

router
  .route('/admin/product/:id')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);

module.exports = router;

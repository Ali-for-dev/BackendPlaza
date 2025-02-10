// backend/controllers/productController.js
const Product = require('../models/Product');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// ----------------------------------------------
// Créer un nouveau produit (Admin) => POST /api/v1/admin/product/new
// ----------------------------------------------
exports.newProduct = catchAsyncErrors(async (req, res, next) => {
  // Associe le produit à l’utilisateur qui l’ajoute (admin en général)
  req.body.user = req.user.id; 

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product
  });
});

// ----------------------------------------------
// Récupérer tous les produits => GET /api/v1/products
// Avec recherche, filtre, pagination
// ----------------------------------------------
exports.getProducts = catchAsyncErrors(async (req, res, next) => {
  // -- Déstructuration des query params pour recherche avancée --
  const { keyword, category, brand, minPrice, maxPrice, page, limit } = req.query;

  // -- Construire un objet de requête dynamique --
  let queryObj = {};

  // Recherche par nom (ou modèle)
  if (keyword) {
    queryObj.name = { $regex: keyword, $options: 'i' };
  }

  // Filtre par catégorie
  if (category) {
    queryObj.category = category;
  }

  // Filtre par marque
  if (brand) {
    queryObj.brand = { $regex: brand, $options: 'i' };
  }

  // Filtre par prix
  if (minPrice || maxPrice) {
    queryObj.price = {};
    if (minPrice) {
      queryObj.price.$gte = Number(minPrice);
    }
    if (maxPrice) {
      queryObj.price.$lte = Number(maxPrice);
    }
  }

  // -- Gestion de la pagination --
  // page par défaut = 1, limit par défaut = 8 (par exemple)
  const currentPage = Number(page) || 1;
  const perPage = Number(limit) || 8;
  const skip = (currentPage - 1) * perPage;

  // -- Exécuter la requête --
  const totalProducts = await Product.countDocuments(queryObj);
  const products = await Product.find(queryObj)
    .skip(skip)
    .limit(perPage);

  // Réponse
  res.status(200).json({
    success: true,
    totalProducts,
    count: products.length,
    currentPage,
    totalPages: Math.ceil(totalProducts / perPage),
    products
  });
});

// ----------------------------------------------
// Récupérer un seul produit => GET /api/v1/product/:id
// ----------------------------------------------
exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    product
  });
});

// ----------------------------------------------
// Mettre à jour un produit (Admin) => PUT /api/v1/admin/product/:id
// ----------------------------------------------
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  // Mettre à jour avec les données du body
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,            // retourne le document modifié
    runValidators: true,  // applique les validateurs du schema
    useFindAndModify: false
  });

  res.status(200).json({
    success: true,
    product
  });
});

// ----------------------------------------------
// Supprimer un produit (Admin) => DELETE /api/v1/admin/product/:id
// ----------------------------------------------
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product is deleted.'
  });
});

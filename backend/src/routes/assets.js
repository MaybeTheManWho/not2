const express = require('express');
const { check } = require('express-validator');
const assetsController = require('../controllers/assets');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// @route   GET api/assets/categories
// @desc    Get all asset categories
// @access  Private
router.get('/categories', assetsController.getCategories);

// @route   POST api/assets/categories
// @desc    Create a new asset category
// @access  Private
router.post(
  '/categories',
  [
    check('name', 'Category name is required').not().isEmpty()
  ],
  assetsController.createCategory
);

// @route   GET api/assets
// @desc    Get all assets
// @access  Private
router.get('/', assetsController.getAssets);

// @route   POST api/assets
// @desc    Create a new asset
// @access  Private
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('category_id', 'Category ID is required').not().isEmpty(),
    check('quality', 'Quality is required and must be one of: bad, okay, good, amazing')
      .isIn(['bad', 'okay', 'good', 'amazing'])
  ],
  assetsController.createAsset
);

// @route   PUT api/assets/:id
// @desc    Update an asset
// @access  Private
router.put(
  '/:id',
  assetsController.updateAsset
);

// @route   DELETE api/assets/:id
// @desc    Delete an asset
// @access  Private
router.delete('/:id', assetsController.deleteAsset);

module.exports = router;

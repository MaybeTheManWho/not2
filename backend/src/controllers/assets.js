const { validationResult } = require('express-validator');
const db = require('../../config/db');

// Get all asset categories
exports.getCategories = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM asset_categories ORDER BY name ASC'
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all assets (with optional category filter)
exports.getAssets = async (req, res) => {
  try {
    const { category_id } = req.query;
    
    let query = `
      SELECT a.*, u.username, c.name as category_name, c.icon as category_icon
      FROM assets a
      JOIN users u ON a.user_id = u.id
      JOIN asset_categories c ON a.category_id = c.id
    `;
    
    const queryParams = [];
    
    // Apply category filter if provided
    if (category_id) {
      query += ' WHERE a.category_id = $1';
      queryParams.push(category_id);
    }
    
    // Order by creation date (newest first)
    query += ' ORDER BY a.created_at DESC';
    
    const result = await db.query(query, queryParams);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Create a new asset
exports.createAsset = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, url, notes, pricing, quality, category_id } = req.body;

  try {
    // Validate quality
    if (!['bad', 'okay', 'good', 'amazing'].includes(quality)) {
      return res.status(400).json({ 
        message: 'Quality must be one of: bad, okay, good, amazing' 
      });
    }
    
    // Validate category exists
    const categoryCheck = await db.query(
      'SELECT * FROM asset_categories WHERE id = $1',
      [category_id]
    );
    
    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const result = await db.query(
      `INSERT INTO assets 
        (name, url, notes, pricing, quality, category_id, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [name, url, notes, pricing, quality, category_id, req.user.id]
    );

    // Get additional info for the created asset
    const assetInfo = await db.query(
      `SELECT a.*, u.username, c.name as category_name, c.icon as category_icon
       FROM assets a
       JOIN users u ON a.user_id = u.id
       JOIN asset_categories c ON a.category_id = c.id
       WHERE a.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(assetInfo.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update asset
exports.updateAsset = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name, url, notes, pricing, quality, category_id } = req.body;

  try {
    // Check if asset exists and belongs to user
    const assetCheck = await db.query(
      'SELECT * FROM assets WHERE id = $1',
      [id]
    );

    if (assetCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    if (assetCheck.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this asset' });
    }

    // Validate quality if provided
    if (quality && !['bad', 'okay', 'good', 'amazing'].includes(quality)) {
      return res.status(400).json({ 
        message: 'Quality must be one of: bad, okay, good, amazing' 
      });
    }
    
    // Validate category exists if provided
    if (category_id) {
      const categoryCheck = await db.query(
        'SELECT * FROM asset_categories WHERE id = $1',
        [category_id]
      );
      
      if (categoryCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }

    // Update asset
    const result = await db.query(
      `UPDATE assets 
       SET name = COALESCE($1, name),
           url = COALESCE($2, url),
           notes = COALESCE($3, notes),
           pricing = COALESCE($4, pricing),
           quality = COALESCE($5, quality),
           category_id = COALESCE($6, category_id)
       WHERE id = $7
       RETURNING *`,
      [
        name || assetCheck.rows[0].name,
        url !== undefined ? url : assetCheck.rows[0].url,
        notes !== undefined ? notes : assetCheck.rows[0].notes,
        pricing !== undefined ? pricing : assetCheck.rows[0].pricing,
        quality || assetCheck.rows[0].quality,
        category_id || assetCheck.rows[0].category_id,
        id
      ]
    );

    // Get additional info for the updated asset
    const assetInfo = await db.query(
      `SELECT a.*, u.username, c.name as category_name, c.icon as category_icon
       FROM assets a
       JOIN users u ON a.user_id = u.id
       JOIN asset_categories c ON a.category_id = c.id
       WHERE a.id = $1`,
      [result.rows[0].id]
    );

    res.json(assetInfo.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete asset
exports.deleteAsset = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if asset exists and belongs to user
    const assetCheck = await db.query(
      'SELECT * FROM assets WHERE id = $1',
      [id]
    );

    if (assetCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    if (assetCheck.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this asset' });
    }

    // Delete asset
    await db.query(
      'DELETE FROM assets WHERE id = $1',
      [id]
    );

    res.json({ message: 'Asset removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Create a new asset category
exports.createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, icon, description } = req.body;

  try {
    // Check if category already exists
    const categoryCheck = await db.query(
      'SELECT * FROM asset_categories WHERE name = $1',
      [name]
    );

    if (categoryCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const result = await db.query(
      `INSERT INTO asset_categories 
        (name, icon, description) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, icon, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

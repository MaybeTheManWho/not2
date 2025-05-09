const { validationResult } = require('express-validator');
const db = require('../../config/db');

// Get all todos (with filter options)
exports.getTodos = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT t.*, u.username 
      FROM todos t
      JOIN users u ON t.user_id = u.id
    `;
    
    const queryParams = [];
    
    // Apply filters
    if (status && ['not-started', 'in-progress', 'completed'].includes(status)) {
      query += ' WHERE t.status = $1';
      queryParams.push(status);
    }
    
    // Order by created_at desc
    query += ' ORDER BY t.created_at DESC';
    
    const result = await db.query(query, queryParams);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Create a new todo
exports.createTodo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, status, due_date } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO todos 
        (title, description, status, due_date, user_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [title, description, status || 'not-started', due_date, req.user.id]
    );

    // Get the username for the created todo
    const userResult = await db.query(
      'SELECT username FROM users WHERE id = $1',
      [req.user.id]
    );

    const todo = {
      ...result.rows[0],
      username: userResult.rows[0].username
    };

    res.status(201).json(todo);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update todo
exports.updateTodo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { title, description, status, due_date, completed } = req.body;

  try {
    // Check if todo exists and belongs to user
    const todoCheck = await db.query(
      'SELECT * FROM todos WHERE id = $1',
      [id]
    );

    if (todoCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    if (todoCheck.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this todo' });
    }

    // Handle completed status changes
    const isCompletedChanged = completed !== undefined && completed !== todoCheck.rows[0].completed;
    const completedAt = isCompletedChanged && completed ? 'CURRENT_TIMESTAMP' : 
                        isCompletedChanged && !completed ? 'NULL' : 
                        'completed_at';

    // Update todo
    const result = await db.query(
      `UPDATE todos 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           due_date = COALESCE($4, due_date),
           completed = COALESCE($5, completed),
           completed_at = ${completedAt}
       WHERE id = $6
       RETURNING *`,
      [
        title || todoCheck.rows[0].title,
        description !== undefined ? description : todoCheck.rows[0].description,
        status || todoCheck.rows[0].status,
        due_date !== undefined ? due_date : todoCheck.rows[0].due_date,
        completed !== undefined ? completed : todoCheck.rows[0].completed,
        id
      ]
    );

    // Get the username for the updated todo
    const userResult = await db.query(
      'SELECT username FROM users WHERE id = $1',
      [req.user.id]
    );

    const todo = {
      ...result.rows[0],
      username: userResult.rows[0].username
    };

    res.json(todo);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete todo
exports.deleteTodo = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if todo exists and belongs to user
    const todoCheck = await db.query(
      'SELECT * FROM todos WHERE id = $1',
      [id]
    );

    if (todoCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    if (todoCheck.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this todo' });
    }

    // Delete todo
    await db.query(
      'DELETE FROM todos WHERE id = $1',
      [id]
    );

    res.json({ message: 'Todo removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

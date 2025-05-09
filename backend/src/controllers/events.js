const { validationResult } = require('express-validator');
const db = require('../../config/db');

// Get all events (with optional date filtering)
exports.getEvents = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let query = `
      SELECT e.*, u.username 
      FROM events e
      JOIN users u ON e.user_id = u.id
    `;
    
    const queryParams = [];
    let whereClause = '';
    
    // Apply date filters if provided
    if (start_date) {
      whereClause += 'e.date >= $' + (queryParams.length + 1);
      queryParams.push(start_date);
    }
    
    if (end_date) {
      if (whereClause) {
        whereClause += ' AND ';
      }
      whereClause += 'e.date <= $' + (queryParams.length + 1);
      queryParams.push(end_date);
    }
    
    if (whereClause) {
      query += ' WHERE ' + whereClause;
    }
    
    // Order by date
    query += ' ORDER BY e.date ASC';
    
    const result = await db.query(query, queryParams);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Create a new event
exports.createEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, date, reminder, image_index } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO events 
        (title, description, date, reminder, image_index, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [title, description, date, reminder, image_index || 1, req.user.id]
    );

    // Get the username for the created event
    const userResult = await db.query(
      'SELECT username FROM users WHERE id = $1',
      [req.user.id]
    );

    const event = {
      ...result.rows[0],
      username: userResult.rows[0].username
    };

    res.status(201).json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { title, description, date, reminder, completed, image_index } = req.body;

  try {
    // Check if event exists and belongs to user
    const eventCheck = await db.query(
      'SELECT * FROM events WHERE id = $1',
      [id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (eventCheck.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    // Handle completed status changes
    const isCompletedChanged = completed !== undefined && completed !== eventCheck.rows[0].completed;
    const completedAt = isCompletedChanged && completed ? 'CURRENT_TIMESTAMP' : 
                        isCompletedChanged && !completed ? 'NULL' : 
                        'completed_at';

    // Update event
    const result = await db.query(
      `UPDATE events 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           date = COALESCE($3, date),
           reminder = COALESCE($4, reminder),
           completed = COALESCE($5, completed),
           completed_at = ${completedAt},
           image_index = COALESCE($6, image_index)
       WHERE id = $7
       RETURNING *`,
      [
        title || eventCheck.rows[0].title,
        description !== undefined ? description : eventCheck.rows[0].description,
        date || eventCheck.rows[0].date,
        reminder !== undefined ? reminder : eventCheck.rows[0].reminder,
        completed !== undefined ? completed : eventCheck.rows[0].completed,
        image_index || eventCheck.rows[0].image_index,
        id
      ]
    );

    // Get the username for the updated event
    const userResult = await db.query(
      'SELECT username FROM users WHERE id = $1',
      [req.user.id]
    );

    const event = {
      ...result.rows[0],
      username: userResult.rows[0].username
    };

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if event exists and belongs to user
    const eventCheck = await db.query(
      'SELECT * FROM events WHERE id = $1',
      [id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (eventCheck.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    // Delete event
    await db.query(
      'DELETE FROM events WHERE id = $1',
      [id]
    );

    res.json({ message: 'Event removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get events for a specific date
exports.getEventsByDate = async (req, res) => {
  const { date } = req.params;

  try {
    // SQL to get events on a specific date (ignoring time)
    const result = await db.query(
      `SELECT e.*, u.username 
       FROM events e
       JOIN users u ON e.user_id = u.id
       WHERE DATE(e.date) = DATE($1)
       ORDER BY e.date ASC`,
      [date]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

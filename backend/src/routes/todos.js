const express = require('express');
const { check } = require('express-validator');
const todosController = require('../controllers/todos');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// @route   GET api/todos
// @desc    Get all todos
// @access  Private
router.get('/', todosController.getTodos);

// @route   POST api/todos
// @desc    Create a new todo
// @access  Private
router.post(
  '/',
  [
    check('title', 'Title is required').not().isEmpty()
  ],
  todosController.createTodo
);

// @route   PUT api/todos/:id
// @desc    Update a todo
// @access  Private
router.put(
  '/:id',
  todosController.updateTodo
);

// @route   DELETE api/todos/:id
// @desc    Delete a todo
// @access  Private
router.delete('/:id', todosController.deleteTodo);

module.exports = router;

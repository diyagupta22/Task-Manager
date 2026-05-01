const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ─── MILESTONE 3: ALL ROUTES BELOW ARE PROTECTED ────────────────────────────
// Apply the `protect` middleware to the whole router
router.use(protect);

// In-memory task store for demo purposes (replace with a Task model + MongoDB)
let tasks = [
  { id: '1', title: 'Set up authentication', done: true, priority: 'high' },
  { id: '2', title: 'Build the React frontend', done: false, priority: 'high' },
  { id: '3', title: 'Write unit tests', done: false, priority: 'medium' },
  { id: '4', title: 'Deploy to production', done: false, priority: 'low' },
];

// GET /api/tasks — Get all tasks for the logged-in user
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    count: tasks.length,
    user: req.user.name, // Proof that we know who the user is
    data: tasks,
  });
});

// POST /api/tasks — Create a new task
router.post('/', (req, res) => {
  const { title, priority = 'medium' } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Task title is required.' });
  }

  const newTask = {
    id: Date.now().toString(),
    title,
    priority,
    done: false,
    createdBy: req.user._id,
  };

  tasks.push(newTask);
  res.status(201).json({ success: true, data: newTask });
});

// PATCH /api/tasks/:id — Toggle task done status
router.patch('/:id', (req, res) => {
  const task = tasks.find((t) => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }
  task.done = !task.done;
  res.status(200).json({ success: true, data: task });
});

// DELETE /api/tasks/:id — Delete a task
router.delete('/:id', (req, res) => {
  const idx = tasks.findIndex((t) => t.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }
  tasks.splice(idx, 1);
  res.status(200).json({ success: true, message: 'Task deleted.' });
});

// ─── Admin-only route example ─────────────────────────────────────────────────
router.get('/admin/all', authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin access granted.',
    data: tasks,
  });
});

module.exports = router;

// server.js
const fs = require('fs');
const https = require('https');
const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// --- JWT Authentication Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).send('Access Denied: No Token Provided');

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) return res.status(403).send('Invalid Token');
    req.user = user;
    next();
  });
};

// --- Access Control Middleware Example ---
const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).send('Access Denied: Insufficient Permissions');
    }
    next();
  };
};

// --- Routes ---

// Home Route
app.get('/', (req, res) => {
  res.send('Welcome to the Connectly API!');
});

// Login Route to Issue JWT (For demonstration only)
app.post('/login', (req, res) => {
  // In a real application, verify user credentials here
  const user = { id: 1, username: req.body.username, role: 'admin' }; // or 'user'
  const token = jwt.sign(user, 'your-secret-key', { expiresIn: '1h' });
  res.json({ token });
});

// --- CRUD Endpoints for "Items" ---

// Create Item (POST /items) with validation
app.post('/items', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').isLength({ min: 5 }).withMessage('Description must be at least 5 characters long')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const newItem = { id: Date.now(), ...req.body };
  // In a real app, save newItem to the database here
  res.status(201).json(newItem);
});

// Read Items (GET /items)
app.get('/items', authenticateToken, (req, res) => {
  // In a real app, fetch items from the database
  res.json([{ id: 1, name: 'Sample Item', description: 'This is an item' }]);
});

// Update Item (PUT /items/:id)
app.put('/items/:id', authenticateToken, [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().isLength({ min: 5 }).withMessage('Description must be at least 5 characters long')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // In a real app, update the item in the database
  res.json({ id: req.params.id, ...req.body });
});

// Delete Item (DELETE /items/:id) - Only admin can delete
app.delete('/items/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
  // In a real app, delete the item from the database
  res.send(`Item with id ${req.params.id} deleted`);
});

// --- Start HTTPS Server ---
const httpsOptions = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
};

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`Secure server running on https://localhost:${PORT}`);
});

import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const db = new Database('users.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    google_id TEXT,
    picture TEXT,
    role TEXT DEFAULT 'user'
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    pickup TEXT NOT NULL,
    dropoff TEXT NOT NULL,
    mode TEXT NOT NULL,
    weight REAL NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'Placed',
    location TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  )
`);
try { db.exec("ALTER TABLE orders ADD COLUMN location TEXT DEFAULT ''"); } catch {}

if (process.env.ADMIN_EMAIL) {
  db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(process.env.ADMIN_EMAIL);
}

app.use(cors());
app.use(express.json());

app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hashedPassword);
  const user = { id: result.lastInsertRowid, name, email };

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, picture: user.picture, role: user.role } });
});

app.post('/api/google-login', async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
    const { sub: googleId, email, name, picture } = ticket.getPayload();

    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      const result = db.prepare('INSERT INTO users (name, email, google_id, picture) VALUES (?, ?, ?, ?)').run(name, email, googleId, picture);
      user = { id: result.lastInsertRowid, name, email, picture };
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, picture: user.picture, role: user.role } });
  } catch (error) {
    res.status(400).json({ error: 'Invalid Google token: ' + error.message });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
  next();
};

// Admin: assign role to a user
app.patch('/api/users/:id/role', authenticateToken, requireAdmin, (req, res) => {
  const { role } = req.body;
  if (!['admin', 'user'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  res.json({ success: true });
});

// Admin: list all users
app.get('/api/users', authenticateToken, requireAdmin, (req, res) => {
  const users = db.prepare('SELECT id, name, email, role, picture FROM users').all();
  res.json({ users });
});

// Admin: get all orders with user info
app.get('/api/admin/orders', authenticateToken, requireAdmin, (req, res) => {
  const orders = db.prepare(`
    SELECT o.*, u.name as user_name, u.email as user_email
    FROM orders o JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `).all();
  res.json({ orders });
});

// Admin: update order status and location
app.patch('/api/admin/orders/:id', authenticateToken, requireAdmin, (req, res) => {
  const { status, location } = req.body;
  const order = db.prepare('SELECT id FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  db.prepare('UPDATE orders SET status = ?, location = ? WHERE id = ?').run(status, location, req.params.id);
  res.json({ success: true });
});

// Orders
app.post('/api/orders', authenticateToken, (req, res) => {
  const { pickup, dropoff, mode, weight, total } = req.body;
  const result = db.prepare('INSERT INTO orders (user_id, pickup, dropoff, mode, weight, total) VALUES (?, ?, ?, ?, ?, ?)').run(req.user.id, pickup, dropoff, mode, weight, total);
  res.json({ id: result.lastInsertRowid, pickup, dropoff, mode, weight, total, status: 'Placed' });
});

app.get('/api/orders', authenticateToken, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ orders });
});

app.get('/api/verify', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, name, email, picture, role FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

app.get('/api/profile', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, name, email, picture, role FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

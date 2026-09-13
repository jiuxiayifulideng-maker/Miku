const bcrypt = require('bcryptjs');
const db = require('./db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`).run();

const username = process.env.ADMIN_USERNAME || 'an';
const password = process.env.ADMIN_PASSWORD || '1234';

const existing = db.prepare('SELECT id FROM admin WHERE username = ?').get(username);
if (!existing) {
  const passwordHash = bcrypt.hashSync(password, 12);
  db.prepare('INSERT INTO admin (username, password_hash) VALUES (?, ?)')
    .run(username, passwordHash);
}

function verifyAdmin(inputUsername, inputPassword) {
  const admin = db.prepare('SELECT * FROM admin WHERE username = ?').get(inputUsername);
  if (!admin) return false;
  return bcrypt.compareSync(inputPassword, admin.password_hash);
}

module.exports = { username, verifyAdmin };

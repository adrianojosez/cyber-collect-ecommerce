const Database = require('./config.js')

const initDb = {
  async init() {
    // Receives database info
    const db = await Database()

    // Enable foreign key constraints in SQLite
    await db.exec('PRAGMA foreign_keys = ON')

    await db.exec(`CREATE TABLE IF NOT EXISTS admin (
      userLogin TEXT,
      password TEXT
    )`)

    await db.exec(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      tipo TEXT,
      points INTEGER DEFAULT 0
    )`)

    await db.exec(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER,
      image TEXT,
      name TEXT,
      price MONEY,
      description TEXT,
      category TEXT,
      altText TEXT
    )`)

    await db.exec(`CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      product_id INTEGER,
      quantity INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(product_id) REFERENCES products(id),
      UNIQUE(user_id, product_id)
    )`)

    await db.exec('DROP TABLE IF EXISTS order_items')
    await db.exec('DROP TABLE IF EXISTS orders')

    await db.exec(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      total_price REAL,
      status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`)

    await db.exec(`CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      product_id INTEGER,
      quantity INTEGER,
      price REAL,
      FOREIGN KEY(order_id) REFERENCES orders(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    )`)

    // Adicionar coluna points se não existir
    try {
      await db.exec('ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0')
    } catch (error) {
      // Coluna já existe, ignorar
    }

    await db.run(`INSERT OR IGNORE INTO admin (
      userLogin,
      password
    ) VALUES (
      "admin@email.com",
      "12345aZ"
    )`)

    // Closes the connection to the database
    await db.close()
  }
}

// Initialize tha database
initDb.init()

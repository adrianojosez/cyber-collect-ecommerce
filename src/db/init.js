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
      tipo TEXT
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

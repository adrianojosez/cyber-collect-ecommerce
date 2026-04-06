// importing sqlite and sqlite3
const sqlite3 = require('sqlite3')
// const sqlite = require('sqlite')
// even though we can import sqlite as above, we do not need to import all its funcionalidades because we're going to use only the "open" function. To import only this function, we declare the funcion name as the const name, but between {}, like this:
const {open} = require('sqlite')

const Database = () =>
  open({
    filename: './src/db/cybercollect.sqlite',
    driver: sqlite3.Database
  })

Database.initDatabase = async () => {
  const db = await Database()
  await db.exec('PRAGMA foreign_keys = ON')
  await db.exec(`CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id),
    UNIQUE(user_id, product_id)
  )`)
  await db.close()
}

module.exports = Database

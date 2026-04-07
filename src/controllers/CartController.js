const Database = require('../db/config.js')

const parsePrice = price => {
  if (price === undefined || price === null) return 0
  const normalized = String(price)
    .replace(/\s/g, '')
    .replace(/R\$/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.')
    .replace(/[^0-9.\-]/g, '')
  return Number(normalized) || 0
}

const formatCurrency = value =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)

const ensureCart = req => {
  if (!req.session.cart) {
    req.session.cart = []
  }
  return req.session.cart
}

const persistCartItem = async (db, userId, productId, quantity) => {
  const existingCartItem = await db.get(
    'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  )

  if (existingCartItem) {
    await db.run(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [existingCartItem.quantity + quantity, existingCartItem.id]
    )
  } else {
    await db.run(
      'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
      [userId, productId, quantity]
    )
  }
}

module.exports = {
  async add(req, res) {
    const db = await Database()
    const productId = req.params.id
    const product = await db.get('SELECT * FROM products WHERE id = ?', productId)

    if (!product) {
      await db.close()
      return res.redirect(req.get('Referrer') || '/')
    }

    const redirectUrl = req.get('Referrer') || '/'
    const cart = ensureCart(req)
    const existingItem = cart.find(item => String(item.id) === String(productId))

    if (existingItem) {
      existingItem.quantidade += 1
    } else {
      cart.push({
        id: product.id,
        nome: product.name,
        preco: product.price,
        imagem: product.image,
        quantidade: 1
      })
    }

    if (req.session.user && req.session.user.id) {
      await persistCartItem(db, req.session.user.id, productId, 1)
    }

    req.session.flash = {
      type: 'success',
      message: `"${product.name}" adicionado ao carrinho com sucesso!`
    }

    await db.close()
    return res.redirect(redirectUrl)
  },

  async remove(req, res) {
    ensureCart(req)
    const db = await Database()
    const productId = req.params.id

    if (req.session.user && req.session.user.id) {
      await db.run(
        'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
        [req.session.user.id, productId]
      )
    }

    await db.close()
    req.session.cart = req.session.cart.filter(
      item => String(item.id) !== String(productId)
    )

    req.session.flash = {
      type: 'info',
      message: 'Produto removido do carrinho.'
    }

    return res.redirect('/cart')
  },

  async updateQuantity(req, res) {
    ensureCart(req)
    const db = await Database()
    const productId = req.body.id || req.body.productId
    const quantity = Number(req.body.quantity)
    const validQuantity = Number.isNaN(quantity) || quantity < 1 ? 1 : quantity

    const item = req.session.cart.find(
      item => String(item.id) === String(productId)
    )

    if (item) {
      item.quantidade = validQuantity
    }

    if (req.session.user && req.session.user.id) {
      const existingCartItem = await db.get(
        'SELECT id FROM cart_items WHERE user_id = ? AND product_id = ?',
        [req.session.user.id, productId]
      )

      if (existingCartItem) {
        await db.run(
          'UPDATE cart_items SET quantity = ? WHERE id = ?',
          [validQuantity, existingCartItem.id]
        )
      } else {
        await db.run(
          'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
          [req.session.user.id, productId, validQuantity]
        )
      }
    }

    await db.close()
    return res.redirect('/cart')
  },

  view(req, res) {
    ensureCart(req)
    const cart = req.session.cart
    const cartWithSubtotals = cart.map(item => {
      const subtotal = parsePrice(item.preco) * item.quantidade
      return {
        ...item,
        subtotal,
        subtotalFormatted: formatCurrency(subtotal),
        precoFormatted: formatCurrency(parsePrice(item.preco))
      }
    })

    const total = cartWithSubtotals.reduce((sum, item) => sum + item.subtotal, 0)

    return res.render('index', {
      page: 'cart',
      title: 'Carrinho de Compras',
      description: 'Veja e gerencie os itens no seu carrinho de compras da Cyber-Collect.',
      keywords: 'carrinho, compras, cyber-collect, produtos',
      ogTitle: 'Carrinho de Compras - Cyber-Collect',
      ogDescription: 'Veja e gerencie os itens no seu carrinho de compras.',
      ogImage: '/images/logo.svg',
      canonical: 'https://seusite.com/cart',
      jsonLd: null,
      button: '<a class="header__button button__void button" href="/login">Login</a>',
      cart: cartWithSubtotals,
      total: total,
      totalFormatted: formatCurrency(total)
    })
  }
}

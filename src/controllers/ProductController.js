// import database
const Database = require('../db/config.js')

module.exports = {
  async index(req, res) {
    const db = await Database()

    try {
      const itemCode = req.params.code
      const action = req.params.action

      if (!req.session.user || req.session.user.tipo !== 'admin') {
        return res.redirect('/login')
      }

      if (action === 'delete' && itemCode) {
        await db.run('DELETE FROM products WHERE id = ?', [itemCode])
      }

      return res.redirect('/admin/todos-os-produtos')
    } finally {
      await db.close()
    }
  },

  async create(req, res) {
    const db = await Database()

    try {
      let productId = req.params.code
      let isId = true

      while (isId) {
        let generatedId = ''

        for (let i = 0; i < 7; i++) {
          generatedId += Math.floor(Math.random() * 10).toString()
        }

        const productsIdList = await db.all('SELECT id FROM products')
        const exists = productsIdList.some(
          product => String(product.id) === generatedId
        )

        if (!exists) {
          productId = generatedId
          isId = false
        }
      }

      return res.redirect(`/admin/${productId}`)
    } finally {
      await db.close()
    }
  },

  async open(req, res) {
    const db = await Database()

    try {
      const productId = req.params.code
      const product = await db.get('SELECT * FROM products WHERE id = ?', [productId])

      if (!product) {
        return res.status(404).render('index', {
          page: '404',
          title: 'Produto não encontrado',
          button: '<a class="header__button button__void button" href="/">Voltar ao início</a>'
        })
      }

      const similar = await db.all(
        'SELECT * FROM products WHERE category = ? AND id != ? ORDER BY id DESC',
        [product.category, product.id]
      )

      const safePrice = typeof product.price === 'string'
        ? product.price.replace('R$', '').replace(',', '.').trim()
        : String(product.price ?? '0')

      return res.render('index', {
        page: 'product',
        title: product.name,
        description: product.description,
        keywords: `${product.name}, ${product.category}, action figures, colecionáveis, geek`,
        ogTitle: product.name,
        ogDescription: product.description,
        ogImage: product.image,
        canonical: `https://seusite.com/produto/${productId}`,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: product.image,
          offers: {
            '@type': 'Offer',
            price: safePrice,
            priceCurrency: 'BRL',
            availability: 'https://schema.org/InStock'
          }
        },
        button: '<a class="header__button button__void button" href="/login">Login</a>',
        product,
        others: similar
      })
    } finally {
      await db.close()
    }
  },

  async save(req, res) {
    const db = await Database()

    try {
      const roomId = req.params.code
      const file = req.body.imageSrc
      const prodName = req.body.prodName
      const price = req.body.price
      const description = req.body.description
      const alt = req.body.imgAlt
      const category = req.body.category

      const item = await db.get('SELECT * FROM products WHERE id = ?', [roomId])

      if (!item) {
        await db.run(
          `INSERT INTO products (
            id,
            image,
            name,
            price,
            description,
            category,
            altText
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [roomId, file, prodName, price, description, category, alt]
        )
      } else {
        await db.run(
          `UPDATE products SET image = ?, name = ?, price = ?, description = ?, category = ?, altText = ? WHERE id = ?`,
          [file, prodName, price, description, category, alt, roomId]
        )
      }

      return res.redirect(`/produto/${roomId}`)
    } finally {
      await db.close()
    }
  },

  async show(req, res) {
    const db = await Database()

    try {
      const starWars = await db.all(
        'SELECT * FROM products WHERE category = ? ORDER BY id DESC LIMIT 6',
        ['star-wars']
      )
      const videogames = await db.all(
        'SELECT * FROM products WHERE category = ? ORDER BY id DESC LIMIT 6',
        ['videogames']
      )
      const misc = await db.all(
        'SELECT * FROM products WHERE category = ? ORDER BY id DESC LIMIT 6',
        ['diversos']
      )
      const featuredCategories = await db.all(
        'SELECT DISTINCT category FROM products ORDER BY category'
      )

      return res.render('index', {
        page: 'main',
        title: 'Home',
        description: 'Cyber-Collect: Loja especializada em hardware, action figures e colecionáveis geek. Encontre os melhores produtos para gamers e colecionadores.',
        keywords: 'hardware, action figures, colecionáveis, geek, star wars, videogames, informática',
        ogTitle: 'Cyber-Collect - Hardware e Colecionáveis Geek',
        ogDescription: 'Loja especializada em hardware, action figures e colecionáveis geek. Encontre os melhores produtos para gamers e colecionadores.',
        ogImage: '/images/logo.svg',
        canonical: 'https://seusite.com/',
        jsonLd: null,
        button: '<a class="header__button button__void button" href="login">Login</a>',
        starWars,
        consoles: videogames,
        diversos: misc,
        categories: featuredCategories
      })
    } catch (error) {
      console.error('Erro ao carregar a home de produtos:', error)
      return res.status(500).render('index', {
        page: '404',
        title: 'Erro ao carregar produtos',
        button: '<a class="header__button button__void button" href="/">Voltar ao início</a>'
      })
    } finally {
      await db.close()
    }
  },

  async view(req, res) {
    const db = await Database()

    try {
      const searchQuery = (req.query.search || req.body.search || '').trim()
      const category = req.query.category || req.params.category

      let productsList = []
      let heading = 'Produtos selecionados'

      if (category) {
        productsList = await db.all(
          'SELECT * FROM products WHERE category = ? ORDER BY id DESC',
          [category]
        )
        heading = `Categoria: ${category}`
      } else if (searchQuery) {
        const pattern = `%${searchQuery}%`
        productsList = await db.all(
          `SELECT * FROM products WHERE name LIKE ? OR description LIKE ? ORDER BY CASE WHEN name LIKE ? THEN 0 ELSE 1 END, id DESC`,
          [pattern, pattern, pattern]
        )
        heading = `Resultados para "${searchQuery}"`
      } else {
        productsList = await db.all('SELECT * FROM products ORDER BY id DESC')
      }

      return res.render('index', {
        page: 'view-category',
        title: 'Ver Produtos',
        button: '<a class="header__button button__void button" href="login">Login</a>',
        productsList,
        heading,
        itemCount: productsList.length
      })
    } finally {
      await db.close()
    }
  },

  async viewAll(req, res) {
    const db = await Database()

    try {
      const allProducts = await db.all('SELECT * FROM products ORDER BY id DESC')

      return res.render('index', {
        page: 'all-products',
        title: 'Produtos',
        button: '<div class="header__button button__void button">Admin</div>',
        products: allProducts
      })
    } finally {
      await db.close()
    }
  },

  async openEdit(req, res) {
    const db = await Database()

    try {
      const itemCode = req.params.code
      const item = await db.get('SELECT * FROM products WHERE id = ?', [itemCode])

      return res.render('index', {
        page: 'edit',
        title: 'Edição',
        button: '<div class="header__button button__void button">Admin</div>',
        item
      })
    } finally {
      await db.close()
    }
  }
}

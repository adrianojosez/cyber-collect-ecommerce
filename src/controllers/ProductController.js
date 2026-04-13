// import database
const Database = require('../db/config.js')

module.exports = {
  async index(req, res) {
    const db = await Database()
    const itemCode = req.params.code // gets parameter from form action route variable
    const action = req.params.action // gets action from form action route variable

    // Verificar se o usuário está logado como admin
    if (!req.session.user || req.session.user.tipo !== 'admin') {
      return res.redirect('/login')
    }

    if (action === 'delete') {
      await db.run(`DELETE FROM products WHERE id = ${itemCode}`)
      res.redirect('/todos-os-produtos')
    } else {
      // Handle other actions if needed
      res.redirect('/todos-os-produtos')
    }

    await db.close()
  },

  async create(req, res) {
    let productId = req.params.code
    let isId = true

    const db = await Database()

    while (isId) {
      // If the id number is equal to existing id in database, keeps generating a new random number to the id
      for (var i = 0; i < 7; i++) {
        i == 0
          ? (productId = Math.floor(Math.random() * 10).toString())
          : (productId += Math.floor(Math.random() * 10).toString())
      }

      // Verify if id number exists by selecting id in database
      const productsIdList = await db.all(`SELECT id FROM products`)
      isId = productsIdList.some(
        productIdNumber => productIdNumber === productId
      ) // if values are equal, returns true and generate a new number

      // If id number is different from database (return false)
      if (!isId) {
        // Insert new id into route address
        res.redirect(`/admin/${productId}`)
      }
    }

    await db.close()
  },

  async open(req, res) {
    const db = await Database()
    const productId = req.params.code
    const product = await db.get('SELECT * FROM products WHERE id = ?', [productId])

    if (!product) {
      await db.close()
      return res.status(404).render('index', {
        page: '404',
        title: 'Produto não encontrado',
        button: '<a class="header__button button__void button" href="/">Voltar ao início</a>'
      })
    }

    const similar = await db.all(
      'SELECT * FROM products WHERE category = ? AND id != ?',
      [product.category, product.id]
    )

    await db.close()

    res.render('index', {
      page: 'product',
      title: product.name,
      description: product.description,
      keywords: `${product.name}, ${product.category}, action figures, colecionáveis, geek`,
      ogTitle: product.name,
      ogDescription: product.description,
      ogImage: product.image,
      canonical: `https://seusite.com/produto/${productId}`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": product.image,
        "offers": {
          "@type": "Offer",
          "price": product.price.replace('R$', '').replace(',', '.').trim(),
          "priceCurrency": "BRL",
          "availability": "https://schema.org/InStock"
        }
      },
      button:
        '<a class="header__button button__void button" href="/login">Login</a>',
      product: product,
      others: similar
    })
  },

  async save(req, res) {
    const db = await Database()
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

    await db.close()
    res.redirect(`/produto/${roomId}`)
  },

  async show(req, res) {
    const db = await Database()
    const starWars = await db.all('SELECT * FROM products WHERE category = ? LIMIT 6', ['star-wars'])
    const videogames = await db.all('SELECT * FROM products WHERE category = ? LIMIT 6', ['videogames'])
    const misc = await db.all('SELECT * FROM products WHERE category = ? LIMIT 6', ['diversos'])
    const featuredCategories = await db.all('SELECT DISTINCT category FROM products ORDER BY category')

    await db.close()

    res.render('index', {
      page: 'main',
      title: 'Home',
      description: 'Cyber-Collect: Loja especializada em hardware, action figures e colecionáveis geek. Encontre os melhores produtos para gamers e colecionadores.',
      keywords: 'hardware, action figures, colecionáveis, geek, star wars, videogames, informática',
      ogTitle: 'Cyber-Collect - Hardware e Colecionáveis Geek',
      ogDescription: 'Loja especializada em hardware, action figures e colecionáveis geek. Encontre os melhores produtos para gamers e colecionadores.',
      ogImage: '/images/logo.svg',
      canonical: 'https://seusite.com/',
      jsonLd: null,
      button:
        '<a class="header__button button__void button" href="login">Login</a>',
      starWars: starWars,
      consoles: videogames,
      diversos: misc,
      categories: featuredCategories
    })
  },

  async view(req, res) {
    const db = await Database()
    const searchQuery = req.query.search || req.body.search || ''
    const category = req.query.category || req.params.category

    let productsList = []
    let heading = 'Produtos selecionados'

    if (category) {
      productsList = await db.all('SELECT * FROM products WHERE category = ?', [category])
      heading = `Categoria: ${category}`
    } else if (searchQuery) {
      const pattern = `%${searchQuery}%`
      productsList = await db.all(
        `SELECT * FROM products WHERE name LIKE ? OR description LIKE ? ORDER BY CASE WHEN name LIKE ? THEN 0 ELSE 1 END`,
        [pattern, pattern, pattern]
      )
      heading = `Resultados para "${searchQuery}"`
    } else {
      productsList = await db.all('SELECT * FROM products ORDER BY id DESC')
    }

    await db.close()

    res.render('index', {
      page: 'view-category',
      title: 'Ver Produtos',
      button:
        '<a class="header__button button__void button" href="login">Login</a>',
      productsList: productsList,
      heading,
      itemCount: productsList.length
    })
  },

  async viewAll(req, res) {
    const db = await Database()
    const allProducts = await db.all('SELECT * FROM products')

    res.render('index', {
      page: 'all-products',
      title: 'Produtos',
      button: '<div class="header__button button__void button">Admin</div>',
      products: allProducts
    })
  },

  async openEdit(req, res) {
    const db = await Database()
    const itemCode = req.params.code
    const item = await db.get('SELECT * FROM products WHERE id = ?', [itemCode])

    await db.close()

    res.render('index', {
      page: 'edit',
      title: 'Edição',
      button: '<div class="header__button button__void button">Admin</div>',
      item: item
    })
  }
}

// import database
const Database = require('../db/config.js')

module.exports = {
  async enter(req, res) {
    const db = await Database()
    const email = req.body.email
    const password = req.body.password

    const user = await db.get(`
      SELECT name, email as login, password, 'cliente' as tipo FROM users WHERE email = ? 
      UNION 
      SELECT 'Administrador' as name, userLogin as login, password, 'admin' as tipo FROM admin WHERE userLogin = ?
    `, [email, email])

    await db.close()

    // --- AQUI COMEÇA A MUDANÇA ---

    // 1. Verifica se o usuário existe e se a senha bate
    if (!user || user.password !== password) {
      return res.redirect('/login-error')
    }

    // 2. SALVA NA SESSÃO (Isso faz o nome aparecer no Header de todas as páginas)
    req.session.user = {
      name: user.name,
      tipo: user.tipo
    }

    // 3. Redireciona em vez de dar Render (Mais seguro e limpo)
    if (user.tipo === 'admin') {
      return res.redirect('/todos-os-produtos')
    } else {
      // Redireciona para a home (ProductController.show cuidará do resto)
      return res.redirect('/') 
    }
  },

  open(req, res) {
    const roomId = req.params.code
    res.render('index', {
      page: 'admin',
      title: 'Administrador',
      productId: roomId,
      button: '<div class="header__button button__void button">Admin</div>'
    })
  }
}
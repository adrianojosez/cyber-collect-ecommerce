// import database
const Database = require('../db/config.js')

module.exports = {
async enter(req, res) {
    const db = await Database()
    const email = req.body.email
    const password = req.body.password

    // Busca unindo as duas tabelas e trazendo o NOME e o TIPO (admin ou cliente)
    // Usamos COALESCE para pegar o nome independente de qual tabela venha
    const user = await db.get(`
      SELECT name, email as login, password, 'cliente' as tipo FROM users WHERE email = ? 
      UNION 
      SELECT 'Administrador' as name, userLogin as login, password, 'admin' as tipo FROM admin WHERE userLogin = ?
    `, [email, email])

    await db.close()

    // 1. Verifica se o usuário existe e se a senha bate
    if (!user || user.password !== password) {
      return res.redirect('/login-error')
    }

    // 2. Define o que será enviado para a página (Header dinâmico)
    const renderData = {
      user: {
        name: user.name,
        tipo: user.tipo
      }
    }

    // 3. Redireciona conforme o cargo
    if (user.tipo === 'admin') {
      // Se for ADMIN: vai para o Dashboard (com botões de editar/excluir)
      return res.render('index', { 
        page: 'todos-os-produtos', 
        title: 'Admin - Painel', 
        ...renderData,
        button: '<a class="header__button button__void button" href="/login">Sair</a>' 
      })
    } else {
      // Se for CLIENTE (como o Adriano): vai para a Home comum
      return res.render('index', { 
        page: 'home', // mude para 'show' ou o nome da sua view da home
        title: 'Cyber_Collect', 
        ...renderData,
        button: '<a class="header__button button__void button" href="/login">Sair</a>'
      })
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

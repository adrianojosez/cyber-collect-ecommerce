// import express
const express = require('express')
// import ProductController
const ProductController = require('./controllers/ProductController.js')
const CartController = require('./controllers/CartController')
const LoginController = require('./controllers/LoginController')
const CadastroController = require('./controllers/cadastroController')
const DashboardController = require('./controllers/DashboardController')
const UserController = require('./controllers/UserController')
const ContactController = require('./controllers/ContactController')

// saving all route functionalities that Express has
const route = express.Router()

const renderPage = (page, title, button) => (req, res) => {
  res.render('index', { page, title, button })
}

const requireAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.tipo === 'admin') {
    return next()
  }
  if (req.session.user) {
    return res.redirect('/my-orders')
  }
  return res.redirect('/login')
}

// defining get routes
route.get('/', ProductController.show)

route.get('/search', ProductController.view)
route.get('/ver', ProductController.view)
route.get('/produto/:code', ProductController.open)
route.get('/produto&id=:code', ProductController.open)
route.get('/editar&id=:code', ProductController.openEdit)
route.get('/ver&category=:category', ProductController.view)

route.get('/cart', CartController.view)
route.post('/cart/add/:id', CartController.add)
route.post('/cart/remove/:id', CartController.remove)
route.post('/cart/update-quantity', CartController.updateQuantity)

// Checkout e pagamento
route.get('/checkout', (req, res) => {
  return res.redirect('/checkout/pagamento')
})

route.get('/checkout/pagamento', CartController.payment)
route.post('/checkout', CartController.checkout)

route.get('/my-orders', CartController.myOrders)

route.get('/pedido/:id', CartController.showOrderDetails)

route.get('/central-ajuda', DashboardController.centralAjuda)

// No seu arquivo route.js
route.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
    }
    res.redirect('/login'); // Agora ele volta limpo
  });
});

route.get('/login', renderPage(
  'login',
  'Login',
  '<div class="header__button button__void button">Login</div>'
))

// Rota de visualização de todos os produtos (Protegida)
route.get('/admin/todos-os-produtos', requireAdmin, ProductController.viewAll);

route.get('/admin/dashboard', requireAdmin, DashboardController.index)
route.get('/admin/pedidos', requireAdmin, DashboardController.adminOrders)
route.post('/admin/pedidos/update-status', requireAdmin, DashboardController.updateOrderStatus)
route.get('/admin/usuarios', requireAdmin, UserController.listUsers)
route.get('/editar-usuario', requireAdmin, UserController.showEditUser)
route.post('/editar-usuario', requireAdmin, UserController.updateUser)
route.get('/deletar-usuario', requireAdmin, UserController.deleteUser)

route.get('/admin/:code', LoginController.open)

route.get('/login-error', renderPage(
  'login-error',
  'Erro de Acesso',
  '<a class="header__button button__void button" href="login">Login</a>'
))

route.get('/pass-incorrect', renderPage(
  'pass-incorrect',
  'Sem Permissão',
  '<a class="header__button button__void button" href="/login">Login</a>'
))

route.get('/link-invalido', renderPage(
  'link-invalido',
  'Link Inválido',
  '<a class="header__button button__void button" href="/login">Login</a>'
))

route.get('/politica', renderPage(
  'politica',
  'Política de Privacidade',
  '<a class="header__button button__void button" href="/login">Login</a>'
))

route.get('/quem-somos', renderPage(
  'quem-somos',
  'Quem Somos Nós',
  '<a class="header__button button__void button" href="/login">Login</a>'
))

route.get('/fidelidade', renderPage(
  'fidelidade',
  'Programa Fidelidade',
  '<a class="header__button button__void button" href="/login">Login</a>'
))

route.get('/lojas', renderPage(
  'lojas',
  'Nossas Lojas',
  '<a class="header__button button__void button" href="/login">Login</a>'
))

route.get('/franqueado', renderPage(
  'franqueado',
  'Seja um Franqueado',
  '<a class="header__button button__void button" href="/login">Login</a>'
))

route.get('/anuncie', renderPage(
  'anuncie',
  'Anuncie Conosco',
  '<a class="header__button button__void button" href="/login">Login</a>'
))

route.get('/termos', renderPage(
  'termos',
  'Termos e Garantia',
  '<a class="header__button button__void button" href="/login">Login</a>'
))

route.get('/faq', renderPage(
  'faq',
  'Dúvidas Frequentes',
  '<a class="header__button button__void button" href="/login">Login</a>'
))

// Rotas de Esqueci a Senha
route.get('/esqueci-senha', renderPage(
  'esqueci-senha',
  'Recuperar Senha',
  '<a class="header__button button__void button" href="/login">Login</a>'
));

route.post('/recuperar-senha', LoginController.recuperarSenha);

// Exibe o formulário de nova senha
// route.get('/redefinir-senha', (req, res) => {
//     const email = req.query.email; // Pega o email que veio no link
//     res.render('index', {
//         page: 'redefinir-senha',
//         title: 'Nova Senha',
//         email: email, // Passamos o email para o formulário saber quem atualizar
//         button: '<a class="header__button button__void button" href="/login">Login</a>'
//     });
// });

// Exibe o formulário de nova senha (Agora via Controller para segurança)
route.get('/redefinir-senha', LoginController.abrirRedefinirSenha);

// Executa a troca da senha no banco
route.post('/atualizar-senha', LoginController.atualizarSenha);

// route.get('/resultado&q=:search', ProductController.view)
route.post('/search', ProductController.view)

// defining post routes
// Implicitly, the .index is receiving (req, res) inside ProductController.js
route.post('/admin/todos-os-produtos/:code/:action', requireAdmin, ProductController.index) // to delete/edit buttons
// It also requires a password but it will not be posted on the url
route.post('/produto/:code', ProductController.index) // to open product page
route.post('/admin/todos-os-produtos', LoginController.enter) // to validate login
route.post('/admin/:code', ProductController.create) // to create new product id
route.post('/produto&id:code', ProductController.save) // open page of recently created product
// Onde você define as rotas de cadastro
route.get('/cadastro', CadastroController.index)     // Chama a função index
route.post('/cadastro', CadastroController.cadastrar) // Chama a função cadastrar (ajustado de .save para .cadastrar)
route.post('/contato', ContactController.send)


// exporting the routes
module.exports = route

// No final do seu arquivo route.js
route.use((req, res) => {
    res.status(404).render('index', {
        page: '404',
        title: 'Página Não Encontrada',
        button: '<a class="header__button button__void button" href="/login">Login</a>'
    });
});

// module.exports = route;
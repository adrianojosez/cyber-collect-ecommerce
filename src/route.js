// import express
const express = require('express')
// import ProductController
const ProductController = require('./controllers/ProductController.js')
const LoginController = require('./controllers/LoginController')
const CadastroController = require('./controllers/cadastroController')
const DashboardController = require('./controllers/DashboardController')
const UserController = require('./controllers/UserController')

// saving all route functionalities that Express has
const route = express.Router()

// defining get routes
route.get('/', ProductController.show)

route.get('/produto&id=:code', ProductController.open)

route.get('/editar&id=:code', ProductController.openEdit)

route.get('/ver&category=:category', ProductController.view)

// No seu arquivo route.js
route.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
    }
    res.redirect('/login'); // Agora ele volta limpo
  });
});

route.get('/login', (req, res) =>
  res.render('index', {
    page: 'login',
    title: 'Login',
    button: '<div class="header__button button__void button">Login</div>'
  })
)

// Rota de visualização de todos os produtos (Protegida)
route.get('/todos-os-produtos', (req, res, next) => {
    if (req.session.user && req.session.user.tipo === 'admin') {
        return next();
    }
    res.redirect('/login');
}, ProductController.viewAll);

route.get('/admin/dashboard', (req, res, next) => {
    if (req.session.user && req.session.user.tipo === 'admin') {
        return next();
    }
    res.redirect('/login');
}, DashboardController.index);

route.get('/admin/usuarios', (req, res, next) => {
    if (req.session.user && req.session.user.tipo === 'admin') {
        return next();
    }
    res.redirect('/login');
}, UserController.listUsers);

route.get('/editar-usuario', (req, res, next) => {
    if (req.session.user && req.session.user.tipo === 'admin') {
        return next();
    }
    res.redirect('/login');
}, UserController.showEditUser);

route.post('/editar-usuario', (req, res, next) => {
    if (req.session.user && req.session.user.tipo === 'admin') {
        return next();
    }
    res.redirect('/login');
}, UserController.updateUser);

route.get('/deletar-usuario', (req, res, next) => {
    if (req.session.user && req.session.user.tipo === 'admin') {
        return next();
    }
    res.redirect('/login');
}, UserController.deleteUser);

route.get('/admin/:code', LoginController.open)

route.get('/login-error', (req, res) =>
  res.render('index', {
    page: 'login-error',
    title: 'Erro de Acesso',
    button:
      '<a class="header__button button__void button" href="login">Login</a>'
  })
)

route.get('/pass-incorrect', (req, res) =>
  res.render('index', {
    page: 'pass-incorrect',
    title: 'Sem Permissão',
    button:
      '<a class="header__button button__void button" href="/login">Login</a>'
  })
)

route.get('/link-invalido', (req, res) =>
  res.render('index', {
    page: 'link-invalido',
    title: 'Link Inválido',
    button:
      '<a class="header__button button__void button" href="/login">Login</a>'
  })
)

route.get('/politica', (req, res) => {
    res.render('index', {
        page: 'politica',
        title: 'Política de Privacidade',
        button: '<a class="header__button button__void button" href="/login">Login</a>'
    })
})

route.get('/quem-somos', (req, res) => {
    res.render('index', {
        page: 'quem-somos',
        title: 'Quem Somos Nós',
        button: '<a class="header__button button__void button" href="/login">Login</a>'
    })
})

route.get('/fidelidade', (req, res) => {
    res.render('index', {
        page: 'fidelidade',
        title: 'Programa Fidelidade',
        button: '<a class="header__button button__void button" href="/login">Login</a>'
    })
})

route.get('/lojas', (req, res) => {
    res.render('index', {
        page: 'lojas',
        title: 'Nossas Lojas',
        button: '<a class="header__button button__void button" href="/login">Login</a>'
    })
})

route.get('/franqueado', (req, res) => {
    res.render('index', {
        page: 'franqueado',
        title: 'Seja um Franqueado',
        button: '<a class="header__button button__void button" href="/login">Login</a>'
    })
})

route.get('/anuncie', (req, res) => {
    res.render('index', {
        page: 'anuncie',
        title: 'Anuncie Conosco',
        button: '<a class="header__button button__void button" href="/login">Login</a>'
    })
})

route.get('/termos', (req, res) => {
    res.render('index', {
        page: 'termos',
        title: 'Termos e Garantia',
        button: '<a class="header__button button__void button" href="/login">Login</a>'
    })
})

route.get('/faq', (req, res) => {
    res.render('index', {
        page: 'faq',
        title: 'Dúvidas Frequentes',
        button: '<a class="header__button button__void button" href="/login">Login</a>'
    })
})

// Rotas de Esqueci a Senha
route.get('/esqueci-senha', (req, res) => res.render('index', {
    page: 'esqueci-senha',
    title: 'Recuperar Senha',
    button: '<a class="header__button button__void button" href="/login">Login</a>'
}));

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
route.post('/todos-os-produtos/:code/:action', ProductController.index) // to delete/edit buttons
// It also requires a password but it will not be posted on the url
route.post('/produto/:code', ProductController.index) // to open product page
route.post('/todos-os-produtos', LoginController.enter) // to validate login
route.post('/admin/:code', ProductController.create) // to create new product id
route.post('/produto&id:code', ProductController.save) // open page of recently created product
// Onde você define as rotas de cadastro
route.get('/cadastro', CadastroController.index)     // Chama a função index
route.post('/cadastro', CadastroController.cadastrar) // Chama a função cadastrar (ajustado de .save para .cadastrar)

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
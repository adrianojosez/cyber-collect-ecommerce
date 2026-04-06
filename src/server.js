// import express
const express = require('express')
const session = require('express-session') //
const port = process.env.PORT || 3000 
const route = require('./route')
const Database = require('./db/config.js')

// initiate the application with Express
const server = express()

server.set('view engine', 'ejs') 
server.use(express.static('public')) 
server.use(express.urlencoded({extended: true, limit: '50mb'})) 

// --- CONFIGURAÇÃO DA SESSÃO (DEVE VIR ANTES DAS ROTAS) ---
server.use(session({
  secret: 'cybercollect_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } // Sessão dura 1 hora
}))

Database.initDatabase().catch(error =>
  console.error('Erro ao inicializar a tabela cart_items:', error)
)

// Middleware para o Header (Faz o 'user' aparecer em todas as páginas)
server.use((req, res, next) => {
  res.locals.user = req.session.user || undefined

  if (!req.session.cart) {
    req.session.cart = []
  }

  res.locals.cart = req.session.cart
  res.locals.cartItemCount = req.session.cart.reduce(
    (count, item) => count + item.quantidade,
    0
  )

  // SEO defaults
  res.locals.jsonLd = null
  res.locals.description = 'Cyber-Collect: Sistema de e-commerce especializado em hardware e colecionáveis.'
  res.locals.keywords = 'action figures, colecionáveis, geek, hardware, informática'
  res.locals.ogTitle = 'Loja Informática'
  res.locals.ogDescription = 'Cyber-Collect: Sistema de e-commerce especializado em hardware e colecionáveis.'
  res.locals.ogImage = '/images/logo.svg'
  res.locals.canonical = 'https://seusite.com'

  next()
})
// ---------------------------------------------------------

// AGORA SIM, CHAMA AS ROTAS
server.use(route) 

// E POR ÚLTIMO O LISTEN (SÓ UMA VEZ)
server.listen(port, () => console.log(`APP RUNNING ON PORT ${port}`))
// import express
const express = require('express')
const session = require('express-session') //
const port = process.env.PORT || 3000 
const route = require('./route') 

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

// Middleware para o Header (Faz o 'user' aparecer em todas as páginas)
server.use((req, res, next) => {
  res.locals.user = req.session.user || undefined
  next()
})
// ---------------------------------------------------------

// AGORA SIM, CHAMA AS ROTAS
server.use(route) 

// E POR ÚLTIMO O LISTEN (SÓ UMA VEZ)
server.listen(port, () => console.log(`APP RUNNING ON PORT ${port}`))
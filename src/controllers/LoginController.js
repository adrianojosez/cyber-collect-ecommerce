// import database
const Database = require('../db/config.js')
const nodemailer = require('nodemailer')

module.exports = {
    // FUNÇÃO DE LOGIN (RESTAURADA)
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

        if (!user || user.password !== password) {
            return res.redirect('/login-error')
        }

        req.session.user = {
            name: user.name,
            tipo: user.tipo
        }

        if (user.tipo === 'admin') {
            return res.redirect('/todos-os-produtos')
        } else {
            return res.redirect('/') 
        }
    },

    // FUNÇÃO OPEN (RESTAURADA)
    open(req, res) {
        const roomId = req.params.code
        res.render('index', {
            page: 'admin',
            title: 'Administrador',
            productId: roomId,
            button: '<div class="header__button button__void button">Admin</div>'
        })
    },

    // NOVA FUNÇÃO DE RECUPERAÇÃO
    async recuperarSenha(req, res) {
        const db = await Database()
        const email = req.body.email

        const user = await db.get(`
            SELECT email FROM users WHERE email = ? 
            UNION 
            SELECT userLogin as email FROM admin WHERE userLogin = ?
        `, [email, email])

        if (!user) {
            await db.close()
            return res.redirect('/login-error') 
        }

        // Configure aqui com seus dados do Mailtrap
        const transporter = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "0e49a87b8a904e",
                pass: "a58792c7289f51" 
            }
        });

        const mailOptions = {
            from: 'suporte@cybercollect.com',
            to: email,
            subject: 'Recuperação de Senha - Cyber Collect',
            html: `
              <div style="font-family: Arial, sans-serif; color: #464646;">
                          <h1 style="color: #2A7AE4;">Olá!</h1>
                          <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Cyber-Collect</strong>.</p>
                          <p>Clique no botão abaixo para prosseguir:</p>
                          <a href="http://localhost:3000/redefinir-senha?email=${email}" 
                            style="background-color: #2A7AE4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; margin-top: 10px;">
                            Redefinir minha senha
                          </a>
                          <p style="margin-top: 25px; font-size: 12px; color: #A2A2A2;">
                              Se você não solicitou essa alteração, basta ignorar este e-mail.
                          </p>
                      </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            await db.close()
            res.render('index', {
                page: 'email-enviado',
                title: 'E-mail Enviado',
                button: '<a class="header__button button__void button" href="/login">Login</a>'
            })
        } catch (error) {
            console.log(error);
            await db.close()
            res.send("Erro ao enviar e-mail.");
        }
    },

    async atualizarSenha(req, res) {
    const db = await Database();
    const { email, password, passwordConfirm } = req.body;

    // 1. Validação básica de segurança
    if (password !== passwordConfirm) {
        await db.close();
        return res.send("As senhas não coincidem!");
    }

    // 2. Atualiza em ambas as tabelas (users e admin) para garantir
    // O SQLite ignorará se o email não existir na tabela específica
    await db.run(`UPDATE users SET password = ? WHERE email = ?`, [password, email]);
    await db.run(`UPDATE admin SET password = ? WHERE userLogin = ?`, [password, email]);

    await db.close();

    // 3. Redireciona para o login com sucesso
    res.render('index', {
        page: 'login', // Ou uma página de "Senha Alterada"
        title: 'Login',
        button: '<div class="header__button button__void button">Login</div>'
    });
},
}
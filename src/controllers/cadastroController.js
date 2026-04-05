const Database = require('../db/config'); 

module.exports = {
    // Essa função abre a página de cadastro (o GET)
    index(req, res) {
        res.render('index', {
            page: 'cadastro', // Certifique-se que o arquivo views/parts/cadastro.ejs existe
            title: 'Cadastro de Usuário',
            button: '<a class="header__button button__void button" href="/login">Login</a>'
        });
    },

    // Essa função salva no banco (o POST)
    async cadastrar(req, res) {
        const { name, email, password, passwordConfirm } = req.body;

        if (password !== passwordConfirm) {
            return res.render('index', { page: 'cadastro-erro', message: 'Senhas diferentes!' });
        }

        try {
            const db = await Database();
            
            await db.run(`INSERT INTO users (name, email, password, tipo) VALUES (?, ?, ?, ?)`, [
                name,
                email,
                password,
                'cliente'
            ]);

            await db.close();
            return res.redirect('/login'); 
        } catch (error) {
            console.error(error);
            return res.send("Erro ao salvar no banco.");
        }
    }
};
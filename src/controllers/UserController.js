const Database = require('../db/config.js');

module.exports = {
    async listUsers(req, res) {
        const db = await Database();

        // Buscar todos os usuários
        const users = await db.all('SELECT id, name, email, tipo FROM users ORDER BY id DESC');

        // Contar total de usuários
        const totalUsers = await db.get('SELECT COUNT(*) as total FROM users');

        await db.close();

        res.render('index', {
            page: 'usuarios',
            title: 'Gerenciar Usuários',
            stats: {
                total: totalUsers.total,
                users: users
            },
            button: '<a href="/logout" class="button" style="background-color: #ff4d4d; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none;">Sair</a>'
        });
    },

    async showEditUser(req, res) {
        const userId = req.query.id;

        if (!userId) {
            return res.redirect('/admin/usuarios');
        }

        const db = await Database();

        // Buscar usuário específico
        const user = await db.get('SELECT id, name, email, tipo FROM users WHERE id = ?', [userId]);

        await db.close();

        if (!user) {
            return res.redirect('/admin/usuarios');
        }

        res.render('index', {
            page: 'editar_usuario',
            title: 'Editar Usuário',
            user: user,
            button: '<a href="/admin/usuarios" class="button" style="background-color: #555; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none;">Voltar</a>'
        });
    },

    async updateUser(req, res) {
        const { id, name, email, tipo } = req.body;

        if (!id || !name || !email || !tipo) {
            return res.redirect('/admin/usuarios');
        }

        const db = await Database();

        // Atualizar usuário
        await db.run('UPDATE users SET name = ?, email = ?, tipo = ? WHERE id = ?', [name, email, tipo, id]);

        await db.close();

        res.redirect('/admin/usuarios');
    },

    async deleteUser(req, res) {
        const userId = req.query.id;

        if (!userId) {
            return res.redirect('/admin/usuarios');
        }

        const db = await Database();

        // Verificar se o usuário existe
        const user = await db.get('SELECT id FROM users WHERE id = ?', [userId]);

        if (!user) {
            await db.close();
            return res.redirect('/admin/usuarios');
        }

        // Não permitir excluir o próprio usuário admin
        if (req.session.user && req.session.user.id == userId) {
            await db.close();
            return res.redirect('/admin/usuarios');
        }

        // Excluir usuário
        await db.run('DELETE FROM users WHERE id = ?', [userId]);

        await db.close();

        res.redirect('/admin/usuarios');
    }
}
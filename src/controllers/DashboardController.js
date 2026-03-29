const Database = require('../db/config.js');

module.exports = {
    async index(req, res) {
        const db = await Database();
        
        // 1. Total de produtos
        const totalProducts = await db.get('SELECT COUNT(*) as total FROM products');
        
        // 2. Média de preço (removendo o 'R$ ' e a vírgula para calcular)
        const allPrices = await db.all('SELECT price FROM products');
        const numericPrices = allPrices.map(p => 
            parseFloat(p.price.replace('R$ ', '').replace('.', '').replace(',', '.'))
        );
        const avgPrice = numericPrices.reduce((a, b) => a + b, 0) / numericPrices.length;

        // 3. Produtos por Categoria (para o Gráfico de Pizza)
        const categoriesData = await db.all('SELECT category, COUNT(*) as count FROM products GROUP BY category');

        await db.close();

        res.render('index', {
            page: 'dashboard',
            title: 'Painel de Controle',
            stats: {
                total: totalProducts.total,
                avg: avgPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                categories: categoriesData
            },
            button: '<a href="/logout" class="button" style="background-color: #ff4d4d; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none;">Sair</a>'
        });
    }
}
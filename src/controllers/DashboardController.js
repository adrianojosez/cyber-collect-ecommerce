const Database = require('../db/config.js');

module.exports = {
    async index(req, res) {
        const db = await Database();
        
        // 1. Total de produtos
        const totalProducts = await db.get('SELECT COUNT(*) as total FROM products');
        
        // 2. Função auxiliar para converter preço string para número
        const parsePrice = (priceStr) => {
            return parseFloat(priceStr.replace('R$ ', '').replace('.', '').replace(',', '.'));
        };
        
        // 3. Valor total do inventário (SUM de price)
        const allPrices = await db.all('SELECT price FROM products');
        const numericPrices = allPrices.map(p => parsePrice(p.price));
        const inventoryValue = numericPrices.reduce((a, b) => a + b, 0);
        
        // 4. Média de preço (AVG de price)
        const avgPrice = inventoryValue / numericPrices.length;
        
        // 5. Produtos por Categoria (contagem)
        const categoriesData = await db.all('SELECT category, COUNT(*) as count FROM products GROUP BY category');
        
        // 6. Produto de maior valor
        const mostExpensive = await db.get(`
            SELECT id, name, price, category 
            FROM products 
            ORDER BY CAST(REPLACE(REPLACE(REPLACE(price, 'R$ ', ''), '.', ''), ',', '.') AS DECIMAL) DESC 
            LIMIT 1
        `);
        
        // 7. Agrupamento por faixas de preço
        const priceRanges = {
            'Até R$ 100': 0,
            'R$ 101 - 500': 0,
            'R$ 501 - 1000': 0,
            'Acima de R$ 1000': 0
        };
        
        allPrices.forEach(price => {
            const numPrice = parsePrice(price.price);
            if (numPrice <= 100) priceRanges['Até R$ 100']++;
            else if (numPrice <= 500) priceRanges['R$ 101 - 500']++;
            else if (numPrice <= 1000) priceRanges['R$ 501 - 1000']++;
            else priceRanges['Acima de R$ 1000']++;
        });
        
        // 8. Top 5 produtos por valor unitário
        const top5Products = await db.all(`
            SELECT id, name, price, category 
            FROM products 
            ORDER BY CAST(REPLACE(REPLACE(REPLACE(price, 'R$ ', ''), '.', ''), ',', '.') AS DECIMAL) DESC 
            LIMIT 5
        `);

        // 9. Lista de todos os produtos para gerenciamento
        const allProducts = await db.all('SELECT id, name, price, category FROM products ORDER BY id DESC');

        await db.close();

        res.render('index', {
            page: 'dashboard',
            title: 'Painel de Controle',
            stats: {
                total: totalProducts.total,
                inventoryValue: inventoryValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                avg: avgPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                categories: categoriesData,
                mostExpensive: mostExpensive,
                products: allProducts,
                priceRanges: priceRanges,
                top5Products: top5Products
            },
            button: '<a href="/logout" class="button" style="background-color: #ff4d4d; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none;">Sair</a>'
        });
    },

    async centralAjuda(req, res) {
        res.render('index', {
            page: 'central-ajuda',
            title: 'Central de Ajuda',
            description: 'Encontre respostas para suas dúvidas sobre pedidos, pagamentos e sua conta.',
            keywords: 'ajuda, faq, dúvidas, suporte, cyber-collect',
            ogTitle: 'Central de Ajuda - Cyber-Collect',
            ogDescription: 'Encontre respostas para suas perguntas frequentes.',
            ogImage: '/images/logo.svg',
            canonical: 'https://seusite.com/central-ajuda',
            jsonLd: null,
            button: '<a class="header__button button__void button" href="/login">Login</a>',
            user: req.session.user || null
        });
    }
}
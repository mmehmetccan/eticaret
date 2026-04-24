// src/api/controllers/statsController.js
const db = require('../../config/db');

const getDashboardStats = async (req, res) => {
    try {
        // 1. Genel Özet
        const generalStatsQuery = `
            SELECT 
                COUNT(id) as total_orders,
                IFNULL(SUM(total_price), 0) as total_revenue,
                (SELECT COUNT(id) FROM users WHERE role = 'customer') as total_customers
            FROM orders
        `;

        // 2. Günlük Satış (Bugün)
        const todaySalesQuery = `
            SELECT 
                IFNULL(SUM(total_price), 0) as today_revenue,
                COUNT(id) as today_orders
            FROM orders 
            WHERE DATE(order_date) = CURDATE()
        `;

        // 3. Dünkü Satış
        const yesterdaySalesQuery = `
            SELECT 
                IFNULL(SUM(total_price), 0) as yesterday_revenue,
                COUNT(id) as yesterday_orders
            FROM orders 
            WHERE DATE(order_date) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        `;

        // 4. Haftalık Satış (Son 7 gün)
        const weeklySalesQuery = `
            SELECT 
                DATE(order_date) as date,
                IFNULL(SUM(total_price), 0) as daily_revenue,
                COUNT(id) as daily_orders
            FROM orders 
            WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(order_date)
            ORDER BY date ASC
        `;

        // 5. Aylık Satış (Son 30 gün)
        const monthlySalesQuery = `
            SELECT 
                DATE(order_date) as date,
                IFNULL(SUM(total_price), 0) as daily_revenue,
                COUNT(id) as daily_orders
            FROM orders 
            WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY DATE(order_date)
            ORDER BY date ASC
        `;

        // 6. En Çok Satan 5 Ürün
        const topProductsQuery = `
            SELECT 
                p.id,
                p.name, 
                p.image_url,
                p.price,
                COALESCE(SUM(oi.quantity), 0) as total_sold,
                COALESCE(SUM(oi.quantity * oi.unit_price), 0) as total_revenue
            FROM products p
            LEFT JOIN order_items oi ON p.id = oi.product_id
            GROUP BY p.id
            ORDER BY total_sold DESC
            LIMIT 5
        `;

        // 7. Son Siparişler (10 adet)
        const recentOrdersQuery = `
            SELECT o.*, u.email, u.full_name 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            ORDER BY o.order_date DESC 
            LIMIT 10
        `;

        // 8. Kategori Bazında Satış
        const categorySalesQuery = `
            SELECT 
                p.category,
                COUNT(DISTINCT o.id) as order_count,
                COALESCE(SUM(oi.quantity), 0) as total_sold,
                COALESCE(SUM(oi.quantity * oi.unit_price), 0) as total_revenue
            FROM products p
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'delivered'
            WHERE p.category IS NOT NULL AND p.category != ''
            GROUP BY p.category
            ORDER BY total_revenue DESC
            LIMIT 5
        `;

        // 9. Bugünün en çok satan ürünleri
        const todayTopProductsQuery = `
            SELECT 
                p.id,
                p.name,
                COALESCE(SUM(oi.quantity), 0) as today_sold
            FROM products p
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.id AND DATE(o.order_date) = CURDATE()
            GROUP BY p.id
            HAVING today_sold > 0
            ORDER BY today_sold DESC
            LIMIT 5
        `;

        // 10. Ortalama Sipariş Değeri
        const avgOrderValueQuery = `
            SELECT 
                IFNULL(AVG(total_price), 0) as avg_order_value
            FROM orders
        `;

        // 11. Aktif Müşteri (Son 30 günde sipariş veren)
        const activeCustomersQuery = `
            SELECT COUNT(DISTINCT user_id) as active_customers
            FROM orders 
            WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        `;

        const [general] = await db.execute(generalStatsQuery);
        const [todaySales] = await db.execute(todaySalesQuery);
        const [yesterdaySales] = await db.execute(yesterdaySalesQuery);
        const [weeklySales] = await db.execute(weeklySalesQuery);
        const [monthlySales] = await db.execute(monthlySalesQuery);
        const [topProducts] = await db.execute(topProductsQuery);
        const [recentOrders] = await db.execute(recentOrdersQuery);
        const [categorySales] = await db.execute(categorySalesQuery);
        const [todayTopProducts] = await db.execute(todayTopProductsQuery);
        const [avgOrderValue] = await db.execute(avgOrderValueQuery);
        const [activeCustomers] = await db.execute(activeCustomersQuery);

        // Hesaplamalar
        const todayRevenue = Number(todaySales[0]?.today_revenue || 0);
        const yesterdayRevenue = Number(yesterdaySales[0]?.yesterday_revenue || 0);
        const todayOrders = Number(todaySales[0]?.today_orders || 0);
        const yesterdayOrders = Number(yesterdaySales[0]?.yesterday_orders || 0);
        
        // Günlük değişim yüzdesi
        let dailyRevenueChange = 0;
        if (yesterdayRevenue === 0 && todayRevenue > 0) {
            dailyRevenueChange = 100;
        } else if (yesterdayRevenue > 0) {
            dailyRevenueChange = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1);
        }
        
        let dailyOrderChange = 0;
        if (yesterdayOrders === 0 && todayOrders > 0) {
            dailyOrderChange = 100;
        } else if (yesterdayOrders > 0) {
            dailyOrderChange = ((todayOrders - yesterdayOrders) / yesterdayOrders * 100).toFixed(1);
        }

        // Haftalık toplam
        let weeklyTotal = 0;
        let weeklyOrderTotal = 0;
        if (weeklySales && weeklySales.length > 0) {
            weeklyTotal = weeklySales.reduce((sum, row) => sum + Number(row.daily_revenue || 0), 0);
            weeklyOrderTotal = weeklySales.reduce((sum, row) => sum + Number(row.daily_orders || 0), 0);
        }

        // Aylık toplam
        let monthlyTotal = 0;
        let monthlyOrderTotal = 0;
        if (monthlySales && monthlySales.length > 0) {
            monthlyTotal = monthlySales.reduce((sum, row) => sum + Number(row.daily_revenue || 0), 0);
            monthlyOrderTotal = monthlySales.reduce((sum, row) => sum + Number(row.daily_orders || 0), 0);
        }

        // Aylık büyüme hesaplama (önceki aya göre)
        const lastMonthStart = new Date();
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
        lastMonthStart.setDate(1);
        const lastMonthEnd = new Date();
        lastMonthEnd.setDate(0);
        
        const [lastMonthSales] = await db.execute(
            `SELECT IFNULL(SUM(total_price), 0) as last_month_revenue 
             FROM orders 
             WHERE order_date >= ? AND order_date <= ?`,
            [lastMonthStart, lastMonthEnd]
        );
        
        const lastMonthRevenue = Number(lastMonthSales[0]?.last_month_revenue || 0);
        const monthlyGrowth = lastMonthRevenue === 0 ? 0 : ((monthlyTotal - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1);

        // Formatla ve gönder
        res.json({
            summary: {
                totalSales: Number(general[0]?.total_revenue || 0),
                orderCount: Number(general[0]?.total_orders || 0),
                userCount: Number(general[0]?.total_customers || 0),
                activeCustomers: Number(activeCustomers[0]?.active_customers || 0),
                avgOrderValue: Number(avgOrderValue[0]?.avg_order_value || 0).toFixed(2),
                monthlyGrowth: monthlyGrowth
            },
            today: {
                revenue: todayRevenue,
                orders: todayOrders,
                revenueChange: dailyRevenueChange,
                orderChange: dailyOrderChange,
                yesterdayRevenue: yesterdayRevenue,
                yesterdayOrders: yesterdayOrders
            },
            weekly: {
                total: weeklyTotal,
                orders: weeklyOrderTotal,
                data: weeklySales || []
            },
            monthly: {
                total: monthlyTotal,
                orders: monthlyOrderTotal,
                data: monthlySales || []
            },
            topProducts: (topProducts || []).map(p => ({
                id: p.id,
                name: p.name || 'İsimsiz Ürün',
                image_url: p.image_url,
                price: Number(p.price || 0),
                total_sold: Number(p.total_sold || 0),
                total_revenue: Number(p.total_revenue || 0)
            })),
            recentOrders: recentOrders || [],
            categorySales: (categorySales || []).map(c => ({
                category: c.category || 'Diğer',
                order_count: Number(c.order_count || 0),
                total_sold: Number(c.total_sold || 0),
                total_revenue: Number(c.total_revenue || 0)
            })),
            todayTopProducts: (todayTopProducts || []).map(p => ({
                id: p.id,
                name: p.name || 'İsimsiz Ürün',
                today_sold: Number(p.today_sold || 0)
            }))
        });
    } catch (err) {
        console.error("SQL Hata Detayı:", err);
        res.status(500).json({ error: "İstatistikler yüklenemedi." });
    }
};

module.exports = { getDashboardStats };
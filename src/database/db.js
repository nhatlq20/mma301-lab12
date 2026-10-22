import * as SQLite from 'expo-sqlite';

let dbInstance = null;

// Khởi tạo hoặc lấy kết nối DB
export const getDB = async () => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('computer_store.db');
  }
  return dbInstance;
};

// Khởi tạo bảng và chèn dữ liệu mẫu nếu chưa có
export const initDatabase = async () => {
  const db = await getDB();
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      cpu TEXT,
      ram INTEGER,
      storage INTEGER,
      price REAL,
      stock INTEGER,
      sold_quantity INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0
    );
  `);

  // Kiểm tra nếu bảng trống thì nạp Sample Data theo đề bài
  const countResult = await db.getFirstAsync('SELECT COUNT(*) as count FROM products;');
  if (countResult && countResult.count === 0) {
    await db.execAsync(`
      INSERT INTO products (product_name, brand, category, cpu, ram, storage, price, stock, sold_quantity, is_featured) VALUES
      ('MacBook Pro M3', 'Apple', 'Laptop', 'M3', 16, 512, 1800, 10, 30, 1),
      ('Dell XPS 13', 'Dell', 'Laptop', 'i7', 16, 512, 1500, 8, 20, 1),
      ('HP Pavilion', 'HP', 'Desktop', 'i5', 8, 256, 800, 5, 15, 0),
      ('RTX 4060', 'Asus', 'Component', 'GPU', 0, 0, 400, 3, 50, 1);
    `);
  }
};

// Các hàm CRUD
export const getAllProducts = async () => {
  const db = await getDB();
  return await db.getAllAsync('SELECT * FROM products ORDER BY id DESC;');
};

export const getProductById = async (id) => {
  const db = await getDB();
  return await db.getFirstAsync('SELECT * FROM products WHERE id = ?;', [id]);
};

export const addProduct = async (product) => {
  const db = await getDB();
  const { product_name, brand, category, cpu, ram, storage, price, stock, sold_quantity, is_featured } = product;
  return await db.runAsync(
    `INSERT INTO products (product_name, brand, category, cpu, ram, storage, price, stock, sold_quantity, is_featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [product_name, brand, category, cpu, Number(ram), Number(storage), Number(price), Number(stock), Number(sold_quantity), is_featured ? 1 : 0]
  );
};

export const updateProduct = async (id, product) => {
  const db = await getDB();
  const { product_name, brand, category, cpu, ram, storage, price, stock, sold_quantity, is_featured } = product;
  return await db.runAsync(
    `UPDATE products SET product_name = ?, brand = ?, category = ?, cpu = ?, ram = ?, storage = ?, price = ?, stock = ?, sold_quantity = ?, is_featured = ?
     WHERE id = ?;`,
    [product_name, brand, category, cpu, Number(ram), Number(storage), Number(price), Number(stock), Number(sold_quantity), is_featured ? 1 : 0, id]
  );
};

export const deleteProduct = async (id) => {
  const db = await getDB();
  return await db.runAsync('DELETE FROM products WHERE id = ?;', [id]);
};

// Các hàm truy vấn thống kê (Task 5 & Task 6)
export const getStatistics = async () => {
  const db = await getDB();
  const totalProducts = await db.getFirstAsync('SELECT COUNT(*) as total FROM products;');
  const totalRevenue = await db.getFirstAsync('SELECT SUM(price * sold_quantity) as revenue FROM products;');
  const totalSold = await db.getFirstAsync('SELECT SUM(sold_quantity) as sold FROM products;');
  const categoryStats = await db.getAllAsync('SELECT category, COUNT(*) as count FROM products GROUP BY category;');
  const avgPrice = await db.getFirstAsync('SELECT AVG(price) as avg_price FROM products;');
  const bestSeller = await db.getFirstAsync('SELECT * FROM products ORDER BY sold_quantity DESC LIMIT 1;');
  const lowStock = await db.getAllAsync('SELECT * FROM products WHERE stock < 5;');
  const topBrand = await db.getFirstAsync('SELECT brand, SUM(sold_quantity) as total_sold FROM products GROUP BY brand ORDER BY total_sold DESC LIMIT 1;');

  return {
    totalProducts: totalProducts?.total || 0,
    totalRevenue: totalRevenue?.revenue || 0,
    totalSold: totalSold?.sold || 0,
    categoryStats: categoryStats || [],
    avgPrice: avgPrice?.avg_price || 0,
    bestSeller: bestSeller || null,
    lowStock: lowStock || [],
    topBrand: topBrand || null
  };
};

export const getFeaturedProducts = async () => {
  const db = await getDB();
  return await db.getAllAsync('SELECT * FROM products WHERE is_featured = 1 ORDER BY id DESC;');
};

export const getFeaturedStatistics = async () => {
  const db = await getDB();
  const totalFeatured = await db.getFirstAsync('SELECT COUNT(*) as total FROM products WHERE is_featured = 1;');
  const featuredRevenue = await db.getFirstAsync('SELECT SUM(price * sold_quantity) as revenue FROM products WHERE is_featured = 1;');
  const totalSoldFeatured = await db.getFirstAsync('SELECT SUM(sold_quantity) as sold FROM products WHERE is_featured = 1;');
  const categoryStats = await db.getAllAsync('SELECT category, COUNT(*) as count FROM products WHERE is_featured = 1 GROUP BY category;');

  return {
    totalFeatured: totalFeatured?.total || 0,
    featuredRevenue: featuredRevenue?.revenue || 0,
    totalSold: totalSoldFeatured?.sold || 0,
    categoryStats: categoryStats || []
  };
};

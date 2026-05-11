const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1/27017/quickbite';
const DB_NAME = 'quickbite';


app.use(cors());
app.use(express.json());

// Request Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

let db;

async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log('Connected to MongoDB - quickbite database');
  await seedDatabase();
}

async function seedDatabase() {
  const menuCollection = db.collection('menuItems');
  const count = await menuCollection.countDocuments();
  if (count === 0) {
    await menuCollection.insertMany([
      { name: 'Crispy Spring Rolls', description: 'Golden fried rolls with veggie filling', price: 149, category: 'Starters', emoji: '🥢', stock: 20, available: true },
      { name: 'Paneer Tikka', description: 'Smoky grilled cottage cheese cubes', price: 199, category: 'Starters', emoji: '🧀', stock: 15, available: true },
      { name: 'Garlic Bread', description: 'Toasted baguette with herb butter', price: 99, category: 'Starters', emoji: '🥖', stock: 25, available: true },
      { name: 'Soup of the Day', description: "Chef's special daily soup", price: 120, category: 'Starters', emoji: '🍲', stock: 10, available: true },
      { name: 'Butter Chicken', description: 'Rich creamy tomato-based curry', price: 299, category: 'Mains', emoji: '🍛', stock: 12, available: true },
      { name: 'Veg Biryani', description: 'Fragrant basmati rice with veggies', price: 249, category: 'Mains', emoji: '🍚', stock: 18, available: true },
      { name: 'Paneer Butter Masala', description: 'Cottage cheese in silky butter gravy', price: 279, category: 'Mains', emoji: '🫕', stock: 14, available: true },
      { name: 'Dal Makhani', description: 'Slow-cooked black lentils overnight', price: 219, category: 'Mains', emoji: '🥣', stock: 20, available: true },
      { name: 'Grilled Chicken Burger', description: 'Juicy chicken with lettuce and sauce', price: 259, category: 'Mains', emoji: '🍔', stock: 8, available: true },
      { name: 'Gulab Jamun', description: 'Soft milk dumplings in rose syrup', price: 99, category: 'Desserts', emoji: '🍮', stock: 30, available: true },
      { name: 'Chocolate Brownie', description: 'Warm fudgy brownie with ice cream', price: 149, category: 'Desserts', emoji: '🍫', stock: 12, available: true },
      { name: 'Mango Kulfi', description: 'Traditional Indian mango ice cream', price: 119, category: 'Desserts', emoji: '🍦', stock: 20, available: true },
      { name: 'Masala Chai', description: 'Spiced milk tea with ginger', price: 59, category: 'Drinks', emoji: '☕', stock: 50, available: true },
      { name: 'Fresh Lime Soda', description: 'Sweet or salted, your choice', price: 69, category: 'Drinks', emoji: '🍋', stock: 50, available: true },
      { name: 'Mango Lassi', description: 'Chilled yogurt mango smoothie', price: 99, category: 'Drinks', emoji: '🥭', stock: 30, available: true },
      { name: 'Cold Coffee', description: 'Blended iced coffee with milk', price: 129, category: 'Drinks', emoji: '🧋', stock: 25, available: true },
    ]);
    console.log('Database seeded with menu items');
  }
}

// ─── MENU ROUTES ──────────────────────────────────────────

// GET all menu items
app.get('/api/menu', async (req, res) => {
  try {
    const items = await db.collection('menuItems').find().toArray();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// GET menu items by category
app.get('/api/menu/category/:category', async (req, res) => {
  try {
    const items = await db.collection('menuItems')
      .find({ category: req.params.category })
      .toArray();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// POST add new menu item
app.post('/api/menu', async (req, res) => {
  try {
    const item = { ...req.body, stock: req.body.stock || 10, available: true };
    const result = await db.collection('menuItems').insertOne(item);
    res.status(201).json({ _id: result.insertedId, ...item });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update menu item
app.put('/api/menu/:id', async (req, res) => {
  try {
    const { _id, ...update } = req.body;
    const result = await db.collection('menuItems').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: update },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Item not found' });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE menu item
app.delete('/api/menu/:id', async (req, res) => {
  try {
    const result = await db.collection('menuItems').deleteOne(
      { _id: new ObjectId(req.params.id) }
    );
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Item not found' });
    res.sendStatus(204);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── ORDER ROUTES ─────────────────────────────────────────

// POST place an order — decrements stock, marks unavailable if 0
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, items } = req.body;
    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({ error: 'customerName and items are required' });
    }

    const menuCollection = db.collection('menuItems');
    let totalAmount = 0;
    const enrichedItems = [];

    for (const item of items) {
      const menuItem = await menuCollection.findOne({ _id: new ObjectId(item.menuItemId) });
      if (!menuItem) return res.status(404).json({ error: `Item not found` });
      if (!menuItem.available || menuItem.stock < item.quantity) {
        return res.status(400).json({ error: `${menuItem.name} is out of stock` });
      }

      const newStock = menuItem.stock - item.quantity;
      await menuCollection.updateOne(
        { _id: new ObjectId(item.menuItemId) },
        { $set: { stock: newStock, available: newStock > 0 } }
      );

      totalAmount += menuItem.price * item.quantity;
      enrichedItems.push({
        menuItemId: new ObjectId(item.menuItemId),
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        emoji: menuItem.emoji
      });
    }

    const order = {
      customerName,
      items: enrichedItems,
      totalAmount,
      status: 'Pending',
      orderedAt: new Date()
    };

    const result = await db.collection('orders').insertOne(order);
    res.status(201).json({ _id: result.insertedId, ...order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.collection('orders')
      .find()
      .sort({ orderedAt: -1 })
      .toArray();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET single order by ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await db.collection('orders').findOne(
      { _id: new ObjectId(req.params.id) }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH update order status
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await db.collection('orders').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { status } },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Order not found' });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── START SERVER ─────────────────────────────────────────

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`QuickBite server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

# 🍽️ QuickBite — Food Delivery Mini Project

A full-stack food ordering app built with **React + Express + MongoDB (native driver)**.

---

## 📁 Project Structure

```
quickbite/
├── backend/
│   ├── server.js        ← Express REST API (pure MongoDB driver)
│   └── package.json
└── frontend/
    └── src/
        ├── App.js        ← Main app + cart state + navbar
        ├── App.css       ← Dark theme (Netwrck-inspired)
        └── pages/
            ├── MenuPage.js   ← Browse menu, add to cart
            ├── CartPage.js   ← Review cart, place order
            └── OrdersPage.js ← Order history
```

---

## 🗄️ MongoDB Collections

### `menuItems`
| Field       | Type    | Description                        |
|-------------|---------|----------------------------------- |
| name        | String  | Dish name                          |
| description | String  | Short description                  |
| price       | Number  | Price in ₹                         |
| category    | String  | Starters / Mains / Desserts /Drinks|
| emoji       | String  | Display emoji                      |
| stock       | Number  | Units available                    |
| available   | Boolean | false when stock = 0               |

### `orders`
| Field        | Type     | Description                   |
|--------------|----------|-------------------------------|
| customerName | String   | Who placed the order          |
| items        | Array    | [{menuItemId, name, price, quantity, emoji}] |
| totalAmount  | Number   | Backend-calculated total      |
| status       | String   | Pending / Preparing / Ready / Delivered |
| orderedAt    | Date     | Timestamp                     |

---

## 🚀 Setup & Run

### Step 1 — Start MongoDB
Make sure MongoDB is running locally:
```bash
mongod
```

### Step 2 — Backend
```bash
cd backend
npm install
node server.js
```
Server runs at: **http://localhost:5000**
Database auto-seeds 16 menu items on first run.

### Step 3 — Frontend
```bash
cd frontend
npm install
npm start
```
App runs at: **http://localhost:3000**

---

## 🔌 API Endpoints

### Menu
| Method | Endpoint                  | Description           |
|--------|---------------------------|-----------------------|
| GET    | /api/menu                 | Get all menu items    |
| GET    | /api/menu/category/:cat   | Filter by category    |
| POST   | /api/menu                 | Add new menu item     |
| PUT    | /api/menu/:id             | Update menu item      |
| DELETE | /api/menu/:id             | Delete menu item      |

### Orders
| Method | Endpoint                  | Description           |
|--------|---------------------------|-----------------------|
| POST   | /api/orders               | Place a new order     |
| GET    | /api/orders               | Get all orders        |
| GET    | /api/orders/:id           | Get order by ID       |
| PATCH  | /api/orders/:id/status    | Update order status   |

---

## ✨ Features

- Browse menu by category (Starters, Mains, Desserts, Drinks)
- Add/remove items with live quantity control
- Cart with GST calculation (5%)
- Total calculated on **backend** (secure)
- Stock decrements when order is placed
- Items auto-marked unavailable when stock hits 0
- Full order history with status badges
- Dark themed UI inspired by Netwrck

---

## 🧪 Test with curl

```bash
# Get all menu items
curl http://localhost:5000/api/menu

# Place an order (replace IDs with actual MongoDB _id values)
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Arjun","items":[{"menuItemId":"<_id>","quantity":2}]}'

# Get all orders
curl http://localhost:5000/api/orders
```

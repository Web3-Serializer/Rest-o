import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Menu from '../src/models/Menu.js';
import Order from '../src/models/Order.js';
import Reservation from '../src/models/Reservation.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Menu.deleteMany({}),
      Order.deleteMany({}),
      Reservation.deleteMany({})
    ]);

    // === USERS ===
    const users = await User.create([
      { name: 'Admin User', email: 'admin@resto.com', password: 'admin123', role: 'admin' },
      { name: 'Manager User', email: 'manager@resto.com', password: 'manager123', role: 'manager' },
      { name: 'Staff User', email: 'staff@resto.com', password: 'staff123', role: 'staff' },
      { name: 'Client User', email: 'client@resto.com', password: 'client123', role: 'user' }
    ]);

    // === MENUS ===
    const menus = await Menu.create([
      {
        name: 'Salade César',
        description: 'Salade romaine, parmesan, croûtons, sauce césar maison',
        price: 12.5,
        category: 'appetizer',
        isAvailable: true,
        ingredients: ['laitue romaine', 'parmesan', 'croûtons', 'sauce césar'],
        allergens: ['gluten', 'lactose', 'œufs']
      },
      {
        name: 'Steak Frites',
        description: 'Entrecôte 300g, frites maison, sauce au poivre',
        price: 24.9,
        category: 'main',
        isAvailable: true,
        ingredients: ['bœuf', 'pommes de terre', 'sauce poivre'],
        allergens: ['lactose']
      },
      {
        name: 'Tiramisu',
        description: 'Dessert italien aux biscuits, café et mascarpone',
        price: 8.5,
        category: 'dessert',
        isAvailable: true,
        ingredients: ['mascarpone', 'café', 'biscuits', 'cacao'],
        allergens: ['gluten', 'lactose', 'œufs']
      },
      {
        name: 'Coca-Cola',
        description: 'Boisson gazeuse 33cl',
        price: 3.5,
        category: 'drink',
        isAvailable: true,
        ingredients: ['eau gazéifiée', 'sucre', 'arômes'],
        allergens: []
      }
    ]);

    // === ORDERS ===
    const orders = await Order.create([
      {
        items: [
          { menu: menus[0]._id, quantity: 2, price: menus[0].price },
          { menu: menus[1]._id, quantity: 1, price: menus[1].price }
        ],
        totalAmount: 2 * menus[0].price + menus[1].price,
        status: 'delivered',
        tableNumber: 'A1',
        customerName: 'Jean Dupont',
        createdBy: users[2]._id // staff
      },
      {
        items: [{ menu: menus[2]._id, quantity: 3, price: menus[2].price }],
        totalAmount: 3 * menus[2].price,
        status: 'preparing',
        tableNumber: 'B3',
        customerName: 'Marie Curie',
        createdBy: users[2]._id
      },
      {
        items: [{ menu: menus[3]._id, quantity: 5, price: menus[3].price }],
        totalAmount: 5 * menus[3].price,
        status: 'pending',
        tableNumber: 'C2',
        customerName: 'Albert Martin',
        createdBy: users[1]._id // manager
      }
    ]);

    // === RESERVATIONS ===
    const reservations = await Reservation.create([
      {
        customerName: 'Sophie Lambert',
        email: 'sophie@example.com',
        phone: '0601020304',
        date: new Date(Date.now() + 86400000), // demain
        time: '19:30',
        numberOfGuests: 4,
        tableNumber: 'T5',
        status: 'confirmed',
        createdBy: users[1]._id
      },
      {
        customerName: 'Lucas Moreau',
        email: 'lucas@example.com',
        phone: '0605060708',
        date: new Date(Date.now() + 172800000), // dans 2 jours
        time: '20:00',
        numberOfGuests: 2,
        tableNumber: 'T3',
        status: 'pending',
        createdBy: users[2]._id
      }
    ]);

    console.log('✅ Database seeded successfully!\n');
    console.log('--- Test Accounts ---');
    console.log('👑 Admin:    admin@resto.com / admin123');
    console.log('📊 Manager:  manager@resto.com / manager123');
    console.log('👨‍🍳 Staff:    staff@resto.com / staff123');
    console.log('👤 User:     client@resto.com / client123');
    console.log('----------------------\n');
    console.log(`📦 Created: ${users.length} users, ${menus.length} menus, ${orders.length} orders, ${reservations.length} reservations.`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();

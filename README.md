# 🍽️ Rest’o

Rest’o is a full-stack restaurant management app.

It covers the basics you actually need: menus, orders, reservations, and auth.  
Nothing overcomplicated, just a clean base you can build on.

---

## 🚀 Features

- CRUD for menu items
- Order tracking (live updates friendly)
- Reservation management
- JWT auth (login / register)
- i18n ready (en + fr for now)
- Responsive UI
- Simple animations (Framer Motion)
- Easy to extend

---

## 🛠️ Stack

### Frontend
- React + Vite
- TypeScript
- Tailwind + shadcn/ui
- React Router
- Context API (auth + state)
- react-i18next

### Backend
- Node.js
- Express
- MongoDB
- JWT auth
- REST API

---

## ⚙️ Setup

### Clone
```bash
git clone https://github.com/Web3-Serializer/rest-o.git
cd rest-o
```

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd server
npm install
```

Create a `.env` file:
```bash
MONGO_URI=your_connection_string
```

Run server:
```bash
npm run dev
```

---

## 📍 Ports

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 🌍 i18n

Translations live in:
```
src/i18n/locales/
```

Add a new JSON file and plug it into the config.

---

## 🤝 Contributing

PRs are welcome.

Basic flow:
1. Fork
2. Create branch
3. Commit
4. Open PR

Run lint before pushing:
```bash
npm run lint
```

---

## 📜 License

MIT

---

## Notes

This project is meant to be a solid starting point.  
Feel free to tweak structure, add features, or plug in your own stack pieces.

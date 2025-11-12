# 🍽️ Rest’o | Modern Restaurant Management App

**Rest'o** is an open-source, full-stack restaurant management platform.
It allows restaurants to easily manage **menus, orders, and reservations** with a modern and responsive interface.

---

## 🚀 Features

✅ **Menu Management** - Add, edit, and delete dishes from your restaurant's menu.<br>
✅ **Order Tracking** - Monitor and process live customer orders.<br>
✅ **Table Reservations** - Manage and visualize restaurant bookings.<br>
✅ **Authentication System** - Secure login & registration with JWT.<br>
✅ **Internationalization (i18n)** - Supports English 🇬🇧 and French 🇫🇷.<br>
✅ **Responsive Design** - Works perfectly on desktop, tablet, and mobile.<br>
✅ **Smooth Animations** - Powered by Framer Motion.<br>
✅ **Beautiful UI** - Built with Shadcn/UI + TailwindCSS.<br>
✅ **Open Source** — MIT licensed, easy to extend and contribute.<br>

---

## 🛠️ Tech Stack

### 🧠 Frontend

| Category      | Technology                                                                     |
| ------------- | ------------------------------------------------------------------------------ |
| Framework     | [React](https://react.dev/) + [Vite](https://vitejs.dev/)                      |
| Language      | [TypeScript](https://www.typescriptlang.org/)                                  |
| UI Library    | [Shadcn/UI](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/) |
| Animations    | [Framer Motion](https://www.framer.com/motion/)                                |
| Icons         | [Lucide React](https://lucide.dev/)                                            |
| Routing       | [React Router DOM](https://reactrouter.com/)                                   |
| State & Auth  | React Context API                                                              |
| i18n          | [react-i18next](https://react.i18next.com/)                                    |

### 🗄️ Backend

| Category  | Technology                                                |
| --------- | --------------------------------------------------------- |
| Runtime   | [Node.js](https://nodejs.org/)                            |
| Framework | [Express.js](https://expressjs.com/)                      |
| Database  | [MongoDB](https://www.mongodb.com/)                       |
| Auth      | JWT (JSON Web Token)                                      |
| API       | RESTful endpoints for menus, orders, reservations & users |

---

## ⚙️ Installation & Setup

### Frontend

```bash
# Clone repository
git clone https://github.com/Web3-Serializer/rest-o.git
cd rest-o

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend

```bash
cd server

# Install backend dependencies
npm install

# Add your MongoDB URI in a .env file
echo "MONGO_URI=your_connection_string" > .env

# Start backend server
npm run dev
```

Frontend will run on `http://localhost:5173`
Backend will run on `http://localhost:5000`

---

## 🌍 Internationalization

Rest’o supports **English (en)** and **French (fr)** using `react-i18next`.
You can add more languages by creating JSON files in:

```
src/i18n/locales/
```

---

## 🧑‍💻 Contributing

We ❤️ open source!
If you want to improve Rest’o:

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Submit a pull request

Run `npm run lint` before pushing changes.

---

## 🪪 License

This project is licensed under the **MIT License**.
Feel free to use, modify, and distribute it freely.
See [LICENSE](./LICENSE) for more details.

---

## 💖 Acknowledgements

* [React](https://react.dev/)
* [Vite](https://vitejs.dev/)
* [Tailwind CSS](https://tailwindcss.com/)
* [Shadcn/UI](https://ui.shadcn.com/)
* [Sonner](https://ui.shadcn.com/docs/components/sonner)
* [Framer Motion](https://www.framer.com/motion/)
* [Lucide Icons](https://lucide.dev/)
* [MongoDB](https://www.mongodb.com/)
* [Express](https://expressjs.com/)
* [Node.js](https://nodejs.org/)
* [react-i18next](https://react.i18next.com/)

---

> ✨ *Rest'o - Open Source Restaurant Management for the Modern Web.*

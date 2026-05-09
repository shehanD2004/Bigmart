<p align="center">
  <h1 align="center">🛒 Bigmart — Client</h1>
  <p align="center">
    A modern, full-featured e-commerce & ERP storefront built with React&nbsp;19, Vite&nbsp;8, and Tailwind&nbsp;CSS&nbsp;4.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Redux_Toolkit-2-764ABC?logo=redux&logoColor=white" alt="Redux Toolkit" />
  <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white" alt="Stripe" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

## 📖 About

**Bigmart Client** is the frontend application for the [Bigmart](../README.md) MERN-stack platform. It provides two distinct experiences:

- **Customer Storefront** — Browse products, manage a cart, checkout with Stripe, and track orders.
- **Admin Dashboard** — A full ERP suite covering inventory, procurement, fleet management, and analytics.

The app communicates with the Bigmart Express/MongoDB backend via RESTful APIs and uses JWT-based authentication with role-based access control.

---

## ✨ Features

### Storefront (Customer-Facing)

| Feature | Description |
|---|---|
| **Product Catalog** | Browse by category, view detailed product pages |
| **Shopping Cart** | Add, update quantities, and remove items |
| **Stripe Checkout** | Secure payment processing via Stripe Elements |
| **Order Tracking** | Real-time order status updates |
| **User Accounts** | Profile management, order history, and addresses |
| **Help Center** | Self-service support and shipping information |

### Admin Dashboard (ERP)

| Module | Capabilities |
|---|---|
| **Dashboard** | Analytics overview with Recharts visualizations |
| **Products** | Full CRUD, image uploads, category management |
| **Orders** | Status management, filtering, returns processing |
| **Users** | Role assignment, account management |
| **Inventory** | Warehouse management and stock movement tracking |
| **Procurement** | Suppliers, purchase orders, invoices, deliveries |
| **Fleet** | Vehicle tracking, staff management, delivery trips |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev) with JSX |
| **Build Tool** | [Vite 8](https://vite.dev) |
| **State Management** | [Redux Toolkit 2](https://redux-toolkit.js.org) + RTK Query |
| **Routing** | [React Router 7](https://reactrouter.com) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com) via PostCSS |
| **Forms** | [React Hook Form 7](https://react-hook-form.com) + [Zod 4](https://zod.dev) |
| **Payments** | [Stripe React](https://stripe.com/docs/stripe-js/react) |
| **Charts** | [Recharts 3](https://recharts.org) |
| **Icons** | [Lucide React](https://lucide.dev) |
| **HTTP Client** | [Axios](https://axios-http.com) |
| **Notifications** | [React Toastify](https://fkhadra.github.io/react-toastify) |
| **Linting** | ESLint 9 with React Hooks & React Refresh plugins |

---

## 📋 Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9 (or **yarn** / **pnpm**)
- A running instance of the [Bigmart Server](../server) (Express + MongoDB)
- A [Stripe](https://stripe.com) publishable key (for checkout)

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/shehanD2004/Bigmart.git
cd Bigmart/client
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `client/` directory (or copy from the root `.env.example`):

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

> **Note:** All client-side environment variables must be prefixed with `VITE_` to be exposed to the app by Vite.

### 4. Start the development server

```bash
npm run dev
```

The app will be available at **http://localhost:5173** by default.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server with HMR |
| `npm run build` | Create an optimized production build in `dist/` |
| `npm run preview` | Locally preview the production build |
| `npm run lint` | Run ESLint across the entire project |

> **Tip:** You can also run both the client and server together from the project root with `npm run dev` (uses [concurrently](https://www.npmjs.com/package/concurrently)).

---

## 🗂️ Project Structure

```
client/
├── public/                  # Static assets served as-is
├── src/
│   ├── assets/              # Images, fonts, and static resources
│   ├── components/          # Reusable UI components
│   │   ├── ProductCard.jsx
│   │   ├── CategoryCard.jsx
│   │   ├── QuantitySelector.jsx
│   │   ├── Modal.jsx
│   │   ├── ConfirmModal.jsx
│   │   ├── SectionHeader.jsx
│   │   └── Toast.jsx
│   ├── features/            # Redux slices and API services
│   │   ├── api/             # RTK Query API definitions
│   │   ├── auth/            # Authentication state
│   │   └── cart/            # Cart state management
│   ├── layouts/             # Page layout wrappers
│   │   ├── AdminLayout.jsx  # Sidebar navigation for admin
│   │   └── StorefrontLayout.jsx
│   ├── pages/
│   │   ├── auth/            # Login, registration
│   │   ├── store/           # Home, Shop, Cart, Checkout, etc.
│   │   ├── account/         # User profile and settings
│   │   └── admin/           # Admin dashboard modules
│   │       ├── procurement/ # Suppliers, POs, invoices
│   │       └── fleet/       # Vehicles, staff, trips
│   ├── App.jsx              # Root component with route definitions
│   ├── store.js             # Redux store configuration
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles and Tailwind directives
├── index.html               # HTML entry point
├── vite.config.js           # Vite configuration
├── eslint.config.js         # ESLint flat config
├── postcss.config.js        # PostCSS plugins (Tailwind)
└── package.json
```

---

## ⚙️ Configuration

### Vite

The Vite configuration is in [`vite.config.js`](./vite.config.js). To customize the dev server port, proxy API requests, or add plugins:

```js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
```

### Tailwind CSS

Tailwind CSS 4 is configured via the PostCSS plugin in [`postcss.config.js`](./postcss.config.js). Customizations can be made directly in [`src/index.css`](./src/index.css) using Tailwind's CSS-first configuration approach.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** your changes: `git commit -m "feat: add your feature"`
4. **Push** to your branch: `git push origin feature/your-feature`
5. **Open** a Pull Request

### Guidelines

- Follow the existing code style and project structure
- Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
- Ensure `npm run lint` passes before submitting
- Test your changes across the storefront and admin views

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](../LICENSE) file for details.

© 2026 Shehan Dilhara

---

## 📬 Contact & Support

- **GitHub Issues** — [Report a bug or request a feature](https://github.com/shehanD2004/Bigmart/issues)
- **Author** — [Shehan Dilhara](https://github.com/shehanD2004)

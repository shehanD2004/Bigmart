# 🛒 Procurement & Inventory Management System

A modern, full-stack **Procurement & Inventory Management System** built using the **MERN Stack** to streamline supplier management, purchase orders, deliveries, inventory tracking, and payment processing.

Designed with scalability, maintainability, and user experience in mind, this system provides a clean modular architecture with reusable frontend components and a RESTful backend API.

---

## 🚀 Project Status

![Status](https://img.shields.io/badge/Status-Completed-success)
![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Backend](https://img.shields.io/badge/Backend-Node.js-green)
![Database](https://img.shields.io/badge/Database-MongoDB-darkgreen)
![License](https://img.shields.io/badge/License-MIT-orange)

---

# 📌 Table of Contents

* [System Overview](#-system-overview)
* [Key Features](#-key-features)
* [Technology Stack](#-technology-stack)
* [System Architecture](#-system-architecture)
* [Project Structure](#-project-structure)
* [Frontend Architecture](#-frontend-architecture)
* [API Documentation](#-api-documentation)
* [Installation & Setup](#-installation--setup)
* [Environment Variables](#-environment-variables)
* [Running the Application](#-running-the-application)
* [Testing Guide](#-testing-guide)
* [Performance Optimizations](#-performance-optimizations)
* [Security Considerations](#-security-considerations)
* [Troubleshooting](#-troubleshooting)
* [License](#-license)

---

# 📖 System Overview

The **BigMart Procurement & Inventory Management System** is a professional inventory and supplier management platform developed to handle:

* Supplier management
* Purchase order tracking
* Supplier product catalog management
* Delivery management
* Payment processing

The application follows a clean and scalable architecture using:

* **React + Vite** for the frontend
* **Node.js + Express.js** for the backend
* **MongoDB Atlas** for cloud database storage
* **Mongoose ODM** for schema modeling

---

# ✨ Key Features

## ✅ Implemented Features

### Supplier Management

* Full CRUD operations
* Supplier ratings and contact management
* Supplier terms management

### Purchase Orders

* Purchase order creation and updates
* Linked supplier references
* Itemized order handling

### Supplier Products

* Product pricing and lead time tracking
* Supplier-product relationships
* Product detail management

### Deliveries

* Delivery status tracking
* Nested delivery item management
* Delivery history support

### Payments

* Invoice management
* Payment tracking
* Payment status indicators

### User Experience

* Responsive UI design
* Toast notifications
* Loading states
* Search and filtering
* Validation handling
* Mobile-friendly sidebar navigation

### 🔐 Authentication & Authorization
- JWT-based Authentication
- Secure Login & Registration
- Protected Routes
- Role-Based Access Control (RBAC)
- Session & Token Management

### 📊 Analytics & Dashboard
- Interactive Analytics Dashboard
- Dashboard Metrics & Charts
- Supplier Performance Insights
- Inventory Statistics
- Purchase & Payment Analytics

### 🔔 Notifications System
- Email Notifications
- Delivery Status 
- Supplier Communication Support

### 🔍 Search & Filtering
- Advanced Search & Filtering
- Multi-field Filtering
- Real-time Search
- Status-based Filtering

### 📦 Procurement Management
- Supplier CRUD Operations
- Purchase Order Management
- Delivery Tracking
- Payment Processing
- Supplier Product Management

---

# 🛠 Technology Stack

## Frontend

| Technology       | Version |
| ---------------- | ------- |
| React            | 18.2.0  |
| Vite             | 4+      |
| React Router DOM | 6.20.0  |
| Tailwind CSS     | 3.4.19  |
| Heroicons        | 2.0.18  |
| react-hot-toast  | 2.4.1   |

---

## Backend

| Technology    | Version        |
| ------------- | -------------- |
| Node.js       | Latest LTS     |
| Express.js    | Latest         |
| MongoDB Atlas | Cloud Database |
| Mongoose      | Latest         |

---

# 🏗 System Architecture

```text
Frontend (React + Vite)
        │
        ▼
REST API (Express.js)
        │
        ▼
MongoDB Atlas Database
```

---

# 📂 Project Structure

```bash
onako-bigmart/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── config/
│       │   ├── db.js
│       │   └── env.js
│       │
│       ├── models/
│       │   ├── inventory/
│       │   └── supplier/
│       │
│       ├── controllers/
│       │   └── supplier/
│       │
│       └── routes/
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── components/
        ├── pages/
        ├── services/
        └── styles/
```

---

# 🧩 Frontend Architecture

The frontend follows a modular and reusable component architecture.

## Design Pattern

```text
Page Component
    ├── List Component
    ├── Form Component
    └── Details Component
```

Example:

```text
PaymentsPage
├── PaymentList
├── PaymentForm
└── PaymentDetails
```

---

## Shared Component Features

### List Components

* Search functionality
* Status badges
* Pagination-ready structure
* CRUD action buttons
* Loading indicators

### Form Components

* Validation handling
* Dynamic forms
* Dropdown relationships
* Date pickers
* Reusable input patterns

### Details Components

* Read-only data views
* Structured layouts
* Related entity display
* Status indicators

---

# 🔌 API Documentation

## Base URL

```http
http://localhost:5000/api
```

---

## Suppliers API

| Method | Endpoint         | Description        |
| ------ | ---------------- | ------------------ |
| GET    | `/suppliers`     | Get all suppliers  |
| GET    | `/suppliers/:id` | Get supplier by ID |
| POST   | `/suppliers`     | Create supplier    |
| PUT    | `/suppliers/:id` | Update supplier    |
| DELETE | `/suppliers/:id` | Delete supplier    |

---

## Purchase Orders API

| Method | Endpoint                         |
| ------ | -------------------------------- |
| GET    | `/suppliers/purchase-orders`     |
| GET    | `/suppliers/purchase-orders/:id` |
| POST   | `/suppliers/purchase-orders`     |
| PUT    | `/suppliers/purchase-orders/:id` |
| DELETE | `/suppliers/purchase-orders/:id` |

---

## Supplier Products API

| Method | Endpoint                           |
| ------ | ---------------------------------- |
| GET    | `/suppliers/supplier-products`     |
| GET    | `/suppliers/supplier-products/:id` |
| POST   | `/suppliers/supplier-products`     |
| PUT    | `/suppliers/supplier-products/:id` |
| DELETE | `/suppliers/supplier-products/:id` |

---

## Deliveries API

| Method | Endpoint                    |
| ------ | --------------------------- |
| GET    | `/suppliers/deliveries`     |
| GET    | `/suppliers/deliveries/:id` |
| POST   | `/suppliers/deliveries`     |
| PUT    | `/suppliers/deliveries/:id` |
| DELETE | `/suppliers/deliveries/:id` |

---

## Payments API

| Method | Endpoint                  |
| ------ | ------------------------- |
| GET    | `/suppliers/payments`     |
| GET    | `/suppliers/payments/:id` |
| POST   | `/suppliers/payments`     |
| PUT    | `/suppliers/payments/:id` |
| DELETE | `/suppliers/payments/:id` |

---

# 📦 Example API Requests

## Create Supplier

```json
POST /api/suppliers
```

```json
{
  "name": "Acme Corp",
  "contact": "john@acme.com",
  "terms": "Net 30",
  "rating": 4.5
}
```

---

## Create Payment

```json
POST /api/suppliers/payments
```

```json
{
  "supplier": "64f8a1c2b5e3f9d2c4e5f6a7",
  "purchaseOrder": "64f8a1c2b5e3f9d2c4e5f6a8",
  "invoiceNumber": "INV-2024-001",
  "amount": 5000,
  "paymentDate": "2024-01-15",
  "paymentMethod": "Bank Transfer",
  "status": "completed",
  "notes": "Payment received"
}
```

---

# ⚙️ Installation & Setup

## Prerequisites

Make sure the following tools are installed:

* Node.js (v14+)
* npm or yarn
* MongoDB Atlas account

---

# 🔐 Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

---

# ▶️ Running the Application

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/onako-bigmart.git
cd onako-bigmart
```

---

## 2️⃣ Start Backend Server

```bash
cd backend
npm install
npm start
```

Backend server runs on:

```text
http://localhost:5000
```

---

## 3️⃣ Start Frontend Server

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend server runs on:

```text
http://localhost:5183
```

---

# 🧪 Testing Guide

## Manual Testing Checklist

### Suppliers Module

* Create supplier
* Edit supplier
* Delete supplier
* Search suppliers
* Validate required fields

### Payments Module

* Create payment
* Link supplier and PO
* Validate amount input
* Verify status badges

### UI Testing

* Responsive layouts
* Mobile sidebar menu
* Toast notifications
* Button hover states

### Error Handling

* Offline API testing
* Validation errors
* Backend unavailable scenarios

---

# ⚡ Performance Optimizations

## Frontend

* Modular component structure
* React Router-based routing
* Optimized rendering patterns

## Backend

* Async/await architecture
* Mongoose schema validation
* MongoDB connection pooling

## Database

* Indexed document IDs
* Optimized relationship handling
* Efficient schema design

---

# 🔒 Security Considerations

## Development Environment

Current implementation is intended for development purposes.

### Production Improvements Recommended

* JWT authentication
* Role-based authorization
* Input sanitization
* Environment-based configuration
* HTTPS enforcement
* API rate limiting
* Secure CORS configuration

---

# 🛠 Troubleshooting

## Frontend Issues

### White Screen

* Verify backend is running
* Check browser console errors
* Confirm React Router setup

### Tailwind CSS Not Working

```bash
npm run build
```

### Port Already In Use

```bash
npm run dev -- --port 3000
```

---

## Backend Issues

### MongoDB Connection Error

* Verify MongoDB Atlas connection string
* Check IP whitelist configuration
* Confirm database credentials

### Port Conflict

Change backend port:

```javascript
const PORT = process.env.PORT || 5001;
```
---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

Developed as a full-stack MERN application for procurement and inventory management workflows.

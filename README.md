# TechHeaven — Next.js E-Commerce Frontend

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwindcss)
![Zustand](https://img.shields.io/badge/Zustand-State-orange?style=flat-square)
![Axios](https://img.shields.io/badge/Axios-HTTP-5A29E4?style=flat-square)

A production-ready, full-featured e-commerce store client built with Next.js (App Router), TypeScript, TailwindCSS, and Zustand. Connects securely to the [Smart Commerce Spring Boot REST API](https://github.com/Suryansh-Varma/smart-commerce-backend). Includes a complete Admin Control Panel for managing products, orders, coupons, and users.

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Features](#features)
- [E-Commerce Checkout Flow](#e-commerce-checkout-flow)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Pages & Directory Structure](#pages--directory-structure)

---

## Overview

TechHeaven provides a seamless shopping experience with a premium Apple/Stripe-inspired aesthetic. It communicates entirely with the Spring Boot backend via a secured Axios client that injects JWT tokens on every request.

- **Stateless Session Integration**: JWT tokens are persisted in the auth store and automatically injected into all outbound API requests via Axios interceptors.
- **Client-Side Cache**: Zustand stores provide immediate, optimistic UI updates for cart operations, coupon simulation, and profile details.
- **Out-of-Stock Awareness**: Products with zero stock are visually flagged as "Out of Stock" — add-to-cart is disabled automatically.
- **Admin Control Panel**: A protected `/admin` section allows privileged users to manage the entire platform without touching the backend directly.
- **Premium Aesthetics**: Minimalist, high-end components with responsive layouts, smooth animations, and clean spacing.

---

## System Architecture

```mermaid
flowchart TD
    subgraph Browser / Next.js Client
        direction TB
        Page["Next.js Pages\n(App Router)"]
        Components["Reusable Components\n(Navbar / ProductCard / AdminSidebar)"]
      
        subgraph State Management
            AuthStore["Auth Store\n(Zustand / Hooks)"]
            CartStore["Cart Store\n(Zustand / LocalStorage)"]
        end

        subgraph Service Layer
            Axios["Axios Interceptor\n(Bearer JWT injection)"]
            OrderS["Order Service"]
            AuthS["Auth Service"]
            CartS["Cart Service"]
            AdminS["Admin Service"]
            CouponS["Coupon Service"]
        end
    end

    API[("Spring Boot Backend\nREST API\nlocalhost:8080")]

    Page --> Components
    Page -..->|Read/Write State| StateManagement
    ServiceLayer --> Axios
    Axios -->|"Authorized HTTP Request"| API
    OrderS & AuthS & CartS & AdminS & CouponS --> ServiceLayer
```

---

## Features

### Customer-Facing
- **Product Catalogue**: Browse all products; out-of-stock items show a disabled "Out of Stock" badge.
- **Shopping Cart**: Add items, update quantities, and remove products — synced with backend cart.
- **Coupon Application**: Apply discount codes at checkout with live preview of savings.
- **Checkout**: Select shipping address, payment method, and place order via the backend pipeline.
- **Order History**: View all past orders with full financial breakdown (subtotal, coupon, discount, total).
- **Order Details**: Premium card layout showing shipping info, itemised product table, and payment details.
- **PDF Invoice**: Download a generated invoice for any order directly from the order details page.
- **Order Cancellation**: Cancel PENDING orders from the order details page.
- **My Account**: View and manage profile details and saved addresses.

### Admin Panel (`/admin`)
- **Dashboard**: Real-time stats — total users, orders, revenue, and pending order count.
- **Products**: Add, edit, and delete product listings.
- **Inventory**: Monitor and adjust stock levels per product.
- **Orders**: View all customer orders; update order status (PENDING → CONFIRMED → SHIPPED → DELIVERED / CANCELLED).
- **Coupons**: Create, activate/deactivate, and delete coupon codes (percentage or fixed discount).
- **Users**: Browse all registered user accounts.
- **Analytics**: Platform-level revenue and order trend overview.
- **Settings**: Admin configuration panel.

---

## E-Commerce Checkout Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Customer (Browser)
    participant Cart as Cart/Checkout Page
    participant Service as Axios OrderService
    participant API as Spring Boot Backend
    participant DB as PostgreSQL Database

    User->>Cart: Apply Coupon Code
    Cart->>API: POST /coupons/apply {code, orderAmount}
    API-->>Cart: Returns Discount Details (Validate Only)
    User->>Cart: Clicks "Place Order" (COD/Card/UPI)
    Cart->>Service: checkout(CheckoutPayload)
    Service->>API: POST /orders/checkout {addressId, paymentMethod, couponCode}
  
    Note over API: Core Business Validation
    API->>API: Re-validate Coupon via CouponService
    API->>API: Verify Item Stock levels
    API->>API: Snapshot Address & Pricing Details
  
    API->>DB: Save Order (status=PENDING) & Create Payment Record
    API->>DB: Clear User Cart
    API-->>Cart: Return CheckoutResponse (Success)
  
    Cart->>User: Clear Zustand Cart & Redirect to /orders

    Note over API,DB: Admin confirms order → stock deducted
    API->>DB: PATCH /orders/{id}/status CONFIRMED → Deduct Stock

    User->>Cart: View Order Details & Click "Download Invoice"
    Cart->>API: GET /orders/{orderId}/invoice
    API->>API: Compile PDF Invoice using OpenPDF
    API-->>Cart: Return binary application/pdf
    Cart-->>User: File saved to local downloads folder
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | TailwindCSS |
| State Management | Zustand |
| HTTP Client | Axios (with custom Bearer Token interceptor) |
| Notifications | React-Toastify |
| Build & Dev | Node.js 18+, npm |

---

## Getting Started

### Prerequisites

- Node.js 18.x or above
- A running instance of the [Smart Commerce backend API](https://github.com/Suryansh-Varma/smart-commerce-backend) (defaults to `http://localhost:8080`)

### Installation & Execution

1. Clone the repository:
   ```bash
   git clone https://github.com/Suryansh-Varma/ecommerce-store.git
   cd ecommerce-store
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Create an `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser at:
   ```
   http://localhost:3000
   ```

### Building for Production

```bash
npm run build
npm start
```

---

## Pages & Directory Structure

```
src/
├── app/                        # App Router Pages
│   ├── page.tsx                # Home / Product Catalogue
│   ├── login/                  # Sign in page
│   ├── signup/                 # Register account page
│   ├── cart/                   # Shopping Cart
│   ├── checkout/               # Checkout form & address selector
│   ├── orders/                 # Order History list
│   ├── orders/[orderId]/       # Order Details & Invoice download
│   ├── myaccount/              # Profile & Address management
│   ├── dashboard/              # Customer dashboard
│   ├── products/[id]/          # Product Detail page
│   └── admin/                  # Admin Control Panel
│       ├── dashboard/          # Admin summary statistics
│       ├── products/           # Product management (list, new, edit)
│       ├── inventory/          # Stock level management
│       ├── orders/             # All orders & status updates
│       ├── coupons/            # Coupon management
│       ├── users/              # User management
│       ├── analytics/          # Revenue & order trends
│       └── settings/           # Admin settings
├── components/                 # Shared layouts & UI components
│   ├── Navbar.tsx
│   ├── ProductCard.tsx
│   ├── ProtectedRoute.tsx
│   └── admin/                  # Admin-specific components
├── services/                   # Axios Client & Service Layer
│   ├── axiosClient.ts          # JWT interceptor setup
│   ├── authService.ts
│   ├── cartService.ts
│   ├── orderService.ts
│   ├── productService.ts
│   ├── couponService.ts
│   └── adminService.ts
├── stores/                     # Zustand state stores
│   ├── authStore.ts
│   └── cartStore.ts
└── types/                      # Shared TypeScript interfaces
```

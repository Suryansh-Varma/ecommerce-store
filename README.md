# Smart Commerce — Next.js 15 E-Commerce Frontend

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwindcss)
![Zustand](https://img.shields.io/badge/Zustand-State-orange?style=flat-square)
![Axios](https://img.shields.io/badge/Axios-HTTP-5A29E4?style=flat-square)

A production-ready e-commerce store client built with Next.js 15 App Router, TypeScript, TailwindCSS, and Zustand. Connects securely to the Spring Boot REST API.

---

## Table of Contents

- [Overview](#overview)
- [System Architecture (Frontend)](#system-architecture-frontend)
- [New Features Implemented](#new-features-implemented)
- [E-Commerce Checkout Flow Sequence](#e-commerce-checkout-flow-sequence)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Key Pages & Directory Structure](#key-pages--directory-structure)

---

## Overview

This repository houses the user interface for Smart Commerce. It offers a fluid, interactive web interface focusing on performance, responsive layout, and robust state management.

- **Stateless Session Integration**: Connects with backend JWT tokens securely stored and automatically injected into outbound requests via Axios interceptors.
- **Client Side Cache**: State managed by Zustand for immediate UI responses on cart additions, coupon simulation, and profile details.
- **Premium Apple/Stripe-Like Aesthetics**: Minimalist, high-end components with responsive layouts and clean spacing.

---

## System Architecture (Frontend)

```mermaid
flowchart TD
    subgraph Browser / Next.js Client
        direction TB
        Page["Next.js Pages\n(App Router)"]
        Components["Reusable Components\n(Navbar / ProductCard)"]
        
        subgraph State Management
            AuthStore["Auth Store\n(Zustand / Hooks)"]
            CartStore["Cart Store\n(Zustand / LocalStorage)"]
        end

        subgraph Service Layer
            Axios["Axios Interceptor\n(Bearer JWT injection)"]
            OrderS["Order Service"]
            AuthS["Auth Service"]
            CartS["Cart Service"]
        end
    end

    API[("Spring Boot Backend\nREST API\nlocalhost:8080")]

    Page --> Components
    Page -.->|Read/Write State| StateManagement
    ServiceLayer --> Axios
    Axios -->|"Authorized HTTP Request"| API
    OrderS & AuthS & CartS --> ServiceLayer
```

---

## New Features Implemented

1. **Transactional Checkout Payload Mapping**:
   - Updated the checkout page to correctly compile and transmit user decisions (`userId`, `addressId`, `paymentMethod`, and `couponCode`) to the backend `/orders/checkout` pipeline.
2. **Detailed Billing in Order History**:
   - Overhauled the order history list cards (`/orders`) to read and display detailed financial columns returned by the backend: Subtotal, Coupon Code, Discount amount, and Grand Total.
3. **Premium Apple/Stripe Order Details Layout**:
   - Completely redesigned `/orders/[orderId]` to feature structured, premium card layouts:
     - **Order Info (Header)**: Quick summaries with colored status badges.
     - **Shipping Details**: Name, phone, and snapshot formatted address.
     - **Products Table**: Displays quantity, price, image frame, and line-item subtotals.
     - **Financial Summary**: Shows full breakdowns (Subtotal, Coupon Code, Discount, Free Shipping, and Grand Total).
     - **Payment details**: Lists Method, Status, and Transaction ID.
4. **Authorized PDF Invoice Downloading**:
   - Configured a "Download Invoice" action that fetches the invoice PDF as a secure binary blob using `axiosClient` (carrying the user's JWT) and downloads it locally via a programmatic browser trigger.

---

## E-Commerce Checkout Flow Sequence

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
    
    API->>DB: Save Order & Create Payment Record
    API->>DB: Deduct Product Stock & Clear User Cart
    API-->>Cart: Return CheckoutResponse (Success)
    
    Cart->>User: Clear Zustand Cart & Redirect to /orders
    User->>Cart: View Order Details & Click "Download Invoice"
    Cart->>API: GET /orders/{orderId}/invoice
    API->>API: Compile PDF Invoice using OpenPDF
    API-->>Cart: Return binary application/pdf
    Cart-->>User: File Saved to local downloads folder
```

---

## Tech Stack

- **Core**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **HTTP Client**: Axios (with custom Bearer Token interceptor)
- **Notifications**: React-Toastify

---

## Getting Started

### Prerequisites
- Node.js 18.x or above
- Local running backend API (defaulting to `http://localhost:8080`)

### Installation & Execution
1. Clone the repository and navigate into it:
   ```bash
   cd ecommerce-store
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Set the environment file (create `.env.local` if needed, containing the backend URI):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```
4. Fire up the development environment:
   ```bash
   npm run dev
   ```
5. Open browser at: `http://localhost:3000`

---

## Key Pages & Directory Structure

```
src/
├── app/                     # App Router Pages
│   ├── cart/                # Shopping Cart Page
│   ├── checkout/            # Checkout form & address selector
│   ├── dashboard/           # Customer Admin dashboard
│   ├── login/               # Sign in page
│   ├── signup/              # Register account page
│   ├── orders/              # Orders History List view
│   └── orders/[orderId]/    # Redesigned Premium Details & Download page
├── components/              # Shared layouts and components (Navbar, ProtectedRoute)
├── services/                # Axios Client and Service Layer API requests
├── stores/                  # Zustand state stores (Cart, Auth)
└── types/                   # Shared TypeScript interface definitions
```

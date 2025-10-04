# POS System - Role-Based Access Control

## Overview
The POS system now implements comprehensive role-based access control with 6 different user roles, each with specific permissions and access to different parts of the application.

## User Roles & Access

### 🟣 Super Admin
- **Email**: `superadmin@pos.com`
- **Password**: `password123`
- **Access**:
  - Global view across all restaurants/tenants
  - Tenants List (`/admin/tenants`)
  - Tenant Overview (`/admin/tenants/:id`)
  - Dashboard (global analytics)

### 🔵 Owner
- **Email**: `owner@restaurant.com`
- **Password**: `password123`
- **Access**:
  - Full restaurant management
  - Dashboard, Menu (Categories/Items), Tables, Orders, Daily Reports
  - Kitchen view (can monitor kitchen operations)
  - All management functions for their restaurant

### 🟢 Manager
- **Email**: `manager@restaurant.com`
- **Password**: `password123`
- **Access**:
  - Restaurant operations management
  - Dashboard, Menu (Categories/Items), Tables, Orders, Daily Reports
  - Kitchen view (can monitor kitchen operations)
  - Same as Owner but typically for day-to-day operations

### 🟡 Cashier
- **Email**: `cashier@restaurant.com`
- **Password**: `password123`
- **Access**:
  - Tables (read-only for checking status)
  - Orders (create/close orders, handle payments)
  - Order Details (can close & pay orders)
  - Dashboard (limited view)

### 🩷 Waiter
- **Email**: `waiter@restaurant.com`
- **Password**: `password123`
- **Access**:
  - Tables (read-only for table status)
  - Order Create (take new orders)
  - Order Details (view only, cannot close orders)
  - Dashboard (limited view)

### 🟠 Kitchen Staff
- **Email**: `kitchen@restaurant.com`
- **Password**: `password123`
- **Access**:
  - Kitchen Tickets (`/kitchen`) - manage order preparation status
  - Can update item status: Pending → Preparing → Ready
  - View order details and special instructions

## Navigation Structure

### Super Admin Navigation
- Dashboard (Global)
- Tenants
  - Tenants List
  - Tenant Overview

### Owner/Manager Navigation
- Dashboard
- Tables
- Menu
  - Categories
  - Items
- Orders
  - Orders List
  - New Order
- Reports
- Kitchen

### Cashier Navigation
- Dashboard
- Tables (read-only)
- Orders
  - Orders List
  - New Order

### Waiter Navigation
- Dashboard
- Tables (read-only)
- Orders
  - Orders List
  - New Order

### Kitchen Navigation
- Kitchen (Kitchen Tickets)

## Technical Implementation

### Authentication Context
- **File**: `src/context/AuthContext.tsx`
- Supports all 6 roles
- Mock user database with demo credentials
- Role-based user data with tenant information

### Protected Routes
- **File**: `src/components/auth/ProtectedRoute.tsx`
- `allowedRoles` prop for fine-grained access control
- Automatic redirection to `/unauthorized` for insufficient permissions

### Unified Login
- **File**: `src/pages/Auth/Login.tsx`
- Single login page with quick-login buttons for demo
- Role detection based on email/credentials
- Automatic role-based redirection

### Role-Based Sidebar
- **File**: `src/layout/AppSidebar.tsx`
- Dynamic navigation based on user role
- Items filtered by `allowedRoles` array

## Routes & Permissions

| Route | Super Admin | Owner | Manager | Cashier | Waiter | Kitchen |
|-------|-------------|-------|---------|---------|---------|---------|
| `/dashboard` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/tables` | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/categories` | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/items` | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/orders` | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/orders/new` | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/orders/:id` | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/reports` | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/kitchen` | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `/admin/tenants` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Features by Role

### Owner/Manager Features
- Complete restaurant management
- Menu management (categories, items)
- Full order management
- Daily reports and analytics
- Kitchen monitoring
- Table management

### Cashier Features
- Process payments and close orders
- Create new orders
- View table status
- Handle customer transactions

### Waiter Features
- Take customer orders
- View table assignments
- Check order status (but cannot close)
- Customer service focused

### Kitchen Features
- Kitchen ticket management
- Order preparation workflow
- Status updates (Pending → Preparing → Ready)
- View special instructions and notes

### Super Admin Features
- Multi-tenant management
- Global analytics across all restaurants
- Tenant onboarding and management
- System-wide reporting

## Demo Data
All users share the same password: `password123`

Quick login buttons are available on the login page for easy testing of different roles.

## Security Features
- Route-level protection
- Role-based component rendering
- Automatic redirection for unauthorized access
- Token-based authentication (mock implementation)
- Session persistence with localStorage

## Future Enhancements
1. Real API integration
2. Permissions granularity (e.g., read/write permissions)
3. Multi-tenant data isolation
4. Advanced reporting by role
5. Time-based access restrictions
6. Audit logging
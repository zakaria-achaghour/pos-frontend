import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import NotFound from "@/pages/OtherPage/NotFound";

// Layouts
import AppLayout from "@/layout/AppLayout";

// Auth Pages
import Login from "@/pages/Auth/Login";
import Unauthorized from "@/pages/Auth/Unauthorized";
import RoleBasedRedirect from "@/components/auth/RoleBasedRedirect";

// POS Pages
import Dashboard from "@/pages/Dashboard/Dashboard";
import OwnerDashboard from "@/pages/Dashboard/OwnerDashboard";
import CashierDashboard from "@/pages/Dashboard/CashierDashboard";
import DailySummary from "@/pages/Dashboard/DailySummary";
import Tables from "@/pages/Tables/Tables";
import TableManagement from "@/pages/Tables/TableManagement";
import EnhancedTableManagement from "@/pages/Tables/EnhancedTableManagement";
import StaffManagement from "@/pages/Staff/StaffManagement";
import CategoriesManagement from "@/pages/Menu/CategoriesManagement";
import MenuItemsManagement from "@/pages/Menu/MenuItemsManagement";
import MenuItemForm from "@/pages/Menu/MenuItemForm";
import OrderCreate from "@/pages/Orders/QuickOrderCreate";
import OrderDetails from "@/pages/Orders/OrderDetails";
import OrdersManagement from "@/pages/Orders/OrdersManagement";
import AdminTenants from "@/pages/Restaurant/AdminTenants";
import AdminTenantOverview from "@/pages/Restaurant/AdminTenantOverview";
import CreateRestaurant from "@/pages/Restaurant/CreateRestaurant";
import EditRestaurant from "@/pages/Restaurant/EditRestaurant";
import RestaurantDetails from "@/pages/Restaurant/RestaurantDetails";
import KitchenTickets from "@/pages/Kitchen/KitchenTickets";

// Protected Route Component
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { EnhancedOrdersList } from './pages/Orders';

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes with Layout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            {/* Root redirect based on user role */}
            <Route index path="/" element={<RoleBasedRedirect />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['owner', 'manager']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Enhanced Owner Dashboard */}
            <Route path="/owner/dashboard" element={
              <ProtectedRoute allowedRoles={['owner', 'manager']}>
                <OwnerDashboard />
              </ProtectedRoute>
            } />
            
            {/* Tables - accessible by owner, manager, cashier, waiter */}
            <Route path="/tables" element={
              <ProtectedRoute allowedRoles={['owner', 'manager', 'cashier', 'waiter']}>
                <Tables />
              </ProtectedRoute>
            } />
            
            {/* Table Management with CRUD */}
            <Route path="/tables/manage" element={
              <ProtectedRoute allowedRoles={['owner', 'manager']}>
                <TableManagement />
              </ProtectedRoute>
            } />
            
            {/* Enhanced Table Analytics for Owners Only */}
            <Route path="/owner/tables" element={
              <ProtectedRoute allowedRoles={['owner']}>
                <EnhancedTableManagement />
              </ProtectedRoute>
            } />
            
            {/* Staff Management for Owners */}
            <Route path="/owner/staff" element={
              <ProtectedRoute allowedRoles={['owner']}>
                <StaffManagement />
              </ProtectedRoute>
            } />
            
            {/* Menu Management - accessible by owner, manager only */}
            <Route path="/categories" element={
              <ProtectedRoute allowedRoles={['owner', 'manager']}>
                <CategoriesManagement />
              </ProtectedRoute>
            } />
            {/* Menu Items - specific routes must come before general route */}
            <Route path="/menu/items/add" element={
              <ProtectedRoute allowedRoles={['owner', 'manager']}>
                <MenuItemForm />
              </ProtectedRoute>
            } />
            <Route path="/menu/items/edit/:id" element={
              <ProtectedRoute allowedRoles={['owner', 'manager']}>
                <MenuItemForm />
              </ProtectedRoute>
            } />
            <Route path="/menu/items" element={
              <ProtectedRoute allowedRoles={['owner', 'manager']}>
                <MenuItemsManagement />
              </ProtectedRoute>
            } />
            
            {/* Orders - accessible by owner, manager, cashier, waiter */}
            <Route path="/orders" element={
              <ProtectedRoute allowedRoles={['owner', 'manager', 'cashier', 'waiter']}>
                <OrdersManagement />
              </ProtectedRoute>
            } />
            <Route path="/orders/new" element={
              <ProtectedRoute allowedRoles={['owner', 'manager', 'cashier', 'waiter']}>
                <OrderCreate />
              </ProtectedRoute>
            } />
            <Route path="/orders/:id" element={
              <ProtectedRoute allowedRoles={['owner', 'manager', 'cashier', 'waiter']}>
                <OrderDetails />
              </ProtectedRoute>
            } />
            
            {/* Cashier-specific routes */}
            <Route path="/cashier/dashboard" element={
              <ProtectedRoute allowedRoles={['cashier']}>
                <CashierDashboard />
              </ProtectedRoute>
            } />
            <Route path="/cashier/orders" element={
              <ProtectedRoute allowedRoles={['cashier']}>
                <OrdersManagement />
              </ProtectedRoute>
            } />
            
            {/* Reports - accessible by owner, manager only */}
            {/* <Route path="/reports" element={
              <ProtectedRoute allowedRoles={['owner', 'manager']}>
                <DailySummary />
              </ProtectedRoute>
            } /> */}
            
            {/* Kitchen - accessible by kitchen, owner, manager */}
            <Route path="/kitchen" element={
              <ProtectedRoute allowedRoles={['kitchen', 'owner', 'manager']}>
                <KitchenTickets />
              </ProtectedRoute>
            } />
            
            {/* SuperAdmin Routes */}
            <Route path="/admin/tenants" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <AdminTenants />
              </ProtectedRoute>
            } />
            <Route path="/admin/restaurants/create" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <CreateRestaurant />
              </ProtectedRoute>
            } />
            <Route path="/admin/restaurants/:id" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <RestaurantDetails />
              </ProtectedRoute>
            } />
            <Route path="/admin/restaurants/:id/edit" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <EditRestaurant />
              </ProtectedRoute>
            } />
            <Route path="/admin/tenants/:id" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <AdminTenantOverview />
              </ProtectedRoute>
            } />
          </Route>

          {/* Fallback Routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

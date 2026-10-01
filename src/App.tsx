import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import RouteFallback from "@/components/common/RouteFallback";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import NotFound from "@/pages/OtherPage/NotFound";

// Layouts
import AppLayout from "@/layout/AppLayout";

// Auth Pages
import Login from "@/pages/Auth/Login";
import Unauthorized from "@/pages/Auth/Unauthorized";
import RoleBasedRedirect from "@/components/auth/RoleBasedRedirect";

// POS Pages

// Protected Route Component
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Pages are code-split: each route downloads when first visited
const Dashboard = lazy(() => import("@/pages/Dashboard/Dashboard"));
const OwnerDashboard = lazy(() => import("@/pages/Dashboard/OwnerDashboard"));
const CashierDashboard = lazy(() => import("@/pages/Dashboard/CashierDashboard"));
const Tables = lazy(() => import("@/pages/Tables/Tables"));
const TableManagement = lazy(() => import("@/pages/Tables/TableManagement"));
const EnhancedTableManagement = lazy(() => import("@/pages/Tables/EnhancedTableManagement"));
const StaffManagement = lazy(() => import("@/pages/Staff/StaffManagement"));
const CategoriesManagement = lazy(() => import("@/pages/Menu/CategoriesManagement"));
const MenuItemsManagement = lazy(() => import("@/pages/Menu/MenuItemsManagement"));
const MenuItemForm = lazy(() => import("@/pages/Menu/MenuItemForm"));
const OrderCreate = lazy(() => import("@/pages/Orders/QuickOrderCreate"));
const OrderDetails = lazy(() => import("@/pages/Orders/OrderDetails"));
const OrdersManagement = lazy(() => import("@/pages/Orders/OrdersManagement"));
const PaymentConfirmation = lazy(() => import("@/pages/Orders/PaymentConfirmation"));
const ReceiptPreview = lazy(() => import("@/pages/Orders/ReceiptPreview"));
const AdminTenants = lazy(() => import("@/pages/Restaurant/AdminTenants"));
const AdminTenantOverview = lazy(() => import("@/pages/Restaurant/AdminTenantOverview"));
const CreateRestaurant = lazy(() => import("@/pages/Restaurant/CreateRestaurant"));
const EditRestaurant = lazy(() => import("@/pages/Restaurant/EditRestaurant"));
const RestaurantDetails = lazy(() => import("@/pages/Restaurant/RestaurantDetails"));
const RoleManagement = lazy(() => import("@/pages/Admin/Roles/RoleManagement"));
const CreateRole = lazy(() => import("@/pages/Admin/Roles/CreateRole"));
const EditRole = lazy(() => import("@/pages/Admin/Roles/EditRole"));
const PermissionManagement = lazy(() => import("@/pages/Admin/Permissions/PermissionManagement"));
const KitchenManagement = lazy(() => import("@/pages/Kitchen/KitchenManagement"));

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<RouteFallback />}>
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
            
            {/* Receipt Routes */}
            <Route path="/orders/:id/payment-confirmation" element={
              <ProtectedRoute allowedRoles={['owner', 'manager', 'cashier', 'waiter']}>
                <PaymentConfirmation />
              </ProtectedRoute>
            } />
            <Route path="/orders/:id/receipt" element={
              <ProtectedRoute allowedRoles={['owner', 'manager', 'cashier', 'waiter']}>
                <ReceiptPreview />
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
            
            {/* Kitchen - accessible by kitchen, owner, manager */}
            <Route path="/kitchen" element={
              <ProtectedRoute allowedRoles={['kitchen', 'owner', 'manager']}>
                <KitchenManagement />
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
            
            {/* Role Management Routes */}
            <Route path="/admin/roles" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <RoleManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/roles/create" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <CreateRole />
              </ProtectedRoute>
            } />
            <Route path="/admin/roles/:id/edit" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <EditRole />
              </ProtectedRoute>
            } />
            
            {/* Permission Management Routes */}
            <Route path="/admin/permissions" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <PermissionManagement />
              </ProtectedRoute>
            } />
          </Route>

          {/* Fallback Routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </Router>
    </>
  );
}

import { BrowserRouter as Router, Routes, Route } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import NotFound from "./pages/OtherPage/NotFound";

// Layouts
import AppLayout from "./layout/AppLayout";

// Auth Pages
import Login from "./pages/Auth/Login";
import Unauthorized from "./pages/Auth/Unauthorized";
import RoleBasedRedirect from "./components/auth/RoleBasedRedirect";

// POS Pages
import Dashboard from "./pages/POS/Dashboard";
import OwnerDashboard from "./pages/POS/OwnerDashboard";
import Tables from "./pages/POS/Tables";
import TableManagement from "./pages/POS/TableManagement";
import EnhancedTableManagement from "./pages/POS/EnhancedTableManagement";
import StaffManagement from "./pages/POS/StaffManagement";
import Categories from "./pages/POS/Categories";
import Items from "./pages/POS/Items";
import OrdersList from "./pages/POS/OrdersList";
import OrderCreate from "./pages/POS/OrderCreate";
import OrderDetails from "./pages/POS/OrderDetails";
import DailySummary from "./pages/POS/DailySummary";
import AdminTenants from "./pages/POS/AdminTenants";
import AdminTenantOverview from "./pages/POS/AdminTenantOverview";
import KitchenTickets from "./pages/POS/KitchenTickets";
import CashierDashboard from "./pages/POS/CashierDashboard";
import EnhancedOrdersList from "./pages/POS/EnhancedOrdersList";

// Protected Route Component
import ProtectedRoute from "./components/auth/ProtectedRoute";

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
            
            {/* Enhanced Table Management for Owners/Managers */}
            <Route path="/owner/tables" element={
              <ProtectedRoute allowedRoles={['owner', 'manager']}>
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
                <Categories />
              </ProtectedRoute>
            } />
            <Route path="/items" element={
              <ProtectedRoute allowedRoles={['owner', 'manager']}>
                <Items />
              </ProtectedRoute>
            } />
            
            {/* Orders - accessible by owner, manager, cashier, waiter */}
            <Route path="/orders" element={
              <ProtectedRoute allowedRoles={['owner', 'manager', 'cashier', 'waiter']}>
                <EnhancedOrdersList />
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
                <EnhancedOrdersList />
              </ProtectedRoute>
            } />
            
            {/* Reports - accessible by owner, manager only */}
            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={['owner', 'manager']}>
                <DailySummary />
              </ProtectedRoute>
            } />
            
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

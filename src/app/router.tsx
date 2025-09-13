import { createBrowserRouter } from "react-router";
import MainLayout from "../components/layout/MainLayout";
import Login from "../features/auth/pages/Login";
import OwnerDashboard from "../features/dashboard/pages/OwnerDashboard";
import Categories from "../features/menu/pages/Categories";
import Items from "../features/menu/pages/Items";
import Tables from "../features/tables/pages/Tables";
import OrdersList from "../features/orders/pages/OrdersList";
import OrderCreate from "../features/orders/pages/OrderCreate";
import OrderDetails from "../features/orders/pages/OrderDetails";
import DailySummary from "../features/reports/pages/DailySummary";
import Tenants from "../features/admin/pages/Tenants";
import TenantOverview from "../features/admin/pages/TenantOverview";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <OwnerDashboard /> },
      { path: "menu/categories", element: <Categories /> },
      { path: "menu/items", element: <Items /> },
      { path: "tables", element: <Tables /> },
      { path: "orders", element: <OrdersList /> },
      { path: "orders/new", element: <OrderCreate /> },
      { path: "orders/:id", element: <OrderDetails /> },
      { path: "reports/daily", element: <DailySummary /> },
      { path: "admin/tenants", element: <Tenants /> },
      { path: "admin/tenants/:id", element: <TenantOverview /> },
    ],
  },
]);


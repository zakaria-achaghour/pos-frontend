import { NavLink } from "react-router";

export default function Sidebar() {
  const link = "block px-4 py-2 hover:bg-gray-100";
  return (
    <div className="h-full border-r">
      <nav className="py-2 text-sm">
        <NavLink className={link} to="/">Owner Dashboard</NavLink>
        <NavLink className={link} to="/menu/categories">Categories</NavLink>
        <NavLink className={link} to="/menu/items">Items</NavLink>
        <NavLink className={link} to="/orders">Orders</NavLink>
        <NavLink className={link} to="/orders/new">Create Order</NavLink>
        <NavLink className={link} to="/tables">Tables</NavLink>
        <NavLink className={link} to="/reports/daily">Daily Summary</NavLink>
        <NavLink className={link} to="/admin/tenants">Tenants</NavLink>
      </nav>
    </div>
  );
}


import { NavLink } from "react-router";

export default function Header() {
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b">
      <div className="font-semibold">POS Dashboard</div>
      <nav className="flex gap-4 text-sm">
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/orders">Orders</NavLink>
        <NavLink to="/tables">Tables</NavLink>
      </nav>
    </header>
  );
}


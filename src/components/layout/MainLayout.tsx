import { Outlet, NavLink } from "react-router";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function MainLayout() {
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr] grid-rows-[56px_1fr]">
      <div className="col-span-2 row-start-1">
        <Header />
      </div>
      <aside className="row-start-2">
        <Sidebar />
      </aside>
      <main className="p-4 row-start-2">
        <Outlet />
      </main>
    </div>
  );
}


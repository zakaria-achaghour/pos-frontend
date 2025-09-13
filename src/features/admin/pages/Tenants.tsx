import { Link } from "react-router";

export default function Tenants() {
  const tenants = [
    { id: "t1", name: "Acme Cafe" },
    { id: "t2", name: "Bistro Co" },
  ];
  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">Tenants</h1>
      <div className="rounded border">
        {tenants.map((t) => (
          <Link key={t.id} to={`/admin/tenants/${t.id}`} className="block border-b px-3 py-2 hover:bg-gray-50">
            {t.name}
          </Link>
        ))}
      </div>
    </div>
  );
}


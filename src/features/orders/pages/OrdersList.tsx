import { Link } from "react-router";

export default function OrdersList() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Orders</h1>
        <Link to="/orders/new" className="rounded bg-black px-3 py-2 text-white">New Order</Link>
      </div>
      <div className="rounded border">
        {[1, 2, 3].map((id) => (
          <Link key={id} to={`/orders/${id}`} className="block border-b px-3 py-2 hover:bg-gray-50">
            Order #{id}
          </Link>
        ))}
      </div>
    </div>
  );
}


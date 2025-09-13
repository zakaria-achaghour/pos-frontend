import { useParams } from "react-router";

export default function OrderDetails() {
  const { id } = useParams();
  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">Order #{id}</h1>
      <div className="rounded border p-4">Order details content.</div>
    </div>
  );
}


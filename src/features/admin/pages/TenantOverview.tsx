import { useParams } from "react-router";

export default function TenantOverview() {
  const { id } = useParams();
  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">Tenant Overview: {id}</h1>
      <div className="rounded border p-4">Tenant settings and KPIs.</div>
    </div>
  );
}


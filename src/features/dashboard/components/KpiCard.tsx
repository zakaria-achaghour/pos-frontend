import Card from "../../../components/common/Card";

export default function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </Card>
  );
}


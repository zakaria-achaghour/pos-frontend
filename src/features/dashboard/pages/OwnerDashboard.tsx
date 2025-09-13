import Card from "../../../components/common/Card";

export default function OwnerDashboard() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <div className="text-sm text-gray-500">Today's Revenue</div>
        <div className="text-2xl font-semibold">$1,240</div>
      </Card>
      <Card>
        <div className="text-sm text-gray-500">Open Orders</div>
        <div className="text-2xl font-semibold">8</div>
      </Card>
      <Card>
        <div className="text-sm text-gray-500">Occupied Tables</div>
        <div className="text-2xl font-semibold">12</div>
      </Card>
    </div>
  );
}


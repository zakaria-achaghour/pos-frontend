import { useState, useEffect } from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

// Mock data - replace with actual API call
const mockDashboardData = {
  salesTotal: 12450.75,
  ordersCount: 87,
  avgTicket: 143.00,
  paymentMethods: {
    cash: 5400.25,
    card: 6200.50,
    other: 850.00
  }
};

interface DashboardData {
  salesTotal: number;
  ordersCount: number;
  avgTicket: number;
  paymentMethods: {
    cash: number;
    card: number;
    other: number;
  };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await api.get(`/reports/summary?date=${new Date().toISOString().split('T')[0]}`);
        // setData(response.data);
        
        // Simulate API delay
        setTimeout(() => {
          setData(mockDashboardData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div>
        <PageMeta
          title="POS Dashboard | TailAdmin - React.js Admin Dashboard Template"
          description="POS Dashboard for restaurant management"
        />
        <PageBreadcrumb pageTitle="Dashboard" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title="POS Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="POS Dashboard for restaurant management"
      />
      <PageBreadcrumb pageTitle="Dashboard" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales Today */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Sales Today</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data?.salesTotal.toFixed(2)} MAD
          </p>
        </div>

        {/* Orders Count */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Orders</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data?.ordersCount}
          </p>
        </div>

        {/* Average Ticket */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Ticket</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data?.avgTicket.toFixed(2)} MAD
          </p>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Payment Methods</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Cash:</span>
              <span className="font-medium">{data?.paymentMethods.cash.toFixed(2)} MAD</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Card:</span>
              <span className="font-medium">{data?.paymentMethods.card.toFixed(2)} MAD</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Other:</span>
              <span className="font-medium">{data?.paymentMethods.other.toFixed(2)} MAD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
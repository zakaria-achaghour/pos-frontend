import { useState, useEffect } from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';

// Mock data
const mockSummaryData = {
  orders: 47,
  totalSales: 3250.75,
  paymentMethods: {
    cash: 1500.25,
    card: 1450.50,
    other: 300.00
  }
};

interface SummaryData {
  orders: number;
  totalSales: number;
  paymentMethods: {
    cash: number;
    card: number;
    other: number;
  };
}

export default function DailySummary() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, [selectedDate]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await api.get(`/reports/summary?date=${selectedDate}`);
      // setData(response.data);
      
      setTimeout(() => {
        setData(mockSummaryData);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching summary:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageMeta title="Daily Summary | POS System" description="Daily sales summary" />
        <PageBreadcrumb pageTitle="Daily Summary" />
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title="Daily Summary | POS System" description="Daily sales summary" />
      <PageBreadcrumb pageTitle="Daily Summary" />
      
      <div className="space-y-6">
        {/* Date Selector */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="max-w-xs">
            <Label htmlFor="date">Select Date</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {/* Summary Cards */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Orders */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Orders</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {data.orders}
              </p>
            </div>

            {/* Total Sales */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sales</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {data.totalSales.toFixed(2)} MAD
              </p>
            </div>

            {/* Payment Methods Breakdown */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Payment Methods</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cash:</span>
                  <span className="font-medium">{data.paymentMethods.cash.toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Card:</span>
                  <span className="font-medium">{data.paymentMethods.card.toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Other:</span>
                  <span className="font-medium">{data.paymentMethods.other.toFixed(2)} MAD</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!data && !loading && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500">No data available for the selected date</p>
          </div>
        )}
      </div>
    </div>
  );
}
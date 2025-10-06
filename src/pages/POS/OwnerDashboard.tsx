import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } fr  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getMetrics(selectedTimeframe);
        setMetrics(data);
      } catch (err: any) {
        console.error('Error fetching metrics:', handleApiError(err));
        // Fallback to mock data for development
        setMetrics(mockMetrics);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [selectedTimeframe]);/AuthContext';
import { dashboardAPI, DashboardMetrics } from '../../api/dashboard';
import { handleApiError } from '../../api/client';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

interface DashboardMetrics {
  // Revenue Metrics
  todayRevenue: number;
  yesterdayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  
  // Order Metrics
  todayOrders: number;
  averageTicket: number;
  completionRate: number;
  
  // Table Metrics
  totalTables: number;
  occupiedTables: number;
  averageTurnover: number;
  
  // Staff Metrics
  activeStaff: number;
  topPerformer: {
    name: string;
    ordersCompleted: number;
    revenue: number;
  };
  
  // Payment Breakdown
  paymentMethods: {
    cash: number;
    card: number;
    other: number;
  };
  
  // Popular Items
  topItems: Array<{
    name: string;
    sold: number;
    revenue: number;
  }>;
  
  // Hourly Sales
  hourlySales: Array<{
    hour: string;
    sales: number;
    orders: number;
  }>;
}

const mockMetrics: DashboardMetrics = {
  todayRevenue: 15750.00,
  yesterdayRevenue: 14200.00,
  weekRevenue: 89400.00,
  monthRevenue: 387500.00,
  
  todayOrders: 156,
  averageTicket: 101.00,
  completionRate: 94.5,
  
  totalTables: 20,
  occupiedTables: 12,
  averageTurnover: 1.8,
  
  activeStaff: 8,
  topPerformer: {
    name: "Sarah",
    ordersCompleted: 28,
    revenue: 2850.00
  },
  
  paymentMethods: {
    cash: 6300.00,
    card: 8450.00,
    other: 1000.00
  },
  
  topItems: [
    { name: "Tagine Beef", sold: 24, revenue: 1440.00 },
    { name: "Couscous Royal", sold: 18, revenue: 1260.00 },
    { name: "Pastilla Chicken", sold: 15, revenue: 900.00 },
    { name: "Mint Tea", sold: 45, revenue: 450.00 }
  ],
  
  hourlySales: [
    { hour: "09:00", sales: 450, orders: 5 },
    { hour: "10:00", sales: 720, orders: 8 },
    { hour: "11:00", sales: 980, orders: 12 },
    { hour: "12:00", sales: 1850, orders: 18 },
    { hour: "13:00", sales: 2400, orders: 24 },
    { hour: "14:00", sales: 1950, orders: 19 },
    { hour: "15:00", sales: 1200, orders: 14 },
    { hour: "16:00", sales: 890, orders: 9 },
    { hour: "17:00", sales: 1100, orders: 11 },
    { hour: "18:00", sales: 1650, orders: 16 },
    { hour: "19:00", sales: 2250, orders: 22 },
    { hour: "20:00", sales: 1300, orders: 13 }
  ]
};

export default function OwnerDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('today');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
          setMetrics(mockMetrics);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [selectedTimeframe]);

  const getRevenueByTimeframe = () => {
    if (!metrics) return 0;
    switch (selectedTimeframe) {
      case 'today': return metrics.todayRevenue;
      case 'week': return metrics.weekRevenue;
      case 'month': return metrics.monthRevenue;
      default: return metrics.todayRevenue;
    }
  };

  const getRevenueChange = () => {
    if (!metrics) return 0;
    const today = metrics.todayRevenue;
    const yesterday = metrics.yesterdayRevenue;
    return yesterday > 0 ? ((today - yesterday) / yesterday * 100) : 0;
  };

  if (loading) {
    return (
      <div>
        <PageMeta title="Owner Dashboard | POS System" description="Restaurant management dashboard" />
        <PageBreadcrumb pageTitle="Owner Dashboard" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <PageMeta title="Owner Dashboard | POS System" description="Restaurant management dashboard" />
      <PageBreadcrumb pageTitle="Owner Dashboard" />
      
      {/* Welcome Header */}
      <div className="bg-blue-500 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100">Here's how your restaurant is performing today</p>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2">
        {[
          { key: 'today', label: 'Today' },
          { key: 'week', label: 'This Week' },
          { key: 'month', label: 'This Month' }
        ].map((timeframe) => (
          <button
            key={timeframe.key}
            onClick={() => setSelectedTimeframe(timeframe.key as 'today' | 'week' | 'month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              selectedTimeframe === timeframe.key
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border hover:bg-gray-50'
            }`}
          >
            {timeframe.label}
          </button>
        ))}
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                MAD {getRevenueByTimeframe().toFixed(2)}
              </p>
              <div className={`text-sm ${getRevenueChange() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {getRevenueChange() >= 0 ? '↗️' : '↘️'} {Math.abs(getRevenueChange()).toFixed(1)}% vs yesterday
              </div>
            </div>
            <div className="text-2xl">💰</div>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Orders Today</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.todayOrders}</p>
              <p className="text-sm text-gray-500">MAD {metrics.averageTicket.toFixed(2)} avg ticket</p>
            </div>
            <div className="text-2xl">🧾</div>
          </div>
        </div>

        {/* Tables */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Table Occupancy</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.occupiedTables}/{metrics.totalTables}
              </p>
              <p className="text-sm text-gray-500">{((metrics.occupiedTables / metrics.totalTables) * 100).toFixed(0)}% occupied</p>
            </div>
            <div className="text-2xl">🍽️</div>
          </div>
        </div>

        {/* Staff Performance */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Top Performer</p>
              <p className="text-lg font-bold text-gray-900">{metrics.topPerformer.name}</p>
              <p className="text-sm text-gray-500">{metrics.topPerformer.ordersCompleted} orders • MAD {metrics.topPerformer.revenue.toFixed(2)}</p>
            </div>
            <div className="text-2xl">👑</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">📈 Hourly Sales</h3>
          <div className="space-y-2">
            {metrics.hourlySales.slice(-8).map((hour, index) => (
              <div key={hour.hour} className="flex items-center gap-3">
                <div className="w-12 text-sm text-gray-600">{hour.hour}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                  <div 
                    className="bg-blue-500 h-3 rounded-full"
                    style={{ width: `${(hour.sales / 2500) * 100}%` }}
                  ></div>
                </div>
                <div className="w-20 text-sm font-medium text-right">MAD {hour.sales}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">💳 Payment Methods</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Cash</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">MAD {metrics.paymentMethods.cash.toFixed(2)}</div>
                <div className="text-sm text-gray-500">
                  {((metrics.paymentMethods.cash / metrics.todayRevenue) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Card</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">MAD {metrics.paymentMethods.card.toFixed(2)}</div>
                <div className="text-sm text-gray-500">
                  {((metrics.paymentMethods.card / metrics.todayRevenue) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Other</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">MAD {metrics.paymentMethods.other.toFixed(2)}</div>
                <div className="text-sm text-gray-500">
                  {((metrics.paymentMethods.other / metrics.todayRevenue) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Items */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">🏆 Top Selling Items Today</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.topItems.map((item, index) => (
            <div key={item.name} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}</span>
                <span className="font-medium">{item.name}</span>
              </div>
              <div className="text-sm text-gray-600">
                <div>Sold: {item.sold} units</div>
                <div className="font-semibold text-green-600">MAD {item.revenue.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">⚡ Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/reports')}
            className="p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors hover:scale-105 transform duration-200"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium">View Reports</div>
          </button>
          <button 
            onClick={() => navigate('/tables/manage')}
            className="p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors hover:scale-105 transform duration-200"
          >
            <div className="text-2xl mb-2">🍽️</div>
            <div className="text-sm font-medium">Manage Tables</div>
          </button>
          <button 
            onClick={() => navigate('/owner/staff')}
            className="p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors hover:scale-105 transform duration-200"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="text-sm font-medium">Staff Management</div>
          </button>
          <button 
            onClick={() => navigate('/items')}
            className="p-4 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors hover:scale-105 transform duration-200"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="text-sm font-medium">Menu Editor</div>
          </button>
        </div>
      </div>
    </div>
  );
}
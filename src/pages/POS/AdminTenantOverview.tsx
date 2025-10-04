import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

// Mock data
const mockTenantOverview = {
  id: 1,
  name: 'Restaurant Le Petit Chef',
  city: 'Casablanca',
  tables: 12,
  categories: 5,
  items: 48,
  orders_today: 23,
  sales_today: 1245.75
};

interface TenantOverview {
  id: number;
  name: string;
  city: string;
  tables: number;
  categories: number;
  items: number;
  orders_today: number;
  sales_today: number;
}

export default function AdminTenantOverview() {
  const { id } = useParams<{ id: string }>();
  const [tenant, setTenant] = useState<TenantOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenantOverview();
  }, [id]);

  const fetchTenantOverview = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await api.get(`/admin/restaurants/${id}/overview`);
      // setTenant(response.data);
      
      setTimeout(() => {
        setTenant({ ...mockTenantOverview, id: parseInt(id || '1') });
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching tenant overview:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageMeta title="Restaurant Overview | Admin" description="Restaurant overview" />
        <PageBreadcrumb pageTitle="Restaurant Overview" />
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
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

  if (!tenant) {
    return (
      <div>
        <PageMeta title="Restaurant Overview | Admin" description="Restaurant overview" />
        <PageBreadcrumb pageTitle="Restaurant Overview" />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Restaurant not found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title={`${tenant.name} Overview | Admin`} description="Restaurant overview" />
      <PageBreadcrumb pageTitle="Restaurant Overview" />
      
      <div className="space-y-6">
        {/* Restaurant Info */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{tenant.name}</h2>
          <p className="text-gray-600">Located in {tenant.city}</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Tables */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Tables</h3>
            <p className="text-3xl font-bold text-gray-900">{tenant.tables}</p>
          </div>

          {/* Categories */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Categories</h3>
            <p className="text-3xl font-bold text-gray-900">{tenant.categories}</p>
          </div>

          {/* Menu Items */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Menu Items</h3>
            <p className="text-3xl font-bold text-gray-900">{tenant.items}</p>
          </div>

          {/* Orders Today */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Orders Today</h3>
            <p className="text-3xl font-bold text-blue-600">{tenant.orders_today}</p>
          </div>

          {/* Sales Today */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Sales Today</h3>
            <p className="text-3xl font-bold text-green-600">{tenant.sales_today.toFixed(2)} MAD</p>
          </div>
        </div>
      </div>
    </div>
  );
}
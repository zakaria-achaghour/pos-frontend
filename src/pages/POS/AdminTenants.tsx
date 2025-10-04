import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';

// Mock data
const mockTenants = [
  { id: 1, name: 'Restaurant Le Petit Chef', city: 'Casablanca', status: 'active' },
  { id: 2, name: 'Café Marina', city: 'Rabat', status: 'active' },
  { id: 3, name: 'Bistro Central', city: 'Marrakech', status: 'inactive' },
  { id: 4, name: 'Pizza Corner', city: 'Tangier', status: 'active' },
];

interface Tenant {
  id: number;
  name: string;
  city: string;
  status: 'active' | 'inactive';
}

export default function AdminTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTenants();
  }, [searchQuery]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await api.get(`/admin/restaurants?q=${searchQuery}`);
      // setTenants(response.data);
      
      setTimeout(() => {
        const filteredTenants = searchQuery
          ? mockTenants.filter(tenant => 
              tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              tenant.city.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : mockTenants;
        setTenants(filteredTenants);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-block px-2 py-1 rounded-full text-xs font-medium';
    if (status === 'active') {
      return `${baseClasses} bg-green-100 text-green-800`;
    }
    return `${baseClasses} bg-red-100 text-red-800`;
  };

  if (loading) {
    return (
      <div>
        <PageMeta title="Restaurants | Admin" description="Manage restaurants" />
        <PageBreadcrumb pageTitle="Restaurants" />
        <div className="bg-white rounded-xl shadow p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title="Restaurants | Admin" description="Manage restaurants" />
      <PageBreadcrumb pageTitle="Restaurants" />
      
      <div className="bg-white rounded-xl shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Restaurants</h2>
          
          <div className="max-w-md">
            <Label htmlFor="search">Search Restaurants</Label>
            <Input
              id="search"
              type="text"
              placeholder="Search by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="p-6">
          {tenants.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchQuery ? 'No restaurants found matching your search' : 'No restaurants found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">City</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-900">#{tenant.id}</td>
                      <td className="py-3 px-4 text-gray-900 font-medium">{tenant.name}</td>
                      <td className="py-3 px-4 text-gray-600">{tenant.city}</td>
                      <td className="py-3 px-4">
                        <span className={getStatusBadge(tenant.status)}>
                          {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          to={`/pos/admin/tenants/${tenant.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
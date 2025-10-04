import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

// Mock data - replace with actual API call
const mockTables = [
  { id: 1, name: 'Table 1', capacity: 4, status: 'available' },
  { id: 2, name: 'Table 2', capacity: 2, status: 'occupied' },
  { id: 3, name: 'Table 3', capacity: 6, status: 'available' },
  { id: 4, name: 'Table 4', capacity: 4, status: 'occupied' },
  { id: 5, name: 'Table 5', capacity: 8, status: 'available' },
  { id: 6, name: 'Table 6', capacity: 2, status: 'available' },
];

interface Table {
  id: number;
  name: string;
  capacity: number;
  status: 'available' | 'occupied';
}

export default function Tables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await api.get('/tables');
        // setTables(response.data);
        
        // Simulate API delay
        setTimeout(() => {
          setTables(mockTables);
          setLoading(false);
        }, 800);
      } catch (err) {
        setError('Failed to load tables');
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  const handleTableClick = (table: Table) => {
    if (user?.role === 'waiter') {
      // For waiters, go directly to order creation for the selected table
      navigate(`/orders/new?table=${table.id}&tableName=${encodeURIComponent(table.name)}`);
    } else {
      // For managers/owners, might go to table management or order creation
      navigate(`/orders/new?table=${table.id}&tableName=${encodeURIComponent(table.name)}`);
    }
  };

  const getPageTitle = () => {
    if (user?.role === 'waiter') {
      return 'Select Table - Create Order';
    }
    return 'Tables';
  };

  const getPageDescription = () => {
    if (user?.role === 'waiter') {
      return 'Select a table to create a new order';
    }
    return 'Restaurant table management';
  };

  if (loading) {
    return (
      <div>
        <PageMeta
          title="Tables | POS System"
          description="Restaurant table management"
        />
        <PageBreadcrumb pageTitle="Tables" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageMeta
          title="Tables | POS System"
          description="Restaurant table management"
        />
        <PageBreadcrumb pageTitle="Tables" />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title={`${getPageTitle()} | POS System`}
        description={getPageDescription()}
      />
      <PageBreadcrumb pageTitle={getPageTitle()} />
      
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">✅ {successMessage}</p>
        </div>
      )}
      
      {user?.role === 'waiter' && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 font-medium">👋 Welcome {user.name}!</p>
          <p className="text-blue-600 text-sm">Select a table below to create a new order for your customers.</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            onClick={() => handleTableClick(table)}
            className={`bg-white p-4 rounded-xl shadow cursor-pointer hover:shadow-lg transition-all duration-200 border-2 ${
              table.status === 'available'
                ? 'border-green-200 hover:border-green-300'
                : 'border-red-200 hover:border-red-300'
            } ${user?.role === 'waiter' ? 'hover:scale-105' : ''}`}
          >
            <h3 className="font-semibold text-gray-900">{table.name}</h3>
            <p className="text-sm text-gray-500">Capacity: {table.capacity}</p>
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                table.status === 'available'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {table.status === 'available' ? 'Available' : 'Occupied'}
            </span>
            {user?.role === 'waiter' && table.status === 'available' && (
              <div className="mt-2 text-xs text-blue-600 font-medium">
                📝 Click to create order
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
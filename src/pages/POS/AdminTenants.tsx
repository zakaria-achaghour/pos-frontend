import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import Button from '../../components/ui/button/Button';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import Alert from '../../components/ui/alert/Alert';
import { restaurantAPI } from '../../api/restaurants';
import type { Restaurant } from '../../api/restaurants';

// Mock data as fallback
const mockTenants = [
  { id: 1, name: 'Restaurant Le Petit Chef', city: 'Casablanca', status: 'active' as const },
  { id: 2, name: 'Café Marina', city: 'Rabat', status: 'active' as const },
  { id: 3, name: 'Bistro Central', city: 'Marrakech', status: 'inactive' as const },
  { id: 4, name: 'Pizza Corner', city: 'Tangier', status: 'active' as const },
];

export default function AdminTenants() {
  const [tenants, setTenants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, [searchQuery]);

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? 'px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium'
      : 'px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium';
  };

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use real API call
      const response = await restaurantAPI.getRestaurants({
        search: searchQuery,
        per_page: 20
      });
      
      // Convert API response format to match our component expectations
      const processedRestaurants = response.data.map((restaurant: any) => ({
        ...restaurant,
        status: restaurant.is_active ? 'active' : 'inactive' // Convert boolean to string
      }));
      
      setTenants(processedRestaurants);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setError('Failed to load restaurants. Using demo data.');
      
      // Fallback to mock data on error
      setTimeout(() => {
        const filteredTenants = searchQuery
          ? mockTenants.filter(tenant => 
              tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              tenant.city.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : mockTenants;
        setTenants(filteredTenants as Restaurant[]);
        setLoading(false);
      }, 800);
    }
  };

  const handleStatusToggle = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowStatusModal(true);
  };

  const confirmStatusToggle = async () => {
    if (!selectedRestaurant) return;

    try {
      setActionLoading(true);
      const newStatus = selectedRestaurant.status === 'active' ? 'inactive' : 'active';
      
      console.log('Updating restaurant status:', {
        id: selectedRestaurant.id,
        currentStatus: selectedRestaurant.status,
        newStatus
      });
      
      const updatedRestaurant = await restaurantAPI.updateRestaurantStatus(selectedRestaurant.id, newStatus);
      
      // Update local state
      setTenants(tenants.map((t: Restaurant) => 
        t.id === selectedRestaurant.id 
          ? { ...updatedRestaurant, status: newStatus } // Ensure status is set correctly
          : t
      ));
      
      setShowStatusModal(false);
      setSelectedRestaurant(null);
      setSuccessMessage(`Restaurant ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      console.log('Restaurant status updated successfully');
    } catch (error) {
      console.error('Error updating restaurant status:', error);
      alert(`Failed to ${selectedRestaurant.status === 'active' ? 'deactivate' : 'activate'} restaurant`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedRestaurant) return;

    try {
      setActionLoading(true);
      await restaurantAPI.deleteRestaurant(selectedRestaurant.id);
      setTenants(tenants.filter((t: Restaurant) => t.id !== selectedRestaurant.id));
      setShowDeleteModal(false);
      setSelectedRestaurant(null);
      setSuccessMessage(`Restaurant "${selectedRestaurant.name}" deleted successfully!`);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      alert('Failed to delete restaurant');
    } finally {
      setActionLoading(false);
    }
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
      
      {/* Success Alert */}
      {successMessage && (
        <div className="mb-6">
          <Alert
            variant="success"
            title="Success!"
            message={successMessage}
          />
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Restaurants</h2>
            <Link
              to="/admin/restaurants/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Restaurant
            </Link>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
              {error}
            </div>
          )}
          
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
                      <td className="py-3 px-4 text-gray-600">{tenant.city || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={getStatusBadge(tenant.status || 'active')}>
                          {(tenant.status || 'active').charAt(0).toUpperCase() + (tenant.status || 'active').slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <Link
                            to={`/admin/restaurants/${tenant.id}/edit`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </Link>
                          <Link
                            to={`/admin/restaurants/${tenant.id}`}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleStatusToggle(tenant)}
                            disabled={actionLoading}
                            className={`text-sm font-medium ${
                              tenant.status === 'active' 
                                ? 'text-orange-600 hover:text-orange-800' 
                                : 'text-green-600 hover:text-green-800'
                            } ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {tenant.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(tenant)}
                            disabled={actionLoading}
                            className={`text-red-600 hover:text-red-800 text-sm font-medium ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedRestaurant(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Restaurant"
        message={`Are you sure you want to delete "${selectedRestaurant?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      <ConfirmationModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedRestaurant(null);
        }}
        onConfirm={confirmStatusToggle}
        title={`${selectedRestaurant?.status === 'active' ? 'Deactivate' : 'Activate'} Restaurant`}
        message={`Are you sure you want to ${selectedRestaurant?.status === 'active' ? 'deactivate' : 'activate'} "${selectedRestaurant?.name}"?`}
        confirmText={selectedRestaurant?.status === 'active' ? 'Deactivate' : 'Activate'}
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
}
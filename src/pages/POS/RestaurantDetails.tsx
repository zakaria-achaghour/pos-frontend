import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Button from '../../components/ui/button/Button';
import { restaurantAPI } from '../../api/restaurants';
import type { Restaurant } from '../../api/restaurants';

export default function RestaurantDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    if (id) {
      fetchRestaurant(parseInt(id));
    }
  }, [id]);

  const fetchRestaurant = async (restaurantId: number) => {
    try {
      setLoading(true);
      console.log('Fetching restaurant details for ID:', restaurantId);
      const data = await restaurantAPI.getRestaurant(restaurantId);
      console.log('Restaurant details received:', data);
      
      // Convert API response to match our component expectations
      const processedData = {
        ...data,
        status: data.is_active ? 'active' : 'inactive' // Convert boolean to string
      };
      
      setRestaurant(processedData);
    } catch (error: any) {
      console.error('Error fetching restaurant:', error);
      console.error('Full error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      setError(`Failed to load restaurant data: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!restaurant) return;

    try {
      const newStatus = restaurant.status === 'active' ? 'inactive' : 'active';
      await restaurantAPI.updateRestaurantStatus(restaurant.id, newStatus);
      setRestaurant({ ...restaurant, status: newStatus });
    } catch (error: any) {
      console.error('Error updating restaurant status:', error);
    }
  };

  const handleDelete = async () => {
    if (!restaurant) return;
    
    if (!confirm(`Are you sure you want to delete "${restaurant.name}"?`)) {
      return;
    }

    try {
      await restaurantAPI.deleteRestaurant(restaurant.id);
      navigate('/admin/tenants');
    } catch (error: any) {
      console.error('Error deleting restaurant:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? 'px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium'
      : 'px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium';
  };

  if (loading) {
    return (
      <div>
        <PageMeta title="Restaurant Details | Admin" description="View restaurant information" />
        <PageBreadcrumb 
          pageTitle="Restaurant Details" 
          breadcrumbItems={[
            { label: 'Restaurants', href: '/admin/tenants' },
            { label: 'Details' }
          ]}
        />
        
        <div className="bg-white rounded-xl shadow p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div>
        <PageMeta title="Restaurant Not Found | Admin" description="Restaurant not found" />
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">{error || 'Restaurant not found'}</p>
            <Button
              variant="primary"
              onClick={() => navigate('/admin/tenants')}
              className="mt-4"
            >
              Back to Restaurants
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title={`${restaurant.name} | Admin`} description="View restaurant information" />
      <PageBreadcrumb 
        pageTitle={restaurant.name}
        breadcrumbItems={[
          { label: 'Restaurants', href: '/admin/tenants' },
          { label: restaurant.name }
        ]}
      />
      
      <div className="bg-white rounded-xl shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">{restaurant.name}</h2>
              <span className={getStatusBadge(restaurant.status)}>
                {restaurant.status.charAt(0).toUpperCase() + restaurant.status.slice(1)}
              </span>
            </div>
            <div className="flex space-x-3">
              <Link
                to={`/admin/restaurants/${restaurant.id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit
              </Link>
              <Button
                variant="secondary"
                onClick={handleStatusToggle}
              >
                {restaurant.status === 'active' ? 'Deactivate' : 'Activate'}
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{restaurant.name}</p>
                </div>

                {restaurant.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900">{restaurant.description}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900">{restaurant.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">City</label>
                    <p className="text-gray-900">{restaurant.city}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Country</label>
                    <p className="text-gray-900">{restaurant.country}</p>
                  </div>
                </div>

                {restaurant.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{restaurant.phone}</p>
                  </div>
                )}

                {restaurant.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{restaurant.email}</p>
                  </div>
                )}

                {restaurant.website && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Website</label>
                    <a 
                      href={restaurant.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {restaurant.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Business & Owner Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Business & Owner Information</h3>
              
              <div className="space-y-3">
                {restaurant.license_number && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Business License</label>
                    <p className="text-gray-900">{restaurant.license_number}</p>
                  </div>
                )}

                {restaurant.tax_number && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tax Number</label>
                    <p className="text-gray-900">{restaurant.tax_number}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">Owner Name</label>
                  <p className="text-gray-900">{restaurant.owner_name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Owner Email</label>
                  <p className="text-gray-900">{restaurant.owner_email}</p>
                </div>

                {restaurant.owner_phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Owner Phone</label>
                    <p className="text-gray-900">{restaurant.owner_phone}</p>
                  </div>
                )}

                {restaurant.subscription_plan && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Subscription Plan</label>
                    <p className="text-gray-900 capitalize">{restaurant.subscription_plan}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {restaurant.timezone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Timezone</label>
                      <p className="text-gray-900">{restaurant.timezone}</p>
                    </div>
                  )}
                  {restaurant.currency && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Currency</label>
                      <p className="text-gray-900">{restaurant.currency}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <p className="text-gray-900">{new Date(restaurant.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="text-gray-900">{new Date(restaurant.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
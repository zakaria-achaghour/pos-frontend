import React from 'react';
import RestaurantCard from './RestaurantCard';
import type { Restaurant } from '@/types/restaurant';

interface RestaurantListProps {
  restaurants: Restaurant[];
  viewMode?: 'grid' | 'list';
  onEdit?: (id: number) => void;
  onView?: (id: number) => void;
  onStatusChange?: (id: number) => void;
  onDelete?: (id: number) => void;
  selectedRestaurants?: number[];
  onSelectRestaurant?: (id: number) => void;
  loading?: boolean;
}

export default function RestaurantList({
  restaurants,
  viewMode = 'list',
  onEdit,
  onView,
  onStatusChange,
  onDelete,
  selectedRestaurants = [],
  onSelectRestaurant,
  loading = false,
}: RestaurantListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-400 text-6xl mb-4">🏪</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3>
        <p className="text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            {...(onEdit && { onEdit })}
            {...(onView && { onView })}
            {...(onStatusChange && { onStatusChange })}
            {...(onDelete && { onDelete })}
            isSelected={selectedRestaurants.includes(restaurant.id)}
            {...(onSelectRestaurant && { onSelect: () => onSelectRestaurant(restaurant.id) })}
          />
        ))}
      </div>
    );
  }

  // Table view
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {onSelectRestaurant && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded"
                    onChange={(e) => {
                      if (e.target.checked) {
                        restaurants.forEach(r => onSelectRestaurant(r.id));
                      } else {
                        restaurants.forEach(r => onSelectRestaurant(r.id));
                      }
                    }}
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                City
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {restaurants.map((restaurant) => {
              const status = restaurant.status || (restaurant.is_active ? 'active' : 'inactive');
              return (
                <tr key={restaurant.id} className="hover:bg-gray-50">
                  {onSelectRestaurant && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRestaurants.includes(restaurant.id)}
                        onChange={() => onSelectRestaurant(restaurant.id)}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{restaurant.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                    {restaurant.email && (
                      <div className="text-sm text-gray-500">{restaurant.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {restaurant.city || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {restaurant.owner_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-3">
                      {onView && (
                        <button
                          onClick={() => onView(restaurant.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(restaurant.id)}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Edit
                        </button>
                      )}
                      {onStatusChange && (
                        <button
                          onClick={() => onStatusChange(restaurant.id)}
                          className={`font-medium ${
                            status === 'active'
                              ? 'text-orange-600 hover:text-orange-800'
                              : 'text-green-600 hover:text-green-800'
                          }`}
                        >
                          {status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(restaurant.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Alert from '@/components/ui/alert/Alert';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import PaginationWithText from '@/components/ui/pagination/PaginationWithText';
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement';
import { RestaurantList, RestaurantFilters } from '@/components/pos/restaurants';
import type { Restaurant } from '@/types/restaurant';

export default function AdminTenants() {
  const navigate = useNavigate();

  // Destructure data and actions from the useRestaurantManagement hook
  const {
    // Data
    restaurants = [],
    
    // UI State
    statusFilter = 'all',
    searchTerm = '',
    loading = false,
    error,
    successMessage,
    pagination = { currentPage: 1, lastPage: 1, total: 0, perPage: 10 },
    selectedItems = [],
    
    // Actions
    deleteRestaurant,
    updateRestaurantStatus,
    goToPage = () => {},
    
    // UI Actions
    setStatusFilter = () => {},
    setSearchTerm = () => {},
    toggleItemSelection = () => {},
    
    // Computed values
    restaurantStats = { total: 0, active: 0, inactive: 0, pending: 0, suspended: 0 },
  } = useRestaurantManagement(10) as any; // 10 restaurants per page

  // Local modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);
  const [restaurantToToggle, setRestaurantToToggle] = useState<Restaurant | null>(null);

  // Handle navigation
  const handleView = (id: number) => {
    navigate(`/admin/restaurants/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`/admin/restaurants/${id}/edit`);
  };

  const handleStatusChangeRequest = (id: number) => {
    const restaurant = restaurants.find((r: Restaurant) => r.id === id);
    if (restaurant) {
      setRestaurantToToggle(restaurant);
      setShowStatusModal(true);
    }
  };

  const confirmStatusToggle = async () => {
    if (!restaurantToToggle) return;

    try {
      const status = restaurantToToggle.status || (restaurantToToggle.is_active ? 'active' : 'inactive');
      const newStatus = status === 'active' ? 'inactive' : 'active';
      await updateRestaurantStatus(restaurantToToggle.id, newStatus as any);
      setShowStatusModal(false);
      setRestaurantToToggle(null);
    } catch (error) {
      console.error('Error updating restaurant status:', error);
    }
  };

  const handleDeleteRequest = (id: number) => {
    const restaurant = restaurants.find((r: Restaurant) => r.id === id);
    if (restaurant) {
      setRestaurantToDelete(restaurant);
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = async () => {
    if (!restaurantToDelete) return;

    try {
      await deleteRestaurant(restaurantToDelete.id);
      setShowDeleteModal(false);
      setRestaurantToDelete(null);
    } catch (error) {
      console.error('Error deleting restaurant:', error);
    }
  };

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

      {/* Error Alert */}
      {error && (
        <div className="mb-6">
          <Alert
            variant="error"
            title="Error"
            message={error}
          />
        </div>
      )}

      {/* Header with Add Button */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Restaurant Management</h1>
        <button
          onClick={() => navigate('/admin/restaurants/create')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Add Restaurant
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <RestaurantFilters
          statusFilter={statusFilter}
          searchTerm={searchTerm}
          onStatusFilterChange={setStatusFilter}
          onSearchChange={setSearchTerm}
          stats={restaurantStats}
        />
      </div>

      {/* Restaurant List */}
      <RestaurantList
        restaurants={restaurants}
        viewMode="list"
        onView={handleView}
        onEdit={handleEdit}
        onStatusChange={handleStatusChangeRequest}
        onDelete={handleDeleteRequest}
        selectedRestaurants={selectedItems}
        onSelectRestaurant={toggleItemSelection}
        loading={loading}
      />

      {/* Pagination */}
      {pagination.lastPage > 1 && (
        <div className="mt-6">
          <PaginationWithText
            totalPages={pagination.lastPage}
            initialPage={pagination.currentPage}
            onPageChange={goToPage}
          />
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setRestaurantToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Restaurant"
        message={`Are you sure you want to delete "${restaurantToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      <ConfirmationModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setRestaurantToToggle(null);
        }}
        onConfirm={confirmStatusToggle}
        title={`${restaurantToToggle?.status === 'active' ? 'Deactivate' : 'Activate'} Restaurant`}
        message={`Are you sure you want to ${restaurantToToggle?.status === 'active' ? 'deactivate' : 'activate'} "${restaurantToToggle?.name}"?`}
        confirmText={restaurantToToggle?.status === 'active' ? 'Deactivate' : 'Activate'}
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
}
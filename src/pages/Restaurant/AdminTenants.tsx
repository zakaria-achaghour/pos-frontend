import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Alert from '@/components/ui/alert/Alert';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import PaginationWithText from '@/components/ui/pagination/PaginationWithText';
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement';
import { RestaurantList, RestaurantFilters } from '@/components/pos/restaurants';
import type { Restaurant } from '@/types/restaurant';

export default function AdminTenants() {
  const { t } = useTranslation();
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
  } = useRestaurantManagement(10); // 10 restaurants per page

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
      await updateRestaurantStatus(restaurantToToggle.id, newStatus);
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
      <PageMeta title={t('tenants.list.metaTitle')} description={t('tenants.list.metaDescription')} />
      <PageBreadcrumb hideTitle pageTitle={t('tenants.breadcrumb.restaurants')} />

      {/* Success Alert */}
      {successMessage && (
        <div className="mb-6">
          <Alert
            variant="success"
            title={t('tenants.successTitle')}
            message={successMessage}
          />
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-6">
          <Alert
            variant="error"
            title={t('tenants.errorTitle')}
            message={error}
          />
        </div>
      )}

      {/* Header with Add Button */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-fg">{t('tenants.list.heading')}</h1>
        <button
          onClick={() => navigate('/admin/restaurants/create')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
        >
          {t('tenants.list.add')}
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
        title={t('tenants.list.deleteTitle')}
        message={t('tenants.list.deleteMessage', { name: restaurantToDelete?.name })}
        confirmText={t('tenants.actions.delete')}
        cancelText={t('common.cancel')}
        type="danger"
      />

      <ConfirmationModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setRestaurantToToggle(null);
        }}
        onConfirm={confirmStatusToggle}
        title={restaurantToToggle?.status === 'active' ? t('tenants.list.deactivateTitle') : t('tenants.list.activateTitle')}
        message={t(restaurantToToggle?.status === 'active' ? 'tenants.list.deactivateMessage' : 'tenants.list.activateMessage', { name: restaurantToToggle?.name })}
        confirmText={restaurantToToggle?.status === 'active' ? t('tenants.actions.deactivate') : t('tenants.actions.activate')}
        cancelText={t('common.cancel')}
        type="warning"
      />
    </div>
  );
}

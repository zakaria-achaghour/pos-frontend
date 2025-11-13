import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Alert from '@/components/ui/alert/Alert';
import Modal from '@/components/common/Modal';
import PaginationWithText from '@/components/ui/pagination/PaginationWithText';
import MenuItemList from '@/components/pos/menu/MenuItemList';
import { useMenuItemManagement } from '@/hooks/useMenuItemManagement';
import type { MenuItem } from '@/types/menu';

export default function MenuItemsManagement() {
  const navigate = useNavigate();
  const {
    // Data
    filteredMenuItems,
    categories,

    // UI State
    statusFilter,
    categoryFilter,
    availabilityFilter,
    searchTerm,
    loading,
    error,
    successMessage,
    pagination,
    menuItemStats,

    // Actions
    deleteMenuItem,
    updateMenuItemStatus,
    updateMenuItemAvailability,
    goToPage,

    // UI Actions
    setStatusFilter,
    setCategoryFilter,
    setAvailabilityFilter,
    setSearchTerm,
  } = useMenuItemManagement(12); // 12 items per page

  // Local modal states
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [itemToToggleAvailability, setItemToToggleAvailability] = useState<MenuItem | null>(null);
  const [itemToToggleStatus, setItemToToggleStatus] = useState<MenuItem | null>(null);

  // Handler for delete request (opens confirmation modal)
  const handleDeleteRequest = (id: number) => {
    const item = filteredMenuItems.find(i => i.id === id);
    if (item) {
      setItemToDelete(item);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteMenuItem(itemToDelete.id);
      setItemToDelete(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  // Handler for toggle availability request
  const handleToggleAvailabilityRequest = (id: number) => {
    const item = filteredMenuItems.find(i => i.id === id);
    if (item) {
      setItemToToggleAvailability(item);
    }
  };

  const handleConfirmToggleAvailability = async () => {
    if (!itemToToggleAvailability) return;
    try {
      const newAvailability = !itemToToggleAvailability.is_available;
      await updateMenuItemAvailability(itemToToggleAvailability.id, newAvailability);
      setItemToToggleAvailability(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  // Handler for toggle status request
  const handleToggleStatusRequest = (id: number) => {
    const item = filteredMenuItems.find(i => i.id === id);
    if (item) {
      setItemToToggleStatus(item);
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!itemToToggleStatus) return;
    try {
      const newStatus = !itemToToggleStatus.is_active;
      await updateMenuItemStatus(itemToToggleStatus.id, newStatus);
      setItemToToggleStatus(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEdit = (item: MenuItem) => {
    navigate(`/menu/items/edit/${item.id}`);
  };

  return (
    <div>
      <PageMeta title="Menu Items | POS System" description="Manage menu items" />
      <PageBreadcrumb pageTitle="Menu Items" />

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

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Items</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your restaurant menu items • {menuItemStats.total} total
          </p>
        </div>
        <button
          onClick={() => navigate('/menu/items/add')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Add Menu Item
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="active">Active ({menuItemStats.active})</option>
              <option value="inactive">Inactive ({menuItemStats.inactive})</option>
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="available">Available ({menuItemStats.available})</option>
              <option value="unavailable">Out of Stock ({menuItemStats.unavailable})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Menu Items List */}
      <div className="bg-white rounded-lg shadow">
        <MenuItemList
          menuItems={filteredMenuItems}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onToggleStatus={handleToggleStatusRequest}
          onToggleAvailability={handleToggleAvailabilityRequest}
          hasFilters={searchTerm !== '' || categoryFilter !== 'all' || statusFilter !== 'all' || availabilityFilter !== 'all'}
        />
      </div>

      {/* Pagination */}
      {!loading && pagination.total > 0 && (
        <div className="bg-white rounded-lg shadow dark:bg-gray-900">
          <PaginationWithText
            totalPages={pagination.lastPage}
            initialPage={pagination.currentPage}
            onPageChange={goToPage}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setItemToDelete(null)}
          title="Delete Menu Item"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{itemToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toggle Availability Confirmation Modal */}
      {itemToToggleAvailability && (
        <Modal
          isOpen={true}
          onClose={() => setItemToToggleAvailability(null)}
          title={`Mark as ${itemToToggleAvailability.is_available ? 'Unavailable' : 'Available'}`}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to mark <strong>{itemToToggleAvailability.name}</strong> as{' '}
              {itemToToggleAvailability.is_available ? 'unavailable' : 'available'}?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setItemToToggleAvailability(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmToggleAvailability}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 ${
                  itemToToggleAvailability.is_available
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading ? 'Processing...' : itemToToggleAvailability.is_available ? 'Mark Unavailable' : 'Mark Available'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toggle Status Confirmation Modal */}
      {itemToToggleStatus && (
        <Modal
          isOpen={true}
          onClose={() => setItemToToggleStatus(null)}
          title={`${itemToToggleStatus.is_active ? 'Deactivate' : 'Activate'} Menu Item`}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to {itemToToggleStatus.is_active ? 'deactivate' : 'activate'}{' '}
              <strong>{itemToToggleStatus.name}</strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setItemToToggleStatus(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmToggleStatus}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 ${
                  itemToToggleStatus.is_active
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Processing...' : itemToToggleStatus.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

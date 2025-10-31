import React, { useState, useRef } from 'react';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import MenuItemFilters from '@/components/pos/menu/MenuItemFilters';
import MenuItemList from '@/components/pos/menu/MenuItemList';
import MenuItemModal from '@/components/pos/menu/MenuItemModal';
import Pagination from '@/components/common/Pagination';
import Toast from '@/components/common/Toast';
import { useMenuItemManagement } from '@/hooks/useMenuItemManagement';
import type { MenuItem, CreateMenuItemData } from '@/api/menu';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export default function MenuItemsManagement() {
  const {
    menuItems,
    categories,
    loading,
    error,
    pagination,
    filters,
    stats,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleItemStatus,
    toggleItemAvailability,
    uploadItemImage,
    setFilters,
    resetFilters,
    setPage,
    setLimit,
  } = useMenuItemManagement();

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingItemId, setUploadingItemId] = useState<number | null>(null);

  // Show toast notification
  const showToast = (message: string, type: ToastState['type'] = 'success') => {
    setToast({ show: true, message, type });
  };

  // Handle create item
  const handleCreate = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  // Handle edit item
  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  // Handle delete item
  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteMenuItem(id);
      showToast(`Menu item "${name}" deleted successfully!`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete menu item', 'error');
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (id: number, isActive: boolean, name: string) => {
    try {
      await toggleItemStatus(id, isActive);
      showToast(
        `Menu item "${name}" ${isActive ? 'activated' : 'deactivated'} successfully!`,
        'success'
      );
    } catch (error: any) {
      showToast(error.message || 'Failed to update status', 'error');
    }
  };

  // Handle toggle availability
  const handleToggleAvailability = async (id: number, isAvailable: boolean, name: string) => {
    try {
      await toggleItemAvailability(id, isAvailable);
      showToast(
        `Menu item "${name}" marked as ${isAvailable ? 'available' : 'out of stock'}!`,
        'success'
      );
    } catch (error: any) {
      showToast(error.message || 'Failed to update availability', 'error');
    }
  };

  // Handle upload image
  const handleUploadImage = (id: number) => {
    setUploadingItemId(id);
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !uploadingItemId) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB', 'error');
      return;
    }

    const item = menuItems.find(i => i.id === uploadingItemId);
    const itemName = item?.name || 'item';

    try {
      await uploadItemImage(uploadingItemId, file);
      showToast(`Image uploaded successfully for "${itemName}"!`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to upload image', 'error');
    } finally {
      setUploadingItemId(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle form submit
  const handleSubmit = async (data: CreateMenuItemData) => {
    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, data);
        showToast(`Menu item "${data.name}" updated successfully!`, 'success');
      } else {
        await createMenuItem(data);
        showToast(`Menu item "${data.name}" created successfully!`, 'success');
      }
      setShowModal(false);
      setEditingItem(null);
    } catch (error: any) {
      throw error; // Let modal handle the error
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const hasFilters = 
    filters.searchTerm !== '' || 
    filters.categoryFilter !== 'all' || 
    filters.statusFilter !== 'all' || 
    filters.availabilityFilter !== 'all';

  return (
    <div className="space-y-6">
      <PageMeta title="Menu Items | POS System" description="Manage restaurant menu items" />
      <PageBreadcrumb pageTitle="Menu Items Management" />

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Header with Stats */}
      <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Menu Items Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your restaurant's menu items and pricing</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.active}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.available}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Available</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{categories.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900 dark:border-red-700">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <MenuItemFilters
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
        onAddItem={handleCreate}
        categories={categories}
        totalCount={stats.total}
        filteredCount={pagination.total}
        loading={loading}
      />

      {/* Menu Items List */}
      <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <MenuItemList
          items={menuItems}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onToggleAvailability={handleToggleAvailability}
          onUploadImage={handleUploadImage}
          hasFilters={hasFilters}
        />
      </div>

      {/* Pagination */}
      {pagination.totalPages > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={setPage}
          onItemsPerPageChange={setLimit}
        />
      )}

      {/* Create/Edit Modal */}
      <MenuItemModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingItem={editingItem}
        categories={categories}
        loading={loading}
      />

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

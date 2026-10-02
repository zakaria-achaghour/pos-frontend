import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Alert from '@/components/ui/alert/Alert';
import { Button, Modal } from '@/components/kit';
import PaginationWithText from '@/components/ui/pagination/PaginationWithText';
import MenuItemList from '@/components/pos/menu/MenuItemList';
import { useMenuItemManagement } from '@/hooks/useMenuItemManagement';
import type { MenuItem, MenuItemFilter } from '@/types/menu';

export default function MenuItemsManagement() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const searchId = useId();
  const categoryId = useId();
  const statusId = useId();
  const availabilityId = useId();
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
      <PageMeta title={t('menuAdmin.metaTitle')} description={t('menuAdmin.metaDescription')} />
      <PageBreadcrumb hideTitle pageTitle={t('menuAdmin.breadcrumb')} />

      {/* Success Alert */}
      {successMessage && (
        <div className="mb-6">
          <Alert
            variant="success"
            title={t('menuAdmin.successTitle')}
            message={successMessage}
          />
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-6">
          <Alert
            variant="error"
            title={t('menuAdmin.errorTitle')}
            message={error}
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg">{t('menuAdmin.heading')}</h1>
          <p className="text-sm text-fg-muted mt-1">
            {t('menuAdmin.subtitle', { total: menuItemStats.total })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/menu/items/add')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
        >
          {t('menuAdmin.add')}
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-surface rounded-2xl shadow-sm p-4 border border-line">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label htmlFor={searchId} className="block text-sm font-medium text-fg mb-2">{t('common.search')}</label>
            <input
              id={searchId}
              type="text"
              placeholder={t('menuAdmin.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor={categoryId} className="block text-sm font-medium text-fg mb-2">{t('menuAdmin.category')}</label>
            <select
              id={categoryId}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">{t('menuAdmin.allCategories')}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor={statusId} className="block text-sm font-medium text-fg mb-2">{t('menuAdmin.status')}</label>
            <select
              id={statusId}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as MenuItemFilter)}
              className="w-full px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">{t('common.all')}</option>
              <option value="active">{t('menuAdmin.filterActive', { count: menuItemStats.active })}</option>
              <option value="inactive">{t('menuAdmin.filterInactive', { count: menuItemStats.inactive })}</option>
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <label htmlFor={availabilityId} className="block text-sm font-medium text-fg mb-2">{t('menuAdmin.availability')}</label>
            <select
              id={availabilityId}
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as 'all' | 'available' | 'unavailable')}
              className="w-full px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">{t('common.all')}</option>
              <option value="available">{t('menuAdmin.filterAvailable', { count: menuItemStats.available })}</option>
              <option value="unavailable">{t('menuAdmin.filterOutOfStock', { count: menuItemStats.unavailable })}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Menu Items List */}
      <div>
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
      {!loading && pagination.lastPage > 1 && (
        <div className="bg-surface rounded-2xl shadow-sm dark:bg-surface border border-line">
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
          title={t('menuAdmin.delete.title')}
          closeLabel={t('common.close')}
          size="sm"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setItemToDelete(null)}>
                {t('common.cancel')}
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete} disabled={loading}>
                {loading ? t('menuAdmin.delete.deleting') : t('menuAdmin.delete.confirm')}
              </Button>
            </div>
          }
        >
          <p className="text-fg-muted">{t('menuAdmin.delete.body', { name: itemToDelete.name })}</p>
        </Modal>
      )}

      {/* Toggle Availability Confirmation Modal */}
      {itemToToggleAvailability && (
        <Modal
          isOpen={true}
          onClose={() => setItemToToggleAvailability(null)}
          title={itemToToggleAvailability.is_available ? t('menuAdmin.availabilityToggle.unavailableTitle') : t('menuAdmin.availabilityToggle.availableTitle')}
          closeLabel={t('common.close')}
          size="sm"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setItemToToggleAvailability(null)}>
                {t('common.cancel')}
              </Button>
              <Button
                variant={itemToToggleAvailability.is_available ? 'danger' : 'success'}
                onClick={handleConfirmToggleAvailability}
                disabled={loading}
              >
                {loading
                  ? t('menuAdmin.processing')
                  : itemToToggleAvailability.is_available
                    ? t('menuAdmin.availabilityToggle.markUnavailable')
                    : t('menuAdmin.availabilityToggle.markAvailable')}
              </Button>
            </div>
          }
        >
          <p className="text-fg-muted">
            {itemToToggleAvailability.is_available
              ? t('menuAdmin.availabilityToggle.unavailableBody', { name: itemToToggleAvailability.name })
              : t('menuAdmin.availabilityToggle.availableBody', { name: itemToToggleAvailability.name })}
          </p>
        </Modal>
      )}

      {/* Toggle Status Confirmation Modal */}
      {itemToToggleStatus && (
        <Modal
          isOpen={true}
          onClose={() => setItemToToggleStatus(null)}
          title={itemToToggleStatus.is_active ? t('menuAdmin.statusToggle.deactivateTitle') : t('menuAdmin.statusToggle.activateTitle')}
          closeLabel={t('common.close')}
          size="sm"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setItemToToggleStatus(null)}>
                {t('common.cancel')}
              </Button>
              <Button
                variant={itemToToggleStatus.is_active ? 'danger' : 'primary'}
                onClick={handleConfirmToggleStatus}
                disabled={loading}
              >
                {loading
                  ? t('menuAdmin.processing')
                  : itemToToggleStatus.is_active
                    ? t('menuAdmin.statusToggle.deactivate')
                    : t('menuAdmin.statusToggle.activate')}
              </Button>
            </div>
          }
        >
          <p className="text-fg-muted">
            {itemToToggleStatus.is_active
              ? t('menuAdmin.statusToggle.deactivateBody', { name: itemToToggleStatus.name })
              : t('menuAdmin.statusToggle.activateBody', { name: itemToToggleStatus.name })}
          </p>
        </Modal>
      )}
    </div>
  );
}

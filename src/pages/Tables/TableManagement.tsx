import { dynamicT } from '@/i18n/dynamic';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Alert from '@/components/ui/alert/Alert';
import { Button, Modal, StatusPill } from '@/components/kit';
import { tableStatusLabel, tableStatusStyle } from '@/components/pos/tables/tableStatus';
import { useTableManagement } from '@/hooks/useTableManagement';
import PaginationWithText from '@/components/ui/pagination/PaginationWithText';

// Import table components
import TableFilters from '@/components/pos/tables/TableFilters';
import TableList from '@/components/pos/tables/TableList';
import TableForm from '@/components/pos/tables/TableForm';
import type { Table, TableFormData, TableStatus } from '@/types/table';
import type { TableFilter } from '@/hooks/useTableManagement';

// Members this page destructures with fallbacks that the hook does not currently return.
type TableManagementExtras = Partial<{
  selectedTables: number[];
  toggleTableSelection: (id: number) => void;
}>;

export default function TableManagement() {
  const { t, i18n } = useTranslation();
  const bulkActionId = useId();
  // Destructure all data and actions from the useTableManagement hook
  const {
    // Data
    tables = [],
    filteredTables = [],
    selectedTable,
    editingTable,

    // UI State
    statusFilter = 'all',
    shapeFilter = 'all',
    sectionFilter = '',
    minCapacityFilter = null,
    maxCapacityFilter = null,
    loading = false,
    error,
    successMessage,
    validationErrors = {}, // Provide default empty object
    pagination = { currentPage: 1, lastPage: 1, total: 0 },
    selectedTables = [],

    // Actions
    createTable,
    updateTable,
    deleteTable,
    updateTableStatus,
    bulkUpdateStatus,
    goToPage = () => {},

    // UI Actions
    setStatusFilter = () => {},
    setShapeFilter = () => {},
    setSectionFilter = () => {},
    setMinCapacityFilter = () => {},
    setMaxCapacityFilter = () => {},
    setSelectedTable = () => {},
    setEditingTable = () => {},
    clearError = () => {},
    toggleTableSelection = () => {},
    clearSelection = () => {},

    // Computed values
    tableStats = { total: 0, available: 0, occupied: 0, reserved: 0, maintenance: 0, totalCapacity: 0, occupancyRate: 0 },
  } = useTableManagement(5) as ReturnType<typeof useTableManagement> & TableManagementExtras; // 5 tables per page for management

  // Local modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);
  const [bulkAction, setBulkAction] = useState<TableStatus | ''>('');

  // Handle form submissions
  const handleAddTable = async (values: TableFormData) => {
    try {
      await createTable(values);
      setShowAddModal(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEditTable = async (values: Partial<TableFormData>) => {
    if (!editingTable) return;
    try {
      await updateTable(editingTable.id, values);
      setEditingTable(null); // Close the modal after successful update
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDeleteRequest = (tableId: number) => {
    const table = tables.find((tb: Table) => tb.id === tableId);
    if (table) {
      setTableToDelete(table);
    }
  };

  const handleConfirmDelete = async () => {
    if (!tableToDelete) return;
    try {
      await deleteTable(tableToDelete.id);
      setTableToDelete(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  // Handle bulk status change
  const handleBulkStatusChange = async () => {
    if (selectedTables.length === 0 || !bulkAction) return;
    try {
      await bulkUpdateStatus(selectedTables, bulkAction);
      setBulkAction('');
    } catch (error) {
      // Error handled in hook
    }
  };

  // Close all modals
  const closeModals = () => {
    setShowAddModal(false);
    setSelectedTable(null);
    setEditingTable(null);
    setTableToDelete(null);
    clearError();
  };

  return (
    <div className="space-y-6">
      {/* Page Meta and Breadcrumb */}
      <PageMeta title={t('tableAdmin.metaTitle')} description={t('tableAdmin.metaDescription')} />
      <PageBreadcrumb hideTitle pageTitle={t('tableAdmin.breadcrumb')} />

      {/* Success Message */}
      {successMessage && (
        <Alert
          variant="success"
          title={t('tableAdmin.successTitle')}
          message={successMessage}
        />
      )}

      {/* Error Message */}
      {error && (
        <Alert
          variant="error"
          title={t('tableAdmin.errorTitle')}
          message={error}
        />
      )}

      {/* Validation Errors */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="bg-danger/10 border border-danger/30 rounded-lg p-4">
          <h4 className="text-danger font-medium mb-2">{t('tableAdmin.fixErrors')}</h4>
          <ul className="list-disc list-inside text-danger text-sm space-y-1">
            {Object.entries(validationErrors).map(([field, errors]) => {
              const errorMessage = Array.isArray(errors) ? errors[0] : String(errors);
              return (
                <li key={field}>
                  {errorMessage}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Header with Stats */}
      <div className="bg-surface p-6 rounded-2xl shadow-sm dark:bg-surface border border-line">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-fg dark:text-fg">{t('tableAdmin.breadcrumb')}</h1>
            <p className="text-fg-muted dark:text-fg-muted">{t('tableAdmin.subtitle')}</p>
          </div>

          {/* Add Table Button */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
          >
            <svg aria-hidden="true" className="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('tableAdmin.addTable')}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-fg dark:text-fg">{tableStats.total}</div>
            <div className="text-sm text-fg-muted dark:text-fg-muted">{t('tableAdmin.totalTables')}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-success">{tableStats.available}</div>
            <div className="text-sm text-fg-muted dark:text-fg-muted">{t('tableState.available')}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-danger">{tableStats.occupied}</div>
            <div className="text-sm text-fg-muted dark:text-fg-muted">{t('tableState.occupied')}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{tableStats.totalCapacity}</div>
            <div className="text-sm text-fg-muted dark:text-fg-muted">{t('tableAdmin.totalCapacity')}</div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTables.length > 0 && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-primary">
              {t('tableAdmin.bulk.selected', { count: selectedTables.length })}
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor={bulkActionId} className="sr-only">{t('tableAdmin.bulk.actionLabel')}</label>
              <select
                id={bulkActionId}
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value as TableStatus | '')}
                className="px-3 py-2 border border-primary/30 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary dark:text-fg"
              >
                <option value="">{t('tableAdmin.bulk.selectAction')}</option>
                <option value="available">{t('tableAdmin.bulk.markAvailable')}</option>
                <option value="occupied">{t('tableAdmin.bulk.markOccupied')}</option>
                <option value="reserved">{t('tableAdmin.bulk.markReserved')}</option>
                <option value="maintenance">{t('tableAdmin.bulk.markMaintenance')}</option>
              </select>
              <button
                type="button"
                onClick={handleBulkStatusChange}
                disabled={!bulkAction || loading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('tableAdmin.bulk.apply')}
              </button>
              <button
                type="button"
                onClick={() => clearSelection()}
                className="px-4 py-2 bg-surface-2 text-fg rounded-lg hover:bg-line dark:bg-surface-2 dark:text-fg-muted"
              >
                {t('tableAdmin.bulk.clear')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <TableFilters
        filters={{
          search: '',
          status: statusFilter,
          shape: shapeFilter,
          location: sectionFilter,
          minCapacity: minCapacityFilter || undefined,
          maxCapacity: maxCapacityFilter || undefined,
        }}
        onFilterChange={(key: string, value: string | number | undefined) => {
          if (key === 'status') {
            setStatusFilter(value as TableFilter);
            if (pagination.currentPage !== 1) {
              goToPage(1);
            }
          } else if (key === 'shape') {
            setShapeFilter(value as string);
            if (pagination.currentPage !== 1) {
              goToPage(1);
            }
          } else if (key === 'location') {
            setSectionFilter(value as string);
            if (pagination.currentPage !== 1) {
              goToPage(1);
            }
          } else if (key === 'minCapacity') {
            setMinCapacityFilter((value as number | undefined) || null);
            if (pagination.currentPage !== 1) {
              goToPage(1);
            }
          } else if (key === 'maxCapacity') {
            setMaxCapacityFilter((value as number | undefined) || null);
            if (pagination.currentPage !== 1) {
              goToPage(1);
            }
          }
        }}
        onClearFilters={() => {
          setStatusFilter('all');
          setShapeFilter('all');
          setSectionFilter('');
          setMinCapacityFilter(null);
          setMaxCapacityFilter(null);
          if (pagination.currentPage !== 1) {
            goToPage(1);
          }
        }}
      />

      {/* Main Content - Table List */}
      <TableList
        tables={filteredTables}
        isLoading={loading}
        onEdit={setEditingTable}
        onDelete={(id: number) => handleDeleteRequest(id)}
        onStatusChange={(id: number, status: string) => updateTableStatus(id, status as TableStatus)}
        onSelectTable={(id: number) => toggleTableSelection(id)}
        selectedTables={selectedTables}
      />

      {/* Pagination */}
      {pagination.lastPage > 1 && (
        <div className="bg-surface rounded-2xl shadow-sm dark:bg-surface border border-line">
          <PaginationWithText
            totalPages={pagination.lastPage}
            initialPage={pagination.currentPage}
            onPageChange={goToPage}
          />
        </div>
      )}

      {/* Add Table Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={closeModals}
        title={t('tableAdmin.addTable')}
        closeLabel={t('common.close')}
        size="md"
      >
        <TableForm
          isLoading={loading}
          onCancel={closeModals}
          onSubmit={handleAddTable}
          serverErrors={validationErrors}
        />
      </Modal>

      {/* Edit Table Modal */}
      <Modal
        isOpen={!!editingTable}
        onClose={closeModals}
        title={t('tableAdmin.editTable', { n: editingTable?.number || '' })}
        closeLabel={t('common.close')}
        size="md"
      >
        {editingTable && (
          <TableForm
            table={editingTable}
            isLoading={loading}
            onCancel={closeModals}
            onSubmit={handleEditTable}
            serverErrors={validationErrors}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!tableToDelete}
        onClose={() => setTableToDelete(null)}
        title={t('tableAdmin.delete.title')}
        closeLabel={t('common.close')}
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setTableToDelete(null)} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} disabled={loading}>
              {loading ? t('tableAdmin.delete.deleting') : t('tableAdmin.delete.confirm')}
            </Button>
          </div>
        }
      >
        <p className="text-fg dark:text-fg-muted">
          {t('tableAdmin.delete.body', { n: tableToDelete?.number ?? '' })}
        </p>
      </Modal>

      {/* Table Details Modal */}
      <Modal
        isOpen={!!selectedTable}
        onClose={closeModals}
        title={t('tableAdmin.details.title', { n: selectedTable?.number || '' })}
        closeLabel={t('common.close')}
        size="lg"
      >
        {selectedTable && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Table Information */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 dark:text-fg">
                <span aria-hidden="true">📋</span> {t('tableAdmin.details.information')}
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-fg-muted dark:text-fg-muted">{t('tableAdmin.details.number')}</span>
                  <span className="font-medium dark:text-fg">{selectedTable.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fg-muted dark:text-fg-muted">{t('tableAdmin.details.capacity')}</span>
                  <span className="font-medium dark:text-fg">{t('tables.seats', { count: selectedTable.capacity })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fg-muted dark:text-fg-muted">{t('tableAdmin.details.shape')}</span>
                  <span className="font-medium dark:text-fg">
                    {selectedTable.shape ? dynamicT(`tableAdmin.shape.${selectedTable.shape}`, { defaultValue: selectedTable.shape }) : t('tableAdmin.details.na')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fg-muted dark:text-fg-muted">{t('tableAdmin.details.section')}</span>
                  <span className="font-medium dark:text-fg">{selectedTable.section || t('tableAdmin.details.na')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fg-muted dark:text-fg-muted">{t('tableAdmin.details.floor')}</span>
                  <span className="font-medium dark:text-fg">{selectedTable.floor || t('tableAdmin.details.na')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fg-muted dark:text-fg-muted">{t('tableAdmin.details.status')}</span>
                  <StatusPill
                    style={tableStatusStyle(selectedTable.status)}
                    label={tableStatusLabel(t, selectedTable.status)}
                    size="sm"
                  />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 dark:text-fg">
                <span aria-hidden="true">ℹ️</span> {t('tableAdmin.details.additional')}
              </h4>
              <div className="space-y-3 text-sm">
                {selectedTable.description && (
                  <div>
                    <span className="text-fg-muted dark:text-fg-muted">{t('tableAdmin.details.description')}</span>
                    <p className="mt-1 text-fg dark:text-fg">{selectedTable.description}</p>
                  </div>
                )}
                {selectedTable.features && selectedTable.features.length > 0 && (
                  <div>
                    <span className="text-fg-muted dark:text-fg-muted">{t('tableAdmin.details.features')}</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedTable.features.map((feature: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-fg-muted dark:text-fg-muted">{t('tableAdmin.details.created')}</span>
                  <span className="font-medium dark:text-fg">
                    {selectedTable.created_at ? new Date(selectedTable.created_at).toLocaleDateString(i18n.language) : t('tableAdmin.details.na')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fg-muted dark:text-fg-muted">{t('tableAdmin.details.updated')}</span>
                  <span className="font-medium dark:text-fg">
                    {selectedTable.updated_at ? new Date(selectedTable.updated_at).toLocaleDateString(i18n.language) : t('tableAdmin.details.na')}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Reservation/Occupancy */}
            {(selectedTable.status === 'occupied' || selectedTable.status === 'reserved') && (
              <div className="md:col-span-2">
                <h4 className="font-semibold mb-3 flex items-center gap-2 dark:text-fg">
                  <span aria-hidden="true">{selectedTable.status === 'occupied' ? '👥' : '📅'}</span>{' '}
                  {selectedTable.status === 'occupied' ? t('tableAdmin.details.occupancy') : t('tableAdmin.details.reservation')}
                </h4>
                <div className="rounded-lg bg-surface-2 p-4">
                  <div className="flex items-center justify-between">
                    <StatusPill
                      style={tableStatusStyle(selectedTable.status)}
                      label={selectedTable.status === 'occupied' ? t('tableAdmin.details.currentlyOccupied') : t('tableState.reserved')}
                    />
                    {(selectedTable as Table & { current_order_id?: number }).current_order_id && (
                      <span className="font-medium dark:text-fg">
                        {t('tables.orderNumber', { n: (selectedTable as Table & { current_order_id?: number }).current_order_id })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

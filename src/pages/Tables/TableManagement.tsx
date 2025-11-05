import React, { useState } from 'react';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Alert from '@/components/ui/alert/Alert';
import Modal from '@/components/common/Modal';
import { useTableManagement } from '@/hooks/useTableManagement';
import PaginationWithText from '@/components/ui/pagination/PaginationWithText';

// Import table components
import TableFilters from '@/components/pos/tables/TableFilters';
import TableList from '@/components/pos/tables/TableList';
import TableForm from '@/components/pos/tables/TableForm';
import type { Table } from '@/types/table';

export default function TableManagement() {
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
    tableStats = { total: 0, available: 0, occupied: 0, reserved: 0 },
  } = useTableManagement(5) as any; // 5 tables per page for management

  // Local modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);
  const [bulkAction, setBulkAction] = useState<string>('');

  // Handle form submissions
  const handleAddTable = async (values: any) => {
    try {
      await createTable(values);
      setShowAddModal(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEditTable = async (values: any) => {
    if (!editingTable) return;
    try {
      await updateTable(editingTable.id, values);
      setEditingTable(null); // Close the modal after successful update
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDeleteRequest = (tableId: number) => {
    const table = tables.find((t: Table) => t.id === tableId);
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
      await bulkUpdateStatus(selectedTables, bulkAction as any);
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
      <PageMeta title="Table Management | POS System" description="Manage restaurant tables and seating" />
      <PageBreadcrumb pageTitle="Table Management" />
      
      {/* Success Message */}
      {successMessage && (
        <Alert
          variant="success"
          title="Success!"
          message={successMessage}
        />
      )}

      {/* Error Message */}
      {error && (
        <Alert
          variant="error"
          title="Error"
          message={error}
        />
      )}

      {/* Validation Errors */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
          <h4 className="text-red-800 font-medium mb-2 dark:text-red-200">Please fix the following errors:</h4>
          <ul className="list-disc list-inside text-red-700 text-sm space-y-1 dark:text-red-300">
            {Object.entries(validationErrors).map(([field, errors]) => {
              const errorMessage = Array.isArray(errors) ? errors[0] : String(errors);
              return (
                <li key={field}>
                  <strong>{field.replace('_', ' ')}:</strong> {errorMessage}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      {/* Header with Stats */}
      <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-900">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Table Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your restaurant tables and seating</p>
          </div>
          
          {/* Add Table Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Table
          </button>
        </div>
          
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{tableStats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Tables</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{tableStats.available}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Available</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{tableStats.occupied}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Occupied</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{tableStats.totalCapacity}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Capacity</div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTables.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <strong>{selectedTables.length}</strong> table{selectedTables.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex items-center gap-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-blue-600 dark:bg-blue-900/20 dark:text-white"
              >
                <option value="">Select action...</option>
                <option value="available">Mark Available</option>
                <option value="occupied">Mark Occupied</option>
                <option value="reserved">Mark Reserved</option>
                <option value="maintenance">Mark for Maintenance</option>
              </select>
              <button
                onClick={handleBulkStatusChange}
                disabled={!bulkAction || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
              <button
                onClick={() => clearSelection()}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Clear
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
        onFilterChange={(key: string, value: any) => {
          if (key === 'status') {
            setStatusFilter(value);
            if (pagination.currentPage !== 1) {
              goToPage(1);
            }
          } else if (key === 'shape') {
            setShapeFilter(value);
            if (pagination.currentPage !== 1) {
              goToPage(1);
            }
          } else if (key === 'location') {
            setSectionFilter(value);
            if (pagination.currentPage !== 1) {
              goToPage(1);
            }
          } else if (key === 'minCapacity') {
            setMinCapacityFilter(value || null);
            if (pagination.currentPage !== 1) {
              goToPage(1);
            }
          } else if (key === 'maxCapacity') {
            setMaxCapacityFilter(value || null);
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
        onStatusChange={(id: number, status: string) => updateTableStatus(id, status)}
        onSelectTable={(id: number) => toggleTableSelection(id)}
        selectedTables={selectedTables}
      />

      {/* Pagination */}
      {pagination.lastPage > 1 && (
        <div className="bg-white rounded-lg shadow dark:bg-gray-900">
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
        title="Add New Table"
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
        title={`Edit Table ${editingTable?.number || ''}`}
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
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete{' '}
            <span className="font-semibold">Table {tableToDelete?.number}</span>? This action
            cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setTableToDelete(null)}
              className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Table Details Modal */}
      <Modal
        isOpen={!!selectedTable}
        onClose={closeModals}
        title={`Table ${selectedTable?.number || ''} - Details`}
        size="lg"
      >
        {selectedTable && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Table Information */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 dark:text-white">
                📋 Table Information
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Table Number:</span> 
                  <span className="font-medium dark:text-white">{selectedTable.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Capacity:</span> 
                  <span className="font-medium dark:text-white">{selectedTable.capacity} seats</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shape:</span> 
                  <span className="font-medium capitalize dark:text-white">{selectedTable.shape || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Section:</span> 
                  <span className="font-medium dark:text-white">{selectedTable.section || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Floor:</span> 
                  <span className="font-medium dark:text-white">{selectedTable.floor || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span> 
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedTable.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                    selectedTable.status === 'occupied' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                    selectedTable.status === 'reserved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {selectedTable.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 dark:text-white">
                ℹ️ Additional Details
              </h4>
              <div className="space-y-3 text-sm">
                {selectedTable.description && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Description:</span>
                    <p className="mt-1 text-gray-900 dark:text-white">{selectedTable.description}</p>
                  </div>
                )}
                {selectedTable.features && selectedTable.features.length > 0 && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Features:</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedTable.features.map((feature: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs dark:bg-blue-900/30 dark:text-blue-300">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Created:</span> 
                  <span className="font-medium dark:text-white">
                    {selectedTable.created_at ? new Date(selectedTable.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Last Updated:</span> 
                  <span className="font-medium dark:text-white">
                    {selectedTable.updated_at ? new Date(selectedTable.updated_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Reservation/Occupancy */}
            {(selectedTable.status === 'occupied' || selectedTable.status === 'reserved') && (
              <div className="md:col-span-2">
                <h4 className="font-semibold mb-3 flex items-center gap-2 dark:text-white">
                  {selectedTable.status === 'occupied' ? '👥 Current Occupancy' : '📅 Reservation'}
                </h4>
                <div className={`${
                  selectedTable.status === 'occupied' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'
                } rounded-lg p-4`}>
                  <div className="flex items-center justify-between">
                    <span className={selectedTable.status === 'occupied' ? 'text-red-700 dark:text-red-300' : 'text-blue-700 dark:text-blue-300'}>
                      {selectedTable.status === 'occupied' ? '🔴 Currently occupied' : '🔵 Reserved'}
                    </span>
                    {selectedTable.current_order_id && (
                      <span className="font-medium dark:text-white">Order #{selectedTable.current_order_id}</span>
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

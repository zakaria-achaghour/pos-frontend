import React, { useState, useCallback } from 'react';
import { useTableManagement } from '../../hooks/useTableManagement';
import { useModal } from '../../hooks/useModal';
import type { Table, TableFormData } from '../../types/table';
import TableForm from '../../components/tables/TableForm';
import TableFilters from '../../components/tables/TableFilters';
import TableList from '../../components/tables/TableList';
import TableStats from '../../components/tables/TableStats';
import Button from '../../components/ui/button/Button';

const TableManagementIntegrated: React.FC = () => {
  const {
    tables,
    filteredTables,
    loading,
    creating,
    updating,
    deleting,
    message,
    filters,
    pagination,
    tableStats,
    
    // Actions
    createTable,
    updateTable,
    deleteTable,
    updateTableStatus,
    deactivateTable,
    activateTable,
    updateFilters,
    resetFilters,
    updatePagination,
    
    // Helpers
    getTableById,
    showMessage
  } = useTableManagement();

  const { isOpen: isFormOpen, openModal: openForm, closeModal: closeForm } = useModal();
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTables, setSelectedTables] = useState<number[]>([]);

  // Form handlers
  const handleOpenCreateForm = useCallback(() => {
    setEditingTable(null);
    openForm();
  }, [openForm]);

  const handleOpenEditForm = useCallback((table: Table) => {
    setEditingTable(table);
    openForm();
  }, [openForm]);

  const handleCloseForm = useCallback(() => {
    closeForm();
    setEditingTable(null);
  }, [closeForm]);

  const handleSubmitForm = useCallback(async (formData: TableFormData) => {
    let success = false;
    
    if (editingTable) {
      success = await updateTable(editingTable.id, formData);
    } else {
      success = await createTable(formData);
    }
    
    if (success) {
      handleCloseForm();
    }
  }, [editingTable, updateTable, createTable, handleCloseForm]);

  // Table action handlers
  const handleDeleteTable = useCallback(async (tableId: number) => {
    const table = getTableById(tableId);
    if (!table) return;

    if (table.status === 'occupied') {
      showMessage('Cannot delete occupied table with active orders', 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to delete table "${table.number}"?`)) {
      await deleteTable(tableId);
    }
  }, [getTableById, showMessage, deleteTable]);

  // Selection handlers
  const handleSelectTable = useCallback((tableId: number) => {
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedTables.length === filteredTables.length && filteredTables.length > 0) {
      setSelectedTables([]);
    } else {
      setSelectedTables(filteredTables.map(table => table.id));
    }
  }, [filteredTables, selectedTables.length]);

  const handleClearSelection = useCallback(() => {
    setSelectedTables([]);
  }, []);

  // Bulk actions
  const handleBulkDeactivate = useCallback(async () => {
    if (selectedTables.length === 0) return;
    
    if (window.confirm(`Deactivate ${selectedTables.length} selected tables?`)) {
      const promises = selectedTables.map(tableId => deactivateTable(tableId));
      await Promise.all(promises);
      setSelectedTables([]);
      showMessage(`${selectedTables.length} tables deactivated`, 'success');
    }
  }, [selectedTables, deactivateTable, showMessage]);

  const handleBulkActivate = useCallback(async () => {
    if (selectedTables.length === 0) return;
    
    if (window.confirm(`Activate ${selectedTables.length} selected tables?`)) {
      const promises = selectedTables.map(tableId => activateTable(tableId));
      await Promise.all(promises);
      setSelectedTables([]);
      showMessage(`${selectedTables.length} tables activated`, 'success');
    }
  }, [selectedTables, activateTable, showMessage]);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    updatePagination({ page });
  }, [updatePagination]);

  const handleItemsPerPageChange = useCallback((limit: number) => {
    updatePagination({ limit, page: 1 });
  }, [updatePagination]);

  const isAnyLoading = loading || creating || updating || deleting;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                🍽️ Table Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your restaurant tables, seating arrangements, and availability with real-time API integration
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View mode toggle */}
              <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>

              <Button 
                onClick={handleOpenCreateForm} 
                disabled={isAnyLoading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Table
              </Button>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
              : message.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'  
              : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'
          }`}>
            <div className="flex items-center">
              <span className="mr-2">
                {message.type === 'success' ? '✅' : message.type === 'error' ? '❌' : 'ℹ️'}
              </span>
              {message.text}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8">
          <TableStats stats={tableStats} />
        </div>

        {/* Bulk Actions */}
        {selectedTables.length > 0 && (
          <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4 dark:bg-indigo-900/20 dark:border-indigo-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-indigo-800 dark:text-indigo-200">
                <strong>{selectedTables.length}</strong> table{selectedTables.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleBulkDeactivate}
                  disabled={isAnyLoading}
                  variant="outline"
                  size="sm"
                >
                  ⚠️ Deactivate Selected
                </Button>
                <Button
                  onClick={handleBulkActivate}
                  disabled={isAnyLoading}
                  variant="outline" 
                  size="sm"
                >
                  ✅ Activate Selected
                </Button>
                <Button
                  onClick={handleClearSelection}
                  variant="outline"
                  size="sm"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8">
          <TableFilters
            filters={filters}
            onFiltersChange={updateFilters}
            onReset={resetFilters}
            totalCount={pagination.total}
            filteredCount={filteredTables.length}
          />
        </div>

        {/* Table List */}
        <div className="mb-8">
          {loading && tables.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading tables...</span>
            </div>
          ) : (
            <>
              {/* Selection controls */}
              {tables.length > 0 && (
                <div className="flex items-center justify-between mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <input
                      type="checkbox"
                      checked={selectedTables.length === filteredTables.length && filteredTables.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    Select all visible tables
                  </label>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {filteredTables.length} of {pagination.total} tables
                  </div>
                </div>
              )}

              <TableList
                tables={filteredTables}
                onEdit={handleOpenEditForm}
                onDelete={handleDeleteTable}
                onStatusChange={updateTableStatus}
                onSelectTable={handleSelectTable}
                selectedTables={selectedTables}
                isLoading={isAnyLoading}
                viewMode={viewMode}
              />

              {/* Pagination */}
              {pagination.total > pagination.limit && (
                <div className="mt-8 flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6 py-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} tables
                    </span>
                    <select
                      value={pagination.limit}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="border border-gray-300 rounded px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                    </span>
                    
                    <Button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto dark:bg-gray-900">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 dark:bg-gray-900 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingTable ? `Edit Table "${editingTable.number}"` : 'Create New Table'}
                  </h2>
                  <button
                    onClick={handleCloseForm}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    disabled={creating || updating}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <TableForm
                  table={editingTable ?? undefined}
                  onSubmit={handleSubmitForm}
                  onCancel={handleCloseForm}
                  isLoading={creating || updating}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableManagementIntegrated;
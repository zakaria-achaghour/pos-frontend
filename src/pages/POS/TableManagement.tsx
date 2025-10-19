import React, { useState } from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { useTableManagementBasic } from '../../hooks/useTableManagementBasic';
import type { Table, TableFormData } from '../../types/table';
import TableFilters from '../../components/tables/TableFilters';
import TableList from '../../components/tables/TableList';
import TableForm from '../../components/tables/TableForm';

export default function TableManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  const {
    filteredTables,
    loading,
    message,
    filters,
    pagination,
    createTable,
    updateTable,
    deleteTable,
    updateTableStatus,
    updateFilters,
    resetFilters,
    updatePagination,
  } = useTableManagementBasic();

  // Handle create table
  const handleCreateTable = async (formData: TableFormData): Promise<void> => {
    const success = await createTable(formData);
    if (success) {
      setShowCreateModal(false);
    }
  };

  // Handle update table
  const handleUpdateTable = async (formData: TableFormData): Promise<void> => {
    if (!editingTable) return;
    
    const success = await updateTable(editingTable.id, formData);
    if (success) {
      setEditingTable(null);
    }
  };

  // Handle edit table
  const handleEditTable = (table: Table) => {
    setEditingTable(table);
  };

  // Handle close modals
  const handleCloseModals = () => {
    setShowCreateModal(false);
    setEditingTable(null);
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      updatePagination({ page: pagination.page - 1 });
    }
  };

  const handleNextPage = () => {
    if (pagination.page < Math.ceil(pagination.total / pagination.limit)) {
      updatePagination({ page: pagination.page + 1 });
    }
  };

  const paginationSummary = (() => {
    const from = pagination.total === 0
      ? 0
      : (pagination.page - 1) * pagination.limit + 1;
    const to = Math.min(pagination.page * pagination.limit, pagination.total);
    return { from, to };
  })();

  return (
    <div className="space-y-6">
      <PageMeta title="Table Management | POS System" description="Create and manage restaurant tables" />
      <PageBreadcrumb pageTitle="Table Management" />
      
      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          message.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
            <p className="text-gray-600">Create, edit, and manage restaurant tables</p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            ➕ Add New Table
          </button>
        </div>
      </div>

      {/* Filters */}
      <TableFilters
        filters={filters}
        onFiltersChange={updateFilters}
        onReset={resetFilters}
        totalCount={filteredTables.length}
        filteredCount={filteredTables.length}
      />

      {/* Tables Grid */}
      <TableList
        tables={filteredTables}
        onEdit={handleEditTable}
        onDelete={deleteTable}
        onStatusChange={updateTableStatus}
        isLoading={loading}
      />

      {/* Pagination */}
      {Math.ceil(pagination.total / pagination.limit) > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={handlePreviousPage}
              disabled={pagination.page === 1 || loading}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit) || loading}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium text-gray-900">{paginationSummary.from}</span> to{' '}
                <span className="font-medium text-gray-900">{paginationSummary.to}</span> of{' '}
                <span className="font-medium text-gray-900">{pagination.total}</span> tables
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={handlePreviousPage}
                  disabled={pagination.page === 1 || loading}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page <span className="font-semibold">{pagination.page}</span> of{' '}
                  <span className="font-semibold">{Math.ceil(pagination.total / pagination.limit)}</span>
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit) || loading}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <TableForm
          onSubmit={handleCreateTable}
          onCancel={handleCloseModals}
          isLoading={loading}
        />
      )}

      {/* Edit Modal */}
      {editingTable && (
        <TableForm
          table={editingTable}
          onSubmit={handleUpdateTable}
          onCancel={handleCloseModals}
          isLoading={loading}
        />
      )}
    </div>
  );
}
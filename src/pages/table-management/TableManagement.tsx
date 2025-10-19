import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../store';
import {
  fetchTables,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatusAsync,
  bulkUpdateStatus,
  setCurrentPage,
  setItemsPerPage,
  setCurrentTable,
  setStatusFilter,
  setSearchTerm,
  setCapacityFilter,
  setCapacityRange,
  setSectionFilter,
  setFloorFilter,
  setShapeFilter,
  clearFilters,
  toggleTableSelection,
  clearSelection,
  clearCurrentTable,
  selectTablesAction,
  selectTables,
  selectTablesList,
  selectCurrentTable,
  selectTablesLoading,
  selectTablesCreating,
  selectTablesUpdating,
  selectTablesDeleting,
  selectTablesError,
  selectTablesValidationErrors,
  selectSelectedTables,
  selectTablesFilters,
  selectFilteredTables
} from '../../store/slices/tableSlice';
import type { Table, TableFormData, TableFilters as TableFiltersType, TableStatus } from '../../types/table';
import TableForm from '../../components/tables/TableForm';
import TableFilters from '../../components/tables/TableFilters';
import TableList from '../../components/tables/TableList';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/ui/button/Button';
import { useModal } from '../../hooks/useModal';

const TableManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const tablesState = useSelector(selectTables);
  const tables = useSelector(selectTablesList);
  const isLoading = useSelector(selectTablesLoading);
  const isCreating = useSelector(selectTablesCreating);
  const isUpdating = useSelector(selectTablesUpdating);
  const isDeleting = useSelector(selectTablesDeleting);
  const error = useSelector(selectTablesError);
  const validationErrors = useSelector(selectTablesValidationErrors);
  const selectedTables = useSelector(selectSelectedTables);
  const filters = useSelector(selectTablesFilters);
  const filteredTables = useSelector(selectFilteredTables);

  const {
    totalTables,
    currentPage,
    itemsPerPage
  } = tablesState;
  
  const { isOpen: isFormOpen, openModal: openForm, closeModal: closeForm } = useModal();
  const [editingTable, setEditingTable] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [bulkAction, setBulkAction] = useState<TableStatus | null>(null);

  // Load tables on component mount and when filters change
  useEffect(() => {
    dispatch(fetchTables({ page: currentPage, limit: itemsPerPage, filters }));
  }, [dispatch, currentPage, itemsPerPage, filters]);

  // Filter handlers
  const handleFiltersChange = useCallback((newFilters: Partial<TableFiltersType>) => {
    Object.entries(newFilters).forEach(([key, value]) => {
      switch (key) {
        case 'status':
          dispatch(
            setStatusFilter(typeof value === 'string' ? (value as TableStatus) : undefined)
          );
          break;
        case 'searchTerm':
          dispatch(setSearchTerm(typeof value === 'string' ? value : undefined));
          break;
        case 'capacity':
          dispatch(setCapacityFilter(value as number | undefined));
          break;
        case 'minCapacity':
        case 'maxCapacity':
          dispatch(setCapacityRange({ 
            min: key === 'minCapacity' ? value as number | undefined : filters.minCapacity,
            max: key === 'maxCapacity' ? value as number | undefined : filters.maxCapacity
          }));
          break;
        case 'section':
          dispatch(setSectionFilter(value as string | undefined));
          break;
        case 'floor':
          dispatch(setFloorFilter(value as number | undefined));
          break;
        case 'shape':
          dispatch(
            setShapeFilter(
              typeof value === 'string' ? (value as TableFiltersType['shape']) : undefined
            )
          );
          break;
      }
    });
    // Reset to first page when filters change
    if (currentPage > 1) {
      dispatch(setCurrentPage(1));
    }
  }, [dispatch, currentPage, filters]);

  const handleResetFilters = useCallback(() => {
    dispatch(clearFilters());
    dispatch(setCurrentPage(1));
  }, [dispatch]);

  // Table CRUD handlers
  const handleCreateTable = useCallback(async (data: TableFormData) => {
    const result = await dispatch(createTable({
      number: data.number,
      capacity: data.capacity,
      shape: data.shape,
      status: data.status,
      section: data.section,
      floor: data.floor,
      description: data.description,
      features: data.features
    }));

    if (createTable.fulfilled.match(result)) {
      closeForm();
      setEditingTable(null);
    }
  }, [dispatch, closeForm]);

  const handleUpdateTable = useCallback(async (data: TableFormData) => {
    if (!editingTable) return;

    const result = await dispatch(updateTable({
      id: editingTable,
      data: {
        number: data.number,
        capacity: data.capacity,
        shape: data.shape,
        status: data.status,
        section: data.section,
        floor: data.floor,
        description: data.description,
        features: data.features
      }
    }));

    if (updateTable.fulfilled.match(result)) {
      closeForm();
      setEditingTable(null);
    }
  }, [dispatch, editingTable, closeForm]);

  const handleDeleteTable = useCallback(async (tableId: number) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      await dispatch(deleteTable(tableId));
    }
  }, [dispatch]);

  const handleStatusChange = useCallback(async (tableId: number, status: TableStatus) => {
    await dispatch(updateTableStatusAsync({ id: tableId, status }));
  }, [dispatch]);

  // Form handlers
  const handleOpenCreateForm = useCallback(() => {
    dispatch(clearCurrentTable());
    setEditingTable(null);
    openForm();
  }, [dispatch, openForm]);

  const handleOpenEditForm = useCallback((table: Table) => {
    setEditingTable(table.id);
    dispatch(setCurrentTable(table));
    openForm();
  }, [dispatch, openForm]);

  const handleCloseForm = useCallback(() => {
    closeForm();
    setEditingTable(null);
    dispatch(clearCurrentTable());
  }, [closeForm, dispatch]);

  // Selection handlers
  const handleSelectTable = useCallback((tableId: number) => {
    dispatch(toggleTableSelection(tableId));
  }, [dispatch]);

  const handleSelectAll = useCallback(() => {
    if (selectedTables.length === filteredTables.length && filteredTables.length > 0) {
      dispatch(clearSelection());
    } else {
      dispatch(selectTablesAction(filteredTables.map((table) => table.id)));
    }
  }, [dispatch, filteredTables, selectedTables.length]);

  // Bulk actions
  const handleBulkStatusChange = useCallback(async () => {
    if (selectedTables.length === 0 || !bulkAction) return;

    const result = await dispatch(bulkUpdateStatus({
      tableIds: selectedTables,
      status: bulkAction
    }));

    if (bulkUpdateStatus.fulfilled.match(result)) {
      dispatch(clearSelection());
      setBulkAction(null);
    }
  }, [dispatch, selectedTables, bulkAction]);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    dispatch(setCurrentPage(page));
  }, [dispatch]);

  const handleItemsPerPageChange = useCallback((items: number) => {
    dispatch(setItemsPerPage(items));
    dispatch(setCurrentPage(1));
  }, [dispatch]);

  const totalPages = Math.ceil(totalTables / itemsPerPage);
  const isAnyLoading = isLoading || isCreating || isUpdating || isDeleting;

  const currentTable = editingTable ? tables.find(t => t.id === editingTable) : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Table Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your restaurant tables, seating arrangements, and availability
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
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
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          <Button onClick={handleOpenCreateForm} disabled={isAnyLoading}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Table
          </Button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Bulk actions */}
      {selectedTables.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <strong>{selectedTables.length}</strong> table{selectedTables.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex items-center gap-3">
              <select
                value={bulkAction || ''}
                onChange={(e) => setBulkAction(e.target.value as TableStatus)}
                className="px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-blue-600 dark:bg-blue-900/20"
              >
                <option value="">Select action...</option>
                <option value="available">Mark Available</option>
                <option value="maintenance">Mark for Maintenance</option>
                <option value="cleaning">Mark for Cleaning</option>
                <option value="out-of-order">Mark Out of Order</option>
              </select>
              <Button
                onClick={handleBulkStatusChange}
                disabled={!bulkAction || isUpdating}
                size="sm"
              >
                Apply
              </Button>
              <Button
                onClick={() => dispatch(clearSelection())}
                variant="secondary"
                size="sm"
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <TableFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
        totalCount={totalTables}
        filteredCount={filteredTables.length}
      />

      {/* Table List */}
      {isLoading && currentPage === 1 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading tables...</span>
        </div>
      ) : (
        <>
          {/* Selection controls */}
          {tables.length > 0 && (
            <div className="flex items-center justify-between">
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
                {filteredTables.length} of {totalTables} tables
              </div>
            </div>
          )}

          <TableList
            tables={filteredTables}
            onEdit={handleOpenEditForm}
            onDelete={handleDeleteTable}
            onStatusChange={handleStatusChange}
            onSelectTable={handleSelectTable}
            selectedTables={selectedTables}
            isLoading={isAnyLoading}
            viewMode={viewMode}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalTables}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              className="mt-6"
            />
          )}
        </>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto dark:bg-gray-900">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 dark:bg-gray-900 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingTable ? 'Edit Table' : 'Create New Table'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={isCreating || isUpdating}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <TableForm
                table={currentTable}
                onSubmit={editingTable ? handleUpdateTable : handleCreateTable}
                onCancel={handleCloseForm}
                isLoading={isCreating || isUpdating}
                serverErrors={validationErrors}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManagement;

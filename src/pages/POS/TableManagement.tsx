import React, { useState } from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { useTableManagement } from '../../hooks/useTableManagement';
import type { Table, TableFormData } from '../../hooks/useTableManagement';
import TableFilters from '../../components/tables/TableFilters';
import TableList from '../../components/tables/TableList';
import TableForm from '../../components/tables/TableForm';
import TableStats from '../../components/tables/TableStats';

export default function TableManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  const {
    filteredTables,
    loading,
    message,
    filters,
    tableStats,
    createTable,
    updateTable,
    deleteTable,
    updateTableStatus,
    updateFilters,
    resetFilters,
    getTableById,
    getStatusColor,
    getShapeIcon,
  } = useTableManagement();

  // Handle create table
  const handleCreateTable = async (formData: TableFormData): Promise<boolean> => {
    const success = await createTable(formData);
    if (success) {
      setShowCreateModal(false);
    }
    return success;
  };

  // Handle update table
  const handleUpdateTable = async (formData: TableFormData): Promise<boolean> => {
    if (!editingTable) return false;
    
    const success = await updateTable(editingTable.id, formData);
    if (success) {
      setEditingTable(null);
    }
    return success;
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
        totalCount={tableStats.total}
        filteredCount={filteredTables.length}
      />

      {/* Tables Grid */}
      <TableList
        tables={filteredTables}
        onEdit={handleEditTable}
        onDelete={deleteTable}
        onStatusChange={updateTableStatus}
        isLoading={loading}
        getStatusColor={getStatusColor}
        getShapeIcon={getShapeIcon}
      />

      {/* Table Statistics */}
      <TableStats stats={tableStats} />

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
          initialData={{
            name: editingTable.name,
            capacity: editingTable.capacity,
            shape: editingTable.shape,
            description: editingTable.description || ''
          }}
          isEdit={true}
          onSubmit={handleUpdateTable}
          onCancel={handleCloseModals}
          isLoading={loading}
        />
      )}
    </div>
  );
}
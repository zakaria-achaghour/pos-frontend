import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

interface Table {
  id: number;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  shape: 'square' | 'round' | 'rectangle';
  position?: { x: number; y: number };
  description?: string;
  currentOrder?: {
    id: number;
    total: number;
    items: number;
    status: 'preparing' | 'ready' | 'served';
    time: string;
  };
}

interface TableFormData {
  name: string;
  capacity: number;
  shape: 'square' | 'round' | 'rectangle';
  description: string;
}

// Mock tables data
const initialTables: Table[] = [
  { id: 1, name: 'Table 1', capacity: 4, status: 'available', shape: 'square' },
  { id: 2, name: 'Table 2', capacity: 2, status: 'occupied', shape: 'round' },
  { id: 3, name: 'Table 3', capacity: 6, status: 'available', shape: 'rectangle' },
  { id: 4, name: 'Table 4', capacity: 4, status: 'reserved', shape: 'square' },
];

export default function TableManagement() {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const [formData, setFormData] = useState<TableFormData>({
    name: '',
    capacity: 2,
    shape: 'square',
    description: ''
  });

  // Filter tables based on search
  const filteredTables = tables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 2 : value
    }));
  };

  // Create new table
  const handleCreateTable = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a table name');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newTable: Table = {
        id: Math.max(...tables.map(t => t.id)) + 1,
        name: formData.name,
        capacity: formData.capacity,
        status: 'available',
        shape: formData.shape,
        description: formData.description
      };

      setTables(prev => [...prev, newTable]);
      setShowCreateModal(false);
      resetForm();
      showToast(`Table "${newTable.name}" created successfully!`, 'success');
    } catch (error) {
      showToast('Failed to create table', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update existing table
  const handleUpdateTable = async () => {
    if (!editingTable || !formData.name.trim()) {
      alert('Please enter a table name');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedTable: Table = {
        ...editingTable,
        name: formData.name,
        capacity: formData.capacity,
        shape: formData.shape,
        description: formData.description
      };

      setTables(prev => prev.map(table => 
        table.id === editingTable.id ? updatedTable : table
      ));
      
      setEditingTable(null);
      resetForm();
      showToast(`Table "${updatedTable.name}" updated successfully!`, 'success');
    } catch (error) {
      showToast('Failed to update table', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete table
  const handleDeleteTable = async (tableId: number) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    if (table.status === 'occupied') {
      showToast('Cannot delete occupied table', 'error');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${table.name}"?`)) {
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTables(prev => prev.filter(t => t.id !== tableId));
      showToast(`Table "${table.name}" deleted successfully!`, 'success');
    } catch (error) {
      showToast('Failed to delete table', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Change table status
  const handleStatusChange = async (tableId: number, newStatus: Table['status']) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setTables(prev => prev.map(t => 
        t.id === tableId ? { ...t, status: newStatus } : t
      ));
      
      showToast(`Table "${table.name}" status updated to ${newStatus}`, 'success');
    } catch (error) {
      showToast('Failed to update table status', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      capacity: 2,
      shape: 'square',
      description: ''
    });
  };

  // Open edit modal
  const openEditModal = (table: Table) => {
    setEditingTable(table);
    setFormData({
      name: table.name,
      capacity: table.capacity,
      shape: table.shape,
      description: table.description || ''
    });
  };

  // Close modals
  const closeModals = () => {
    setShowCreateModal(false);
    setEditingTable(null);
    resetForm();
  };

  // Toast notification function
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white font-medium ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

  // Get status color
  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Table Management | POS System" description="Create and manage restaurant tables" />
      <PageBreadcrumb pageTitle="Table Management" />
      
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
            <p className="text-gray-600">Create, edit, and manage restaurant tables</p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            ➕ Add New Table
          </button>
        </div>

        {/* Search */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTables.map((table) => (
          <div key={table.id} className="bg-white rounded-lg shadow border">
            {/* Table Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{table.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(table.status)}`}>
                  {table.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                👥 {table.capacity} seats • {table.shape}
              </div>
            </div>

            {/* Table Body */}
            <div className="p-4">
              {table.description && (
                <p className="text-sm text-gray-600 mb-3">{table.description}</p>
              )}

              {/* Status Change Buttons */}
              <div className="mb-3">
                <label className="text-sm font-medium text-gray-700 block mb-1">Change Status:</label>
                <select
                  value={table.status}
                  onChange={(e) => handleStatusChange(table.id, e.target.value as Table['status'])}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(table)}
                  className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200 transition-colors"
                  disabled={loading}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDeleteTable(table.id)}
                  className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200 transition-colors"
                  disabled={loading || table.status === 'occupied'}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingTable) && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-lg border">
            <h3 className="text-xl font-bold mb-4">
              {editingTable ? 'Edit Table' : 'Create New Table'}
            </h3>
            
            <div className="space-y-4">
              {/* Table Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Table Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Table 1, VIP Table A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity (Number of Seats)
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="1"
                  max="20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Shape */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Table Shape
                </label>
                <select
                  name="shape"
                  value={formData.shape}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="square">Square</option>
                  <option value="round">Round</option>
                  <option value="rectangle">Rectangle</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g., Near window, VIP section, etc."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModals}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={editingTable ? handleUpdateTable : handleCreateTable}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                disabled={loading || !formData.name.trim()}
              >
                {loading ? 'Saving...' : (editingTable ? 'Update Table' : 'Create Table')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">📊 Table Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{tables.length}</div>
            <div className="text-sm text-gray-600">Total Tables</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {tables.filter(t => t.status === 'available').length}
            </div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {tables.filter(t => t.status === 'occupied').length}
            </div>
            <div className="text-sm text-gray-600">Occupied</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {tables.reduce((sum, t) => sum + t.capacity, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Capacity</div>
          </div>
        </div>
      </div>
    </div>
  );
}
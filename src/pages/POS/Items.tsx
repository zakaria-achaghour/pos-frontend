import React, { useState } from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { useMenuManagement } from '../../hooks/useMenuManagement';
import type { MenuItem, MenuItemFormData } from '../../hooks/useMenuManagement';
import MenuFilters from '../../components/menu/MenuFilters';
import ItemCard from '../../components/menu/ItemCard';
import MenuItemForm from '../../components/menu/MenuItemForm';

export default function Items() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const {
    categories,
    filteredMenuItems,
    loading,
    message,
    filters,
    menuStats,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemStatus,
    updateFilters,
    resetFilters,
  } = useMenuManagement();

  // Handle create item
  const handleCreateItem = async (formData: MenuItemFormData): Promise<boolean> => {
    const success = await createMenuItem(formData);
    if (success) {
      setShowCreateModal(false);
    }
    return success;
  };

  // Handle update item
  const handleUpdateItem = async (formData: MenuItemFormData): Promise<boolean> => {
    if (!editingItem) return false;
    
    const success = await updateMenuItem(editingItem.id, formData);
    if (success) {
      setEditingItem(null);
    }
    return success;
  };

  // Handle edit item
  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
  };

  // Handle close modals
  const handleCloseModals = () => {
    setShowCreateModal(false);
    setEditingItem(null);
  };

  return (
    <div>
      <PageMeta title="Items | POS System" description="Manage menu items" />
      <PageBreadcrumb pageTitle="Items" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Menu Items</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage your restaurant's menu items and pricing
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Item
            </button>
          </div>
        </div>

        {/* Filters */}
        <MenuFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onResetFilters={resetFilters}
          categories={categories}
          mode="items"
          stats={menuStats}
        />

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Items Grid */}
        <div className="bg-white rounded-xl shadow p-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-5xl mb-4">🍽️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600 mb-4">
                {filters.search || filters.category || filters.status !== 'all'
                  ? 'Try adjusting your filters to see more items.'
                  : 'Get started by adding your first menu item.'}
              </p>
              {!filters.search && !filters.category && filters.status === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Your First Item
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onEdit={handleEditItem}
                  onDelete={deleteMenuItem}
                  onToggleStatus={toggleMenuItemStatus}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <MenuItemForm
              onSubmit={handleCreateItem}
              onCancel={handleCloseModals}
              categories={categories}
              isSubmitting={loading}
              title="Add New Menu Item"
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <MenuItemForm
              onSubmit={handleUpdateItem}
              onCancel={handleCloseModals}
              categories={categories}
              isSubmitting={loading}
              initialData={{
                name: editingItem.name,
                price: editingItem.price,
                description: editingItem.description || '',
                categoryId: editingItem.categoryId,
                ingredients: editingItem.ingredients || [],
                allergens: editingItem.allergens || [],
                preparationTime: editingItem.preparationTime || 0,
                isActive: editingItem.isActive,
                image: editingItem.image || ''
              }}
              title="Edit Menu Item"
            />
          </div>
        </div>
      )}
    </div>
  );
}
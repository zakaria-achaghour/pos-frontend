import React, { useState, useEffect } from 'react';
import { menuAPI } from '@/api/menu';
import { tableAPI } from '@/api/tables';
import { orderAPI } from '@/api/orders';
import type { MenuItem } from '@/types/menu';
import type { Table } from '@/types/table';
import type { OrderType } from '@/types/order';

interface OrderItem {
  menu_item_id: number;
  quantity: number;
  special_instructions?: string;
}

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preSelectedTableId?: number;
}

export default function OrderFormModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  preSelectedTableId 
}: OrderFormModalProps) {
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [tableId, setTableId] = useState<number | ''>('');
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState<OrderItem[]>([
    { menu_item_id: 0, quantity: 1, special_instructions: '' }
  ]);
  const [kitchenNotes, setKitchenNotes] = useState('');
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch menu items and tables
  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (preSelectedTableId) {
        setTableId(preSelectedTableId);
        setOrderType('dine-in');
      }
    }
  }, [isOpen, preSelectedTableId]);

  const fetchData = async () => {
    try {
      const [menuResponse, tablesResponse] = await Promise.all([
        menuAPI.getItems(),
        tableAPI.getTables()
      ]);
      
      const menuData = Array.isArray(menuResponse) ? menuResponse : menuResponse.data || [];
      const availableItems = menuData.filter((item: MenuItem) => item.is_active && item.is_available);
      setMenuItems(availableItems);
      
      const tablesData = Array.isArray(tablesResponse) ? tablesResponse : tablesResponse.data || [];
      const availableTables = tablesData.filter((table: Table) => 
        table.status === 'available' || table.status === 'occupied'
      );
      setTables(availableTables);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data');
    }
  };

  const addItem = () => {
    setItems([...items, { menu_item_id: 0, quantity: 1, special_instructions: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const menuItem = menuItems.find(m => m.id === item.menu_item_id);
      if (menuItem && item.quantity > 0) {
        return total + (Number(menuItem.price) * item.quantity);
      }
      return total;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (orderType === 'dine-in' && !tableId) {
      setError('Please select a table for dine-in orders');
      return;
    }
    
    if (items.length === 0 || items.every(item => !item.menu_item_id)) {
      setError('Please add at least one item');
      return;
    }

    setLoading(true);
    
    try {
      const validItems = items
        .filter(item => item.menu_item_id && item.quantity > 0)
        .map(item => ({
          menu_item_id: Number(item.menu_item_id),
          quantity: Number(item.quantity),
          special_instructions: item.special_instructions || undefined,
        }));

      const data: any = {
        type: orderType,
        table_id: orderType === 'dine-in' ? Number(tableId) : undefined,
        customer_name: customerName || undefined,
        items: validItems,
        kitchen_notes: kitchenNotes || undefined,
      };

      await orderAPI.createOrder(data);
      
      // Reset form
      setOrderType('dine-in');
      setTableId('');
      setCustomerName('');
      setItems([{ menu_item_id: 0, quantity: 1, special_instructions: '' }]);
      setKitchenNotes('');
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-start justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Create New Order</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
              type="button"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Order Type & Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Type <span className="text-red-500">*</span>
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as OrderType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="dine-in">🍽️ Dine-in</option>
                <option value="takeout">🥡 Takeout</option>
                <option value="delivery">🚚 Delivery</option>
              </select>
            </div>

            {orderType === 'dine-in' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Table <span className="text-red-500">*</span>
                </label>
                <select
                  value={tableId}
                  onChange={(e) => setTableId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select table</option>
                  {tables.map(table => (
                    <option key={table.id} value={table.id}>
                      Table {table.number} ({table.capacity} seats)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className={orderType === 'dine-in' ? '' : 'sm:col-span-2'}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Order Items <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addItem}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => {
                const menuItem = menuItems.find(m => m.id === item.menu_item_id);
                const itemTotal = menuItem ? Number(menuItem.price) * item.quantity : 0;

                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      {/* Menu Item */}
                      <div className="sm:col-span-6">
                        <select
                          value={item.menu_item_id}
                          onChange={(e) => updateItem(index, 'menu_item_id', Number(e.target.value))}
                          className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select item</option>
                          {menuItems.map(menuItem => (
                            <option key={menuItem.id} value={menuItem.id}>
                              {menuItem.name} - {Number(menuItem.price).toFixed(2)} MAD
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                          placeholder="Qty"
                          className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      {/* Special Instructions */}
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          value={item.special_instructions || ''}
                          onChange={(e) => updateItem(index, 'special_instructions', e.target.value)}
                          placeholder="Special instructions"
                          className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Item Total */}
                    {menuItem && (
                      <div className="mt-2 flex justify-between text-sm">
                        <span className="text-gray-600">
                          {menuItem.category?.name || 'N/A'} • {menuItem.preparation_time || 'N/A'} min
                        </span>
                        <span className="font-semibold text-blue-600">
                          {itemTotal.toFixed(2)} MAD
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kitchen Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kitchen Notes
            </label>
            <textarea
              value={kitchenNotes}
              onChange={(e) => setKitchenNotes(e.target.value)}
              placeholder="Special instructions for kitchen..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border-2 border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Order Total:</span>
              <span className="text-2xl font-bold text-blue-600">
                {calculateTotal().toFixed(2)} MAD
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Order'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

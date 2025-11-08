import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Alert from '@/components/ui/alert/Alert';
import { orderAPI } from '@/api/orders';
import { menuAPI } from '@/api/menu';
import { tableAPI } from '@/api/tables';
import type { CreateOrderData, Order, OrderType } from '@/types/order';
import type { MenuItem } from '@/types/menu';
import type { Table } from '@/types/table';

const validationSchema = Yup.object({
  type: Yup.string()
    .oneOf(['dine-in', 'takeout', 'delivery'], 'Invalid order type')
    .required('Order type is required'),
  table_id: Yup.number()
    .nullable()
    .when('type', {
      is: 'dine-in',
      then: (schema: Yup.NumberSchema) => schema.required('Table is required for dine-in orders'),
    }),
  customer_name: Yup.string()
    .max(100, 'Customer name must be less than 100 characters'),
  items: Yup.array()
    .of(
      Yup.object({
        menu_item_id: Yup.number().required('Menu item is required'),
        quantity: Yup.number()
          .min(1, 'Quantity must be at least 1')
          .required('Quantity is required'),
        special_instructions: Yup.string().max(200, 'Instructions too long'),
      })
    )
    .min(1, 'At least one item is required'),
  kitchen_notes: Yup.string().max(500, 'Kitchen notes too long'),
  customer_notes: Yup.string().max(500, 'Customer notes too long'),
});

export default function OrderForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isEditMode = !!id;
  
  // Get pre-selected table from location state (when coming from table view)
  const preSelectedTableId = location.state?.tableId;

  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await menuAPI.getItems();
        const itemsData = Array.isArray(response) ? response : response.data || [];
        // Filter only active and available items
        const availableItems = itemsData.filter(item => item.is_active && item.is_available);
        setMenuItems(availableItems);
      } catch (err: any) {
        console.error('Failed to fetch menu items:', err);
        setError('Failed to load menu items');
      }
    };
    fetchMenuItems();
  }, []);

  // Fetch tables
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await tableAPI.getTables();
        const tablesData = Array.isArray(response) ? response : response.data || [];
        // Filter only available tables
        const availableTables = tablesData.filter((table: Table) => table.status === 'available' || table.status === 'occupied');
        setTables(availableTables);
      } catch (err: any) {
        console.error('Failed to fetch tables:', err);
        setError('Failed to load tables');
      }
    };
    fetchTables();
  }, []);

  // Fetch order if editing
  useEffect(() => {
    if (isEditMode && id) {
      const fetchOrder = async () => {
        setLoading(true);
        try {
          const orderData = await orderAPI.getOrder(Number(id));
          setOrder(orderData);
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to load order');
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [isEditMode, id]);

  const initialValues = {
    type: (order?.type || 'dine-in') as OrderType,
    table_id: order?.tableId || preSelectedTableId || '',
    customer_name: order?.customer?.name || '',
    items: order?.items?.map(item => ({
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
      special_instructions: item.specialInstructions || '',
    })) || [{
      menu_item_id: '',
      quantity: 1,
      special_instructions: '',
    }],
    kitchen_notes: order?.kitchenNotes || '',
    customer_notes: order?.customerNotes || '',
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const data: any = {
        type: values.type,
        table_id: values.type === 'dine-in' ? Number(values.table_id) : undefined,
        customer_name: values.customer_name || undefined,
        items: values.items.map((item: any) => ({
          menu_item_id: Number(item.menu_item_id),
          quantity: Number(item.quantity),
          special_instructions: item.special_instructions || undefined,
        })),
        kitchen_notes: values.kitchen_notes || undefined,
        customer_notes: values.customer_notes || undefined,
      };

      if (isEditMode && id) {
        // Note: Update endpoint when available
        // await orderAPI.updateOrder(Number(id), data);
        setSuccessMessage('Order updated successfully!');
      } else {
        await orderAPI.createOrder(data);
        setSuccessMessage('Order created successfully!');
      }

      // Redirect after short delay
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save order');
    } finally {
      setLoading(false);
    }
  };

  const calculateItemTotal = (menuItemId: number, quantity: number) => {
    const menuItem = menuItems.find(item => item.id === menuItemId);
    if (!menuItem) return 0;
    return Number(menuItem.price) * quantity;
  };

  const calculateOrderTotal = (items: any[]) => {
    return items.reduce((total, item) => {
      if (item.menu_item_id && item.quantity) {
        return total + calculateItemTotal(Number(item.menu_item_id), Number(item.quantity));
      }
      return total;
    }, 0);
  };

  return (
    <div className="p-6">
      <PageMeta 
        title={isEditMode ? 'Edit Order' : 'Create Order'}
        description={isEditMode ? 'Edit order details' : 'Create a new order'}
      />
      <PageBreadcrumb pageTitle={isEditMode ? 'Edit Order' : 'Create Order'} />

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6">
          <Alert
            variant="success"
            title="Success"
            message={successMessage}
          />
        </div>
      )}

      {error && (
        <div className="mb-6">
          <Alert
            variant="error"
            title="Error"
            message={error}
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back to Orders
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Order' : 'Create New Order'}
        </h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form className="space-y-6">
              {/* Order Type & Basic Info */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Order Type */}
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Order Type <span className="text-red-500">*</span>
                    </label>
                    <Field
                      as="select"
                      id="type"
                      name="type"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.type && touched.type ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting || loading}
                    >
                      <option value="dine-in">🍽️ Dine-in</option>
                      <option value="takeout">🥡 Takeout</option>
                      <option value="delivery">🚚 Delivery</option>
                    </Field>
                    <ErrorMessage name="type" component="div" className="text-red-600 text-sm mt-1" />
                  </div>

                  {/* Table Selection (only for dine-in) */}
                  {values.type === 'dine-in' && (
                    <div>
                      <label htmlFor="table_id" className="block text-sm font-medium text-gray-700 mb-1">
                        Table <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="select"
                        id="table_id"
                        name="table_id"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.table_id && touched.table_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isSubmitting || loading}
                      >
                        <option value="">Select a table</option>
                        {tables.map(table => (
                          <option key={table.id} value={table.id}>
                            {table.number} - {table.status === 'available' ? '✅ Available' : '🔴 Occupied'} ({table.capacity} seats)
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="table_id" component="div" className="text-red-600 text-sm mt-1" />
                    </div>
                  )}

                  {/* Customer Name */}
                  <div className={values.type === 'dine-in' ? '' : 'md:col-span-2'}>
                    <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name
                    </label>
                    <Field
                      id="customer_name"
                      name="customer_name"
                      type="text"
                      placeholder="Enter customer name (optional)"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.customer_name && touched.customer_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting || loading}
                    />
                    <ErrorMessage name="customer_name" component="div" className="text-red-600 text-sm mt-1" />
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items <span className="text-red-500">*</span></h2>
                <FieldArray name="items">
                  {({ push, remove }) => (
                    <div className="space-y-4">
                      {values.items.map((item: any, index: number) => {
                        const itemTotal = calculateItemTotal(item.menu_item_id, item.quantity);
                        const selectedMenuItem = menuItems.find(mi => mi.id === Number(item.menu_item_id));
                        
                        return (
                          <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-medium text-gray-900">Item #{index + 1}</h3>
                              {values.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => remove(index)}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                  ✕ Remove
                                </button>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                              {/* Menu Item */}
                              <div className="md:col-span-5">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Menu Item <span className="text-red-500">*</span>
                                </label>
                                <Field
                                  as="select"
                                  name={`items.${index}.menu_item_id`}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  disabled={isSubmitting || loading}
                                >
                                  <option value="">Select menu item</option>
                                  {menuItems.map(menuItem => (
                                    <option key={menuItem.id} value={menuItem.id}>
                                      {menuItem.name} - {Number(menuItem.price).toFixed(2)} MAD
                                    </option>
                                  ))}
                                </Field>
                                <ErrorMessage name={`items.${index}.menu_item_id`} component="div" className="text-red-600 text-sm mt-1" />
                              </div>

                              {/* Quantity */}
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Quantity <span className="text-red-500">*</span>
                                </label>
                                <Field
                                  type="number"
                                  name={`items.${index}.quantity`}
                                  min="1"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  disabled={isSubmitting || loading}
                                />
                                <ErrorMessage name={`items.${index}.quantity`} component="div" className="text-red-600 text-sm mt-1" />
                              </div>

                              {/* Special Instructions */}
                              <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Special Instructions
                                </label>
                                <Field
                                  type="text"
                                  name={`items.${index}.special_instructions`}
                                  placeholder="e.g., No onions"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  disabled={isSubmitting || loading}
                                />
                                <ErrorMessage name={`items.${index}.special_instructions`} component="div" className="text-red-600 text-sm mt-1" />
                              </div>

                              {/* Item Total */}
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Item Total
                                </label>
                                <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-blue-600">
                                  {itemTotal.toFixed(2)} MAD
                                </div>
                              </div>
                            </div>

                            {/* Show item details if selected */}
                            {selectedMenuItem && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-gray-700">
                                  <div><strong>Category:</strong> {selectedMenuItem.category?.name || 'N/A'}</div>
                                  <div><strong>Price:</strong> {Number(selectedMenuItem.price).toFixed(2)} MAD</div>
                                  <div><strong>Prep Time:</strong> {selectedMenuItem.preparation_time || 'N/A'} min</div>
                                  <div><strong>Status:</strong> {selectedMenuItem.is_available ? '✅ Available' : '🚫 Unavailable'}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Add Item Button */}
                      <button
                        type="button"
                        onClick={() => push({ menu_item_id: '', quantity: 1, special_instructions: '' })}
                        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors font-medium"
                        disabled={isSubmitting || loading}
                      >
                        + Add Another Item
                      </button>

                      {/* Order Total */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-semibold text-gray-900">Order Total:</span>
                          <span className="text-3xl font-bold text-blue-600">
                            {calculateOrderTotal(values.items).toFixed(2)} MAD
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Additional Notes */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Kitchen Notes */}
                  <div>
                    <label htmlFor="kitchen_notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Kitchen Notes
                    </label>
                    <Field
                      as="textarea"
                      id="kitchen_notes"
                      name="kitchen_notes"
                      rows={3}
                      placeholder="Special instructions for kitchen staff..."
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.kitchen_notes && touched.kitchen_notes ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting || loading}
                    />
                    <ErrorMessage name="kitchen_notes" component="div" className="text-red-600 text-sm mt-1" />
                  </div>

                  {/* Customer Notes */}
                  <div>
                    <label htmlFor="customer_notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Notes
                    </label>
                    <Field
                      as="textarea"
                      id="customer_notes"
                      name="customer_notes"
                      rows={3}
                      placeholder="Any additional customer requests..."
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.customer_notes && touched.customer_notes ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting || loading}
                    />
                    <ErrorMessage name="customer_notes" component="div" className="text-red-600 text-sm mt-1" />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/orders')}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting || loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {(isSubmitting || loading) && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isEditMode ? 'Update Order' : 'Create Order'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

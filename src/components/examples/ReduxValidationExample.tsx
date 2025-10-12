import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector, useAsyncState, useFieldError } from '../store/hooks';

// Example component showing how to use the Redux validation system
interface FormFieldProps {
  label: string;
  field: string;
  slice: keyof import('../store').RootState;
  type?: 'text' | 'email' | 'password' | 'number';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  field,
  slice,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
}) => {
  const dispatch = useAppDispatch();
  const fieldError = useFieldError(slice, field);
  const hasError = !!fieldError;

  // Clear field error when user starts typing
  useEffect(() => {
    if (hasError && value) {
      // You would dispatch a clearFieldError action here
      // dispatch(clearFieldError(field));
    }
  }, [value, hasError, field, dispatch]);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          hasError
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500'
        }`}
      />
      {hasError && (
        <p className="mt-1 text-sm text-red-600">{fieldError}</p>
      )}
    </div>
  );
};

// Example loading state component
interface LoadingStateProps {
  slice: keyof import('../store').RootState;
  children: React.ReactNode;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ slice, children }) => {
  const { isLoading, isProcessing, error } = useAsyncState(slice);

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className={isProcessing ? 'opacity-75 pointer-events-none' : ''}>
      {children}
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

// Example usage component
export const MenuManagementExample: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: menuItems, categories, selectedCategory } = useAppSelector(state => state.menu);
  const { isLoading, isCreating, error, validationErrors } = useAsyncState('menu');

  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
  });

  // Example of fetching data on component mount
  useEffect(() => {
    // dispatch(fetchMenuItems());
    // dispatch(fetchCategories());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await dispatch(createMenuItem({
      //   name: formData.name,
      //   description: formData.description,
      //   price: parseFloat(formData.price),
      //   category_id: parseInt(formData.category_id),
      // })).unwrap();
      
      // Reset form on success
      setFormData({ name: '', description: '', price: '', category_id: '' });
    } catch (error) {
      // Error is already handled by Redux
      console.error('Failed to create menu item:', error);
    }
  };

  return (
    <LoadingState slice="menu">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Menu Management</h1>
        
        {/* Create Menu Item Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Menu Item</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Item Name"
                field="name"
                slice="menu"
                value={formData.name}
                onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                placeholder="Enter item name"
                required
              />
              
              <FormField
                label="Price"
                field="price"
                slice="menu"
                type="number"
                value={formData.price}
                onChange={(value) => setFormData(prev => ({ ...prev, price: value }))}
                placeholder="0.00"
                required
              />
              
              <div className="col-span-full">
                <FormField
                  label="Description"
                  field="description"
                  slice="menu"
                  value={formData.description}
                  onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                  placeholder="Enter item description"
                />
              </div>
              
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.category_id
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {validationErrors.category_id && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.category_id[0]}</p>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={isCreating}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create Menu Item'}
              </button>
            </div>
          </form>
        </div>

        {/* Menu Items List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Menu Items</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {menuItems.map(item => (
              <div key={item.id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                  <p className="text-sm text-gray-500">Category: {item.category.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
                  <div className="flex space-x-2 mt-2">
                    <button className="text-blue-600 hover:text-blue-900 text-sm">Edit</button>
                    <button className="text-red-600 hover:text-red-900 text-sm">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LoadingState>
  );
};

export default MenuManagementExample;
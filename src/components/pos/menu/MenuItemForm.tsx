import React from 'react';
import type { MenuItemFormProps } from '@/types/menu';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import type { MenuItemFormData, Category } from '@/types/menu';
import { MODAL_BACKDROP_CLASS, MODAL_OVERLAY_BASE_CLASS } from '@/utils/modalStyles';

interface MenuItemFormProps {
  initialData?: Partial<MenuItemFormData>;
  isEdit?: boolean;
  onSubmit: (data: MenuItemFormData) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
  categories: Category[];
  serverErrors?: Record<string, string[]>;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Item name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  price: Yup.number()
    .required('Price is required')
    .min(0.01, 'Price must be greater than 0')
    .max(9999.99, 'Price cannot exceed 9999.99 MAD'),
  category_id: Yup.number()
    .required('Please select a category'),
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters'),
  preparation_time: Yup.number()
    .min(1, 'Preparation time must be at least 1 minute')
    .max(480, 'Preparation time cannot exceed 480 minutes')
    .nullable()
    .transform((value: any, originalValue: any) => {
      return originalValue === '' ? null : value;
    }),
  ingredients: Yup.string()
    .max(1000, 'Ingredients list is too long'),
  allergens: Yup.string()
    .max(500, 'Allergens list is too long'),
  is_active: Yup.boolean()
});

const MenuItemForm: React.FC<MenuItemFormProps> = ({
  initialData = {},
  isEdit = false,
  onSubmit,
  onCancel,
  isLoading = false,
  categories,
  serverErrors
}) => {
  const activeCategories = categories.filter(cat => cat.is_active !== false);

  const defaultValues: MenuItemFormData = {
    name: '',
    price: 0,
    category_id: activeCategories.length > 0 ? activeCategories[0]?.id || 1 : 1,
    description: '',
    is_active: true,
    preparation_time: 15,
    ingredients: '',
    allergens: '',
    ...initialData
  };

  return (
    <div className={`${MODAL_OVERLAY_BASE_CLASS} ${MODAL_BACKDROP_CLASS} z-50`}>
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {isEdit ? 'Edit Menu Item' : 'Create New Menu Item'}
          </h3>
          
          <Formik
            initialValues={defaultValues}
            validationSchema={validationSchema}
            onSubmit={async (values: MenuItemFormData) => {
              await onSubmit(values);
            }}
            enableReinitialize
          >
            {({ values, errors, touched, isSubmitting }) => (
              <Form className="space-y-4">
                {/* Server Errors */}
                {serverErrors && Object.keys(serverErrors).length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-sm text-red-800">
                      {Object.entries(serverErrors).map(([field, messages]) => (
                        <div key={field} className="mb-1">
                          <strong>{field}:</strong> {messages.join(', ')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Item Name */}
                  <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name *
                    </label>
                    <Field
                      id="name"
                      name="name"
                      type="text"
                      placeholder="e.g., Grilled Chicken Breast"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.name && touched.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting || isLoading}
                    />
                    <ErrorMessage name="name" component="div" className="text-red-600 text-sm mt-1" />
                  </div>

                  {/* Price */}
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Price (MAD) *
                    </label>
                    <Field
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="9999.99"
                      placeholder="0.00"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.price && touched.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting || isLoading}
                    />
                    <ErrorMessage name="price" component="div" className="text-red-600 text-sm mt-1" />
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <Field
                      as="select"
                      id="category_id"
                      name="category_id"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.category_id && touched.category_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting || isLoading}
                    >
                      <option value="">Select Category</option>
                      {activeCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="category_id" component="div" className="text-red-600 text-sm mt-1" />
                  </div>

                  {/* Preparation Time */}
                  <div>
                    <label htmlFor="preparation_time" className="block text-sm font-medium text-gray-700 mb-1">
                      Prep Time (minutes)
                    </label>
                    <Field
                      id="preparation_time"
                      name="preparation_time"
                      type="number"
                      min="1"
                      max="480"
                      placeholder="15"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.preparation_time && touched.preparation_time ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting || isLoading}
                    />
                    <ErrorMessage name="preparation_time" component="div" className="text-red-600 text-sm mt-1" />
                    <div className="text-xs text-gray-500 mt-1">
                      {values.preparation_time ? `${values.preparation_time} minute${values.preparation_time !== 1 ? 's' : ''}` : 'Not specified'}
                    </div>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center">
                    <Field
                      id="is_active"
                      name="is_active"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isSubmitting || isLoading}
                    />
                    <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                      Active (available for ordering)
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Field
                    as="textarea"
                    id="description"
                    name="description"
                    rows={3}
                    placeholder="Brief description of the item..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                      errors.description && touched.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting || isLoading}
                  />
                  <ErrorMessage name="description" component="div" className="text-red-600 text-sm mt-1" />
                  <div className="text-xs text-gray-500 mt-1">
                    {values.description?.length || 0}/500 characters
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-1">
                    Ingredients (comma separated)
                  </label>
                  <Field
                    as="textarea"
                    id="ingredients"
                    name="ingredients"
                    rows={2}
                    placeholder="e.g., Chicken breast, Olive oil, Herbs, Salt, Pepper"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                      errors.ingredients && touched.ingredients ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting || isLoading}
                  />
                  <ErrorMessage name="ingredients" component="div" className="text-red-600 text-sm mt-1" />
                  <div className="text-xs text-gray-500 mt-1">
                    Separate each ingredient with a comma
                  </div>
                </div>

                {/* Allergens */}
                <div>
                  <label htmlFor="allergens" className="block text-sm font-medium text-gray-700 mb-1">
                    Allergens (comma separated)
                  </label>
                  <Field
                    as="textarea"
                    id="allergens"
                    name="allergens"
                    rows={2}
                    placeholder="e.g., Dairy, Gluten, Nuts, Eggs"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                      errors.allergens && touched.allergens ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting || isLoading}
                  />
                  <ErrorMessage name="allergens" component="div" className="text-red-600 text-sm mt-1" />
                  <div className="text-xs text-gray-500 mt-1">
                    List all allergens present in this item
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting || isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting || isLoading}
                  >
                    {isSubmitting || isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {isEdit ? 'Updating...' : 'Creating...'}
                      </span>
                    ) : (
                      isEdit ? 'Update Item' : 'Create Item'
                    )}
                  </button>
                </div>

                {/* Form Preview */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="text-sm font-medium text-gray-700 mb-2">Preview:</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>🍽️ <strong>{values.name || 'Item Name'}</strong></div>
                    <div>💰 {values.price ? `${values.price} MAD` : '0.00 MAD'}</div>
                    <div>📂 {categories.find(c => c.id === Number(values.category_id))?.name || 'No Category'}</div>
                    <div>⏱️ {values.preparation_time ? `${values.preparation_time} minutes` : 'No prep time'}</div>
                    <div>✅ {values.is_active ? 'Active' : 'Inactive'}</div>
                    {values.description && <div>📝 {values.description}</div>}
                    {values.ingredients && (
                      <div>🥘 {values.ingredients.split(',').length} ingredient{values.ingredients.split(',').length !== 1 ? 's' : ''}</div>
                    )}
                    {values.allergens && (
                      <div>⚠️ {values.allergens.split(',').length} allergen{values.allergens.split(',').length !== 1 ? 's' : ''}</div>
                    )}
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default MenuItemForm;

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
            onSubmit={onSubmit}
          >
            {({ values, errors, touched, isSubmitting }) => (
              <Form className="space-y-6">
                {/* Basic Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name *
                    </label>
                    <Field
                      type="text"
                      name="name"
                      id="name"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.name && touched.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      placeholder="e.g., Classic Burger"
                    />
                    <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-500" />
                  </div>

                  {/* Price */}
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Price (MAD) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">MAD</span>
                      <Field
                        type="number"
                        name="price"
                        id="price"
                        step="0.01"
                        className={`w-full pl-12 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.price && touched.price ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        placeholder="0.00"
                      />
                    </div>
                    <ErrorMessage name="price" component="div" className="mt-1 text-sm text-red-500" />
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <Field
                      as="select"
                      name="category_id"
                      id="category_id"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.category_id && touched.category_id ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                    >
                      <option value="">Select a category</option>
                      {activeCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="category_id" component="div" className="mt-1 text-sm text-red-500" />
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-4">
                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <Field
                      as="textarea"
                      name="description"
                      id="description"
                      rows={3}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.description && touched.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      placeholder="Describe the dish..."
                    />
                    <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-500" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Preparation Time */}
                    <div>
                      <label htmlFor="preparation_time" className="block text-sm font-medium text-gray-700 mb-1">
                        Preparation Time (mins)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">⏱️</span>
                        <Field
                          type="number"
                          name="preparation_time"
                          id="preparation_time"
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.preparation_time && touched.preparation_time ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          placeholder="15"
                        />
                      </div>
                      <ErrorMessage name="preparation_time" component="div" className="mt-1 text-sm text-red-500" />
                    </div>

                    {/* Status Toggle */}
                    <div className="flex items-center h-full pt-6">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <Field type="checkbox" name="is_active" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-700">
                          {values.is_active ? 'Available for ordering' : 'Currently unavailable'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Ingredients */}
                    <div>
                      <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-1">
                        Ingredients
                      </label>
                      <Field
                        as="textarea"
                        name="ingredients"
                        id="ingredients"
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Comma separated list..."
                      />
                      <ErrorMessage name="ingredients" component="div" className="mt-1 text-sm text-red-500" />
                    </div>

                    {/* Allergens */}
                    <div>
                      <label htmlFor="allergens" className="block text-sm font-medium text-gray-700 mb-1">
                        Allergens
                      </label>
                      <Field
                        as="textarea"
                        name="allergens"
                        id="allergens"
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Comma separated list..."
                      />
                      <ErrorMessage name="allergens" component="div" className="mt-1 text-sm text-red-500" />
                    </div>
                  </div>
                </div>

                {serverErrors && Object.keys(serverErrors).length > 0 && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm leading-5 font-medium text-red-800">
                          There were errors with your submission
                        </h3>
                        <div className="mt-2 text-sm leading-5 text-red-700">
                          <ul className="list-disc pl-5 space-y-1">
                            {Object.entries(serverErrors).map(([key, errors]) => (
                              <li key={key}>
                                {key}: {errors.join(', ')}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
        </div >
      </div >
    </div >
  );
};

export default MenuItemForm;

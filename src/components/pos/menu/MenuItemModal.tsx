import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import type { MenuItemModalProps } from '@/types/menu';
import type { FormikProps } from 'formik';
import * as Yup from 'yup';
import type { MenuItem, CreateMenuItemData, Category } from '@/api/menu';
import { MODAL_BACKDROP_CLASS } from '@/utils/modalStyles';

interface FormValues {
  name: string;
  description: string;
  price: number;
  cost: number | string;
  category_id: number;
  preparation_time: number | string;
  is_active: boolean;
  is_available: boolean;
  sort_order: number | string;
}


const validationSchema = Yup.object({
  name: Yup.string()
    .required('Item name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters'),
  price: Yup.number()
    .required('Price is required')
    .min(0.01, 'Price must be greater than 0')
    .max(99999.99, 'Price is too high'),
  cost: Yup.number()
    .min(0, 'Cost cannot be negative')
    .max(99999.99, 'Cost is too high')
    .nullable()
    .transform((value: any, originalValue: any) => {
      return originalValue === '' ? null : value;
    }),
  category_id: Yup.number()
    .required('Category is required'),
  preparation_time: Yup.number()
    .min(1, 'Preparation time must be at least 1 minute')
    .max(480, 'Preparation time cannot exceed 480 minutes')
    .nullable()
    .transform((value: any, originalValue: any) => {
      return originalValue === '' ? null : value;
    }),
  is_active: Yup.boolean(),
  is_available: Yup.boolean(),
  sort_order: Yup.number()
    .min(0, 'Sort order cannot be negative')
    .nullable()
    .transform((value: any, originalValue: any) => {
      return originalValue === '' ? null : value;
    }),
});

const MenuItemModal: React.FC<MenuItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  categories,
  loading = false,
}) => {
  const [submitError, setSubmitError] = useState<string>('');
  const [ingredients, setIngredients] = useState<string>(
    editingItem?.ingredients?.join(', ') || ''
  );
  const [allergens, setAllergens] = useState<string>(
    editingItem?.allergens?.join(', ') || ''
  );

  if (!isOpen) return null;

  const initialValues = {
    name: editingItem?.name || '',
    description: editingItem?.description || '',
    price: editingItem?.price ? Number(editingItem.price) : 0,
    cost: editingItem?.cost ? Number(editingItem.cost) : '',
    category_id: editingItem?.category_id || (categories && categories.length > 0 ? categories[0]?.id : 0) || 0,
    preparation_time: editingItem?.preparation_time || '',
    is_active: editingItem?.is_active ?? true,
    is_available: editingItem?.is_available ?? true,
    sort_order: editingItem?.sort_order ?? '',
  };

  const handleSubmit = async (values: any) => {
    try {
      setSubmitError('');
      const data: CreateMenuItemData = {
        ...values,
        ingredients: ingredients ? ingredients.split(',').map(i => i.trim()).filter(Boolean) : undefined,
        allergens: allergens ? allergens.split(',').map(a => a.trim()).filter(Boolean) : undefined,
      };
      await onSubmit(data);
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to save menu item');
    }
  };

  const activeCategories = categories ? categories.filter(cat => cat.is_active) : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className={`fixed inset-0 transition-opacity ${MODAL_BACKDROP_CLASS}`}
          onClick={onClose}
        ></div>

        {/* Center modal vertically */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal panel */}
        <div className="inline-block w-full max-w-3xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingItem ? 'Edit Menu Item' : 'Create New Menu Item'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, isSubmitting }) => (
              <Form className="px-6 py-4">
                {submitError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                    {submitError}
                  </div>
                )}
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <Field
                      id="name"
                      name="name"
                      type="text"
                      placeholder="e.g., Grilled Chicken Breast"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.name && touched.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting || loading}
                    />
                    <ErrorMessage name="name" component="div" className="text-red-600 text-sm mt-1" />
                    <div className="text-xs text-gray-500 mt-1">
                      {values.name.length}/100 characters
                    </div>
                  </div>

                  {/* Price and Cost */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                        Price (MAD) <span className="text-red-500">*</span>
                      </label>
                      <Field
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.price && touched.price ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isSubmitting || loading}
                      />
                      <ErrorMessage name="price" component="div" className="text-red-600 text-sm mt-1" />
                    </div>

                    <div>
                      <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                        Cost (MAD)
                      </label>
                      <Field
                        id="cost"
                        name="cost"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.cost && touched.cost ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isSubmitting || loading}
                      />
                      <ErrorMessage name="cost" component="div" className="text-red-600 text-sm mt-1" />
                      {values.cost && values.price && Number(values.cost) > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Margin: {((Number(values.price) - Number(values.cost)) / Number(values.price) * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Category and Prep Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="select"
                        id="category_id"
                        name="category_id"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.category_id && touched.category_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isSubmitting || loading}
                      >
                        {activeCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="category_id" component="div" className="text-red-600 text-sm mt-1" />
                      {activeCategories.length === 0 && (
                        <p className="text-xs text-yellow-600 mt-1">
                          Activate at least one category to assign this item.
                        </p>
                      )}
                    </div>

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
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.preparation_time && touched.preparation_time ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isSubmitting || loading}
                      />
                      <ErrorMessage name="preparation_time" component="div" className="text-red-600 text-sm mt-1" />
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
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none ${
                        errors.description && touched.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting || loading}
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
                    <textarea
                      id="ingredients"
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                      rows={2}
                      placeholder="e.g., Chicken breast, Olive oil, Herbs, Salt, Pepper"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      disabled={isSubmitting || loading}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {ingredients ? ingredients.split(',').filter(Boolean).length : 0} ingredient(s)
                    </div>
                  </div>

                  {/* Allergens */}
                  <div>
                    <label htmlFor="allergens" className="block text-sm font-medium text-gray-700 mb-1">
                      Allergens (comma separated)
                    </label>
                    <textarea
                      id="allergens"
                      value={allergens}
                      onChange={(e) => setAllergens(e.target.value)}
                      rows={2}
                      placeholder="e.g., Dairy, Gluten, Nuts, Eggs"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      disabled={isSubmitting || loading}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {allergens ? allergens.split(',').filter(Boolean).length : 0} allergen(s)
                    </div>
                  </div>

                  {/* Checkboxes and Sort Order */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <Field
                        id="is_active"
                        name="is_active"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        disabled={isSubmitting || loading}
                      />
                      <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                        Active
                      </label>
                    </div>

                    <div className="flex items-center">
                      <Field
                        id="is_available"
                        name="is_available"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        disabled={isSubmitting || loading}
                      />
                      <label htmlFor="is_available" className="ml-2 text-sm text-gray-700">
                        Available
                      </label>
                    </div>

                    <div>
                      <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 mb-1">
                        Sort Order
                      </label>
                      <Field
                        id="sort_order"
                        name="sort_order"
                        type="number"
                        min="0"
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={isSubmitting || loading}
                      />
                    </div>
                  </div>

                  {/* Warnings */}
                  {!values.is_active && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                      ⚠️ This item will be hidden from the menu
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 transition-colors disabled:opacity-50"
                    disabled={isSubmitting || loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting || loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {editingItem ? 'Updating...' : 'Creating...'}
                      </span>
                    ) : (
                      editingItem ? 'Update Item' : 'Create Item'
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default MenuItemModal;

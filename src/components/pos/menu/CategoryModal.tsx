import React from 'react';
import type { Category, CreateCategoryData } from '@/api/menu';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import type { CategoryModalProps } from '@/types/menu';
import * as Yup from 'yup';


const categorySchema = Yup.object().shape({
  name: Yup.string()
    .required('Category name is required')
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name must be less than 50 characters'),
  description: Yup.string()
    .max(200, 'Description must be less than 200 characters'),
  is_active: Yup.boolean(),
  sort_order: Yup.number()
    .min(0, 'Sort order must be 0 or greater')
    .integer('Sort order must be an integer'),
});

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  category,
  isSubmitting,
}) => {
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const initialValues: CreateCategoryData = {
    name: category?.name || '',
    description: category?.description || '',
    is_active: category?.is_active ?? true,
    sort_order: category?.sort_order || 0,
  };

  const handleSubmit = async (values: CreateCategoryData, { setSubmitting }: any) => {
    try {
      setSubmitError(null);
      await onSubmit(values);
    } catch (error: any) {
      setSubmitError(error.message || 'An error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {category ? 'Edit Category' : 'Create New Category'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={categorySchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched }) => (
              <Form className="space-y-4">
                {/* Submit Error Display */}
                {submitError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                    <div className="flex items-start gap-2">
                      <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-red-800">Unable to save category</p>
                        <p className="text-sm text-red-700 mt-1">{submitError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Category Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <Field
                    name="name"
                    type="text"
                    placeholder="e.g., Appetizers, Main Courses"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors.name && touched.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-500 text-sm mt-1 flex items-center gap-1"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {values.name.length}/50 characters
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Field
                    name="description"
                    as="textarea"
                    rows={3}
                    disabled={isSubmitting}
                    placeholder="Brief description of this category..."
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors.description && touched.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {(values.description?.length || 0)}/200 characters
                  </div>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort Order
                  </label>
                  <Field
                    name="sort_order"
                    type="number"
                    min="0"
                    placeholder="0"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors.sort_order && touched.sort_order ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <ErrorMessage
                    name="sort_order"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Lower numbers appear first in the menu
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <Field
                    name="is_active"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Active (visible in menu)
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
                  </button>
                </div>

                {/* Form Preview */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                  <div className="text-sm font-medium text-gray-700 mb-2">Preview:</div>
                  <div className="text-sm text-gray-600">
                    <div>📂 <strong>{values.name || 'Category Name'}</strong></div>
                    <div className={values.is_active ? 'text-green-600' : 'text-red-600'}>
                      {values.is_active ? '✅ Active' : '❌ Inactive'}
                    </div>
                    {values.description && (
                      <div>📝 {values.description}</div>
                    )}
                  </div>
                </div>

                {/* Status Info */}
                {!values.is_active && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-xs text-red-800">
                      ⚠️ Inactive categories won't appear in the POS system
                    </div>
                  </div>
                )}
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;

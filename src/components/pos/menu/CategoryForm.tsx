import React from 'react';
import type { CategoryFormProps } from '@/types/menu';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import type { CategoryFormData } from '@/types/menu';
import { MODAL_BACKDROP_CLASS, MODAL_OVERLAY_BASE_CLASS } from '@/utils/modalStyles';

interface CategoryFormProps {
  initialData?: Partial<CategoryFormData>;
  isEdit?: boolean;
  onSubmit: (data: CategoryFormData) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
  serverErrors?: Record<string, string[]>;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Category name is required')
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name must be less than 50 characters'),
  description: Yup.string()
    .max(200, 'Description must be less than 200 characters'),
  is_active: Yup.boolean()
});

const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData = {},
  isEdit = false,
  onSubmit,
  onCancel,
  isLoading = false,
  serverErrors
}) => {
  const defaultValues: CategoryFormData = {
    name: '',
    description: '',
    is_active: true,
    ...initialData
  };

  return (
    <div className={`${MODAL_OVERLAY_BASE_CLASS} ${MODAL_BACKDROP_CLASS} z-50`}>
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {isEdit ? 'Edit Category' : 'Create New Category'}
          </h3>
          
          <Formik
            initialValues={defaultValues}
            validationSchema={validationSchema}
            onSubmit={async (values: CategoryFormData) => {
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
                {/* Category Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <Field
                    id="name"
                    name="name"
                    type="text"
                    placeholder="e.g., Appetizers, Main Courses"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.name && touched.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting || isLoading}
                  />
                  <ErrorMessage name="name" component="div" className="text-red-600 text-sm mt-1" />
                  <div className="text-xs text-gray-500 mt-1">
                    {values.name.length}/50 characters
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
                    placeholder="Brief description of this category..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                      errors.description && touched.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting || isLoading}
                  />
                  <ErrorMessage name="description" component="div" className="text-red-600 text-sm mt-1" />
                  <div className="text-xs text-gray-500 mt-1">
                    {values.description?.length || 0}/200 characters
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
                    Active (visible in menu)
                  </label>
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
                      isEdit ? 'Update Category' : 'Create Category'
                    )}
                  </button>
                </div>

                {/* Form Preview */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                  <div className="text-sm font-medium text-gray-700 mb-2">Preview:</div>
                  <div className="text-sm text-gray-600">
                    <div>📂 <strong>{values.name || 'Category Name'}</strong></div>
                    <div className={values.is_active !== false ? 'text-green-600' : 'text-red-600'}>
                      {values.is_active !== false ? '✅ Active' : '❌ Inactive'}
                    </div>
                    {values.description && (
                      <div>📝 {values.description}</div>
                    )}
                  </div>
                </div>

                {/* Status Info */}
                {values.is_active === false && (
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

export default CategoryForm;

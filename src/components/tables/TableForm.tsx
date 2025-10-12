import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import type { TableFormData, Table } from '../../hooks/useTableManagement';

interface TableFormProps {
  initialData?: Partial<TableFormData>;
  isEdit?: boolean;
  onSubmit: (data: TableFormData) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

const tableValidationSchema = Yup.object({
  name: Yup.string()
    .required('Table name is required')
    .min(2, 'Table name must be at least 2 characters')
    .max(50, 'Table name must be less than 50 characters')
    .trim(),
  capacity: Yup.number()
    .required('Capacity is required')
    .min(1, 'Capacity must be at least 1')
    .max(20, 'Capacity cannot exceed 20')
    .integer('Capacity must be a whole number'),
  shape: Yup.string()
    .required('Shape is required')
    .oneOf(['square', 'round', 'rectangle'], 'Invalid shape selected'),
  description: Yup.string()
    .max(200, 'Description must be less than 200 characters')
    .trim()
});

const TableForm: React.FC<TableFormProps> = ({
  initialData = {},
  isEdit = false,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const defaultValues: TableFormData = {
    name: '',
    capacity: 4,
    shape: 'square',
    description: '',
    ...initialData
  };

  const handleSubmit = async (values: TableFormData, { setSubmitting, setFieldError }: any) => {
    try {
      const success = await onSubmit(values);
      if (success) {
        // Form will be closed by parent component
      } else {
        // Error message will be shown by the hook
        setSubmitting(false);
      }
    } catch (error: any) {
      if (error.field) {
        setFieldError(error.field, error.message);
      }
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {isEdit ? 'Edit Table' : 'Create New Table'}
          </h3>
          
          <Formik
            initialValues={defaultValues}
            validationSchema={tableValidationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, errors, touched, values }) => (
              <Form className="space-y-4">
                {/* Table Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Table Name *
                  </label>
                  <Field
                    id="name"
                    name="name"
                    type="text"
                    placeholder="e.g., Table 1, VIP Table A"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.name && touched.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting || isLoading}
                  />
                  <ErrorMessage name="name" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                {/* Capacity */}
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity (Number of Seats) *
                  </label>
                  <Field
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    max="20"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.capacity && touched.capacity ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting || isLoading}
                  />
                  <ErrorMessage name="capacity" component="div" className="text-red-600 text-sm mt-1" />
                  <div className="text-xs text-gray-500 mt-1">
                    Current: {values.capacity} {values.capacity === 1 ? 'seat' : 'seats'}
                  </div>
                </div>

                {/* Shape */}
                <div>
                  <label htmlFor="shape" className="block text-sm font-medium text-gray-700 mb-1">
                    Table Shape *
                  </label>
                  <Field
                    as="select"
                    id="shape"
                    name="shape"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.shape && touched.shape ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting || isLoading}
                  >
                    <option value="square">⬜ Square</option>
                    <option value="round">⭕ Round</option>
                    <option value="rectangle">▭ Rectangle</option>
                  </Field>
                  <ErrorMessage name="shape" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <Field
                    as="textarea"
                    id="description"
                    name="description"
                    rows={3}
                    placeholder="e.g., Near window, VIP section, etc."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                      errors.description && touched.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting || isLoading}
                  />
                  <ErrorMessage name="description" component="div" className="text-red-600 text-sm mt-1" />
                  <div className="text-xs text-gray-500 mt-1">
                    {values.description ? values.description.length : 0}/200 characters
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
                    disabled={isSubmitting || isLoading || Object.keys(errors).length > 0}
                  >
                    {isSubmitting || isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {isEdit ? 'Updating...' : 'Creating...'}
                      </span>
                    ) : (
                      isEdit ? 'Update Table' : 'Create Table'
                    )}
                  </button>
                </div>

                {/* Form Preview */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                  <div className="text-sm font-medium text-gray-700 mb-2">Preview:</div>
                  <div className="text-sm text-gray-600">
                    <div>📋 <strong>{values.name || 'Table Name'}</strong></div>
                    <div>👥 {values.capacity} seat{values.capacity !== 1 ? 's' : ''}</div>
                    <div>🔲 {values.shape} shape</div>
                    {values.description && (
                      <div>📝 {values.description}</div>
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

export default TableForm;
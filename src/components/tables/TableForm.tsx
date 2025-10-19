import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import type { Table, TableFormData, TableStatus, TableShape } from '../../types/table';
import Button from '../ui/button/Button';

interface TableFormProps {
  table?: Table;
  onSubmit: (data: TableFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  serverErrors?: Record<string, string[]>;
}

const tableValidationSchema = Yup.object().shape({
  number: Yup.string()
    .required('Table number is required')
    .min(1, 'Table number must be at least 1 character')
    .max(10, 'Table number must be at most 10 characters'),
  capacity: Yup.number()
    .required('Capacity is required')
    .min(1, 'Capacity must be at least 1')
    .max(20, 'Capacity must be at most 20'),
  shape: Yup.string()
    .oneOf(['round', 'square', 'rectangular', 'rectangle'], 'Invalid table shape')
    .required('Shape is required'),
  status: Yup.string()
    .oneOf(['available', 'occupied', 'reserved', 'cleaning', 'out-of-order', 'maintenance'], 'Invalid status')
    .required('Status is required'),
  section: Yup.string()
    .required('Section is required')
    .min(1, 'Section name must be at least 1 character')
    .max(50, 'Section name must be at most 50 characters'),
  floor: Yup.number()
    .required('Floor is required')
    .min(1, 'Floor must be at least 1')
    .max(50, 'Floor must be at most 50'),
  description: Yup.string()
    .max(200, 'Description must be at most 200 characters'),
  features: Yup.array()
    .of(Yup.string())
    .default([])
});

const TableForm: React.FC<TableFormProps> = ({ 
  table, 
  onSubmit, 
  onCancel,
  isLoading = false,
  serverErrors = {} 
}) => {
  const initialValues: TableFormData = {
    number: table?.number || '',
    capacity: table?.capacity || 4,
    shape: table?.shape || 'rectangular',
    status: table?.status || 'available',
    section: table?.location.section || '',
    floor: table?.location.floor || 1,
    description: table?.description || '',
    features: table?.features || []
  };

  const statusOptions: { value: TableStatus; label: string; color: string }[] = [
    { value: 'available', label: 'Available', color: 'text-green-600' },
    { value: 'occupied', label: 'Occupied', color: 'text-red-600' },
    { value: 'reserved', label: 'Reserved', color: 'text-yellow-600' },
    { value: 'cleaning', label: 'Cleaning', color: 'text-blue-600' },
    { value: 'out-of-order', label: 'Out of Order', color: 'text-gray-600' },
    { value: 'maintenance', label: 'Maintenance', color: 'text-purple-600' }
  ];

  const shapeOptions: { value: TableShape; label: string; icon: string }[] = [
    { value: 'round', label: 'Round', icon: '⭕' },
    { value: 'square', label: 'Square', icon: '⬜' },
    { value: 'rectangular', label: 'Rectangular', icon: '▭' },
    { value: 'rectangle', label: 'Rectangle', icon: '▭' }
  ];

  const availableFeatures = [
    'Window View',
    'Private Booth',
    'High Chair Available',
    'Wheelchair Accessible',
    'Power Outlet',
    'Quiet Area',
    'Near Kitchen',
    'Bar Seating',
    'Outdoor Seating',
    'VIP Section'
  ];

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg dark:bg-gray-900">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {table ? 'Edit Table' : 'Create New Table'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          {table ? 'Update table information' : 'Add a new table to your restaurant'}
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={tableValidationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, errors, touched }) => (
          <Form className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Table Number *
                </label>
                <Field
                  id="number"
                  name="number"
                  type="text"
                  placeholder="e.g., T-01, A1, Table 1"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                />
                <ErrorMessage name="number" component="p" className="mt-1 text-sm text-red-600" />
                {serverErrors.number && (
                  <p className="mt-1 text-sm text-red-600">{serverErrors.number[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Capacity *
                </label>
                <Field
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  max="20"
                  placeholder="Number of seats"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                />
                <ErrorMessage name="capacity" component="p" className="mt-1 text-sm text-red-600" />
                <p className="mt-1 text-xs text-gray-500">
                  Current: {values.capacity} {values.capacity === 1 ? 'seat' : 'seats'}
                </p>
                {serverErrors.capacity && (
                  <p className="mt-1 text-sm text-red-600">{serverErrors.capacity[0]}</p>
                )}
              </div>
            </div>

            {/* Shape and Status */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="shape" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Table Shape *
                </label>
                <Field
                  as="select"
                  id="shape"
                  name="shape"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {shapeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="shape" component="p" className="mt-1 text-sm text-red-600" />
                {serverErrors.shape && (
                  <p className="mt-1 text-sm text-red-600">{serverErrors.shape[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status *
                </label>
                <Field
                  as="select"
                  id="status"
                  name="status"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="status" component="p" className="mt-1 text-sm text-red-600" />
                {serverErrors.status && (
                  <p className="mt-1 text-sm text-red-600">{serverErrors.status[0]}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="section" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Section *
                </label>
                <Field
                  id="section"
                  name="section"
                  type="text"
                  placeholder="e.g., Main Hall, Patio, VIP"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                />
                <ErrorMessage name="section" component="p" className="mt-1 text-sm text-red-600" />
                {serverErrors.section && (
                  <p className="mt-1 text-sm text-red-600">{serverErrors.section[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="floor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Floor *
                </label>
                <Field
                  id="floor"
                  name="floor"
                  type="number"
                  min="1"
                  max="50"
                  placeholder="Floor number"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                />
                <ErrorMessage name="floor" component="p" className="mt-1 text-sm text-red-600" />
                {serverErrors.floor && (
                  <p className="mt-1 text-sm text-red-600">{serverErrors.floor[0]}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <Field
                as="textarea"
                id="description"
                name="description"
                rows={3}
                placeholder="Additional details about this table..."
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
              />
              <ErrorMessage name="description" component="p" className="mt-1 text-sm text-red-600" />
              <p className="mt-1 text-xs text-gray-500">
                {values.description ? values.description.length : 0}/200 characters
              </p>
              {serverErrors.description && (
                <p className="mt-1 text-sm text-red-600">{serverErrors.description[0]}</p>
              )}
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Table Features
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {availableFeatures.map(feature => (
                  <label key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={values.features.includes(feature)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFieldValue('features', [...values.features, feature]);
                        } else {
                          setFieldValue('features', values.features.filter(f => f !== feature));
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  </label>
                ))}
              </div>
              {serverErrors.features && (
                <p className="mt-1 text-sm text-red-600">{serverErrors.features[0]}</p>
              )}
            </div>

            {/* Preview */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>📋 <strong>{values.number || 'Table Number'}</strong></div>
                <div>👥 {values.capacity} seat{values.capacity !== 1 ? 's' : ''}</div>
                <div>🔲 {values.shape} shape</div>
                <div>📍 Section: {values.section || 'Not specified'}, Floor: {values.floor}</div>
                <div>🏷️ Status: <span className={statusOptions.find(opt => opt.value === values.status)?.color}>
                  {statusOptions.find(opt => opt.value === values.status)?.label}
                </span></div>
                {values.description && <div>📝 {values.description}</div>}
                {values.features.length > 0 && (
                  <div>✨ Features: {values.features.join(', ')}</div>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {table ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  table ? 'Update Table' : 'Create Table'
                )}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default TableForm;
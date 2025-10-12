import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import type { StaffFormData, StaffRole } from '../../types/staff';

interface StaffFormProps {
  initialValues?: StaffFormData;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (values: StaffFormData) => Promise<void> | void;
  serverErrors?: Record<string, string[]>;
}

const roles: StaffRole[] = ['manager', 'cashier', 'waiter', 'kitchen'];

const StaffSchema = Yup.object().shape({
  first_name: Yup.string().trim().required('First name is required'),
  last_name: Yup.string().trim().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().trim().optional(),
  role: Yup.mixed<StaffRole>().oneOf(roles).required('Role is required'),
  salary: Yup.number().min(0, 'Salary must be >= 0').required('Salary is required'),
  hireDate: Yup.string().required('Hire date is required'),
  password: Yup.string().min(6, 'Min 6 characters').optional(),
  employee_id: Yup.string().optional(),
});

const defaultValues: StaffFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  role: 'waiter',
  salary: 3000,
  hireDate: new Date().toISOString().split('T')[0],
  password: 'password123',
  employee_id: '',
};

export default function StaffForm({
  initialValues = defaultValues,
  loading,
  onCancel,
  onSubmit,
  serverErrors,
}: StaffFormProps) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={StaffSchema}
      onSubmit={async (values, { setSubmitting }) => {
        await onSubmit(values);
        setSubmitting(false);
      }}
    >
      {({ isSubmitting, values }) => (
        <Form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
            <Field
              name="employee_id"
              type="text"
              placeholder="Will be auto-generated if empty"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <ErrorMessage name="employee_id" component="div" className="text-red-500 text-xs mt-1" />
            {serverErrors?.employee_id && (
              <p className="text-red-500 text-xs mt-1">{serverErrors.employee_id[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <Field
                name="first_name"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <ErrorMessage name="first_name" component="div" className="text-red-500 text-xs mt-1" />
              {serverErrors?.first_name && (
                <p className="text-red-500 text-xs mt-1">{serverErrors.first_name[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <Field
                name="last_name"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <ErrorMessage name="last_name" component="div" className="text-red-500 text-xs mt-1" />
              {serverErrors?.last_name && (
                <p className="text-red-500 text-xs mt-1">{serverErrors.last_name[0]}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <Field
              name="email"
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
            {serverErrors?.email && (
              <p className="text-red-500 text-xs mt-1">{serverErrors.email[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <Field
              name="phone"
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <ErrorMessage name="phone" component="div" className="text-red-500 text-xs mt-1" />
            {serverErrors?.phone && (
              <p className="text-red-500 text-xs mt-1">{serverErrors.phone[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
            <Field
              as="select"
              name="role"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {roles.map((r) => (
                <option value={r} key={r}>
                  {r}
                </option>
              ))}
            </Field>
            <ErrorMessage name="role" component="div" className="text-red-500 text-xs mt-1" />
            {serverErrors?.role && (
              <p className="text-red-500 text-xs mt-1">{serverErrors.role[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary (MAD)</label>
            <Field
              name="salary"
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <ErrorMessage name="salary" component="div" className="text-red-500 text-xs mt-1" />
            {serverErrors?.hourly_rate && (
              <p className="text-red-500 text-xs mt-1">{serverErrors.hourly_rate[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
            <Field
              name="hireDate"
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <ErrorMessage name="hireDate" component="div" className="text-red-500 text-xs mt-1" />
            {serverErrors?.hire_date && (
              <p className="text-red-500 text-xs mt-1">{serverErrors.hire_date[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Field
              name="password"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
            {serverErrors?.password && (
              <p className="text-red-500 text-xs mt-1">{serverErrors.password[0]}</p>
            )}
          </div>

          {serverErrors?.user_id && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">
                <strong>User ID Error:</strong> {serverErrors.user_id[0]}
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
              disabled={loading || isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              disabled={loading || isSubmitting}
            >
              {loading || isSubmitting ? 'Saving...' : 'Add Staff'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}


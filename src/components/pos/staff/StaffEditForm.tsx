import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import type { StaffFormData, StaffRole, StaffMember } from '@/types/staff';

interface StaffEditFormProps {
  member: StaffMember;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (values: Partial<StaffFormData>) => Promise<void> | void;
  serverErrors?: Record<string, string[]>;
}

const roles: StaffRole[] = ['manager', 'cashier', 'waiter', 'kitchen'];

const StaffEditSchema = Yup.object().shape({
  first_name: Yup.string().trim().required('First name is required'),
  last_name: Yup.string().trim().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().trim().optional(),
  role: Yup.mixed<StaffRole>().oneOf(roles).required('Role is required'),
  salary: Yup.number().min(0, 'Salary must be >= 0').required('Salary is required'),
  hireDate: Yup.string().required('Hire date is required'),
  password: Yup.string().min(6, 'Min 6 characters').optional(),
});

export default function StaffEditForm({
  member,
  loading,
  onCancel,
  onSubmit,
  serverErrors,
}: StaffEditFormProps) {
  // Convert member data to form format
  const nameParts = member.name.split(' ');
  const initialValues: Partial<StaffFormData> = {
    first_name: nameParts[0] || '',
    last_name: nameParts.slice(1).join(' ') || '',
    email: member.email,
    phone: member.phone,
    role: member.role,
    salary: member.salary,
    hireDate: member.hireDate,
    password: '', // Leave empty for updates
    employee_id: '', // Not typically editable
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={StaffEditSchema}
      onSubmit={async (values, { setSubmitting }) => {
        await onSubmit(values);
        setSubmitting(false);
      }}
    >
      {({ isSubmitting, values }) => (
        <Form className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <Field
                name="first_name"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {roles.map((r) => (
                <option value={r} key={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <ErrorMessage name="hireDate" component="div" className="text-red-500 text-xs mt-1" />
            {serverErrors?.hire_date && (
              <p className="text-red-500 text-xs mt-1">{serverErrors.hire_date[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password (leave empty to keep current)
            </label>
            <Field
              name="password"
              type="password"
              placeholder="Enter new password or leave empty"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
            {serverErrors?.password && (
              <p className="text-red-500 text-xs mt-1">{serverErrors.password[0]}</p>
            )}
          </div>

          {/* Current member info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Current Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {member.status}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Member since:</span>
                <span className="ml-2 font-medium">{member.hireDate}</span>
              </div>
              <div>
                <span className="text-gray-600">Rating:</span>
                <span className="ml-2 font-medium">⭐ {member.performance.customerRating.toFixed(1)}</span>
              </div>
              <div>
                <span className="text-gray-600">Orders completed:</span>
                <span className="ml-2 font-medium">{member.performance.ordersCompleted}</span>
              </div>
            </div>
          </div>

          {serverErrors?.user_id && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">
                <strong>Error:</strong> {serverErrors.user_id[0]}
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              disabled={loading || isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              disabled={loading || isSubmitting}
            >
              {loading || isSubmitting ? 'Updating...' : 'Update Staff Member'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
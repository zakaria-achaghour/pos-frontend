import { dynamicT } from '@/i18n/dynamic';
import { useId, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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

export default function StaffEditForm({
  member,
  loading,
  onCancel,
  onSubmit,
  serverErrors,
}: StaffEditFormProps) {
  const { t } = useTranslation();
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;
  const StaffEditSchema = useMemo(() => Yup.object().shape({
    first_name: Yup.string().trim().required(t('staffAdmin.validation.firstNameRequired')),
    last_name: Yup.string().trim().required(t('staffAdmin.validation.lastNameRequired')),
    email: Yup.string().email(t('staffAdmin.validation.emailInvalid')).required(t('staffAdmin.validation.emailRequired')),
    phone: Yup.string().trim().optional(),
    role: Yup.mixed<StaffRole>().oneOf(roles).required(t('staffAdmin.validation.roleRequired')),
    salary: Yup.number().min(0, t('staffAdmin.validation.salaryMin')).required(t('staffAdmin.validation.salaryRequired')),
    hireDate: Yup.string().required(t('staffAdmin.validation.hireDateRequired')),
    password: Yup.string().min(6, t('staffAdmin.validation.passwordMin')).optional(),
  }), [t]);

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
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor={fid('first_name')} className="block text-sm font-medium text-gray-700 mb-1">{t('staffAdmin.form.firstName')}</label>
              <Field id={fid('first_name')}
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
              <label htmlFor={fid('last_name')} className="block text-sm font-medium text-gray-700 mb-1">{t('staffAdmin.form.lastName')}</label>
              <Field id={fid('last_name')}
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
            <label htmlFor={fid('email')} className="block text-sm font-medium text-gray-700 mb-1">{t('staffAdmin.form.email')}</label>
            <Field id={fid('email')}
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
            <label htmlFor={fid('phone')} className="block text-sm font-medium text-gray-700 mb-1">{t('staffAdmin.form.phone')}</label>
            <Field id={fid('phone')}
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
            <label htmlFor={fid('role')} className="block text-sm font-medium text-gray-700 mb-1">{t('staffAdmin.form.position')}</label>
            <Field id={fid('role')}
as="select"
              name="role"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {roles.map((r) => (
                <option value={r} key={r}>
                  {dynamicT(`roles.${r}`)}
                </option>
              ))}
            </Field>
            <ErrorMessage name="role" component="div" className="text-red-500 text-xs mt-1" />
            {serverErrors?.role && (
              <p className="text-red-500 text-xs mt-1">{serverErrors.role[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor={fid('salary')} className="block text-sm font-medium text-gray-700 mb-1">{t('staffAdmin.form.salary')}</label>
            <Field id={fid('salary')}
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
            <label htmlFor={fid('hireDate')} className="block text-sm font-medium text-gray-700 mb-1">{t('staffAdmin.form.hireDate')}</label>
            <Field id={fid('hireDate')}
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
            <label htmlFor={fid('password')} className="block text-sm font-medium text-gray-700 mb-1">
              {t('staffAdmin.form.newPassword')}
            </label>
            <Field
              id={fid('password')}
              name="password"
              type="password"
              placeholder={t('staffAdmin.form.newPasswordPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
            {serverErrors?.password && (
              <p className="text-red-500 text-xs mt-1">{serverErrors.password[0]}</p>
            )}
          </div>

          {/* Current member info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">{t('staffAdmin.form.currentInfo')}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">{t('staffAdmin.details.status')}</span>
                <span className={`ms-2 px-2 py-1 rounded text-xs ${
                  member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {dynamicT(`staffAdmin.status.${member.status}`, { defaultValue: member.status })}
                </span>
              </div>
              <div>
                <span className="text-gray-600">{t('staffAdmin.form.memberSince')}</span>
                <span className="ms-2 font-medium">{member.hireDate}</span>
              </div>
              <div>
                <span className="text-gray-600">{t('staffAdmin.card.rating')}</span>
                <span className="ms-2 font-medium">⭐ {member.performance.customerRating.toFixed(1)}</span>
              </div>
              <div>
                <span className="text-gray-600">{t('staffAdmin.form.ordersCompleted')}</span>
                <span className="ms-2 font-medium">{member.performance.ordersCompleted}</span>
              </div>
            </div>
          </div>

          {serverErrors?.user_id && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">
                <strong>{t('staffAdmin.errorTitle')}:</strong> {serverErrors.user_id[0]}
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
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              disabled={loading || isSubmitting}
            >
              {loading || isSubmitting ? t('staffAdmin.form.updating') : t('staffAdmin.form.submitUpdate')}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

import { useId, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import type { StaffFormProps } from '@/types/staff';
import type { StaffFormData, StaffRole } from '@/types/staff';


const roles: StaffRole[] = ['manager', 'cashier', 'waiter', 'kitchen'];

const defaultValues: StaffFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  role: 'waiter',
  salary: 3000,
  hireDate: new Date().toISOString().slice(0, 10),
  password: 'password123',
  employee_id: '',
};

export default function StaffForm({
  initialValues,
  loading,
  onCancel,
  onSubmit,
  serverErrors,
  availableRoles,
}: StaffFormProps) {
  const { t } = useTranslation();
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;
  const StaffSchema = useMemo(() => Yup.object().shape({
    first_name: Yup.string().trim().required(t('staffAdmin.validation.firstNameRequired')),
    last_name: Yup.string().trim().required(t('staffAdmin.validation.lastNameRequired')),
    email: Yup.string().email(t('staffAdmin.validation.emailInvalid')).required(t('staffAdmin.validation.emailRequired')),
    phone: Yup.string().trim().optional(),
    role: Yup.mixed<StaffRole>().oneOf(roles).required(t('staffAdmin.validation.roleRequired')),
    salary: Yup.number().min(0, t('staffAdmin.validation.salaryMin')).required(t('staffAdmin.validation.salaryRequired')),
    hireDate: Yup.string().required(t('staffAdmin.validation.hireDateRequired')),
    password: Yup.string().min(6, t('staffAdmin.validation.passwordMin')).optional(),
    employee_id: Yup.string().optional(),
  }), [t]);

  // Use API roles if available, otherwise fall back to hardcoded roles
  const roleOptions = availableRoles && availableRoles.length > 0 
    ? availableRoles 
    : roles.map((r) => ({ name: r, label: t(`roles.${r}`) }));

  const startValues: StaffFormData = { ...defaultValues, ...initialValues };

  return (
    <Formik
      initialValues={startValues}
      validationSchema={StaffSchema}
      onSubmit={async (values, { setSubmitting }) => {
        await onSubmit(values);
        setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          <div>
            <label htmlFor={fid('employee_id')} className="block text-sm font-medium text-gray-700 mb-1">{t('staffAdmin.form.employeeId')}</label>
            <Field id={fid('employee_id')}
name="employee_id"
              type="text"
              placeholder={t('staffAdmin.form.employeeIdPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <ErrorMessage name="employee_id" component="div" className="text-red-500 text-xs mt-1" />
            {serverErrors?.employee_id && (
              <p className="text-red-500 text-xs mt-1">{serverErrors.employee_id[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor={fid('first_name')} className="block text-sm font-medium text-gray-700 mb-1">{t('staffAdmin.form.firstName')}</label>
              <Field id={fid('first_name')}
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
              <label htmlFor={fid('last_name')} className="block text-sm font-medium text-gray-700 mb-1">{t('staffAdmin.form.lastName')}</label>
              <Field id={fid('last_name')}
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
            <label htmlFor={fid('email')} className="block text-sm font-medium text-gray-700 mb-1">{t('staffAdmin.form.email')}</label>
            <Field id={fid('email')}
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
            <label htmlFor={fid('phone')} className="block text-sm font-medium text-gray-700 mb-1">{t('staffAdmin.form.phone')}</label>
            <Field id={fid('phone')}
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
            <label htmlFor={fid('role')} className="block text-sm font-medium text-gray-700 mb-1">{t('staffAdmin.form.position')}</label>
            <Field id={fid('role')}
as="select"
              name="role"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {roleOptions.map((r) => (
                <option value={r.name} key={r.name}>
                  {t(`roles.${r.name}`, { defaultValue: r.label })}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <ErrorMessage name="hireDate" component="div" className="text-red-500 text-xs mt-1" />
            {serverErrors?.hire_date && (
              <p className="text-red-500 text-xs mt-1">{serverErrors.hire_date[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor={fid('password')} className="block text-sm font-medium text-gray-700 mb-1">{t('staffAdmin.form.password')}</label>
            <Field id={fid('password')}
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
                <strong>{t('staffAdmin.form.userIdError')}</strong> {serverErrors.user_id[0]}
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
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              disabled={loading || isSubmitting}
            >
              {loading || isSubmitting ? t('staffAdmin.form.saving') : t('staffAdmin.form.submitAdd')}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}


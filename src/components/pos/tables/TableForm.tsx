import React, { useId, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TableFormProps } from '@/types/table';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import type { TableFormData, TableStatus, TableShape } from '@/types/table';
import Button from '@/components/ui/button/Button';
import { tableStatusLabel, tableStatusStyle } from './tableStatus';

const TableForm: React.FC<TableFormProps> = ({ 
  table, 
  onSubmit, 
  onCancel,
  isLoading = false,
  serverErrors = {} 
}) => {
  const { t } = useTranslation();
  const formId = useId();
  const fid = (name: string) => `${formId}-${name}`;

  const tableValidationSchema = useMemo(
    () =>
      Yup.object().shape({
        number: Yup.string()
          .required(t('tableAdmin.form.validation.numberRequired'))
          .min(1, t('tableAdmin.form.validation.numberMin', { count: 1 }))
          .max(10, t('tableAdmin.form.validation.numberMax', { count: 10 })),
        capacity: Yup.number()
          .required(t('tableAdmin.form.validation.capacityRequired'))
          .min(1, t('tableAdmin.form.validation.capacityMin', { count: 1 }))
          .max(20, t('tableAdmin.form.validation.capacityMax', { count: 20 })),
        shape: Yup.string()
          .oneOf(['round', 'square', 'rectangular', 'rectangle'], t('tableAdmin.form.validation.shapeInvalid'))
          .required(t('tableAdmin.form.validation.shapeRequired')),
        status: Yup.string()
          .oneOf(
            ['available', 'occupied', 'reserved', 'cleaning', 'out-of-order', 'maintenance'],
            t('tableAdmin.form.validation.statusInvalid')
          )
          .required(t('tableAdmin.form.validation.statusRequired')),
        section: Yup.string()
          .required(t('tableAdmin.form.validation.sectionRequired'))
          .min(1, t('tableAdmin.form.validation.sectionMin', { count: 1 }))
          .max(50, t('tableAdmin.form.validation.sectionMax', { count: 50 })),
        floor: Yup.number()
          .required(t('tableAdmin.form.validation.floorRequired'))
          .min(1, t('tableAdmin.form.validation.floorMin', { count: 1 }))
          .max(50, t('tableAdmin.form.validation.floorMax', { count: 50 })),
        description: Yup.string().max(200, t('tableAdmin.form.validation.descriptionMax', { count: 200 })),
        features: Yup.array().of(Yup.string()).default([]),
      }),
    [t]
  );

  const initialValues: TableFormData = {
    number: table?.number || '',
    capacity: table?.capacity || 4,
    shape: table?.shape || 'rectangular',
    status: table?.status || 'available',
    section: table?.location?.section || '',
    floor: table?.location?.floor || 1,
    description: table?.description || '',
    features: table?.features || []
  };

  const statusValues: TableStatus[] = ['available', 'occupied', 'reserved', 'cleaning', 'out-of-order', 'maintenance'];
  const statusOptions = statusValues.map((value) => ({
    value,
    label: tableStatusLabel(t, value),
    color: tableStatusStyle(value).text,
  }));

  const shapeOptions: { value: TableShape; label: string; icon: string }[] = [
    { value: 'round', label: t('tableAdmin.shape.round'), icon: '⭕' },
    { value: 'square', label: t('tableAdmin.shape.square'), icon: '⬜' },
    { value: 'rectangular', label: t('tableAdmin.shape.rectangular'), icon: '▭' },
    { value: 'rectangle', label: t('tableAdmin.shape.rectangle'), icon: '▭' },
  ];

  // The English strings are the stored values; only the labels are translated.
  const availableFeatures: { value: string; label: string }[] = [
    { value: 'Window View', label: t('tableAdmin.features.windowView') },
    { value: 'Private Booth', label: t('tableAdmin.features.privateBooth') },
    { value: 'High Chair Available', label: t('tableAdmin.features.highChair') },
    { value: 'Wheelchair Accessible', label: t('tableAdmin.features.wheelchair') },
    { value: 'Power Outlet', label: t('tableAdmin.features.powerOutlet') },
    { value: 'Quiet Area', label: t('tableAdmin.features.quietArea') },
    { value: 'Near Kitchen', label: t('tableAdmin.features.nearKitchen') },
    { value: 'Bar Seating', label: t('tableAdmin.features.barSeating') },
    { value: 'Outdoor Seating', label: t('tableAdmin.features.outdoorSeating') },
    { value: 'VIP Section', label: t('tableAdmin.features.vipSection') },
  ];

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg dark:bg-gray-900">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {table ? t('tableAdmin.form.editTitle') : t('tableAdmin.form.createTitle')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          {table ? t('tableAdmin.form.editSubtitle') : t('tableAdmin.form.createSubtitle')}
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={tableValidationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue }) => (
          <Form className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor={fid('number')} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tableAdmin.form.number')}
                </label>
                <Field
                  id={fid('number')}
                  name="number"
                  type="text"
                  placeholder={t('tableAdmin.form.numberPlaceholder')}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                />
                <ErrorMessage name="number" component="p" className="mt-1 text-sm text-red-600" />
                {serverErrors.number && (
                  <p className="mt-1 text-sm text-red-600">{serverErrors.number[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor={fid('capacity')} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tableAdmin.form.capacity')}
                </label>
                <Field
                  id={fid('capacity')}
                  name="capacity"
                  type="number"
                  min="1"
                  max="20"
                  placeholder={t('tableAdmin.form.capacityPlaceholder')}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                />
                <ErrorMessage name="capacity" component="p" className="mt-1 text-sm text-red-600" />
                <p className="mt-1 text-xs text-gray-500">
                  {t('tableAdmin.form.currentCapacity', { count: Number(values.capacity) || 0 })}
                </p>
                {serverErrors.capacity && (
                  <p className="mt-1 text-sm text-red-600">{serverErrors.capacity[0]}</p>
                )}
              </div>
            </div>

            {/* Shape and Status */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor={fid('shape')} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tableAdmin.form.shape')}
                </label>
                <Field
                  as="select"
                  id={fid('shape')}
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
                <label htmlFor={fid('status')} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tableAdmin.form.status')}
                </label>
                <Field
                  as="select"
                  id={fid('status')}
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
                <label htmlFor={fid('section')} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tableAdmin.form.section')}
                </label>
                <Field
                  id={fid('section')}
                  name="section"
                  type="text"
                  placeholder={t('tableAdmin.form.sectionPlaceholder')}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                />
                <ErrorMessage name="section" component="p" className="mt-1 text-sm text-red-600" />
                {serverErrors.section && (
                  <p className="mt-1 text-sm text-red-600">{serverErrors.section[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor={fid('floor')} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tableAdmin.form.floor')}
                </label>
                <Field
                  id={fid('floor')}
                  name="floor"
                  type="number"
                  min="1"
                  max="50"
                  placeholder={t('tableAdmin.form.floorPlaceholder')}
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
              <label htmlFor={fid('description')} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tableAdmin.form.description')}
              </label>
              <Field
                as="textarea"
                id={fid('description')}
                name="description"
                rows={3}
                placeholder={t('tableAdmin.form.descriptionPlaceholder')}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
              />
              <ErrorMessage name="description" component="p" className="mt-1 text-sm text-red-600" />
              <p className="mt-1 text-xs text-gray-500">
                {t('tableAdmin.form.charCount', { current: values.description ? values.description.length : 0, max: 200 })}
              </p>
              {serverErrors.description && (
                <p className="mt-1 text-sm text-red-600">{serverErrors.description[0]}</p>
              )}
            </div>

            {/* Features */}
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('tableAdmin.form.features')}
              </legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {availableFeatures.map(({ value: feature, label: featureLabel }) => (
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
                    <span className="ms-2 text-sm text-gray-700 dark:text-gray-300">{featureLabel}</span>
                  </label>
                ))}
              </div>
              {serverErrors.features && (
                <p className="mt-1 text-sm text-red-600">{serverErrors.features[0]}</p>
              )}
            </fieldset>

            {/* Preview */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tableAdmin.form.preview')}</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>📋 <strong>{values.number || t('tableAdmin.form.previewNumber')}</strong></div>
                <div>👥 {t('tables.seats', { count: Number(values.capacity) || 0 })}</div>
                <div>🔲 {t('tableAdmin.form.previewShape', { shape: shapeOptions.find(opt => opt.value === values.shape)?.label ?? values.shape })}</div>
                <div>📍 {t('tableAdmin.form.previewLocation', { section: values.section || t('tableAdmin.form.notSpecified'), floor: values.floor })}</div>
                <div>🏷️ {t('tableAdmin.form.previewStatus')} <span className={statusOptions.find(opt => opt.value === values.status)?.color}>
                  {statusOptions.find(opt => opt.value === values.status)?.label}
                </span></div>
                {values.description && <div>📝 {values.description}</div>}
                {values.features.length > 0 && (
                  <div>✨ {t('tableAdmin.form.previewFeatures', { features: values.features.map(f => availableFeatures.find(a => a.value === f)?.label ?? f).join(', ') })}</div>
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
                  {t('common.cancel')}
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg aria-hidden="true" className="animate-spin -ms-1 me-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {table ? t('tableAdmin.form.updating') : t('tableAdmin.form.creating')}
                  </>
                ) : (
                  table ? t('tableAdmin.form.update') : t('tableAdmin.form.create')
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
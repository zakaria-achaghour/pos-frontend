import React from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateCategoryData } from '@/types/menu';
import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from 'formik';
import type { CategoryModalProps } from '@/types/menu';
import * as Yup from 'yup';
import { errorMessage } from '@/lib/errors';
import { Button, Modal } from '@/components/kit';

const NAME_MAX = 50;
const DESCRIPTION_MAX = 200;
const FORM_ID = 'category-form';

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingCategory,
  loading,
}) => {
  const { t } = useTranslation();
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const categorySchema = React.useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string()
          .required(t('categoriesAdmin.modal.validation.nameRequired'))
          .min(2, t('categoriesAdmin.modal.validation.nameMin', { count: 2 }))
          .max(NAME_MAX, t('categoriesAdmin.modal.validation.nameMax', { count: NAME_MAX })),
        description: Yup.string().max(
          DESCRIPTION_MAX,
          t('categoriesAdmin.modal.validation.descriptionMax', { count: DESCRIPTION_MAX })
        ),
        is_active: Yup.boolean(),
        sort_order: Yup.number()
          .min(0, t('categoriesAdmin.modal.validation.sortMin'))
          .integer(t('categoriesAdmin.modal.validation.sortInteger')),
      }),
    [t]
  );

  if (!isOpen) return null;

  const initialValues: CreateCategoryData = {
    name: editingCategory?.name || '',
    description: editingCategory?.description || '',
    is_active: editingCategory?.is_active ?? true,
    sort_order: editingCategory?.sort_order || 0,
  };

  const handleSubmit = async (values: CreateCategoryData, { setSubmitting }: FormikHelpers<CreateCategoryData>) => {
    try {
      setSubmitError(null);
      await onSubmit(values);
    } catch (error) {
      setSubmitError(errorMessage(error, t('categoriesAdmin.modal.genericError')));
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCategory ? t('categoriesAdmin.modal.editTitle') : t('categoriesAdmin.modal.createTitle')}
      closeLabel={t('common.close')}
      size="md"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={categorySchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, isSubmitting }) => (
          <Form id={FORM_ID} className="space-y-4">
            {/* Submit Error Display */}
            {submitError && (
              <div role="alert" className="bg-red-50 border-s-4 border-red-500 p-3 rounded">
                <div className="flex items-start gap-2">
                  <svg aria-hidden="true" className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-red-800">{t('categoriesAdmin.modal.submitErrorTitle')}</p>
                    <p className="text-sm text-red-700 mt-1">{submitError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Category Name */}
            <div>
              <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('categoriesAdmin.modal.nameLabel')}
              </label>
              <Field
                id="category-name"
                name="name"
                type="text"
                placeholder={t('categoriesAdmin.modal.namePlaceholder')}
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
                {t('categoriesAdmin.modal.charCount', { current: values.name.length, max: NAME_MAX })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="category-description" className="block text-sm font-medium text-gray-700 mb-1">
                {t('categoriesAdmin.modal.descriptionLabel')}
              </label>
              <Field
                id="category-description"
                name="description"
                as="textarea"
                rows={3}
                disabled={isSubmitting}
                placeholder={t('categoriesAdmin.modal.descriptionPlaceholder')}
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
                {t('categoriesAdmin.modal.charCount', { current: values.description?.length || 0, max: DESCRIPTION_MAX })}
              </div>
            </div>

            {/* Sort Order */}
            <div>
              <label htmlFor="category-sort-order" className="block text-sm font-medium text-gray-700 mb-1">
                {t('categoriesAdmin.modal.sortOrderLabel')}
              </label>
              <Field
                id="category-sort-order"
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
                {t('categoriesAdmin.modal.sortOrderHint')}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <Field
                id="category-active"
                name="is_active"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="category-active" className="ms-2 block text-sm text-gray-900">
                {t('categoriesAdmin.modal.activeLabel')}
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={onClose} disabled={isSubmitting || loading} className="flex-1">
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting
                  ? t('categoriesAdmin.modal.saving')
                  : editingCategory
                    ? t('categoriesAdmin.modal.update')
                    : t('categoriesAdmin.modal.create')}
              </Button>
            </div>

            {/* Form Preview */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
              <div className="text-sm font-medium text-gray-700 mb-2">{t('categoriesAdmin.modal.preview')}</div>
              <div className="text-sm text-gray-600">
                <div><span aria-hidden="true">📂 </span><strong>{values.name || t('categoriesAdmin.modal.previewName')}</strong></div>
                <div className={values.is_active ? 'text-green-600' : 'text-red-600'}>
                  {values.is_active ? `✓ ${t('categoriesAdmin.list.active')}` : `✗ ${t('categoriesAdmin.list.inactive')}`}
                </div>
                {values.description && (
                  <div>{values.description}</div>
                )}
              </div>
            </div>

            {/* Status Info */}
            {!values.is_active && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-xs text-red-800">
                  {t('categoriesAdmin.modal.inactiveInfo')}
                </div>
              </div>
            )}
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default CategoryModal;

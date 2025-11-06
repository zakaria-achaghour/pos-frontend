import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Alert from '@/components/ui/alert/Alert';
import { menuAPI } from '@/api/menu';
import type { CreateMenuItemData, Category, MenuItem } from '@/types/menu';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Item name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters'),
  price: Yup.number()
    .required('Price is required')
    .min(0.01, 'Price must be greater than 0')
    .max(99999.99, 'Price is too high'),
  cost: Yup.number()
    .min(0, 'Cost cannot be negative')
    .max(99999.99, 'Cost is too high')
    .nullable()
    .transform((value: any, originalValue: any) => {
      return originalValue === '' ? null : value;
    }),
  category_id: Yup.number()
    .required('Category is required'),
  preparation_time: Yup.number()
    .min(1, 'Preparation time must be at least 1 minute')
    .max(480, 'Preparation time cannot exceed 480 minutes')
    .nullable()
    .transform((value: any, originalValue: any) => {
      return originalValue === '' ? null : value;
    }),
  is_active: Yup.boolean(),
  is_available: Yup.boolean(),
  sort_order: Yup.number()
    .min(0, 'Sort order cannot be negative')
    .nullable()
    .transform((value: any, originalValue: any) => {
      return originalValue === '' ? null : value;
    }),
});

export default function MenuItemForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<string>('');
  const [allergens, setAllergens] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await menuAPI.getCategories();
        const categoriesData = Array.isArray(response) ? response : response.data || [];
        setCategories(categoriesData);
      } catch (err: any) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  // Fetch menu item if editing
  useEffect(() => {
    if (isEditMode && id) {
      const fetchMenuItem = async () => {
        setLoading(true);
        try {
          const response = await menuAPI.getItems({ id: Number(id) });
          const itemsData = Array.isArray(response) ? response : response.data || [];
          const item = itemsData.find((i: MenuItem) => i.id === Number(id));
          if (item) {
            setMenuItem(item);
            setIngredients(item.ingredients?.join(', ') || '');
            setAllergens(item.allergens?.join(', ') || '');
          } else {
            setError('Menu item not found');
          }
        } catch (err: any) {
          setError('Failed to load menu item');
          console.error('Failed to fetch menu item:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchMenuItem();
    }
  }, [isEditMode, id]);

  // Set image preview when menu item is loaded
  useEffect(() => {
    if (menuItem?.image_url) {
      setImagePreview(menuItem.image_url);
    }
  }, [menuItem]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const initialValues = {
    name: menuItem?.name || '',
    description: menuItem?.description || '',
    price: menuItem?.price ? Number(menuItem.price) : 0,
    cost: menuItem?.cost ? Number(menuItem.cost) : '',
    category_id: menuItem?.category_id || (categories && categories.length > 0 ? categories[0]?.id : 0) || 0,
    preparation_time: menuItem?.preparation_time || '',
    is_active: menuItem?.is_active ?? true,
    is_available: menuItem?.is_available ?? true,
    sort_order: menuItem?.sort_order ?? '',
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const data: CreateMenuItemData = {
        ...values,
        ingredients: ingredients ? ingredients.split(',').map(i => i.trim()).filter(Boolean) : undefined,
        allergens: allergens ? allergens.split(',').map(a => a.trim()).filter(Boolean) : undefined,
      };

      let itemId: number;
      
      if (isEditMode && id) {
        await menuAPI.updateItem(Number(id), data);
        itemId = Number(id);
        setSuccessMessage('Menu item updated successfully!');
      } else {
        const result = await menuAPI.createItem(data);
        itemId = result.id;
        setSuccessMessage('Menu item created successfully!');
      }

      // Upload image if one was selected
      if (imageFile && itemId) {
        try {
          await menuAPI.uploadItemImage(itemId, imageFile);
        } catch (imgErr: any) {
          console.error('Failed to upload image:', imgErr);
          // Don't fail the whole operation if image upload fails
          setError('Item saved but image upload failed. You can try uploading the image again.');
        }
      }

      // Redirect after short delay
      setTimeout(() => {
        navigate('/menu/items');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save menu item');
    } finally {
      setLoading(false);
    }
  };

  const activeCategories = categories ? categories.filter(cat => cat.is_active) : [];

  return (
    <div className="p-6">
      <PageMeta title={isEditMode ? 'Edit Menu Item' : 'Add Menu Item'} />
      <PageBreadcrumb
        items={[
          { label: 'Menu Items', path: '/menu/items' },
          { label: isEditMode ? 'Edit Item' : 'Add Item', path: '' },
        ]}
      />

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6">
          <Alert
            variant="success"
            title="Success"
            message={successMessage}
          />
        </div>
      )}

      {error && (
        <div className="mb-6">
          <Alert
            variant="error"
            title="Error"
            message={error}
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {isEditMode ? 'Update the menu item details' : 'Create a new item for your menu'}
          </p>
        </div>
        <button
          onClick={() => navigate('/menu/items')}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ← Back to Menu Items
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form className="space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <Field
                      id="name"
                      name="name"
                      type="text"
                      placeholder="e.g., Grilled Chicken Breast"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name && touched.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting || loading}
                    />
                    <ErrorMessage name="name" component="div" className="text-red-600 text-sm mt-1" />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <Field
                      as="textarea"
                      id="description"
                      name="description"
                      rows={3}
                      placeholder="Brief description of the item..."
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.description && touched.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting || loading}
                    />
                    <ErrorMessage name="description" component="div" className="text-red-600 text-sm mt-1" />
                  </div>

                  {/* Image Upload */}
                  <div className="md:col-span-2">
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                      Item Image
                    </label>
                    <div className="flex items-start gap-4">
                      {imagePreview && (
                        <div className="flex-shrink-0">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={isSubmitting || loading}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <Field
                      as="select"
                      id="category_id"
                      name="category_id"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.category_id && touched.category_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting || loading}
                    >
                      <option value={0}>Select a category</option>
                      {activeCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="category_id" component="div" className="text-red-600 text-sm mt-1" />
                  </div>

                  {/* Preparation Time */}
                  <div>
                    <label htmlFor="preparation_time" className="block text-sm font-medium text-gray-700 mb-1">
                      Preparation Time (minutes)
                    </label>
                    <Field
                      id="preparation_time"
                      name="preparation_time"
                      type="number"
                      min="1"
                      placeholder="e.g., 15"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.preparation_time && touched.preparation_time ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting || loading}
                    />
                    <ErrorMessage name="preparation_time" component="div" className="text-red-600 text-sm mt-1" />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Price */}
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Price (MAD) <span className="text-red-500">*</span>
                    </label>
                    <Field
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.price && touched.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting || loading}
                    />
                    <ErrorMessage name="price" component="div" className="text-red-600 text-sm mt-1" />
                  </div>

                  {/* Cost */}
                  <div>
                    <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                      Cost (MAD)
                    </label>
                    <Field
                      id="cost"
                      name="cost"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.cost && touched.cost ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting || loading}
                    />
                    <ErrorMessage name="cost" component="div" className="text-red-600 text-sm mt-1" />
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h2>
                <div className="space-y-4">
                  {/* Ingredients */}
                  <div>
                    <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-1">
                      Ingredients (comma-separated)
                    </label>
                    <input
                      id="ingredients"
                      type="text"
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                      placeholder="e.g., Chicken, Olive oil, Garlic, Herbs"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isSubmitting || loading}
                    />
                  </div>

                  {/* Allergens */}
                  <div>
                    <label htmlFor="allergens" className="block text-sm font-medium text-gray-700 mb-1">
                      Allergens (comma-separated)
                    </label>
                    <input
                      id="allergens"
                      type="text"
                      value={allergens}
                      onChange={(e) => setAllergens(e.target.value)}
                      placeholder="e.g., Nuts, Dairy, Gluten"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isSubmitting || loading}
                    />
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 mb-1">
                      Sort Order
                    </label>
                    <Field
                      id="sort_order"
                      name="sort_order"
                      type="number"
                      min="0"
                      placeholder="0"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.sort_order && touched.sort_order ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting || loading}
                    />
                    <ErrorMessage name="sort_order" component="div" className="text-red-600 text-sm mt-1" />
                  </div>
                </div>
              </div>

              {/* Status Toggles */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
                <div className="space-y-3">
                  {/* Is Available */}
                  <div className="flex items-center">
                    <Field
                      id="is_available"
                      name="is_available"
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isSubmitting || loading}
                    />
                    <label htmlFor="is_available" className="ml-2 text-sm font-medium text-gray-700">
                      Item is available for sale
                    </label>
                  </div>

                  {/* Is Active */}
                  <div className="flex items-center">
                    <Field
                      id="is_active"
                      name="is_active"
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isSubmitting || loading}
                    />
                    <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                      Item is active
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/menu/items')}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting || loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting || loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </span>
                  ) : (
                    isEditMode ? 'Update Item' : 'Create Item'
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

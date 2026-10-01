import React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import Button from '../../components/ui/button/Button';
import Alert from '../../components/ui/alert/Alert';
import { restaurantAPI } from '../../api/restaurants';
import type { Restaurant, UpdateRestaurantData } from '@/types/restaurant';
import type { AxiosError } from 'axios';

export default function EditRestaurant() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  
  const [formData, setFormData] = useState<UpdateRestaurantData>({
    name: '',
    description: '',
    address: '',
    city: '',
    country: 'Morocco',
    phone: '',
    email: '',
    website: '',
    license_number: '',
    tax_number: '',
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    subscription_plan: 'basic',
    timezone: 'Africa/Casablanca',
    currency: 'MAD',
    status: 'active'
  });

  useEffect(() => {
    if (id) {
      fetchRestaurant(parseInt(id));
    }
  }, [id]);

  const fetchRestaurant = async (restaurantId: number) => {
    try {
      setLoading(true);
      const data = await restaurantAPI.getRestaurant(restaurantId);
      setRestaurant(data);
      
      // Extract owner information from users array if available
      const owner = data.users && data.users.length > 0 ? data.users[0] : null;
      
      setFormData({
        name: data.name || '',
        description: data.description || '',
        address: typeof data.address === 'string' ? data.address : (data.address?.street || ''),
        city: data.city || '',
        country: data.country || 'Morocco',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        license_number: data.license_number || '',
        tax_number: data.tax_number || '',
        owner_name: owner?.name || data.owner_name || '',
        owner_email: owner?.email || data.owner_email || '',
        owner_phone: data.owner_phone || '',
        subscription_plan: data.subscription_plan || 'basic',
        timezone: data.timezone || 'Africa/Casablanca',
        currency: data.currency || 'MAD',
        status: data.is_active ? 'active' : 'inactive' // Convert boolean to string
      });
    } catch (error) {
      const e = error as AxiosError<{ message?: string }>;
      setError(t('tenants.edit.loadFailed', { message: e.response?.data?.message || e.message }));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: UpdateRestaurantData) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validate required fields
      if (!formData.name?.trim()) {
        setError(t('tenants.errors.nameRequired'));
        return;
      }
      if (!formData.address?.trim()) {
        setError(t('tenants.errors.addressRequired'));
        return;
      }
      if (!formData.city?.trim()) {
        setError(t('tenants.errors.cityRequired'));
        return;
      }
      if (!formData.owner_name?.trim()) {
        setError(t('tenants.errors.ownerNameRequired'));
        return;
      }
      if (!formData.owner_email?.trim()) {
        setError(t('tenants.errors.ownerEmailRequired'));
        return;
      }

      // Clean the data and ensure all required fields are present
      const cleanedData: UpdateRestaurantData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        country: formData.country || 'Morocco',
        owner_name: formData.owner_name.trim(),
        owner_email: formData.owner_email.trim(),
        subscription_plan: formData.subscription_plan || 'basic',
        timezone: formData.timezone || 'Africa/Casablanca',
        currency: formData.currency || 'MAD',
        status: formData.status as 'active' | 'inactive'
      };

      // Add optional fields only if they have values
      if (formData.description?.trim()) {
        cleanedData.description = formData.description.trim();
      }
      if (formData.phone?.trim()) {
        cleanedData.phone = formData.phone.trim();
      }
      if (formData.email?.trim()) {
        cleanedData.email = formData.email.trim();
      }
      if (formData.website?.trim()) {
        cleanedData.website = formData.website.trim();
      }
      if (formData.license_number?.trim()) {
        cleanedData.license_number = formData.license_number.trim();
      }
      if (formData.tax_number?.trim()) {
        cleanedData.tax_number = formData.tax_number.trim();
      }
      if (formData.owner_phone?.trim()) {
        cleanedData.owner_phone = formData.owner_phone.trim();
      }

      
      const response = await restaurantAPI.updateRestaurant(restaurant.id, cleanedData);
      
      // Check if response has a message property (from your API response)
      if (response && typeof response === 'object' && 'message' in response) {
        setSuccessMessage(response.message as string);
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        setSuccessMessage(t('tenants.edit.success'));
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      }
      
      // Don't navigate immediately, let user see the success message
      // navigate('/admin/tenants');
    } catch (error) {
      const e = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
      // Handle validation errors (422)
      if (e.response?.status === 422 && e.response?.data?.errors) {
        const validationErrors = e.response.data.errors;
        const errorMessages = Object.keys(validationErrors).map(field => 
          `${field}: ${validationErrors[field]?.join(', ')}`
        ).join('\n');
        setError(t('tenants.errors.validation', { details: errorMessages }));
      } else {
        setError(e.response?.data?.message || e.message || t('tenants.edit.failed'));
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageMeta title={t('tenants.edit.metaTitle')} description={t('tenants.edit.metaDescription')} />
        <PageBreadcrumb 
          pageTitle={t('tenants.edit.title')}
          breadcrumbItems={[
            { label: t('tenants.breadcrumb.restaurants'), href: '/admin/tenants' },
            { label: t('tenants.breadcrumb.edit') }
          ]}
        />
        
        <div className="bg-white rounded-xl shadow p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div>
        <PageMeta title={t('tenants.notFoundMeta')} description={t('tenants.notFound')} />
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">{t('tenants.notFound')}</p>
            <Button
              variant="primary"
              onClick={() => navigate('/admin/tenants')}
              className="mt-4"
            >
              {t('tenants.backToList')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title={t('tenants.edit.metaTitleNamed', { name: restaurant.name })} description={t('tenants.edit.metaDescription')} />
      <PageBreadcrumb 
        pageTitle={t('tenants.edit.titleNamed', { name: restaurant.name })}
        breadcrumbItems={[
          { label: t('tenants.breadcrumb.restaurants'), href: '/admin/tenants' },
          { label: restaurant.name, href: `/admin/restaurants/${restaurant.id}` },
          { label: t('tenants.breadcrumb.edit') }
        ]}
      />
      
      {/* Success Alert */}
      {successMessage && (
        <div className="mb-6">
          <Alert
            variant="success"
            title={t('tenants.successTitle')}
            message={successMessage}
          />
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{t('tenants.edit.sectionTitle')}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('tenants.form.basicInfo')}</h3>
              
              <div>
                <Label htmlFor="name">{t('tenants.form.name')}</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder={t('tenants.form.namePh')}
                />
              </div>

              <div>
                <Label htmlFor="description">{t('tenants.form.description')}</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('tenants.form.descriptionPh')}
                />
              </div>

              <div>
                <Label htmlFor="address">{t('tenants.form.address')}</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder={t('tenants.form.addressPh')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">{t('tenants.form.city')}</Label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder={t('tenants.form.cityPh')}
                  />
                </div>
                <div>
                  <Label htmlFor="country">{t('tenants.form.country')}</Label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Morocco">{t('tenants.form.countries.morocco')}</option>
                    <option value="France">{t('tenants.form.countries.france')}</option>
                    <option value="Spain">{t('tenants.form.countries.spain')}</option>
                    <option value="Tunisia">{t('tenants.form.countries.tunisia')}</option>
                    <option value="Algeria">{t('tenants.form.countries.algeria')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">{t('tenants.form.phone')}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t('tenants.form.phonePh')}
                  />
                </div>
                <div>
                  <Label htmlFor="email">{t('tenants.form.email')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t('tenants.form.emailPh')}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">{t('tenants.form.website')}</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder={t('tenants.form.websitePh')}
                />
              </div>

              <div>
                <Label htmlFor="status">{t('tenants.form.status')}</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">{t('tenants.status.active')}</option>
                  <option value="inactive">{t('tenants.status.inactive')}</option>
                </select>
              </div>
            </div>

            {/* Business & Owner Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('tenants.form.businessOwnerInfo')}</h3>
              
              <div>
                <Label htmlFor="license_number">{t('tenants.form.license')}</Label>
                <Input
                  id="license_number"
                  name="license_number"
                  type="text"
                  value={formData.license_number}
                  onChange={handleInputChange}
                  placeholder={t('tenants.form.licensePh')}
                />
              </div>

              <div>
                <Label htmlFor="tax_number">{t('tenants.form.taxNumber')}</Label>
                <Input
                  id="tax_number"
                  name="tax_number"
                  type="text"
                  value={formData.tax_number}
                  onChange={handleInputChange}
                  placeholder={t('tenants.form.taxNumberPh')}
                />
              </div>

              <div>
                <Label htmlFor="owner_name">{t('tenants.form.ownerName')}</Label>
                <Input
                  id="owner_name"
                  name="owner_name"
                  type="text"
                  value={formData.owner_name}
                  onChange={handleInputChange}
                  required
                  placeholder={t('tenants.form.ownerNamePh')}
                />
              </div>

              <div>
                <Label htmlFor="owner_email">{t('tenants.form.ownerEmail')}</Label>
                <Input
                  id="owner_email"
                  name="owner_email"
                  type="email"
                  value={formData.owner_email}
                  onChange={handleInputChange}
                  required
                  placeholder={t('tenants.form.ownerEmailPh')}
                />
              </div>

              <div>
                <Label htmlFor="owner_phone">{t('tenants.form.ownerPhone')}</Label>
                <Input
                  id="owner_phone"
                  name="owner_phone"
                  type="tel"
                  value={formData.owner_phone}
                  onChange={handleInputChange}
                  placeholder={t('tenants.form.phonePh')}
                />
              </div>

              <div>
                <Label htmlFor="subscription_plan">{t('tenants.form.plan')}</Label>
                <select
                  id="subscription_plan"
                  name="subscription_plan"
                  value={formData.subscription_plan}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="basic">{t('tenants.plan.basic')}</option>
                  <option value="premium">{t('tenants.plan.premium')}</option>
                  <option value="enterprise">{t('tenants.plan.enterprise')}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">{t('tenants.form.timezone')}</Label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Africa/Casablanca">Africa/Casablanca</option>
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="Europe/Madrid">Europe/Madrid</option>
                    <option value="Africa/Tunis">Africa/Tunis</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="currency">{t('tenants.form.currency')}</Label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="MAD">{t('tenants.form.currencies.mad')}</option>
                    <option value="EUR">{t('tenants.form.currencies.eur')}</option>
                    <option value="USD">{t('tenants.form.currencies.usd')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/tenants')}
              disabled={saving}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
            >
              {saving ? t('tenants.edit.saving') : t('tenants.edit.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import Button from '../../components/ui/button/Button';
import Alert from '../../components/ui/alert/Alert';
import { restaurantAPI } from '../../api/restaurants';
import type { CreateRestaurantData } from '@/types/restaurant';
import { errorMessage } from '@/lib/errors';

export default function CreateRestaurant() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateRestaurantData>({
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
    currency: 'MAD'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: CreateRestaurantData) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await restaurantAPI.createRestaurant(formData);
      
      // Check if response has a message property
      if (response && typeof response === 'object' && 'message' in response) {
        setSuccessMessage(response.message as string);
      } else {
        setSuccessMessage(t('tenants.create.success'));
      }
      
      // Auto-hide success message and redirect after 3 seconds
      setTimeout(() => {
        navigate('/admin/tenants');
      }, 3000);
    } catch (error) {
      console.error('Error creating restaurant:', error);
      setError(errorMessage(error, t('tenants.create.failed')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageMeta title={t('tenants.create.metaTitle')} description={t('tenants.create.metaDescription')} />
      <PageBreadcrumb 
        pageTitle={t('tenants.create.title')}
        breadcrumbItems={[
          { label: t('tenants.breadcrumb.restaurants'), href: '/admin/tenants' },
          { label: t('tenants.breadcrumb.create') }
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
          <h2 className="text-xl font-semibold text-gray-900">{t('tenants.create.sectionTitle')}</h2>
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
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? t('tenants.create.creating') : t('tenants.create.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

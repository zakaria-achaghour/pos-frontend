import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import Button from '../../components/ui/button/Button';
import Alert from '../../components/ui/alert/Alert';
import { restaurantAPI } from '../../api/restaurants';
import type { CreateRestaurantData } from '../../api/restaurants';

export default function CreateRestaurant() {
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
    setFormData(prev => ({
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
      console.log('🆕 Creating restaurant with data:', formData);
      const response = await restaurantAPI.createRestaurant(formData);
      console.log('📡 Create response:', response);
      
      // Check if response has a message property
      if (response && typeof response === 'object' && 'message' in response) {
        setSuccessMessage(response.message as string);
        console.log('✅ Success message:', response.message);
      } else {
        setSuccessMessage('Restaurant created successfully!');
      }
      
      // Auto-hide success message and redirect after 3 seconds
      setTimeout(() => {
        navigate('/admin/tenants');
      }, 3000);
    } catch (error: any) {
      console.error('Error creating restaurant:', error);
      setError(error.response?.data?.message || 'Failed to create restaurant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageMeta title="Create Restaurant | Admin" description="Add new restaurant" />
      <PageBreadcrumb 
        pageTitle="Create Restaurant" 
        breadcrumbItems={[
          { label: 'Restaurants', href: '/admin/tenants' },
          { label: 'Create' }
        ]}
      />
      
      {/* Success Alert */}
      {successMessage && (
        <div className="mb-6">
          <Alert
            variant="success"
            title="Success!"
            message={successMessage}
          />
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Restaurant Information</h2>
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              
              <div>
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter restaurant name"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of the restaurant"
                />
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Full address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Morocco">Morocco</option>
                    <option value="France">France</option>
                    <option value="Spain">Spain</option>
                    <option value="Tunisia">Tunisia</option>
                    <option value="Algeria">Algeria</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+212 123 456 789"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="restaurant@example.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://restaurant.com"
                />
              </div>
            </div>

            {/* Business & Owner Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Business & Owner Information</h3>
              
              <div>
                <Label htmlFor="license_number">Business License</Label>
                <Input
                  id="license_number"
                  name="license_number"
                  type="text"
                  value={formData.license_number}
                  onChange={handleInputChange}
                  placeholder="Business license number"
                />
              </div>

              <div>
                <Label htmlFor="tax_number">Tax Number</Label>
                <Input
                  id="tax_number"
                  name="tax_number"
                  type="text"
                  value={formData.tax_number}
                  onChange={handleInputChange}
                  placeholder="Tax identification number"
                />
              </div>

              <div>
                <Label htmlFor="owner_name">Owner Name *</Label>
                <Input
                  id="owner_name"
                  name="owner_name"
                  type="text"
                  value={formData.owner_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Owner full name"
                />
              </div>

              <div>
                <Label htmlFor="owner_email">Owner Email *</Label>
                <Input
                  id="owner_email"
                  name="owner_email"
                  type="email"
                  value={formData.owner_email}
                  onChange={handleInputChange}
                  required
                  placeholder="owner@example.com"
                />
              </div>

              <div>
                <Label htmlFor="owner_phone">Owner Phone</Label>
                <Input
                  id="owner_phone"
                  name="owner_phone"
                  type="tel"
                  value={formData.owner_phone}
                  onChange={handleInputChange}
                  placeholder="+212 123 456 789"
                />
              </div>

              <div>
                <Label htmlFor="subscription_plan">Subscription Plan</Label>
                <select
                  id="subscription_plan"
                  name="subscription_plan"
                  value={formData.subscription_plan}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
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
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="MAD">MAD (Moroccan Dirham)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="USD">USD (US Dollar)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/tenants')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Restaurant'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
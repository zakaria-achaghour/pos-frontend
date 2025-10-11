import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import Button from '../../components/ui/button/Button';
import Alert from '../../components/ui/alert/Alert';
import { restaurantAPI } from '../../api/restaurants';
import type { Restaurant, UpdateRestaurantData } from '../../api/restaurants';

export default function EditRestaurant() {
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
        address: data.address || '',
        city: data.city || '',
        country: data.country || 'Morocco',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        license_number: data.license_number || '',
        tax_number: data.tax_number || data.tax_rate || '', // Try both field names
        owner_name: owner?.name || data.owner_name || '',
        owner_email: owner?.email || data.owner_email || '',
        owner_phone: data.owner_phone || '',
        subscription_plan: data.subscription_plan || 'basic',
        timezone: data.timezone || 'Africa/Casablanca',
        currency: data.currency || 'MAD',
        status: data.is_active ? 'active' : 'inactive' // Convert boolean to string
      });
    } catch (error: any) {
      setError(`Failed to load restaurant data: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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
        setError('Restaurant name is required');
        return;
      }
      if (!formData.address?.trim()) {
        setError('Address is required');
        return;
      }
      if (!formData.city?.trim()) {
        setError('City is required');
        return;
      }
      if (!formData.owner_name?.trim()) {
        setError('Owner name is required');
        return;
      }
      if (!formData.owner_email?.trim()) {
        setError('Owner email is required');
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

      console.log('🔄 Updating restaurant with data:', cleanedData);
      console.log('🔄 Restaurant ID:', restaurant.id);
      console.log('🔄 Payload being sent:', JSON.stringify(cleanedData, null, 2));
      
      const response = await restaurantAPI.updateRestaurant(restaurant.id, cleanedData);
      console.log('📡 Update response:', response);
      
      // Check if response has a message property (from your API response)
      if (response && typeof response === 'object' && 'message' in response) {
        setSuccessMessage(response.message as string);
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        setSuccessMessage('Restaurant updated successfully!');
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      }
      
      // Don't navigate immediately, let user see the success message
      // navigate('/admin/tenants');
    } catch (error: any) {
      // Handle validation errors (422)
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.keys(validationErrors).map(field => 
          `${field}: ${validationErrors[field].join(', ')}`
        ).join('\n');
        setError(`Validation errors:\n${errorMessages}`);
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to update restaurant');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageMeta title="Edit Restaurant | Admin" description="Edit restaurant information" />
        <PageBreadcrumb 
          pageTitle="Edit Restaurant" 
          breadcrumbItems={[
            { label: 'Restaurants', href: '/admin/tenants' },
            { label: 'Edit' }
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
        <PageMeta title="Restaurant Not Found | Admin" description="Restaurant not found" />
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Restaurant not found</p>
            <Button
              variant="primary"
              onClick={() => navigate('/admin/tenants')}
              className="mt-4"
            >
              Back to Restaurants
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title={`Edit ${restaurant.name} | Admin`} description="Edit restaurant information" />
      <PageBreadcrumb 
        pageTitle={`Edit ${restaurant.name}`}
        breadcrumbItems={[
          { label: 'Restaurants', href: '/admin/tenants' },
          { label: restaurant.name, href: `/admin/restaurants/${restaurant.id}` },
          { label: 'Edit' }
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
          <h2 className="text-xl font-semibold text-gray-900">Edit Restaurant Information</h2>
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

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
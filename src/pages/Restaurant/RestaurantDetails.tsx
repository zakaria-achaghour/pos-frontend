import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/kit/Modal';
import { Button as KitButton, useToast } from '@/components/kit';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Button from '../../components/ui/button/Button';
import { restaurantAPI } from '../../api/restaurants';
import type { Restaurant } from '@/types/restaurant';
import type { AxiosError } from 'axios';

export default function RestaurantDetails() {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    if (id) {
      fetchRestaurant(parseInt(id));
    }
  }, [id]);

  const fetchRestaurant = async (restaurantId: number) => {
    try {
      setLoading(true);
      const data = await restaurantAPI.getRestaurant(restaurantId);
      
      // Convert API response to match our component expectations
      const processedData: Restaurant = {
        ...data,
        status: data.is_active ? 'active' : 'inactive' // Convert boolean to string
      };
      
      setRestaurant(processedData);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      console.error('Error fetching restaurant:', error);
      console.error('Full error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      setError(t('tenants.edit.loadFailed', { message: error.response?.data?.message || error.message }));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!restaurant) return;

    try {
      const newStatus = restaurant.status === 'active' ? 'inactive' : 'active';
      await restaurantAPI.updateRestaurantStatus(restaurant.id, newStatus);
      setRestaurant({ ...restaurant, status: newStatus });
    } catch (error) {
      console.error('Error updating restaurant status:', error);
    }
  };

  const handleDelete = async () => {
    if (!restaurant) return;
    
    try {
      await restaurantAPI.deleteRestaurant(restaurant.id);
      navigate('/admin/tenants');
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast.error(t('tenants.details.deleteFailed'));
    } finally {
      setConfirmingDelete(false);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? 'px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium'
      : 'px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium';
  };

  if (loading) {
    return (
      <div>
        <PageMeta title={t('tenants.details.metaTitle')} description={t('tenants.details.metaDescription')} />
        <PageBreadcrumb 
          pageTitle={t('tenants.details.title')}
          breadcrumbItems={[
            { label: t('tenants.breadcrumb.restaurants'), href: '/admin/tenants' },
            { label: t('tenants.breadcrumb.details') }
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

  if (error || !restaurant) {
    return (
      <div>
        <PageMeta title={t('tenants.notFoundMeta')} description={t('tenants.notFound')} />
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">{error || t('tenants.notFound')}</p>
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
      <PageMeta title={t('tenants.details.metaTitleNamed', { name: restaurant.name })} description={t('tenants.details.metaDescription')} />
      <PageBreadcrumb 
        pageTitle={restaurant.name}
        breadcrumbItems={[
          { label: t('tenants.breadcrumb.restaurants'), href: '/admin/tenants' },
          { label: restaurant.name }
        ]}
      />
      
      <div className="bg-white rounded-xl shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">{restaurant.name}</h2>
              <span className={getStatusBadge(restaurant.status)}>
                {t(`tenants.status.${restaurant.status}`, { defaultValue: restaurant.status })}
              </span>
            </div>
            <div className="flex gap-3">
              <Link
                to={`/admin/restaurants/${restaurant.id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('tenants.actions.edit')}
              </Link>
              <Button
                variant="secondary"
                onClick={handleStatusToggle}
              >
                {restaurant.status === 'active' ? t('tenants.actions.deactivate') : t('tenants.actions.activate')}
              </Button>
              <Button
                variant="danger"
                onClick={() => setConfirmingDelete(true)}
              >
                {t('tenants.actions.delete')}
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('tenants.form.basicInfo')}</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="block text-sm font-medium text-gray-500">{t('tenants.details.name')}</span>
                  <p className="text-gray-900">{restaurant.name}</p>
                </div>

                {restaurant.description && (
                  <div>
                    <span className="block text-sm font-medium text-gray-500">{t('tenants.form.description')}</span>
                    <p className="text-gray-900">{restaurant.description}</p>
                  </div>
                )}

                <div>
                  <span className="block text-sm font-medium text-gray-500">{t('tenants.details.address')}</span>
                  <p className="text-gray-900">{typeof restaurant.address === 'string' ? restaurant.address : [restaurant.address.street, restaurant.address.city, restaurant.address.state, restaurant.address.zipCode, restaurant.address.country].filter(Boolean).join(', ')}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-sm font-medium text-gray-500">{t('tenants.details.city')}</span>
                    <p className="text-gray-900">{restaurant.city}</p>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-500">{t('tenants.details.country')}</span>
                    <p className="text-gray-900">{restaurant.country}</p>
                  </div>
                </div>

                {restaurant.phone && (
                  <div>
                    <span className="block text-sm font-medium text-gray-500">{t('tenants.form.phone')}</span>
                    <p className="text-gray-900">{restaurant.phone}</p>
                  </div>
                )}

                {restaurant.email && (
                  <div>
                    <span className="block text-sm font-medium text-gray-500">{t('tenants.form.email')}</span>
                    <p className="text-gray-900">{restaurant.email}</p>
                  </div>
                )}

                {restaurant.website && (
                  <div>
                    <span className="block text-sm font-medium text-gray-500">{t('tenants.form.website')}</span>
                    <a 
                      href={restaurant.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {restaurant.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Business & Owner Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('tenants.form.businessOwnerInfo')}</h3>
              
              <div className="space-y-3">
                {restaurant.license_number && (
                  <div>
                    <span className="block text-sm font-medium text-gray-500">{t('tenants.form.license')}</span>
                    <p className="text-gray-900">{restaurant.license_number}</p>
                  </div>
                )}

                {restaurant.tax_number && (
                  <div>
                    <span className="block text-sm font-medium text-gray-500">{t('tenants.form.taxNumber')}</span>
                    <p className="text-gray-900">{restaurant.tax_number}</p>
                  </div>
                )}

                <div>
                  <span className="block text-sm font-medium text-gray-500">{t('tenants.details.ownerName')}</span>
                  <p className="text-gray-900">{restaurant.owner_name}</p>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-500">{t('tenants.details.ownerEmail')}</span>
                  <p className="text-gray-900">{restaurant.owner_email}</p>
                </div>

                {restaurant.owner_phone && (
                  <div>
                    <span className="block text-sm font-medium text-gray-500">{t('tenants.details.ownerPhone')}</span>
                    <p className="text-gray-900">{restaurant.owner_phone}</p>
                  </div>
                )}

                {restaurant.subscription_plan && (
                  <div>
                    <span className="block text-sm font-medium text-gray-500">{t('tenants.form.plan')}</span>
                    <p className="text-gray-900">{t(`tenants.plan.${restaurant.subscription_plan}`, { defaultValue: restaurant.subscription_plan })}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {restaurant.timezone && (
                    <div>
                      <span className="block text-sm font-medium text-gray-500">{t('tenants.form.timezone')}</span>
                      <p className="text-gray-900">{restaurant.timezone}</p>
                    </div>
                  )}
                  {restaurant.currency && (
                    <div>
                      <span className="block text-sm font-medium text-gray-500">{t('tenants.form.currency')}</span>
                      <p className="text-gray-900">{restaurant.currency}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-sm font-medium text-gray-500">{t('tenants.details.created')}</span>
                    <p className="text-gray-900">{new Date(restaurant.created_at ?? '').toLocaleDateString(i18n.language)}</p>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-500">{t('tenants.details.updated')}</span>
                    <p className="text-gray-900">{new Date(restaurant.updated_at ?? '').toLocaleDateString(i18n.language)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        title={t('tenants.list.deleteTitle')}
        size="sm"
        closeLabel={t('common.close')}
        footer={
          <>
            <KitButton variant="secondary" onClick={() => setConfirmingDelete(false)}>
              {t('common.cancel')}
            </KitButton>
            <KitButton variant="danger" onClick={handleDelete}>
              {t('tenants.actions.delete')}
            </KitButton>
          </>
        }
      >
        <p>{t('tenants.details.deleteConfirm', { name: restaurant.name })}</p>
      </Modal>
    </div>
  );
}

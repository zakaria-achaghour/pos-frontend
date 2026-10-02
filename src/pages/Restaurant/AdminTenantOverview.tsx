import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { formatMoney } from '@/lib/money';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import DemoDataBanner from '@/components/common/DemoDataBanner';

// Mock data
const mockTenantOverview = {
  id: 1,
  name: 'Restaurant Le Petit Chef',
  city: 'Casablanca',
  tables: 12,
  categories: 5,
  items: 48,
  orders_today: 23,
  sales_today: 1245.75
};

interface TenantOverview {
  id: number;
  name: string;
  city: string;
  tables: number;
  categories: number;
  items: number;
  orders_today: number;
  sales_today: number;
}

export default function AdminTenantOverview() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [tenant, setTenant] = useState<TenantOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenantOverview();
  }, [id]);

  const fetchTenantOverview = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await api.get(`/admin/restaurants/${id}/overview`);
      // setTenant(response.data);

      setTimeout(() => {
        setTenant({ ...mockTenantOverview, id: parseInt(id || '1') });
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching tenant overview:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageMeta title={t('tenants.overview.metaTitle')} description={t('tenants.overview.metaDescription')} />
        <PageBreadcrumb pageTitle={t('tenants.overview.title')} />
        <div className="space-y-6">
          <div className="bg-surface p-6 rounded-xl shadow-sm animate-pulse border border-line">
            <div className="h-8 bg-surface-2 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-surface-2 rounded w-1/4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-surface p-4 rounded-xl shadow-sm animate-pulse border border-line">
                <div className="h-4 bg-surface-2 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-surface-2 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div>
        <PageMeta title={t('tenants.overview.metaTitle')} description={t('tenants.overview.metaDescription')} />
        <PageBreadcrumb pageTitle={t('tenants.overview.title')} />
        <div className="bg-danger/10 border border-danger/30 rounded-lg p-4">
          <p className="text-danger">{t('tenants.notFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title={t('tenants.overview.metaTitleNamed', { name: tenant.name })} description={t('tenants.overview.metaDescription')} />
      <PageBreadcrumb pageTitle={t('tenants.overview.title')} />
      <DemoDataBanner />

      <div className="space-y-6">
        {/* Restaurant Info */}
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-line">
          <h2 className="text-2xl font-bold text-fg mb-2">{tenant.name}</h2>
          <p className="text-fg-muted">{t('tenants.overview.locatedIn', { city: tenant.city })}</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Tables */}
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-line">
            <h3 className="text-sm font-medium text-fg-muted mb-2">{t('tenants.overview.tables')}</h3>
            <p className="text-3xl font-bold text-fg">{tenant.tables}</p>
          </div>

          {/* Categories */}
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-line">
            <h3 className="text-sm font-medium text-fg-muted mb-2">{t('tenants.overview.categories')}</h3>
            <p className="text-3xl font-bold text-fg">{tenant.categories}</p>
          </div>

          {/* Menu Items */}
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-line">
            <h3 className="text-sm font-medium text-fg-muted mb-2">{t('tenants.overview.menuItems')}</h3>
            <p className="text-3xl font-bold text-fg">{tenant.items}</p>
          </div>

          {/* Orders Today */}
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-line">
            <h3 className="text-sm font-medium text-fg-muted mb-2">{t('tenants.overview.ordersToday')}</h3>
            <p className="text-3xl font-bold text-primary">{tenant.orders_today}</p>
          </div>

          {/* Sales Today */}
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-line">
            <h3 className="text-sm font-medium text-fg-muted mb-2">{t('tenants.overview.salesToday')}</h3>
            <p className="text-3xl font-bold text-success">{formatMoney(tenant.sales_today)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { downloadReceipt, printReceipt } from '../../api/receipts';
import { fetchOrderById } from '../../api/orders';
import type { Order } from '../../types/order';
import { Button } from '@/components/kit';
import { formatMoney } from '@/lib/money';

export default function PaymentConfirmation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/orders');
      return;
    }

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const orderData = await fetchOrderById(parseInt(id));
        
        // Check if order is paid or completed
        if (orderData.status !== 'completed' && orderData.status !== 'served') {
          setError(t('paymentConfirmation.errors.notCompleted'));
        } else {
          setOrder(orderData);
        }
      } catch (err) {
        console.error('Error loading order:', err);
        setError(t('paymentConfirmation.errors.load'));
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  const handlePrintReceipt = async () => {
    if (!id) return;
    
    try {
      setActionLoading('print');
      await printReceipt(parseInt(id));
    } catch (err) {
      console.error('Error printing receipt:', err);
      setError(t('paymentConfirmation.errors.print'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadPDF = async () => {
    if (!id) return;
    
    try {
      setActionLoading('download');
      await downloadReceipt(parseInt(id), 'pdf');
    } catch (err) {
      console.error('Error downloading receipt:', err);
      setError(t('paymentConfirmation.errors.download'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewReceipt = () => {
    if (id) {
      navigate(`/orders/${id}/receipt`);
    }
  };

  const handleBackToOrders = () => {
    navigate('/orders');
  };

  if (loading) {
    return (
      <div>
        <PageMeta
          title={t('paymentConfirmation.meta.title')}
          description={t('paymentConfirmation.meta.loading')}
        />
        <PageBreadcrumb pageTitle={t('paymentConfirmation.title')} />
        <div className="flex items-center justify-center min-h-[400px]">
          <div role="status" className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">{t('paymentConfirmation.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <PageMeta
          title={t('paymentConfirmation.meta.title')}
          description={t('paymentConfirmation.meta.error')}
        />
        <PageBreadcrumb pageTitle={t('paymentConfirmation.title')} />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <svg
                className="h-12 w-12 text-red-500 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('paymentConfirmation.errorTitle')}</h3>
              <p role="alert" className="text-gray-600">{error || t('paymentConfirmation.notFound')}</p>
            </div>
            <Button onClick={handleBackToOrders}>{t('paymentConfirmation.backToOrders')}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title={t('paymentConfirmation.meta.title')}
        description={t('paymentConfirmation.meta.success')}
      />
      <PageBreadcrumb pageTitle={t('paymentConfirmation.title')} />

      <div className="max-w-2xl mx-auto">
        {/* Success Message */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
            <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-12 w-12 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{t('paymentConfirmation.successTitle')}</h2>
            <p className="text-green-50 text-lg">{t('paymentConfirmation.thanks')}</p>
          </div>

          {/* Order Details */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">{t('paymentConfirmation.orderNumber')}</p>
                <p className="text-lg font-semibold text-gray-900">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('paymentConfirmation.table')}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {order.table?.number || t('paymentConfirmation.notAvailable')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('paymentConfirmation.paymentMethod')}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {t(`payment.method.${order.payment_method || order.paymentMethod || 'cash'}`, {
                    defaultValue: String(order.payment_method || order.paymentMethod),
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('paymentConfirmation.totalAmount')}</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatMoney(order.total)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('paymentConfirmation.receiptOptions')}</h3>
              
              <Button fullWidth onClick={handleViewReceipt}>
                {t('paymentConfirmation.viewReceipt')}
              </Button>

              <Button
                fullWidth
                variant="secondary"
                onClick={handlePrintReceipt}
                loading={actionLoading === 'print'}
              >
                {actionLoading === 'print' ? t('paymentConfirmation.printing') : t('paymentConfirmation.printReceipt')}
              </Button>

              <Button
                fullWidth
                variant="secondary"
                onClick={handleDownloadPDF}
                loading={actionLoading === 'download'}
              >
                {actionLoading === 'download' ? t('paymentConfirmation.downloading') : t('paymentConfirmation.downloadPdf')}
              </Button>

              <Button fullWidth variant="ghost" onClick={handleBackToOrders}>
                {t('paymentConfirmation.backToOrders')}
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-blue-600 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-blue-800 font-medium mb-1">{t('paymentConfirmation.infoTitle')}</p>
              <p className="text-sm text-blue-700">{t('paymentConfirmation.infoBody')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

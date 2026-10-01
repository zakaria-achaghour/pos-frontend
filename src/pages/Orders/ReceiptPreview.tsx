import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import PageMeta from '../../components/common/PageMeta';
import { fetchReceipt, downloadReceipt, printReceipt } from '../../api/receipts';
import type { ReceiptData } from '../../types/receipt';
import { Button } from '@/components/kit';
import { formatMoney } from '@/lib/money';

export default function ReceiptPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/orders');
      return;
    }

    const loadReceipt = async () => {
      try {
        setLoading(true);
        setError(null);
        const receiptData = await fetchReceipt(parseInt(id));
        setReceipt(receiptData);
      } catch (err) {
        console.error('Error loading receipt:', err);
        setError(t('receipt.errors.load'));
      } finally {
        setLoading(false);
      }
    };

    loadReceipt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  const handlePrint = async () => {
    if (id) {
      try {
        await printReceipt(parseInt(id));
      } catch (err) {
        console.error('Error printing receipt:', err);
        setError(t('receipt.errors.print'));
      }
    }
  };

  const handleDownloadPDF = async () => {
    if (id) {
      try {
        await downloadReceipt(parseInt(id), 'pdf');
      } catch (err) {
        console.error('Error downloading receipt:', err);
        setError(t('receipt.errors.download'));
      }
    }
  };

  const handleBack = () => {
    navigate(`/orders/${id}`);
  };

  if (loading) {
    return (
      <div>
        <PageMeta title={t('receipt.meta.title')} description={t('receipt.meta.loading')} />
        <div className="flex items-center justify-center min-h-screen">
          <div role="status" className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">{t('receipt.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div>
        <PageMeta title={t('receipt.meta.title')} description={t('receipt.meta.notFound')} />
        <div className="flex items-center justify-center min-h-screen">
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('receipt.errorTitle')}</h3>
              <p role="alert" className="text-gray-600">{error || t('receipt.notFound')}</p>
            </div>
            <Button onClick={handleBack}>{t('receipt.backToOrder')}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageMeta
        title={t('receipt.meta.receiptTitle', { n: receipt.order_number })}
        description={t('receipt.meta.receiptDescription', { n: receipt.order_number })}
      />

      {/* Action Bar - No Print */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="md" onClick={handleBack}>
              <svg
                aria-hidden="true"
                className="h-5 w-5 rtl:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {t('common.back')}
            </Button>

            <div className="flex items-center gap-3">
              <Button variant="secondary" size="md" onClick={handlePrint}>
                {t('receipt.print')}
              </Button>
              <Button variant="danger" size="md" onClick={handleDownloadPDF}>
                {t('receipt.downloadPdf')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Receipt Header */}
          <div className="border-b-2 border-dashed border-gray-300 p-8 text-center">
            {receipt.restaurant.logo_url && (
              <img
                src={receipt.restaurant.logo_url}
                alt={receipt.restaurant.name}
                className="h-16 mx-auto mb-4"
              />
            )}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {receipt.restaurant.name}
            </h1>
            <p className="text-sm text-gray-600">{receipt.restaurant.address}</p>
            <p className="text-sm text-gray-600">{receipt.restaurant.phone}</p>
            {receipt.restaurant.email && (
              <p className="text-sm text-gray-600">{receipt.restaurant.email}</p>
            )}
            {receipt.restaurant.tax_number && (
              <p className="text-sm text-gray-500 mt-2">
                {t('receipt.taxId', { id: receipt.restaurant.tax_number })}
              </p>
            )}
          </div>

          {/* Order Information */}
          <div className="p-8 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">{t('receipt.orderNumber')}</p>
                <p className="font-semibold text-gray-900">{receipt.order_number}</p>
              </div>
              <div>
                <p className="text-gray-500">{t('receipt.dateTime')}</p>
                <p className="font-semibold text-gray-900">
                  {receipt.date} {receipt.time}
                </p>
              </div>
              {receipt.table_number && (
                <div>
                  <p className="text-gray-500">{t('receipt.table')}</p>
                  <p className="font-semibold text-gray-900">{receipt.table_number}</p>
                </div>
              )}
              {receipt.server_name && (
                <div>
                  <p className="text-gray-500">{t('receipt.server')}</p>
                  <p className="font-semibold text-gray-900">{receipt.server_name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="p-8 border-b border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-start pb-2 font-semibold text-gray-700">{t('receipt.item')}</th>
                  <th className="text-center pb-2 font-semibold text-gray-700">{t('receipt.qty')}</th>
                  <th className="text-end pb-2 font-semibold text-gray-700">{t('receipt.price')}</th>
                  <th className="text-end pb-2 font-semibold text-gray-700">{t('receipt.total')}</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        {item.notes && (
                          <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                        )}
                      </div>
                    </td>
                    <td className="text-center py-3 text-gray-700">{item.quantity}</td>
                    <td className="text-end py-3 text-gray-700">
                      {formatMoney(item.unit_price)}
                    </td>
                    <td className="text-end py-3 font-medium text-gray-900">
                      {formatMoney(item.total_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="p-8 border-b-2 border-dashed border-gray-300">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('receipt.subtotal')}</span>
                <span className="text-gray-900">{formatMoney(receipt.subtotal)}</span>
              </div>
              
              {receipt.discount_amount && receipt.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t('receipt.discount')}</span>
                  <span>-{formatMoney(receipt.discount_amount)}</span>
                </div>
              )}

              {receipt.service_charge && receipt.service_charge > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('receipt.serviceCharge')}</span>
                  <span className="text-gray-900">{formatMoney(receipt.service_charge)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">{t('receipt.tax', { rate: receipt.tax_rate })}</span>
                <span className="text-gray-900">{formatMoney(receipt.tax_amount)}</span>
              </div>

              <div className="flex justify-between pt-3 border-t border-gray-300">
                <span className="text-lg font-bold text-gray-900">{t('receipt.total')}</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatMoney(receipt.total)}
                </span>
              </div>
            </div>

            {/* Payment Information */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('receipt.paymentMethod')}</span>
                <span className="font-semibold text-gray-900">
                  {t(`payment.method.${receipt.payment_method}`, { defaultValue: receipt.payment_method })}
                </span>
              </div>
              {receipt.amount_paid && (
                <>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">{t('receipt.amountPaid')}</span>
                    <span className="text-gray-900">{formatMoney(receipt.amount_paid)}</span>
                  </div>
                  {receipt.change_amount && receipt.change_amount > 0 && (
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-600">{t('receipt.change')}</span>
                      <span className="font-semibold text-green-600">
                        {formatMoney(receipt.change_amount)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 text-center">
            {receipt.notes && (
              <p className="text-sm text-gray-600 mb-4">{receipt.notes}</p>
            )}
            <p className="text-sm text-gray-600 mb-2">
              {receipt.footer_message || t('receipt.thanks')}
            </p>
            <p className="text-xs text-gray-500">
              {t('receipt.paidAt', { date: new Date(receipt.paid_at || receipt.created_at).toLocaleString(i18n.language) })}
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

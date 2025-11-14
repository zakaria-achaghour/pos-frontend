import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import { fetchReceipt, downloadReceipt, printReceipt } from '../../api/receipts';
import type { ReceiptData } from '../../types/receipt';

export default function ReceiptPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
        setError('Failed to load receipt. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadReceipt();
  }, [id, navigate]);

  const handlePrint = () => {
    if (id) {
      printReceipt(parseInt(id));
    }
  };

  const handleDownloadPDF = () => {
    if (id) {
      const url = downloadReceipt(parseInt(id), 'pdf');
      window.open(url, '_blank');
    }
  };

  const handleBack = () => {
    navigate(`/orders/${id}`);
  };

  if (loading) {
    return (
      <div>
        <PageMeta title="Receipt Preview | Restaurant POS" description="Loading receipt details" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading receipt...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div>
        <PageMeta title="Receipt Preview | Restaurant POS" description="Receipt not found" />
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600">{error || 'Receipt not found'}</p>
            </div>
            <button onClick={handleBack} className="btn btn-primary">
              Back to Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageMeta 
        title={`Receipt #${receipt.order_number} | Restaurant POS`} 
        description={`Receipt for order ${receipt.order_number}`} 
      />

      {/* Action Bar - No Print */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <svg
                className="h-5 w-5"
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
              Back
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-gray-800 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-900 transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print
              </button>

              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download PDF
              </button>
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
                Tax ID: {receipt.restaurant.tax_number}
              </p>
            )}
          </div>

          {/* Order Information */}
          <div className="p-8 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Order Number</p>
                <p className="font-semibold text-gray-900">{receipt.order_number}</p>
              </div>
              <div>
                <p className="text-gray-500">Date & Time</p>
                <p className="font-semibold text-gray-900">
                  {receipt.date} {receipt.time}
                </p>
              </div>
              {receipt.table_number && (
                <div>
                  <p className="text-gray-500">Table</p>
                  <p className="font-semibold text-gray-900">{receipt.table_number}</p>
                </div>
              )}
              {receipt.server_name && (
                <div>
                  <p className="text-gray-500">Server</p>
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
                  <th className="text-left pb-2 font-semibold text-gray-700">Item</th>
                  <th className="text-center pb-2 font-semibold text-gray-700">Qty</th>
                  <th className="text-right pb-2 font-semibold text-gray-700">Price</th>
                  <th className="text-right pb-2 font-semibold text-gray-700">Total</th>
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
                    <td className="text-right py-3 text-gray-700">
                      {item.unit_price.toFixed(2)}
                    </td>
                    <td className="text-right py-3 font-medium text-gray-900">
                      {item.total_price.toFixed(2)}
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
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{receipt.subtotal.toFixed(2)} MAD</span>
              </div>
              
              {receipt.discount_amount && receipt.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{receipt.discount_amount.toFixed(2)} MAD</span>
                </div>
              )}

              {receipt.service_charge && receipt.service_charge > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Charge</span>
                  <span className="text-gray-900">{receipt.service_charge.toFixed(2)} MAD</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Tax ({receipt.tax_rate}%)</span>
                <span className="text-gray-900">{receipt.tax_amount.toFixed(2)} MAD</span>
              </div>

              <div className="flex justify-between pt-3 border-t border-gray-300">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">
                  {receipt.total.toFixed(2)} MAD
                </span>
              </div>
            </div>

            {/* Payment Information */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-semibold text-gray-900 capitalize">
                  {receipt.payment_method}
                </span>
              </div>
              {receipt.amount_paid && (
                <>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="text-gray-900">{receipt.amount_paid.toFixed(2)} MAD</span>
                  </div>
                  {receipt.change_amount && receipt.change_amount > 0 && (
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-600">Change</span>
                      <span className="font-semibold text-green-600">
                        {receipt.change_amount.toFixed(2)} MAD
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
              {receipt.footer_message || 'Thank you for dining with us!'}
            </p>
            <p className="text-xs text-gray-500">
              Paid at: {new Date(receipt.paid_at || receipt.created_at).toLocaleString()}
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

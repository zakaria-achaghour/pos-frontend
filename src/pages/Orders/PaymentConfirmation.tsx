import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { downloadReceipt, printReceipt } from '../../api/receipts';
import { fetchOrderById } from '../../api/orders';
import type { Order } from '../../types/order';

export default function PaymentConfirmation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
          setError('This order has not been completed yet.');
        } else {
          setOrder(orderData);
        }
      } catch (err) {
        console.error('Error loading order:', err);
        setError('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, navigate]);

  const handlePrintReceipt = async () => {
    if (!id) return;
    
    try {
      setActionLoading('print');
      await printReceipt(parseInt(id));
    } catch (err) {
      console.error('Error printing receipt:', err);
      setError('Failed to print receipt. Please try again.');
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
      setError('Failed to download receipt. Please try again.');
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
          title="Payment Confirmation | Restaurant POS" 
          description="Order payment confirmation page"
        />
        <PageBreadcrumb pageTitle="Payment Confirmation" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <PageMeta 
          title="Payment Confirmation | Restaurant POS" 
          description="Payment confirmation error"
        />
        <PageBreadcrumb pageTitle="Payment Confirmation" />
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600">{error || 'Order not found'}</p>
            </div>
            <button
              onClick={handleBackToOrders}
              className="btn btn-primary"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta 
        title="Payment Confirmation | Restaurant POS" 
        description="Order payment successful"
      />
      <PageBreadcrumb pageTitle="Payment Confirmation" />

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
            <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-green-50 text-lg">Thank you for your payment</p>
          </div>

          {/* Order Details */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="text-lg font-semibold text-gray-900">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Table</p>
                <p className="text-lg font-semibold text-gray-900">
                  {order.table?.number || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {order.payment_method || order.paymentMethod || 'Cash'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-lg font-semibold text-green-600">
                  {order.total.toFixed(2)} MAD
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Receipt Options</h3>
              
              <button
                onClick={handleViewReceipt}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                View Receipt
              </button>

              <button
                onClick={handlePrintReceipt}
                disabled={actionLoading === 'print'}
                className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'print' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Printing...
                  </>
                ) : (
                  <>
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
                    Print Receipt
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={actionLoading === 'download'}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'download' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Downloading...
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </button>

              <button
                onClick={handleBackToOrders}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
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
                Back to Orders
              </button>
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
              <p className="text-sm text-blue-800 font-medium mb-1">Receipt Information</p>
              <p className="text-sm text-blue-700">
                Your receipt has been generated and can be printed or downloaded at any time. 
                You can also access it later from the order details page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

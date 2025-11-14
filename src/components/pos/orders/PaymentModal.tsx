import React, { useState, useEffect } from 'react';
import type { Order } from '@/types/order';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onConfirm: (
    orderId: number,
    paymentData: {
      payment_method: string;
      payment_status: string;
      amount_received?: number;
      tip_amount?: number;
      discount_amount?: number;
    },
  ) => Promise<Order | void>;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  order,
  onConfirm,
}) => {
  const [paymentMethod, setPaymentMethod] =
    useState<'cash' | 'card' | 'mobile'>('cash');
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [tipAmount, setTipAmount] = useState<string>('0');
  const [discountAmount, setDiscountAmount] = useState<string>('0');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paidAt, setPaidAt] = useState<string | null>(null);

  // Reset modal state
  useEffect(() => {
    if (isOpen && order) {
      const method = order.paymentMethod || order.payment_method;
      if (method === 'cash' || method === 'card' || method === 'mobile') {
        setPaymentMethod(method as any);
      } else {
        setPaymentMethod('cash');
      }
      const orderTotal = Number(order.total) || 0;
      setAmountReceived(orderTotal.toFixed(2));
      setTipAmount('0');
      setDiscountAmount('0');
      setIsSuccess(false);
      setPaidAt(null);
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const orderTotal = Number(order.total) || 0;
  const tip = parseFloat(tipAmount) || 0;
  const discount = parseFloat(discountAmount) || 0;
  const finalTotal = orderTotal + tip - discount;
  const received = parseFloat(amountReceived) || 0;
  const change = received - finalTotal;

  const applyTipPercentage = (percentage: number) => {
    const tipValue = (orderTotal * percentage) / 100;
    setTipAmount(tipValue.toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'cash' && received < finalTotal) {
      alert('Amount received must be at least the total amount');
      return;
    }

    setIsProcessing(true);
    try {
      const paymentData: {
        payment_method: string;
        payment_status: string;
        amount_received?: number;
        tip_amount?: number;
        discount_amount?: number;
      } = {
        payment_method: paymentMethod,
        payment_status: 'completed',
      };

      if (paymentMethod === 'cash') {
        paymentData.amount_received = received;
      }

      if (tip > 0) {
        paymentData.tip_amount = tip;
      }

      if (discount > 0) {
        paymentData.discount_amount = discount;
      }

      await onConfirm(order.id, paymentData);
      setPaidAt(new Date().toISOString());
      setIsSuccess(true);
    } catch (error) {
      console.error('Payment processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    window.open(`/api/orders/${order.id}/receipt`, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadReceipt = () => {
    window.open(
      `/api/orders/${order.id}/receipt?format=pdf`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const handleClose = () => {
    setIsSuccess(false);
    setPaidAt(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">💵 Process Payment</h2>
              <p className="text-sm text-gray-600">
                {order.orderNumber || `Order #${order.id}`}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isProcessing}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        {isSuccess ? (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="text-4xl">✅</div>
              <h3 className="text-xl font-bold text-gray-900">Payment Completed</h3>
              <p className="text-sm text-gray-600">
                Order {order.orderNumber || `#${order.id}`} has been marked as paid via{' '}
                <strong className="capitalize">{paymentMethod}</strong>.
              </p>
              {paidAt && (
                <p className="text-xs text-gray-500">
                  Paid at {new Date(paidAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Total</span>
                <span className="font-semibold">MAD {orderTotal.toFixed(2)}</span>
              </div>
              {tip > 0 && (
                <div className="flex justify-between">
                  <span>Tip</span>
                  <span className="font-semibold">MAD {tip.toFixed(2)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className="font-semibold text-rose-600">
                    - MAD {discount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 mt-2">
                <span>Final Amount</span>
                <span className="font-semibold">MAD {finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                🖨️ Print Receipt
              </button>
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                📄 Download PDF
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="w-full px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="text-sm text-gray-600">Order {order.orderNumber || `#${order.id}`}</div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-bold">Total:</span>
              <span className="text-2xl font-bold text-gray-900">
                MAD {orderTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                disabled={isProcessing}
              >
                <div className="text-2xl mb-1">💵</div>
                <div className="text-xs font-medium">Cash</div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                disabled={isProcessing}
              >
                <div className="text-2xl mb-1">💳</div>
                <div className="text-xs font-medium">Card</div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('mobile')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'mobile'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                disabled={isProcessing}
              >
                <div className="text-2xl mb-1">📱</div>
                <div className="text-xs font-medium">Mobile</div>
              </button>
            </div>
          </div>

          {/* Amount Received (Cash only) */}
          {paymentMethod === 'cash' && (
            <div>
              <label htmlFor="amountReceived" className="block text-sm font-medium text-gray-700 mb-2">
                Amount Received
              </label>
              <input
                type="number"
                id="amountReceived"
                step="0.01"
                min={finalTotal}
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="0.00"
                required
                disabled={isProcessing}
              />
            </div>
          )}

          {/* Discount */}
          <div>
            <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-2">
                Discount (Optional)
              </label>
              <div className="relative">
                <input
                  type="number"
                id="discount"
                step="0.01"
                min="0"
                max={orderTotal}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="0.00"
                disabled={isProcessing}
              />
              <span className="absolute right-3 top-2.5 text-gray-500 font-medium">MAD</span>
            </div>
          </div>

          {/* Change Calculation */}
          {paymentMethod === 'cash' && received >= finalTotal && (
            <div className="p-3 bg-gray-100 rounded-lg">
              <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
                <span>Change:</span>
                <span className="font-medium">MAD {change.toFixed(2)}</span>
              </div>
            </div>
          )}

          {received > 0 && received < finalTotal && (
            <div className="text-sm text-red-600">
              ⚠️ Amount received is less than total
            </div>
          )}

          {/* Tips */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tips (Optional)
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <button
                type="button"
                onClick={() => applyTipPercentage(10)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                disabled={isProcessing}
              >
                10%
              </button>
              <button
                type="button"
                onClick={() => applyTipPercentage(15)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                disabled={isProcessing}
              >
                15%
              </button>
              <button
                type="button"
                onClick={() => applyTipPercentage(20)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                disabled={isProcessing}
              >
                20%
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="0.00"
              disabled={isProcessing}
            />
          </div>

          {/* Card/Mobile Message */}
          {(paymentMethod === 'card' || paymentMethod === 'mobile') && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                ℹ️ {paymentMethod === 'card' ? 'Please process the card payment on the terminal' : 'Please process the mobile payment'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || (paymentMethod === 'cash' && received < finalTotal)}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Process Payment
                </>
              )}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Button from '../../components/ui/button/Button';

interface ShiftSummary {
  cashTotal: number;
  cardTotal: number;
  refunds: number;
  tips: number;
  ordersCompleted: number;
  averagePaymentTime: number;
  startTime: string;
}

interface RevenueMetrics {
  cashRevenue: number;
  cardRevenue: number;
  totalSales: number;
  ordersCompleted: number;
  averagePaymentTime: number;
  readyToPayCount: number;
}

const CashierDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    cashRevenue: 1850.00,
    cardRevenue: 3220.00,
    totalSales: 5070.00,
    ordersCompleted: 42,
    averagePaymentTime: 1.8,
    readyToPayCount: 3
  });
  const [showShiftSummary, setShowShiftSummary] = useState(false);
  const [shiftData, setShiftData] = useState<ShiftSummary>({
    cashTotal: 1850.00,
    cardTotal: 3220.00,
    refunds: 50.00,
    tips: 175.00,
    ordersCompleted: 42,
    averagePaymentTime: 1.8,
    startTime: '09:00 AM'
  });

  const handleCloseShift = () => {
    setShowShiftSummary(true);
  };

  const exportShiftSummary = () => {
    const summaryText = `
SHIFT SUMMARY - ${new Date().toLocaleDateString()}
Cashier: ${user?.name}
Start Time: ${shiftData.startTime}
End Time: ${new Date().toLocaleTimeString()}

Cash Total: MAD ${shiftData.cashTotal.toFixed(2)}
Card Total: MAD ${shiftData.cardTotal.toFixed(2)}
Refunds: MAD ${shiftData.refunds.toFixed(2)}
Tips: MAD ${shiftData.tips.toFixed(2)}
End-of-Day Balance: MAD ${(shiftData.cashTotal + shiftData.cardTotal - shiftData.refunds + shiftData.tips).toFixed(2)}

Orders Completed: ${shiftData.ordersCompleted}
Average Payment Time: ${shiftData.averagePaymentTime} min
    `;
    
    const blob = new Blob([summaryText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shift-summary-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <PageMeta title="Cashier Dashboard | POS System" description="Cashier dashboard" />
      <PageBreadcrumb pageTitle="Cashier Dashboard" />
      
      {/* Simple Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome {user?.name}</h1>
        <p className="text-gray-600">Today's Summary</p>
      </div>

      {/* Simple Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded border">
          <div className="text-lg font-bold">MAD {metrics.totalSales.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Total Sales</div>
        </div>
        <div className="bg-white p-4 rounded border">
          <div className="text-lg font-bold">{metrics.readyToPayCount}</div>
          <div className="text-sm text-gray-600">Ready to Pay</div>
        </div>
      </div>

      {/* Simple Actions */}
      <div className="space-y-3">
        <Button 
          onClick={() => window.location.href = '/orders'}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
        >
          Process Payments
        </Button>
        <Button 
          onClick={handleCloseShift}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white"
        >
          Close Shift
        </Button>
      </div>

      {/* Simple Shift Summary */}
      {showShiftSummary && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white border rounded p-6 max-w-md mx-4 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Shift Summary</h2>
            
            <div className="bg-gray-50 p-4 rounded mb-4">
              <div className="text-sm text-gray-600 mb-2">
                {user?.name} • {shiftData.startTime} - {new Date().toLocaleTimeString()}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Cash Total:</span>
                  <span>MAD {shiftData.cashTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Card Total:</span>
                  <span>MAD {shiftData.cardTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tips:</span>
                  <span>MAD {shiftData.tips.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Refunds:</span>
                  <span>MAD {shiftData.refunds.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span>MAD {(shiftData.cashTotal + shiftData.cardTotal - shiftData.refunds + shiftData.tips).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-3 text-sm text-gray-600">
                <div>Orders: {shiftData.ordersCompleted}</div>
                <div>Avg Time: {shiftData.averagePaymentTime} min</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={exportShiftSummary}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Export Summary
              </button>
              <button
                onClick={() => setShowShiftSummary(false)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Continue Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierDashboard;
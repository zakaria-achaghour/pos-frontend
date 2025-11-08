import React, { memo } from 'react';

interface CartItem {
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  special_instructions?: string;
  removed_ingredients?: string[];
  added_extras?: string[];
}

interface OrderCartProps {
  cart: CartItem[];
  onUpdateQuantity: (itemId: number, newQuantity: number) => void;
  onRemoveItem: (itemId: number) => void;
  onPlaceOrder: () => void;
  loading: boolean;
}

const OrderCartComponent: React.FC<OrderCartProps> = ({ 
  cart, 
  onUpdateQuantity, 
  onRemoveItem, 
  onPlaceOrder,
  loading 
}) => {
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="w-full h-full md:h-[calc(100vh-64px)] md:sticky md:top-16 overflow-y-auto bg-white border-l border-gray-200 p-4 md:p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-bold">Cart</h2>
        <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
          {cart.reduce((total, item) => total + item.quantity, 0)}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto mb-4 md:mb-6">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-center font-medium text-sm md:text-base">Cart is empty</p>
            <p className="text-xs md:text-sm">Tap items to add</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item, index) => (
              <div key={`${item.menu_item_id}-${index}`} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start mb-2">
                  <div className="flex-1 pr-2">
                    <div className="font-semibold text-gray-900 text-sm">
                      {item.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {Number(item.price).toFixed(2)} MAD
                    </div>
                    
                    {/* Removed Ingredients */}
                    {item.removed_ingredients && item.removed_ingredients.length > 0 && (
                      <div className="text-xs text-red-600 mt-1">
                        ❌ No: {item.removed_ingredients.join(', ')}
                      </div>
                    )}
                    
                    {/* Added Extras */}
                    {item.added_extras && item.added_extras.length > 0 && (
                      <div className="text-xs text-green-600 mt-1">
                        ➕ Extra: {item.added_extras.join(', ')}
                      </div>
                    )}
                    
                    {/* Special Instructions */}
                    {item.special_instructions && (
                      <div className="text-xs text-blue-600 mt-1 italic">
                        📝 {item.special_instructions}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.menu_item_id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300">
                    <button
                      onClick={() => onUpdateQuantity(item.menu_item_id, item.quantity - 1)}
                      className="px-3 py-1 text-gray-600 hover:text-gray-900 font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-semibold min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.menu_item_id, item.quantity + 1)}
                      className="px-3 py-1 text-gray-600 hover:text-gray-900 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <div className="font-bold text-blue-600">
                    {(Number(item.price) * item.quantity).toFixed(2)} MAD
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total and Place Order */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold text-blue-600">
            {calculateTotal().toFixed(2)} MAD
          </span>
        </div>
        <button
          onClick={onPlaceOrder}
          disabled={cart.length === 0 || loading}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};

export const OrderCart = memo(OrderCartComponent);

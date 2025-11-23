import React, { useState } from 'react';
import type { MenuItem } from '@/types/menu';
import { MODAL_BACKDROP_CLASS, MODAL_OVERLAY_BASE_CLASS } from '@/utils/modalStyles';

interface AddItemModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: MenuItem, quantity: number, specialInstructions?: string, removedIngredients?: string[], addedExtras?: string[]) => void;
  initialValues?: {
    quantity: number;
    specialInstructions?: string;
    removedIngredients?: string[];
    addedExtras?: string[];
  };
  mode?: 'add' | 'edit';
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  item,
  isOpen,
  onClose,
  onAdd,
  initialValues,
  mode = 'add'
}) => {
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [addedExtras, setAddedExtras] = useState<string[]>([]);

  // Reset or initialize state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialValues) {
        setQuantity(initialValues.quantity);
        setSpecialInstructions(initialValues.specialInstructions || '');
        setRemovedIngredients(initialValues.removedIngredients || []);
        setAddedExtras(initialValues.addedExtras || []);
      } else {
        setQuantity(1);
        setSpecialInstructions('');
        setRemovedIngredients([]);
        setAddedExtras([]);
      }
    }
  }, [isOpen, mode, initialValues]);

  // Common extras that can be added
  const availableExtras = [
    'Extra Cheese',
    'Extra Sauce',
    'Extra Spicy',
    'Extra Veggies',
    'Extra Meat',
    'Bacon',
    'Avocado',
    'Fried Egg'
  ];

  if (!isOpen || !item) return null;

  const handleAdd = () => {
    onAdd(item, quantity, specialInstructions, removedIngredients, addedExtras);
    setQuantity(1);
    setSpecialInstructions('');
    setRemovedIngredients([]);
    setAddedExtras([]);
    onClose();
  };

  const handleClose = () => {
    setQuantity(1);
    setSpecialInstructions('');
    setRemovedIngredients([]);
    setAddedExtras([]);
    onClose();
  };

  const toggleIngredient = (ingredient: string) => {
    setRemovedIngredients(prev =>
      prev.includes(ingredient)
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const toggleExtra = (extra: string) => {
    setAddedExtras(prev =>
      prev.includes(extra)
        ? prev.filter(e => e !== extra)
        : [...prev, extra]
    );
  };

  const hasIngredients = item.ingredients && item.ingredients.length > 0;

  return (
    <div className={`${MODAL_OVERLAY_BASE_CLASS} ${MODAL_BACKDROP_CLASS} z-50`}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Image Header */}
        <div className="relative h-48 sm:h-56 bg-gray-100">
          {item.image || item.image_url ? (
            <img
              src={item.image || item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 rounded-full p-2 shadow-sm backdrop-blur-sm transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Header Content */}
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Description */}
          {item.description && (
            <p className="text-sm text-gray-600">{item.description}</p>
          )}

          {/* Price */}
          <div className="flex items-center justify-between py-2 border-y">
            <span className="text-sm font-medium text-gray-700">Base Price</span>
            <span className="text-lg font-bold text-blue-600">
              {Number(item.price).toFixed(2)} MAD
            </span>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 transition-colors"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center border border-gray-300 rounded-lg py-2 font-semibold focus:ring-2 focus:ring-blue-500"
                min="1"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Ingredients - Remove Options */}
          {hasIngredients && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🥗 Ingredients (Select to Remove)
              </label>
              <div className="flex flex-wrap gap-2">
                {item.ingredients.map((ingredient) => (
                  <button
                    key={ingredient}
                    onClick={() => toggleIngredient(ingredient)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${removedIngredients.includes(ingredient)
                      ? 'bg-red-100 text-red-700 border-2 border-red-500 line-through'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    {ingredient}
                  </button>
                ))}
              </div>
              {removedIngredients.length > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  ❌ {removedIngredients.length} ingredient(s) will be removed
                </p>
              )}
            </div>
          )}

          {/* Add Extras */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ➕ Add Extras (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {availableExtras.map((extra) => (
                <button
                  key={extra}
                  onClick={() => toggleExtra(extra)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${addedExtras.includes(extra)
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:border-gray-400'
                    }`}
                >
                  {extra}
                </button>
              ))}
            </div>
            {addedExtras.length > 0 && (
              <p className="text-xs text-green-600 mt-1">
                ✓ {addedExtras.length} extra(s) selected
              </p>
            )}
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📝 Additional Notes (Optional)
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="E.g., Well done, cut in half, separate sauce..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
            />
          </div>

          {/* Summary */}
          {(removedIngredients.length > 0 || addedExtras.length > 0 || specialInstructions) && (
            <div className="bg-blue-50 rounded-lg p-3 space-y-1 text-sm">
              <p className="font-semibold text-blue-900">📋 Customizations:</p>
              {removedIngredients.length > 0 && (
                <p className="text-red-700">
                  <span className="font-medium">Remove:</span> {removedIngredients.join(', ')}
                </p>
              )}
              {addedExtras.length > 0 && (
                <p className="text-green-700">
                  <span className="font-medium">Add:</span> {addedExtras.join(', ')}
                </p>
              )}
              {specialInstructions && (
                <p className="text-gray-700">
                  <span className="font-medium">Notes:</span> {specialInstructions}
                </p>
              )}
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between py-3 bg-blue-50 rounded-lg px-4">
            <span className="text-sm font-semibold text-gray-700">Total</span>
            <span className="text-xl font-bold text-blue-600">
              {(Number(item.price) * quantity).toFixed(2)} MAD
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white flex gap-3 p-4 border-t">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            {mode === 'edit' ? 'Update Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

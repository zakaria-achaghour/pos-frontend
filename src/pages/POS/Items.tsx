import { useState, useEffect } from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';

// Mock data
const mockCategories = [
  { id: 1, name: 'Appetizers', description: 'Starter dishes' },
  { id: 2, name: 'Main Courses', description: 'Primary dishes' },
  { id: 3, name: 'Desserts', description: 'Sweet treats' },
  { id: 4, name: 'Beverages', description: 'Drinks and refreshments' },
];

const mockItems = [
  { id: 1, name: 'Caesar Salad', price: 85.00, category_id: 1, category_name: 'Appetizers', is_active: true },
  { id: 2, name: 'Grilled Chicken', price: 150.00, category_id: 2, category_name: 'Main Courses', is_active: true },
  { id: 3, name: 'Chocolate Cake', price: 65.00, category_id: 3, category_name: 'Desserts', is_active: false },
  { id: 4, name: 'Orange Juice', price: 25.00, category_id: 4, category_name: 'Beverages', is_active: true },
];

interface Category {
  id: number;
  name: string;
  description: string;
}

interface Item {
  id: number;
  name: string;
  price: number;
  category_id: number;
  category_name: string;
  is_active: boolean;
}

export default function Items() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category_id: '',
    is_active: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      // const [categoriesRes, itemsRes] = await Promise.all([
      //   api.get('/categories'),
      //   api.get('/items')
      // ]);
      
      setTimeout(() => {
        setCategories(mockCategories);
        setItems(mockItems);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.get(`/items${selectedCategory ? `?category_id=${selectedCategory}` : ''}`);
      
      const filteredItems = selectedCategory 
        ? mockItems.filter(item => item.category_id === selectedCategory)
        : mockItems;
      setItems(filteredItems);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      // TODO: Replace with actual API call
      // await api.post('/items', {
      //   ...newItem,
      //   price: parseFloat(newItem.price),
      //   category_id: parseInt(newItem.category_id)
      // });
      
      setTimeout(() => {
        const category = categories.find(c => c.id === parseInt(newItem.category_id));
        const newItemData: Item = {
          id: Date.now(),
          name: newItem.name,
          price: parseFloat(newItem.price),
          category_id: parseInt(newItem.category_id),
          category_name: category?.name || '',
          is_active: newItem.is_active
        };
        setItems([...items, newItemData]);
        setNewItem({ name: '', price: '', category_id: '', is_active: true });
        setShowModal(false);
        setSubmitting(false);
      }, 500);
    } catch (error) {
      console.error('Error creating item:', error);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageMeta title="Items | POS System" description="Manage menu items" />
        <PageBreadcrumb pageTitle="Items" />
        <div className="bg-white rounded-xl shadow p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title="Items | POS System" description="Manage menu items" />
      <PageBreadcrumb pageTitle="Items" />
      
      <div className="bg-white rounded-xl shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Menu Items</h2>
            <Button onClick={() => setShowModal(true)}>New Item</Button>
          </div>
          
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : '')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-6">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No items found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-900">{item.name}</td>
                      <td className="py-3 px-4 text-gray-600">{item.category_name}</td>
                      <td className="py-3 px-4 text-gray-900">{item.price.toFixed(2)} MAD</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">New Item</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="price">Price (MAD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={newItem.category_id}
                  onChange={(e) => setNewItem({ ...newItem, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newItem.is_active}
                    onChange={(e) => setNewItem({ ...newItem, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  Active
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
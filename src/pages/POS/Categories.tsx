import { useState, useEffect } from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';

// Mock data - replace with actual API call
const mockCategories = [
  { id: 1, name: 'Appetizers', description: 'Starter dishes' },
  { id: 2, name: 'Main Courses', description: 'Primary dishes' },
  { id: 3, name: 'Desserts', description: 'Sweet treats' },
  { id: 4, name: 'Beverages', description: 'Drinks and refreshments' },
];

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await api.get('/categories');
      // setCategories(response.data);
      
      setTimeout(() => {
        setCategories(mockCategories);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      // TODO: Replace with actual API call
      // await api.post('/categories', newCategory);
      
      // Simulate API call
      setTimeout(() => {
        const newCat = { id: Date.now(), ...newCategory };
        setCategories([...categories, newCat]);
        setNewCategory({ name: '', description: '' });
        setShowModal(false);
        setSubmitting(false);
      }, 500);
    } catch (error) {
      console.error('Error creating category:', error);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageMeta
          title="Categories | POS System"
          description="Manage menu categories"
        />
        <PageBreadcrumb pageTitle="Categories" />
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
      <PageMeta
        title="Categories | POS System"
        description="Manage menu categories"
      />
      <PageBreadcrumb pageTitle="Categories" />
      
      <div className="bg-white rounded-xl shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
            <Button onClick={() => setShowModal(true)}>
              New Category
            </Button>
          </div>
        </div>

        <div className="p-6">
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No categories found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-900">{category.name}</td>
                      <td className="py-3 px-4 text-gray-600">{category.description}</td>
                      <td className="py-3 px-4">
                        <button className="text-red-600 hover:text-red-800 text-sm">
                          Delete
                        </button>
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
            <h3 className="text-lg font-semibold mb-4">New Category</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  type="text"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                />
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
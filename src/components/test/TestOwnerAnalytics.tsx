import React from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { useAuth } from '../../hooks/useAuthRedux';

export default function TestOwnerAnalytics() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageMeta title="Table Analytics Test | POS System" description="Test page for owner analytics" />
      <PageBreadcrumb pageTitle="Table Analytics Test" />
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-green-600 mb-4">✅ Table Analytics Access Test</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="font-semibold text-green-800">🎉 Success!</h2>
            <p className="text-green-700">You can access the Table Analytics page as an owner.</p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800">👤 User Information:</h3>
            <div className="mt-2 text-blue-700">
              <p><strong>Name:</strong> {user?.name || 'Unknown'}</p>
              <p><strong>Role:</strong> {user?.role || 'Unknown'}</p>
              <p><strong>Email:</strong> {user?.email || 'Unknown'}</p>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800">🔧 Route Test:</h3>
            <p className="text-yellow-700">
              Current URL: <code className="bg-white px-2 py-1 rounded">{window.location.pathname}</code>
            </p>
            <p className="text-yellow-700">
              Expected: <code className="bg-white px-2 py-1 rounded">/owner/tables</code>
            </p>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-800">📝 Next Steps:</h3>
            <p className="text-gray-700">
              If you can see this page, the route protection is working correctly. 
              We can now proceed to load the actual analytics components.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
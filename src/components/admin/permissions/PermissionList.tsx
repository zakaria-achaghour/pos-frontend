import React from 'react';
import type { Permission } from '@/types/roles';

interface PermissionListProps {
  permissions: Permission[];
  loading?: boolean;
  onEdit: (permission: Permission) => void;
  onDelete: (id: number, name: string) => void;
}

export default function PermissionList({ permissions, loading, onEdit, onDelete }: PermissionListProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="animate-pulse p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (permissions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow border p-12 text-center">
        <div className="text-gray-400 text-6xl mb-4">🔑</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No permissions found</h3>
        <p className="text-gray-600">Create your first permission to define access controls.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Permission Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created At
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {permissions.map((permission) => (
            <tr key={permission.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {permission.name}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(permission.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(permission)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => onDelete(permission.id, permission.name)}
                    className="text-red-600 hover:text-red-900"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

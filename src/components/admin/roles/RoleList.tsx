import React from 'react';
import type { Role } from '@/types/roles';
import RoleCard from './RoleCard';

interface RoleListProps {
  roles: Role[];
  loading?: boolean;
  onEdit: (role: Role) => void;
  onDelete: (id: number, name: string) => void;
  onViewUsers: (role: Role) => void;
}

export default function RoleList({ roles, loading, onEdit, onDelete, onViewUsers }: RoleListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow border p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow border p-12 text-center">
        <div className="text-gray-400 text-6xl mb-4">🔐</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
        <p className="text-gray-600">Create your first role to get started with access control.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {roles.map((role) => (
        <RoleCard
          key={role.id}
          role={role}
          onEdit={onEdit}
          onDelete={(id) => onDelete(id, role.name)}
          onViewUsers={onViewUsers}
        />
      ))}
    </div>
  );
}

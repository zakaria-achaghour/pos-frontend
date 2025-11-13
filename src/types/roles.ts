// ============================================
// ROLE & PERMISSION CORE TYPES
// ============================================

export interface Role {
  id: number;
  name: string;
  permissions: string[]; // Array of permission slugs
  users_count: number;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string; // Permission slug like "manage-menu"
  created_at: string;
  updated_at: string;
}

export interface RoleUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

// ============================================
// ROLE & PERMISSION FORM DATA
// ============================================

export interface RoleFormData {
  name: string;
  permissions: string[];
}

export interface PermissionFormData {
  name: string;
}

// ============================================
// COMPONENT PROPS
// ============================================

export interface RoleListProps {
  roles: Role[];
  loading?: boolean;
  onEdit: (role: Role) => void;
  onDelete: (id: number, name: string) => void;
  onViewUsers: (role: Role) => void;
}

export interface RoleCardProps {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (id: number) => void;
  onViewUsers: (role: Role) => void;
}

export interface RoleFormProps {
  initialData?: Partial<RoleFormData>;
  isEdit?: boolean;
  onSubmit: (data: RoleFormData) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
  serverErrors?: Record<string, string | string[]>;
  availablePermissions: Permission[];
}

export interface PermissionListProps {
  permissions: Permission[];
  loading?: boolean;
  onEdit: (permission: Permission) => void;
  onDelete: (id: number, name: string) => void;
}

export interface PermissionFormProps {
  initialData?: Partial<PermissionFormData>;
  isEdit?: boolean;
  onSubmit: (data: PermissionFormData) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
  serverErrors?: Record<string, string | string[]>;
}

export interface RoleUsersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
  users: RoleUser[];
}

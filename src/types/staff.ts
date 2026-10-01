// ============================================
// STAFF CORE TYPES
// ============================================

export type StaffRole = 'manager' | 'cashier' | 'waiter' | 'kitchen';
export type StaffStatus = 'active' | 'inactive' | 'on-break' | 'vacation';

export interface ShiftDay {
  start: string;
  end: string;
  isWorking: boolean;
}

export interface ShiftSchedule {
  monday: ShiftDay;
  tuesday: ShiftDay;
  wednesday: ShiftDay;
  thursday: ShiftDay;
  friday: ShiftDay;
  saturday: ShiftDay;
  sunday: ShiftDay;
}

export interface PerformanceMetrics {
  ordersCompleted: number;
  revenueGenerated: number;
  customerRating: number;
  punctualityScore: number;
  tips: number;
}

export interface CurrentShift {
  clockIn: string;
  isActive: boolean;
  tableAssignments?: number[];
}

export interface StaffMember {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: StaffRole;
  status: StaffStatus;
  hireDate: string;
  salary: number;
  shiftSchedule: ShiftSchedule;
  performance: PerformanceMetrics;
  currentShift?: CurrentShift;
}

export interface StaffFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: StaffRole;
  salary: number;
  hireDate: string;
  password: string;
  employee_id: string;
}

// ============================================
// STAFF API TYPES
// ============================================

export interface Staff {
  id: number;
  name: string;
  email: string;
  role: 'manager' | 'cashier' | 'waiter' | 'kitchen';
  phone?: string;
  address?: string;
  hire_date: string;
  hourly_rate?: number;
  photo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateStaffData {
  name?: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  hire_date: string;
  hourly_rate?: number;
  password: string;
  user_id?: number;
  employee_id?: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  department?: string;
  status?: string;
}

export interface UpdateStaffData extends Partial<Omit<CreateStaffData, 'password'>> {
  password?: string;
  is_active?: boolean;
  status?: string;
}

export interface StaffPerformance {
  staff_id: number;
  staff_name: string;
  orders_completed: number;
  revenue_generated: number;
  hours_worked: number;
  performance_score: number;
  productivity_rate: number;
  period: string;
}

export interface AttendanceRecord {
  id: number;
  staff_id: number;
  staff_name: string;
  clock_in: string;
  clock_out?: string;
  hours_worked?: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'early_leave';
}

export interface ClockInData {
  staff_id: number;
}

export interface ClockOutData {
  staff_id: number;
}

export interface AttendanceSummary {
  total_staff: number;
  present_today: number;
  absent_today: number;
  late_today: number;
  total_hours_today: number;
  average_hours_per_staff: number;
}

// ============================================
// STAFF COMPONENT PROPS
// ============================================

export interface StaffFiltersProps {
  filters: Record<string, string | number | boolean | undefined>;
  onFilterChange: (key: string, value: string | number | undefined) => void;
  onClearFilters: () => void;
}

export interface StaffFormProps {
  initialData?: Partial<StaffFormData>;
  initialValues?: Partial<StaffFormData>; // Alias for backward compatibility
  isEdit?: boolean;
  onSubmit: (data: StaffFormData) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
  loading?: boolean; // Alias for backward compatibility
  serverErrors?: Record<string, string | string[]>;
  availableRoles?: Array<{ name: string; label: string }>; // Optional: roles from API
}

export interface StaffEditFormProps {
  staff: StaffMember;
  onSubmit: (data: Partial<StaffMember>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  staff?: StaffMember | null;
}

export interface StaffListProps {
  staff: StaffMember[];
  loading?: boolean;
  onEdit: (staff: StaffMember) => void;
  onDelete: (id: number, name: string) => void;
  onStatusChange: (id: number, status: StaffStatus) => void;
  onClockInOut: (id: number) => void;
  onViewDetails: (staff: StaffMember) => void;
}

export interface StaffCardProps {
  staff: StaffMember;
  onEdit: (staff: StaffMember) => void;
  onDelete: (id: number) => void;
  onView?: (staff: StaffMember) => void;
}

export interface StaffPerformanceViewProps {
  staffId: number;
  onClose?: () => void;
}

export interface StaffScheduleViewProps {
  staff: StaffMember[];
}



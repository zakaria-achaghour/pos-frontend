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


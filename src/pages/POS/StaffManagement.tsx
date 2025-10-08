import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuthRedux';
import { useStaff } from '../../hooks/useStaffRedux';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Alert from '../../components/ui/alert/Alert';

interface StaffMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'manager' | 'cashier' | 'waiter' | 'kitchen';
  status: 'active' | 'inactive' | 'on-break' | 'vacation';
  hireDate: string;
  salary: number;
  shiftSchedule: {
    monday: { start: string; end: string; isWorking: boolean };
    tuesday: { start: string; end: string; isWorking: boolean };
    wednesday: { start: string; end: string; isWorking: boolean };
    thursday: { start: string; end: string; isWorking: boolean };
    friday: { start: string; end: string; isWorking: boolean };
    saturday: { start: string; end: string; isWorking: boolean };
    sunday: { start: string; end: string; isWorking: boolean };
  };
  performance: {
    ordersCompleted: number;
    revenueGenerated: number;
    customerRating: number;
    punctualityScore: number;
    tips: number;
  };
  currentShift?: {
    clockIn: string;
    isActive: boolean;
    tableAssignments?: number[];
  };
}

interface StaffFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: 'manager' | 'cashier' | 'waiter' | 'kitchen';
  salary: number;
  hireDate: string;
  password: string;
  employee_id: string;
}

// Map API Staff to local StaffMember format
const mapApiStaffToLocal = (apiStaff: any): StaffMember => {
  return {
    id: apiStaff.id,
    name: apiStaff.first_name && apiStaff.last_name 
      ? `${apiStaff.first_name} ${apiStaff.last_name}` 
      : apiStaff.name || 'Unknown',
    email: apiStaff.email || '',
    phone: apiStaff.phone || '',
    role: apiStaff.role || 'waiter',
    status: apiStaff.is_active ? 'active' : 'inactive',
    hireDate: apiStaff.hire_date || apiStaff.created_at || new Date().toISOString().split('T')[0],
    salary: apiStaff.hourly_rate || 0,
    // Set default values for complex fields not provided by API
    shiftSchedule: {
      monday: { start: '09:00', end: '17:00', isWorking: true },
      tuesday: { start: '09:00', end: '17:00', isWorking: true },
      wednesday: { start: '09:00', end: '17:00', isWorking: true },
      thursday: { start: '09:00', end: '17:00', isWorking: true },
      friday: { start: '09:00', end: '17:00', isWorking: true },
      saturday: { start: '10:00', end: '18:00', isWorking: true },
      sunday: { start: '10:00', end: '18:00', isWorking: false }
    },
    performance: {
      ordersCompleted: 0,
      revenueGenerated: 0,
      customerRating: 4.5,
      punctualityScore: 90,
      tips: 0
    }
  };
};

// Mock staff data
const initialStaff: StaffMember[] = [
  {
    id: 1,
    name: 'Sara Alami',
    email: 'sara@restaurant.com',
    phone: '+212 6 12 34 56 78',
    role: 'waiter',
    status: 'active',
    hireDate: '2024-01-15',
    salary: 3500,
    shiftSchedule: {
      monday: { start: '09:00', end: '17:00', isWorking: true },
      tuesday: { start: '09:00', end: '17:00', isWorking: true },
      wednesday: { start: '09:00', end: '17:00', isWorking: true },
      thursday: { start: '09:00', end: '17:00', isWorking: true },
      friday: { start: '09:00', end: '17:00', isWorking: true },
      saturday: { start: '10:00', end: '18:00', isWorking: true },
      sunday: { start: '10:00', end: '18:00', isWorking: false }
    },
    performance: {
      ordersCompleted: 156,
      revenueGenerated: 15800.50,
      customerRating: 4.8,
      punctualityScore: 95,
      tips: 850.75
    },
    currentShift: {
      clockIn: '09:15',
      isActive: true,
      tableAssignments: [1, 3, 5, 7]
    }
  },
  {
    id: 2,
    name: 'Ahmed Benjelloun',
    email: 'ahmed@restaurant.com',
    phone: '+212 6 87 65 43 21',
    role: 'cashier',
    status: 'active',
    hireDate: '2024-03-10',
    salary: 4000,
    shiftSchedule: {
      monday: { start: '14:00', end: '22:00', isWorking: true },
      tuesday: { start: '14:00', end: '22:00', isWorking: true },
      wednesday: { start: '14:00', end: '22:00', isWorking: true },
      thursday: { start: '14:00', end: '22:00', isWorking: true },
      friday: { start: '14:00', end: '22:00', isWorking: true },
      saturday: { start: '12:00', end: '20:00', isWorking: true },
      sunday: { start: '12:00', end: '20:00', isWorking: true }
    },
    performance: {
      ordersCompleted: 89,
      revenueGenerated: 25600.00,
      customerRating: 4.6,
      punctualityScore: 88,
      tips: 425.50
    },
    currentShift: {
      clockIn: '14:05',
      isActive: true
    }
  },
  {
    id: 3,
    name: 'Fatima Kadiri',
    email: 'fatima@restaurant.com',
    phone: '+212 6 55 44 33 22',
    role: 'kitchen',
    status: 'active',
    hireDate: '2023-11-20',
    salary: 3800,
    shiftSchedule: {
      monday: { start: '11:00', end: '19:00', isWorking: true },
      tuesday: { start: '11:00', end: '19:00', isWorking: true },
      wednesday: { start: '11:00', end: '19:00', isWorking: true },
      thursday: { start: '11:00', end: '19:00', isWorking: true },
      friday: { start: '11:00', end: '19:00', isWorking: true },
      saturday: { start: '11:00', end: '19:00', isWorking: true },
      sunday: { start: '11:00', end: '19:00', isWorking: false }
    },
    performance: {
      ordersCompleted: 234,
      revenueGenerated: 0, // Kitchen staff don't directly generate revenue
      customerRating: 4.9,
      punctualityScore: 92,
      tips: 0
    },
    currentShift: {
      clockIn: '11:00',
      isActive: true
    }
  }
];

export default function StaffManagement() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'performance' | 'schedule'>('grid');
  const [roleFilter, setRoleFilter] = useState<'all' | 'manager' | 'cashier' | 'waiter' | 'kitchen'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState<StaffFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'waiter',
    salary: 3000,
    hireDate: new Date().toISOString().split('T')[0],
    password: 'password123',
    employee_id: ''
  });

  // Fetch staff data from API
  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching staff data from API...');
      const response = await staffAPI.getStaff();
      console.log('✅ API Response:', response);
      
      const mappedStaff = response.data.map(mapApiStaffToLocal);
      console.log('📝 Mapped staff data:', mappedStaff);
      
      setStaff(mappedStaff);
    } catch (error: any) {
      console.error('❌ Error fetching staff:', error);
      setError(error.response?.data?.message || 'Failed to fetch staff data');
    } finally {
      setLoading(false);
    }
  };

  // Load staff data on component mount
  useEffect(() => {
    fetchStaff();
  }, []);

  // Filter staff by role
  const filteredStaff = staff.filter(member => 
    roleFilter === 'all' || member.role === roleFilter
  );

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'salary' ? parseFloat(value) || 0 : value
    }));
  };

  // Add new staff member
  const handleAddStaff = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setValidationErrors({});
    
    try {
      console.log('➕ Creating new staff member:', formData);
      
      // Generate user_id (you might want to get this from user context or backend)
      const userId = user?.id || 1; // Fallback to 1 if user ID not available
      
      // Generate employee_id if not provided
      const employeeId = formData.employee_id || `EMP${Date.now()}`;
      
      const createData = {
        user_id: userId,
        employee_id: employeeId,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        position: formData.role, // Backend expects 'position' instead of 'role'
        phone: formData.phone,
        hire_date: formData.hireDate,
        hourly_rate: formData.salary,
        password: formData.password
      };
      
      console.log('📤 Sending data to API:', createData);
      
      const response = await fetch('http://localhost:8080/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(createData)
      });
      
      const responseData = await response.json();
      console.log('📡 API Response:', responseData);
      
      if (!response.ok) {
        if (responseData.errors) {
          setValidationErrors(responseData.errors);
          setError(responseData.message || 'Validation errors occurred');
        } else {
          setError(responseData.message || 'Failed to add staff member');
        }
        return;
      }
      
      // Success - refresh the staff list
      await fetchStaff();
      
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'waiter',
        salary: 3000,
        hireDate: new Date().toISOString().split('T')[0],
        password: 'password123',
        employee_id: ''
      });
      setShowAddModal(false);
      setSuccessMessage('Staff member added successfully!');
      
      // Auto-hide success message
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('❌ Error adding staff:', error);
      setError('Failed to add staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update staff status
  const handleStatusChange = async (memberId: number, newStatus: StaffMember['status']) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setStaff(prev => prev.map((member: StaffMember) => 
        member.id === memberId ? { ...member, status: newStatus } : member
      ));
      
      const member = staff.find((s: StaffMember) => s.id === memberId);
      showToast(`${member?.name}'s status updated to ${newStatus}`, 'success');
    } catch (error) {
      showToast('Failed to update status', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete staff member
  const handleDeleteStaff = async (memberId: number) => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    setLoading(true);
    try {
      console.log('🗑️ Deleting staff member:', memberId);
      await staffAPI.deleteStaff(memberId);
      
      setStaff(prev => prev.filter((member: StaffMember) => member.id !== memberId));
      setSuccessMessage('Staff member deleted successfully!');
      
      // Auto-hide success message
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('❌ Error deleting staff:', error);
      setError(error.response?.data?.message || 'Failed to delete staff member');
    } finally {
      setLoading(false);
    }
  };

  // Clock in/out staff
  const handleClockInOut = async (memberId: number) => {
    const member = staff.find(s => s.id === memberId);
    if (!member) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const isClockingIn = !member.currentShift?.isActive;
      const currentTime = new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      setStaff(prev => prev.map(s => 
        s.id === memberId ? {
          ...s,
          currentShift: isClockingIn ? {
            clockIn: currentTime,
            isActive: true,
            ...(s.role === 'waiter' && { tableAssignments: [] })
          } : undefined
        } : s
      ));
      
      showToast(`${member.name} ${isClockingIn ? 'clocked in' : 'clocked out'}`, 'success');
    } catch (error) {
      showToast('Failed to update clock status', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: 'waiter',
      salary: 3000,
      hireDate: new Date().toISOString().split('T')[0],
      password: 'password123',
      employee_id: ''
    });
    setValidationErrors({});
    setError(null);
  };

  // Close modals
  const closeModals = () => {
    setShowAddModal(false);
    setSelectedMember(null);
    setEditingMember(null);
    resetForm();
  };

  // Toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white font-medium ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'cashier': return 'bg-green-100 text-green-800';
      case 'waiter': return 'bg-blue-100 text-blue-800';
      case 'kitchen': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'on-break': return 'bg-yellow-100 text-yellow-800';
      case 'vacation': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get total staff stats
  const getStaffStats = () => {
    return {
      total: staff.length,
      active: staff.filter(s => s.status === 'active').length,
      onShift: staff.filter(s => s.currentShift?.isActive).length,
      totalSalary: staff.reduce((sum, s) => sum + s.salary, 0)
    };
  };

  const stats = getStaffStats();

  return (
    <div className="space-y-6">
      <PageMeta title="Staff Management | POS System" description="Manage restaurant staff and schedules" />
      <PageBreadcrumb pageTitle="Staff Management" />
      
      {/* Success Message */}
      {successMessage && (
        <Alert
          message={successMessage}
          type="success"
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {/* Error Message */}
      {error && (
        <Alert
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}

      {/* Validation Errors */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-red-800 font-medium mb-2">Please fix the following errors:</h4>
          <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
            {Object.entries(validationErrors).map(([field, errors]) => (
              <li key={field}>
                <strong>{field.replace('_', ' ')}:</strong> {errors[0]}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Header with Stats */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-600">Manage your restaurant team</p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Staff</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{stats.onShift}</div>
              <div className="text-sm text-gray-600">On Shift</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">MAD {stats.totalSalary.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Salaries</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            {[
              { key: 'grid', label: 'Staff Grid', icon: '👥' },
              { key: 'performance', label: 'Performance', icon: '📊' },
              { key: 'schedule', label: 'Schedule', icon: '📅' }
            ].map((mode) => (
              <button
                key={mode.key}
                onClick={() => setViewMode(mode.key as any)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  viewMode === mode.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode.icon} {mode.label}
              </button>
            ))}
          </div>

          {/* Role Filter & Add Button */}
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="manager">Managers</option>
              <option value="cashier">Cashiers</option>
              <option value="waiter">Waiters</option>
              <option value="kitchen">Kitchen</option>
            </select>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              ➕ Add Staff
            </button>
          </div>
        </div>
      </div>

      {/* Staff Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((member) => (
            <div key={member.id} className="bg-white rounded-lg shadow border">
              {/* Member Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                      {member.role}
                    </span>
                    <div className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Member Body */}
              <div className="p-4">
                <div className="space-y-3">
                  {/* Current Shift Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Shift Status:</span>
                    <div className="flex items-center gap-2">
                      {member.currentShift?.isActive ? (
                        <span className="text-green-600 text-sm">
                          🟢 On duty since {member.currentShift.clockIn}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">⚫ Off duty</span>
                      )}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Orders:</span>
                      <div className="font-medium">{member.performance.ordersCompleted}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Rating:</span>
                      <div className="font-medium">⭐ {member.performance.customerRating.toFixed(1)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Salary:</span>
                      <div className="font-medium">MAD {member.salary.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Tips:</span>
                      <div className="font-medium text-green-600">MAD {member.performance.tips.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Table Assignments (for waiters) */}
                  {member.role === 'waiter' && member.currentShift?.tableAssignments && (
                    <div>
                      <span className="text-sm text-gray-600">Tables: </span>
                      <span className="text-sm font-medium">
                        {member.currentShift.tableAssignments.map(t => `T${t}`).join(', ') || 'None'}
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleClockInOut(member.id)}
                      className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                        member.currentShift?.isActive
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      disabled={loading}
                    >
                      {member.currentShift?.isActive ? '⏰ Clock Out' : '⏰ Clock In'}
                    </button>
                    <button
                      onClick={() => setSelectedMember(member)}
                      className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200"
                    >
                      👁️ Details
                    </button>
                  </div>

                  {/* Status Change */}
                  <select
                    value={member.status}
                    onChange={(e) => handleStatusChange(member.id, e.target.value as StaffMember['status'])}
                    className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on-break">On Break</option>
                    <option value="vacation">Vacation</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Performance View */}
      {viewMode === 'performance' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">📊 Staff Performance</h3>
            <div className="space-y-4">
              {filteredStaff
                .sort((a, b) => b.performance.revenueGenerated - a.performance.revenueGenerated)
                .map((member, index) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'}
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.role}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-6 text-center">
                      <div>
                        <div className="text-lg font-bold">{member.performance.ordersCompleted}</div>
                        <div className="text-xs text-gray-600">Orders</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          MAD {member.performance.revenueGenerated.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">Revenue</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">⭐ {member.performance.customerRating.toFixed(1)}</div>
                        <div className="text-xs text-gray-600">Rating</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{member.performance.punctualityScore}%</div>
                        <div className="text-xs text-gray-600">Punctuality</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Schedule View */}
      {viewMode === 'schedule' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">📅 Weekly Schedule</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Staff Member</th>
                    <th className="text-center p-2">Monday</th>
                    <th className="text-center p-2">Tuesday</th>
                    <th className="text-center p-2">Wednesday</th>
                    <th className="text-center p-2">Thursday</th>
                    <th className="text-center p-2">Friday</th>
                    <th className="text-center p-2">Saturday</th>
                    <th className="text-center p-2">Sunday</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((member) => (
                    <tr key={member.id} className="border-b">
                      <td className="p-2">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xs text-gray-600">{member.role}</div>
                      </td>
                      {Object.entries(member.shiftSchedule).map(([day, shift]) => (
                        <td key={day} className="p-2 text-center">
                          {shift.isWorking ? (
                            <div className="text-green-600 text-xs">
                              <div>{shift.start} - {shift.end}</div>
                            </div>
                          ) : (
                            <div className="text-gray-400 text-xs">Off</div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-lg border">
            <h3 className="text-xl font-bold mb-4">Add New Staff Member</h3>
            
            <div className="space-y-4">
              {/* Employee ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                <input
                  type="text"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Will be auto-generated if empty"
                />
                {validationErrors.employee_id && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.employee_id[0]}</p>
                )}
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                {validationErrors.first_name && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.first_name[0]}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                {validationErrors.last_name && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.last_name[0]}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.email[0]}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {validationErrors.phone && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.phone[0]}</p>
                )}
              </div>

              {/* Role/Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="waiter">Waiter</option>
                  <option value="cashier">Cashier</option>
                  <option value="kitchen">Kitchen Staff</option>
                  <option value="manager">Manager</option>
                </select>
                {validationErrors.position && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.position[0]}</p>
                )}
              </div>

              {/* Salary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (MAD)</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  min="20"
                  max="200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {validationErrors.hourly_rate && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.hourly_rate[0]}</p>
                )}
              </div>

              {/* Hire Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                <input
                  type="date"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {validationErrors.hire_date && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.hire_date[0]}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {validationErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.password[0]}</p>
                )}
              </div>

              {/* User ID Error */}
              {validationErrors.user_id && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">
                    <strong>User ID Error:</strong> {validationErrors.user_id[0]}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModals}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddStaff}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                disabled={loading || !formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()}
              >
                {loading ? 'Adding...' : 'Add Staff'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 shadow-lg border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{selectedMember.name} - Details</h3>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div>
                <h4 className="font-semibold mb-3">📋 Personal Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Email:</span> {selectedMember.email}</div>
                  <div><span className="text-gray-600">Phone:</span> {selectedMember.phone}</div>
                  <div><span className="text-gray-600">Role:</span> {selectedMember.role}</div>
                  <div><span className="text-gray-600">Hire Date:</span> {selectedMember.hireDate}</div>
                  <div><span className="text-gray-600">Salary:</span> MAD {selectedMember.salary.toLocaleString()}</div>
                </div>
              </div>

              {/* Performance */}
              <div>
                <h4 className="font-semibold mb-3">📊 Performance Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Orders Completed:</span> {selectedMember.performance.ordersCompleted}</div>
                  <div><span className="text-gray-600">Revenue Generated:</span> MAD {selectedMember.performance.revenueGenerated.toLocaleString()}</div>
                  <div><span className="text-gray-600">Customer Rating:</span> ⭐ {selectedMember.performance.customerRating.toFixed(1)}</div>
                  <div><span className="text-gray-600">Punctuality:</span> {selectedMember.performance.punctualityScore}%</div>
                  <div><span className="text-gray-600">Tips Earned:</span> MAD {selectedMember.performance.tips.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => setSelectedMember(null)}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
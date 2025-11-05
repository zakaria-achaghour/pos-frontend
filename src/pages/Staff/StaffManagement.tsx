import React, { useState } from 'react';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Alert from '@/components/ui/alert/Alert';
import Modal from '@/components/common/Modal';
import { useStaffManagement } from '@/hooks/useStaffManagement';
import PaginationWithText from '@/components/ui/pagination/PaginationWithText';

// Import new components
import StaffFilters from '@/components/pos/staff/StaffFilters';
import StaffList from '@/components/pos/staff/StaffList';
import StaffPerformanceView from '@/components/pos/staff/StaffPerformanceView';
import StaffScheduleView from '@/components/pos/staff/StaffScheduleView';
import StaffForm from '@/components/pos/staff/StaffForm';
import StaffEditForm from '@/components/pos/staff/StaffEditForm';
import type { StaffMember } from '@/types/staff';

export default function StaffManagement() {
  const {
    // Data
    staff,
    filteredStaff,
    selectedMember,
    editingMember,
    
    // UI State
    viewMode,
    roleFilter,
    loading,
    error,
    successMessage,
    validationErrors,
    pagination,

    // Actions
    createStaff,
    updateStaff,
    deleteStaff,
    updateStaffStatus,
    clockInOut,
    goToPage,
    
    // UI Actions
    setViewMode,
    setRoleFilter,
    setSelectedMember,
    setEditingMember,
    clearError,
    
    // Computed values
    staffStats,
  } = useStaffManagement();

  // Local modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<StaffMember | null>(null);

  // Handle form submissions
  const handleAddStaff = async (values: any) => {
    try {
      await createStaff(values);
      setShowAddModal(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEditStaff = async (values: any) => {
    if (!editingMember) return;
    try {
      await updateStaff(editingMember.id, values);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDeleteRequest = (memberId: number) => {
    const member = staff.find((s) => s.id === memberId);
    if (member) {
      setMemberToDelete(member);
    }
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    try {
      await deleteStaff(memberToDelete.id);
      setMemberToDelete(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  // Close all modals
  const closeModals = () => {
    setShowAddModal(false);
    setSelectedMember(null);
    setEditingMember(null);
    setMemberToDelete(null);
    clearError();
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Staff Management | POS System" description="Manage restaurant staff and schedules" />
      <PageBreadcrumb pageTitle="Staff Management" />
      
      {/* Success Message */}
      {successMessage && (
        <Alert
          variant="success"
          title="Success!"
          message={successMessage}
        />
      )}

      {/* Error Message */}
      {error && (
        <Alert
          variant="error"
          title="Error"
          message={error}
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
              <div className="text-lg font-bold text-gray-900">{staffStats.total}</div>
              <div className="text-sm text-gray-600">Total Staff</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{staffStats.onShift}</div>
              <div className="text-sm text-gray-600">On Shift</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{staffStats.active}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">MAD {staffStats.totalSalary.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Salaries</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <StaffFilters
        viewMode={viewMode}
        roleFilter={roleFilter}
        onViewModeChange={setViewMode}
        onRoleFilterChange={(filter) => {
          setRoleFilter(filter);
          if (pagination.currentPage !== 1) {
            goToPage(1);
          }
        }}
        onAddStaff={() => setShowAddModal(true)}
      />

      {/* Main Content based on View Mode */}
      {viewMode === 'grid' && (
        <StaffList
          staff={filteredStaff}
          loading={loading}
          onClockInOut={clockInOut}
          onViewDetails={setSelectedMember}
          onStatusChange={updateStaffStatus}
          onEdit={setEditingMember}
          onDelete={handleDeleteRequest}
        />
      )}

      {viewMode === 'performance' && (
        <StaffPerformanceView staff={filteredStaff} />
      )}

      {viewMode === 'schedule' && (
        <StaffScheduleView staff={filteredStaff} />
      )}

      {pagination.lastPage > 1 && (
        <div className="bg-white rounded-lg shadow">
          <PaginationWithText
            totalPages={pagination.lastPage}
            initialPage={pagination.currentPage}
            onPageChange={goToPage}
          />
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={closeModals}
        title="Add New Staff Member"
        size="md"
      >
        <StaffForm
          loading={loading}
          onCancel={closeModals}
          onSubmit={handleAddStaff}
          serverErrors={validationErrors}
        />
      </Modal>

      {/* Edit Staff Modal */}
      <Modal
        isOpen={!!editingMember}
        onClose={closeModals}
        title={`Edit ${editingMember?.name || 'Staff Member'}`}
        size="md"
      >
        {editingMember && (
          <StaffEditForm
            member={editingMember}
            loading={loading}
            onCancel={closeModals}
            onSubmit={handleEditStaff}
            serverErrors={validationErrors}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-gray-700">
            Are you sure you want to delete{' '}
            <span className="font-semibold">{memberToDelete?.name}</span>? This action
            cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setMemberToDelete(null)}
              className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Staff Details Modal */}
      <Modal
        isOpen={!!selectedMember}
        onClose={closeModals}
        title={`${selectedMember?.name || 'Staff Member'} - Details`}
        size="lg"
      >
        {selectedMember && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                📋 Personal Information
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span> 
                  <span className="font-medium">{selectedMember.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span> 
                  <span className="font-medium">{selectedMember.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Role:</span> 
                  <span className="font-medium capitalize">{selectedMember.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hire Date:</span> 
                  <span className="font-medium">{selectedMember.hireDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Salary:</span> 
                  <span className="font-medium">MAD {selectedMember.salary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span> 
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedMember.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedMember.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                📊 Performance Metrics
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Orders Completed:</span> 
                  <span className="font-medium">{selectedMember.performance.ordersCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue Generated:</span> 
                  <span className="font-medium text-green-600">MAD {selectedMember.performance.revenueGenerated.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer Rating:</span> 
                  <span className="font-medium">⭐ {selectedMember.performance.customerRating.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Punctuality:</span> 
                  <span className="font-medium">{selectedMember.performance.punctualityScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tips Earned:</span> 
                  <span className="font-medium text-green-600">MAD {selectedMember.performance.tips.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Current Shift */}
            {selectedMember.currentShift && (
              <div className="md:col-span-2">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  ⏰ Current Shift
                </h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  {selectedMember.currentShift.isActive ? (
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">🟢 Currently on duty</span>
                      <span className="font-medium">Since {selectedMember.currentShift.clockIn}</span>
                    </div>
                  ) : (
                    <span className="text-gray-600">Currently off duty</span>
                  )}
                  
                  {selectedMember.role === 'waiter' && selectedMember.currentShift.tableAssignments && (
                    <div className="mt-2">
                      <span className="text-blue-700 text-sm">Assigned Tables: </span>
                      <span className="font-medium">
                        {selectedMember.currentShift.tableAssignments.map(t => `T${t}`).join(', ') || 'None'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
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
import { formatMoney } from '@/lib/money';
import type { StaffMember, StaffFormData } from '@/types/staff';

export default function StaffManagement() {
  const { t } = useTranslation();
  const {
    // Data
    staff,
    filteredStaff,
    selectedMember,
    editingMember,
    availableRoles,
    
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
    fetchAvailableRoles,
    
    // UI Actions
    setViewMode,
    setRoleFilter,
    setSelectedMember,
    setEditingMember,
    clearError,
    
    // Computed values
    staffStats,
  } = useStaffManagement();

  // Fetch available roles on mount
  useEffect(() => {
    fetchAvailableRoles();
  }, []);

  // Local modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<StaffMember | null>(null);

  // Handle form submissions
  const handleAddStaff = async (values: StaffFormData) => {
    try {
      await createStaff(values);
      setShowAddModal(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEditStaff = async (values: Partial<StaffFormData>) => {
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
      <PageMeta title={t('staffAdmin.metaTitle')} description={t('staffAdmin.metaDescription')} />
      <PageBreadcrumb pageTitle={t('staffAdmin.pageTitle')} />
      
      {/* Success Message */}
      {successMessage && (
        <Alert
          variant="success"
          title={t('staffAdmin.successTitle')}
          message={successMessage}
        />
      )}

      {/* Error Message */}
      {error && (
        <Alert
          variant="error"
          title={t('staffAdmin.errorTitle')}
          message={error}
        />
      )}

      {/* Validation Errors */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-red-800 font-medium mb-2">{t('staffAdmin.fixErrors')}</h4>
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
            <h1 className="text-2xl font-bold text-gray-900">{t('staffAdmin.pageTitle')}</h1>
            <p className="text-gray-600">{t('staffAdmin.subtitle')}</p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{staffStats.total}</div>
              <div className="text-sm text-gray-600">{t('staffAdmin.stats.total')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{staffStats.onShift}</div>
              <div className="text-sm text-gray-600">{t('staffAdmin.stats.onShift')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{staffStats.active}</div>
              <div className="text-sm text-gray-600">{t('staffAdmin.stats.active')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{formatMoney(staffStats.totalSalary)}</div>
              <div className="text-sm text-gray-600">{t('staffAdmin.stats.totalSalaries')}</div>
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
        availableRoles={availableRoles}
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
        title={t('staffAdmin.addTitle')}
        size="md"
      >
        <StaffForm
          loading={loading}
          onCancel={closeModals}
          onSubmit={handleAddStaff}
          serverErrors={validationErrors}
          availableRoles={availableRoles}
        />
      </Modal>

      {/* Edit Staff Modal */}
      <Modal
        isOpen={!!editingMember}
        onClose={closeModals}
        title={t('staffAdmin.editTitle', { name: editingMember?.name || t('staffAdmin.memberFallback') })}
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
        title={t('staffAdmin.deleteTitle')}
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-gray-700">
            <Trans
              i18nKey="staffAdmin.deleteConfirm"
              values={{ name: memberToDelete?.name }}
              components={{ strong: <span className="font-semibold" /> }}
            />
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setMemberToDelete(null)}
              className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
              disabled={loading}
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? t('staffAdmin.deleting') : t('staffAdmin.delete')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Staff Details Modal */}
      <Modal
        isOpen={!!selectedMember}
        onClose={closeModals}
        title={t('staffAdmin.detailsTitle', { name: selectedMember?.name || t('staffAdmin.memberFallback') })}
        size="lg"
      >
        {selectedMember && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span aria-hidden="true">📋</span> {t('staffAdmin.details.personal')}
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('staffAdmin.details.email')}</span> 
                  <span className="font-medium">{selectedMember.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('staffAdmin.details.phone')}</span> 
                  <span className="font-medium">{selectedMember.phone || t('staffAdmin.details.notAvailable')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('staffAdmin.details.role')}</span> 
                  <span className="font-medium">{t(`roles.${selectedMember.role}`, { defaultValue: selectedMember.role })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('staffAdmin.details.hireDate')}</span> 
                  <span className="font-medium">{selectedMember.hireDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('staffAdmin.details.salary')}</span> 
                  <span className="font-medium">{formatMoney(selectedMember.salary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('staffAdmin.details.status')}</span> 
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedMember.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {t(`staffAdmin.status.${selectedMember.status}`, { defaultValue: selectedMember.status })}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span aria-hidden="true">📊</span> {t('staffAdmin.details.performance')}
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('staffAdmin.details.ordersCompleted')}</span> 
                  <span className="font-medium">{selectedMember.performance.ordersCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('staffAdmin.details.revenueGenerated')}</span> 
                  <span className="font-medium text-green-600">{formatMoney(selectedMember.performance.revenueGenerated)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('staffAdmin.details.customerRating')}</span> 
                  <span className="font-medium">⭐ {selectedMember.performance.customerRating.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('staffAdmin.details.punctuality')}</span> 
                  <span className="font-medium">{selectedMember.performance.punctualityScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('staffAdmin.details.tipsEarned')}</span> 
                  <span className="font-medium text-green-600">{formatMoney(selectedMember.performance.tips)}</span>
                </div>
              </div>
            </div>

            {/* Current Shift */}
            {selectedMember.currentShift && (
              <div className="md:col-span-2">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span aria-hidden="true">⏰</span> {t('staffAdmin.details.currentShift')}
                </h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  {selectedMember.currentShift.isActive ? (
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700"><span aria-hidden="true">🟢</span> {t('staffAdmin.details.onDuty')}</span>
                      <span className="font-medium">{t('staffAdmin.details.since', { time: selectedMember.currentShift.clockIn })}</span>
                    </div>
                  ) : (
                    <span className="text-gray-600">{t('staffAdmin.details.offDuty')}</span>
                  )}
                  
                  {selectedMember.role === 'waiter' && selectedMember.currentShift.tableAssignments && (
                    <div className="mt-2">
                      <span className="text-blue-700 text-sm">{t('staffAdmin.details.assignedTables')} </span>
                      <span className="font-medium">
                        {selectedMember.currentShift.tableAssignments.map((n) => `T${n}`).join(', ') || t('staffAdmin.details.none')}
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

import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { AppDispatch } from '../../store';
import {
  fetchTable,
  updateTable,
  selectCurrentTable,
  selectTablesLoading,
  selectTablesUpdating,
  selectTablesValidationErrors,
  selectTablesError
} from '../../store/slices/tableSlice';
import type { TableFormData } from '../../types/table';
import TableForm from '../../components/tables/TableForm';
import Button from '../../components/ui/button/Button';

const EditTablePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const table = useSelector(selectCurrentTable);
  const isLoading = useSelector(selectTablesLoading);
  const isUpdating = useSelector(selectTablesUpdating);
  const validationErrors = useSelector(selectTablesValidationErrors);
  const error = useSelector(selectTablesError);

  const tableId = id ? parseInt(id, 10) : null;

  // Load table data
  useEffect(() => {
    if (tableId && !isNaN(tableId)) {
      dispatch(fetchTable(tableId));
    }
  }, [dispatch, tableId]);

  const handleUpdateTable = useCallback(async (data: TableFormData) => {
    if (!tableId) return;

    const result = await dispatch(updateTable({
      id: tableId,
      data: {
        number: data.number,
        capacity: data.capacity,
        shape: data.shape,
        status: data.status,
        section: data.section,
        floor: data.floor,
        description: data.description,
        features: data.features
      }
    }));

    if (updateTable.fulfilled.match(result)) {
      navigate('/tables', { replace: true });
    }
  }, [dispatch, tableId, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/tables', { replace: true });
  }, [navigate]);

  // Handle invalid ID
  if (!tableId || isNaN(tableId)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Invalid Table ID
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The table ID provided is not valid.
          </p>
          <Button onClick={handleCancel}>
            Back to Tables
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading && !table) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading table...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !table) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Table Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'The table you are looking for could not be found.'}
          </p>
          <Button onClick={handleCancel}>
            Back to Tables
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={handleCancel}
              variant="secondary"
              size="sm"
              className="p-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Table {table?.number}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Update table information and settings
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
          <div className="p-6">
            {table ? (
              <TableForm
                table={table}
                onSubmit={handleUpdateTable}
                onCancel={handleCancel}
                isLoading={isUpdating}
                serverErrors={validationErrors}
              />
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading table data...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTablePage;
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch } from '../../store';
import {
  createTable,
  selectTablesCreating,
  selectTablesValidationErrors
} from '../../store/slices/tableSlice';
import type { TableFormData } from '../../types/table';
import TableForm from '../../components/tables/TableForm';
import Button from '../../components/ui/button/Button';

const CreateTablePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isCreating = useSelector(selectTablesCreating);
  const validationErrors = useSelector(selectTablesValidationErrors);

  const handleCreateTable = useCallback(async (data: TableFormData) => {
    const result = await dispatch(createTable({
      number: data.number,
      capacity: data.capacity,
      shape: data.shape,
      status: data.status,
      section: data.section,
      floor: data.floor,
      description: data.description,
      features: data.features
    }));

    if (createTable.fulfilled.match(result)) {
      navigate('/tables', { replace: true });
    }
  }, [dispatch, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/tables', { replace: true });
  }, [navigate]);

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
                Create New Table
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Add a new table to your restaurant floor plan
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
          <div className="p-6">
            <TableForm
              onSubmit={handleCreateTable}
              onCancel={handleCancel}
              isLoading={isCreating}
              serverErrors={validationErrors}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTablePage;
import apiClient from './client';
import type { ApiResponse } from './client';
import type { ReceiptData, ReceiptTemplate } from '../types/receipt';

/**
 * Fetch receipt data for a specific order
 */
export const fetchReceipt = async (orderId: number): Promise<ReceiptData> => {
  const response = await apiClient.get<ApiResponse<ReceiptData>>(`/orders/${orderId}/receipt`);
  return response.data.data;
};

/**
 * Download receipt as PDF or HTML with authentication
 * Opens the receipt in a new tab with proper Bearer token authentication
 */
export const downloadReceipt = async (orderId: number, format: 'pdf' | 'html' = 'pdf', templateId?: number): Promise<void> => {
  const params = new URLSearchParams();
  params.append('format', format);
  if (templateId) {
    params.append('template_id', templateId.toString());
  }
  
  try {
    // Make authenticated request to get the receipt
    const response = await apiClient.get(`/orders/${orderId}/receipt?${params.toString()}`, {
      responseType: format === 'pdf' ? 'blob' : 'text',
    });
    
    if (format === 'pdf') {
      // Create blob URL and open in new tab for PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${orderId}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      // Open HTML in new window for printing
      const htmlContent = response.data;
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
      }
    }
  } catch (error) {
    console.error('Error downloading receipt:', error);
    throw error;
  }
};

/**
 * Print receipt (opens in new window with authentication)
 */
export const printReceipt = async (orderId: number, templateId?: number): Promise<void> => {
  const params = new URLSearchParams();
  params.append('format', 'html');
  if (templateId) {
    params.append('template_id', templateId.toString());
  }
  
  try {
    // Make authenticated request to get the receipt HTML
    const response = await apiClient.get(`/orders/${orderId}/receipt?${params.toString()}`, {
      responseType: 'text',
    });
    
    // Open in new window and trigger print
    const htmlContent = response.data;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  } catch (error) {
    console.error('Error printing receipt:', error);
    throw error;
  }
};

/**
 * Fetch all receipt templates (for future template editor)
 */
export const fetchReceiptTemplates = async (): Promise<ReceiptTemplate[]> => {
  const response = await apiClient.get<ApiResponse<ReceiptTemplate[]>>('/receipt-templates');
  return response.data.data;
};

/**
 * Fetch default receipt template
 */
export const fetchDefaultTemplate = async (): Promise<ReceiptTemplate | null> => {
  try {
    const response = await apiClient.get<ApiResponse<ReceiptTemplate>>('/receipt-templates/default');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching default template:', error);
    return null;
  }
};

/**
 * Email receipt to customer (future feature)
 */
export const emailReceipt = async (orderId: number, email: string): Promise<void> => {
  await apiClient.post(`/orders/${orderId}/receipt/email`, { email });
};

export default {
  fetchReceipt,
  downloadReceipt,
  printReceipt,
  fetchReceiptTemplates,
  fetchDefaultTemplate,
  emailReceipt,
};

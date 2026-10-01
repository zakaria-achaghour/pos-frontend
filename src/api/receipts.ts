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
 * Print server-rendered receipt HTML without a popup window.
 *
 * The HTML goes into a hidden, sandboxed iframe: `sandbox` without `allow-scripts` means any script
 * smuggled into the receipt (e.g. through a customer name) cannot run, while `allow-same-origin`
 * lets us call print() on it. No popup, so popup blockers can't interfere.
 */
const printHtml = (html: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-same-origin allow-modals');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;inset-inline-end:0;bottom:0;width:0;height:0;border:0;';

    const cleanup = () => window.setTimeout(() => frame.remove(), 60000);

    frame.onload = () => {
      try {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
        cleanup();
        resolve();
      } catch (error) {
        frame.remove();
        reject(error);
      }
    };
    frame.srcdoc = html;
    document.body.appendChild(frame);
  });

const receiptParams = (format: 'pdf' | 'html', templateId?: number) => ({
  format,
  ...(templateId && { template_id: templateId }),
});

/**
 * Download the receipt PDF (authenticated request, saved via a blob link),
 * or print the HTML version.
 */
export const downloadReceipt = async (orderId: number, format: 'pdf' | 'html' = 'pdf', templateId?: number): Promise<void> => {
  if (format === 'html') {
    await printReceipt(orderId, templateId);
    return;
  }

  const response = await apiClient.get(`/orders/${orderId}/receipt`, {
    params: receiptParams('pdf', templateId),
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `receipt-${orderId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revoking immediately can cancel the download in some browsers
  window.setTimeout(() => window.URL.revokeObjectURL(url), 10000);
};

/**
 * Print the receipt (authenticated request, printed through a sandboxed iframe).
 */
export const printReceipt = async (orderId: number, templateId?: number): Promise<void> => {
  const response = await apiClient.get<string>(`/orders/${orderId}/receipt`, {
    params: receiptParams('html', templateId),
    responseType: 'text',
  });
  await printHtml(response.data);
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

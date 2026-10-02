import { useTranslation } from 'react-i18next';
import { Button, Icon, Modal } from '@/components/kit';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}
export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type = 'warning' }: ConfirmationModalProps) {
  const { t } = useTranslation();
  const tone = { danger: 'bg-danger/10 text-danger', warning: 'bg-warning/10 text-warning', info: 'bg-brand-50 text-brand-700' }[type];
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" footer={<>
      <Button variant="secondary" size="md" onClick={onClose}>{cancelText || t('common.cancel')}</Button>
      <Button variant={type === 'danger' ? 'danger' : 'primary'} size="md" onClick={onConfirm}>{confirmText || t('ux.confirm')}</Button>
    </>}>
      <div className="flex items-start gap-4 py-2"><span className={`shrink-0 rounded-xl p-3 ${tone}`}><Icon name="alert" className="h-6 w-6"/></span><p className="text-sm leading-6 text-fg-muted">{message}</p></div>
    </Modal>
  );
}

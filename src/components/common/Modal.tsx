import type { ReactNode } from 'react';
import Dialog from '@/components/kit/Modal';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: ReactNode;
  showCloseButton?: boolean;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
}
const widths = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl', full: 'max-w-full' };

export default function Modal({ size = 'md', closeOnOverlayClick = true, ...props }: ModalProps) {
  return <Dialog {...props} className={widths[size]} closeOnBackdrop={closeOnOverlayClick}/>;
}

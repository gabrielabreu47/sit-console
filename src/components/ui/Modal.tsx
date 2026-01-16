import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  if (typeof document === 'undefined') {
    return null;
  }

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return createPortal(
     <div className="fixed inset-0 z-50 overflow-y-auto bg-[#000000]">
      <div className="flex min-h-screen items-center justify-center p-4 bg-[#050810]">
        {/* Backdrop - click to close */}
        <div className="fixed inset-0" onClick={onClose} />
        <div className={`relative w-full ${sizeClasses[size]} max-h-[90vh]`} style={{backgroundColor: 'rgba(0, 0, 0)'}}>
          {/* Modal content - solid dark background */}
          <div className="relative overflow-hidden rounded-[32px] border border-white/20 bg-[#0a0f1a] shadow-2xl shadow-black/80">
            {/* Header */}
            <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0d1422]">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
                <X className="h-4 w-4" />
              </Button>
            </div>
            {/* Body */}
            <div className="relative p-6 overflow-y-auto max-h-[calc(90vh-140px)] bg-[#0a0f1a] text-white">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

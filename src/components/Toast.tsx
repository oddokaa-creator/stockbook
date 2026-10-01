/**
 * StockBook - 사용자 피드백 알림 토스트 컴포넌트
 * @license Apache-2.0
 */

import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return 'fa-circle-check text-emerald-500';
      case 'error':
        return 'fa-circle-xmark text-red-500';
      case 'warning':
        return 'fa-triangle-exclamation text-amber-500';
      default:
        return 'fa-circle-info text-indigo-500';
    }
  };

  const getBorder = () => {
    switch (toast.type) {
      case 'success':
        return 'border-emerald-200 dark:border-emerald-900/60';
      case 'error':
        return 'border-red-200 dark:border-red-900/60';
      case 'warning':
        return 'border-amber-200 dark:border-amber-900/60';
      default:
        return 'border-indigo-200 dark:border-indigo-900/60';
    }
  };

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border ${getBorder()} shadow-lg text-xs animate-in slide-in-from-top-2 duration-200`}
    >
      <div className="flex items-center gap-2.5">
        <i className={`fa-solid ${getIcon()} text-sm shrink-0`}></i>
        <span className="font-medium text-slate-800 dark:text-slate-200">{toast.message}</span>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs shrink-0"
      >
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
};

"use client";
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, AlertTriangle, Trash2, Info } from 'lucide-react';
import { useCanvasTheme } from './CanvasThemeProvider';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmationModalProps) {
  const { isDark } = useCanvasTheme();

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <Trash2 className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-500" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
    }
  };

  const getConfirmButtonStyles = () => {
    const baseStyles = 'px-6 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    switch (variant) {
      case 'danger':
        return `${baseStyles} bg-red-600 text-white hover:bg-red-700 focus:ring-4 focus:ring-red-500/20`;
      case 'warning':
        return `${baseStyles} bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-4 focus:ring-yellow-500/20`;
      case 'info':
        return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20`;
      default:
        return `${baseStyles} bg-red-600 text-white hover:bg-red-700 focus:ring-4 focus:ring-red-500/20`;
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-2xl border shadow-2xl transition-all ${
                isDark
                  ? 'bg-gray-900 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                {/* Header */}
                <div className={`p-6 border-b ${
                  isDark ? 'border-gray-700/50' : 'border-gray-200/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getIcon()}
                      <Dialog.Title className={`text-lg font-bold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {title}
                      </Dialog.Title>
                    </div>
                    <button
                      onClick={onClose}
                      disabled={isLoading}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                        isDark
                          ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                          : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className={`text-left leading-relaxed ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {message}
                  </p>
                </div>

                {/* Actions */}
                <div className={`p-6 border-t flex gap-3 justify-end ${
                  isDark ? 'border-gray-700/50' : 'border-gray-200/50'
                }`}>
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white focus:ring-4 focus:ring-gray-500/20'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 focus:ring-4 focus:ring-gray-300/20'
                    }`}
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={getConfirmButtonStyles()}
                  >
                    {isLoading ? 'Processing...' : confirmText}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
"use client";
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, AlertTriangle } from 'lucide-react';
import { useCanvasTheme } from './CanvasThemeProvider';

export interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onDiscard: () => void;
  isSaving?: boolean;
}

export default function UnsavedChangesModal({
  isOpen,
  onClose,
  onSave,
  onDiscard,
  isSaving = false,
}: UnsavedChangesModalProps) {
  const { isDark } = useCanvasTheme();

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
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isDark ? 'bg-amber-500/20' : 'bg-amber-100'
                      }`}>
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      </div>
                      <Dialog.Title className={`text-lg font-bold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        Unsaved Changes
                      </Dialog.Title>
                    </div>
                    <button
                      onClick={onClose}
                      disabled={isSaving}
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
                    You have unsaved changes that will be lost. Would you like to save your changes before continuing?
                  </p>
                </div>

                {/* Actions */}
                <div className={`p-6 border-t flex gap-3 ${
                  isDark ? 'border-gray-700/50' : 'border-gray-200/50'
                }`}>
                  <button
                    onClick={onClose}
                    disabled={isSaving}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white focus:ring-4 focus:ring-gray-500/20'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 focus:ring-4 focus:ring-gray-300/20'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onDiscard}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-500/20 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Don&apos;t Save
                  </button>
                  <button
                    onClick={onSave}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-500/20 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Save & Continue'}
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
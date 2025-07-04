import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

function AlertDialog({ isOpen, onClose, title, message, type, confirmButtonText, onConfirm, cancelButtonText, showCancelButton, autoCloseDelay = 0 }) {
  const isSuccess = type === 'success';
  const isError = type === 'error';
  const isConfirm = type === 'confirm'; // New type for confirmation dialogs

  // Auto-close logic for success/error alerts
  React.useEffect(() => {
    if (isOpen && autoCloseDelay > 0 && (isSuccess || isError)) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer); // Cleanup timer on unmount or if isOpen changes
    }
  }, [isOpen, autoCloseDelay, isSuccess, isError, onClose]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

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
              <Dialog.Panel
                className={`w-full max-w-sm transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all
                  ${isSuccess ? 'bg-green-100' : isError ? 'bg-red-100' : 'bg-white'}`} /* Default white for confirm */
              >
                <Dialog.Title
                  as="h3"
                  className={`text-lg font-medium leading-6 
                    ${isSuccess ? 'text-green-900' : isError ? 'text-red-900' : 'text-gray-900'}`} /* Default gray for confirm */
                >
                  {title}
                </Dialog.Title>
                <div className="mt-2">
                  <p className={`text-sm 
                    ${isSuccess ? 'text-green-700' : isError ? 'text-red-700' : 'text-gray-700'}`}> {/* Default gray for confirm */}
                    {message}
                  </p>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  {showCancelButton && (isError || isConfirm) && ( // Show cancel button for error or confirm type
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={onClose}
                    >
                      {cancelButtonText || 'Tutup'}
                    </button>
                  )}
                  {isConfirm && ( // Show confirm button only for confirm type
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-bps-blue px-4 py-2 text-sm font-medium text-white hover:bg-bps-light-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-bps-blue focus-visible:ring-offset-2"
                      onClick={onConfirm}
                    >
                      {confirmButtonText || 'Ya'}
                    </button>
                  )}
                  {isError && !isConfirm && ( // Show default close button for error alerts only
                     <button
                       type="button"
                       className="inline-flex justify-center rounded-md border border-transparent bg-red-200 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                       onClick={onClose}
                     >
                       Tutup
                     </button>
                  )}
                  {isSuccess && ( // No explicit close button for success if autoCloseDelay > 0
                     <button
                       type="button"
                       className="inline-flex justify-center rounded-md border border-transparent bg-green-200 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                       onClick={onClose}
                     >
                       Oke
                     </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default AlertDialog;
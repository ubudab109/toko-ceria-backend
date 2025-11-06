import React, { FC } from 'react';
// Import Lucide Icons
import { AlertTriangle, Info, TriangleAlert, LucideIcon } from 'lucide-react';

// Define the available types for the modal
type ModalType = 'danger' | 'info' | 'warning';

// Define the component props using TypeScript
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type: ModalType;
  confirmButtonText?: string;
  cancelButtonText?: string;
  // Optional flag to control if the user can close the modal by clicking the backdrop
  isStatic?: boolean; 
}

// Map the modal type to colors and icons
const typeStyles: Record<ModalType, { icon: LucideIcon; color: string; bgColor: string; confirmClass: string }> = {
  // Danger Type: Used for permanent/destructive actions (e.g., Delete)
  danger: {
    icon: TriangleAlert,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900',
    confirmClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  },
  // Info Type: Used for general information or less critical confirmation
  info: {
    icon: Info,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900',
    confirmClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  },
  // Warning Type: Used for cautionary actions (e.g., Unsaved changes, Proceed)
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900',
    confirmClass: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400',
  },
};

const ConfirmationModal: FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  isStatic = false,
}) => {
  if (!isOpen) return null;

  const { icon: Icon, color, bgColor, confirmClass } = typeStyles[type];
  
  // Handle backdrop click if the modal is not static
  const handleBackdropClick = () => {
    if (!isStatic) {
      onClose();
    }
  };

  return (
    // Backdrop: Fixed position, full screen, dark mode opacity, transition
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 dark:bg-gray-900/80 transition-opacity flex items-center justify-center p-4 sm:p-0"
      onClick={handleBackdropClick}
    >
      
      {/* Modal Container: Stop propagation to prevent accidental backdrop close */}
      <div 
        className="relative w-full max-w-sm sm:max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl transition-all scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()} // Crucial: Prevents closing when clicking inside the modal
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="p-6">
          <div className="flex items-start">
            
            {/* Type Icon Container */}
            <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${bgColor}`}>
              <Icon className={`h-6 w-6 ${color} stroke-2`} aria-hidden="true" />
            </div>

            {/* Modal Content */}
            <div className="mt-0 ml-4 text-left">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white" id="modal-title">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {message}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (Buttons) - Responsive Ordering */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 mt-3 sm:mt-0"
          >
            {cancelButtonText}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            // Dynamic color for the confirm button based on type
            className={`w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 ${confirmClass} focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
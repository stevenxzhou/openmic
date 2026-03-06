import React, { ReactNode } from "react";

type ModalProps = {
  children: ReactNode;
  onClose?: () => void;
};

const Modal = ({ children, onClose }: ModalProps) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-full max-w-md bg-white border rounded-lg shadow-xl p-4 sm:p-6 space-y-4">
          {children}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-200 text-gray-600 hover:text-gray-800 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Modal;

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title, 
  message,
  confirmText = 'Bekreft',
  cancelText = 'Avbryt'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {title && (
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
        )}
        <p className="text-gray-700 mb-6 whitespace-pre-line">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 active:bg-red-800 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

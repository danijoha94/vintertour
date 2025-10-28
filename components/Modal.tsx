interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export default function Modal({ isOpen, onClose, title, message }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {title && (
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
        )}
        <p className="text-gray-700 mb-6 whitespace-pre-line">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#275319] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#1f4215] transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

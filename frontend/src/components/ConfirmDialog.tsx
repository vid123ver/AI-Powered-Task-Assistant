interface ConfirmDialogProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  isOpen,
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
            !
          </div>

          <h2
            id="confirm-dialog-title"
            className="text-base font-semibold text-gray-900"
          >
            Delete task?
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {message}
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="!m-0 !rounded-lg !border !border-gray-300 !bg-white !px-4 !py-2.5 !text-sm !font-medium !text-gray-700 transition hover:!bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="!m-0 !rounded-lg !bg-red-600 !px-4 !py-2.5 !text-sm !font-medium !text-white transition hover:!bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
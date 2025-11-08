import React from 'react'

const ConfirmModal = ({ open, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', cancelLabel = 'Cancel' }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow p-6 w-11/12 max-w-md">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="mb-4 text-sm text-gray-600">{message}</p>
        <div className="flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onCancel}>{cancelLabel}</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal

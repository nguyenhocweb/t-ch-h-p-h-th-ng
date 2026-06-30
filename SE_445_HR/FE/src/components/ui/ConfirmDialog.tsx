'use client';

import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, loading }: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="confirm-dialog">
          <div className="confirm-icon">⚠️</div>
          <div className="confirm-title">{title}</div>
          <div className="confirm-message">{message}</div>
          <div className="confirm-actions">
            <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
              Hủy
            </button>
            <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
              {loading ? 'Đang xóa...' : 'Xác nhận xóa'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

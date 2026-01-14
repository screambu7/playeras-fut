/**
 * Contenedor para múltiples toasts
 * Gestiona la visualización de toasts apilados
 */

"use client";

import Toast, { ToastType } from "./Toast";

export interface ToastData {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({
  toasts,
  onRemove,
}: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 flex flex-col items-end">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="animate-slide-in-right"
          style={{
            animationDelay: `${index * 50}ms`,
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}

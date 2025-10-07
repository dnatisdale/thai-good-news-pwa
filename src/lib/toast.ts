// src/lib/toast.ts
export type ToastType = 'info' | 'success' | 'error';

export function toast(message: string, type: ToastType = 'info') {
  window.dispatchEvent(new CustomEvent('toast', { detail: { message, type } }));
}

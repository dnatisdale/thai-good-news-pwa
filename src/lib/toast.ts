export type ToastType = 'info' | 'success' | 'error';

export function Toast(message: string, type: ToastType = 'info') {
  window.dispatchEvent(new CustomEvent('Toast', { detail: { message, type } }));
}

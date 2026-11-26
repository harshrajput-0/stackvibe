// Runs navigation inside the native View Transitions API when available,
// with a direct callback fallback for unsupported browsers.
export function withViewTransition(callback) {
  if (typeof document === "undefined" || !document.startViewTransition) {
    callback();
    return;
  }

  document.startViewTransition(() => {
    callback();
  });
}

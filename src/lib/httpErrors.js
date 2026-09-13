// Lightweight error type controllers throw to signal an HTTP status.
// Route handlers catch this and turn it into a Response — keeps
// controllers framework-agnostic (no req/res, works in App Router,
// tests, background jobs, etc).
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

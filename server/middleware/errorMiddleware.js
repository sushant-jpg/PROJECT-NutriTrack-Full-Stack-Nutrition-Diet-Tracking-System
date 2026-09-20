function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'An unexpected error occurred.';

  if (error.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'A record with that username or email already exists.';
  }

  if (statusCode >= 500) {
    console.error(error);
    message = 'The server could not complete your request.';
  }

  const response = { success: false, message };
  if (error.details) response.errors = error.details;
  res.status(statusCode).json(response);
}

module.exports = { notFound, errorHandler };

